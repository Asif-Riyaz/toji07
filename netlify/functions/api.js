const db = require('../../db-store.js');
const auth = require('../../auth-store.js');

function sendJson(statusCode, data, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      ...extraHeaders
    },
    body: JSON.stringify(data)
  };
}

exports.handler = async (event, context) => {
  try {
    const method = (event.httpMethod || 'GET').toUpperCase();

    if (method === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
        },
        body: ''
      };
    }

    let pathname = event.path || '';
    if (pathname.includes('/.netlify/functions/api')) {
      const idx = pathname.indexOf('/.netlify/functions/api');
      let sub = pathname.substring(idx + '/.netlify/functions/api'.length);
      if (!sub.startsWith('/')) sub = '/' + sub;
      pathname = '/api' + sub;
    } else if (!pathname.startsWith('/api')) {
      pathname = '/api' + (pathname.startsWith('/') ? pathname : '/' + pathname);
    }
    if (pathname.length > 5 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }

    const rawHeaders = event.headers || {};
    const headers = {};
    for (const [key, value] of Object.entries(rawHeaders)) {
      headers[key.toLowerCase()] = value;
    }

    const clientIp = headers['x-forwarded-for']?.split(',')[0].trim() || headers['client-ip'] || '';
    const userAgent = headers['user-agent'] || '';
    const query = event.queryStringParameters || {};

    let body = {};
    if (event.body) {
      try {
        const rawBody = event.isBase64Encoded
          ? Buffer.from(event.body, 'base64').toString('utf8')
          : event.body;
        if (rawBody && rawBody.trim()) {
          body = JSON.parse(rawBody);
        }
      } catch (err) {
        return sendJson(400, { error: 'Invalid JSON payload' });
      }
    }

    const req = {
      headers,
      method,
      url: pathname
    };

    // Public Auth Routes
    if (pathname === '/api/auth/status' && method === 'GET') {
      const status = await auth.getAuthStatus(req);
      return sendJson(200, status);
    }

    if (pathname === '/api/auth/setup' && method === 'POST') {
      const result = await auth.setupOwner(body.username, body.password, clientIp);
      if (result.error) {
        return sendJson(result.status || 400, { error: result.error });
      }
      const cookie = `toji_session=${result.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 3600}`;
      return sendJson(200, result, { 'Set-Cookie': cookie });
    }

    if (pathname === '/api/auth/login' && method === 'POST') {
      const result = await auth.login(body.password, clientIp, userAgent);
      if (result.error) {
        return sendJson(result.status || 401, { error: result.error });
      }
      const cookie = `toji_session=${result.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 3600}`;
      return sendJson(200, result, { 'Set-Cookie': cookie });
    }

    if (pathname === '/api/auth/logout' && method === 'POST') {
      await auth.logout(req);
      const cookie = `toji_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
      return sendJson(200, { success: true }, { 'Set-Cookie': cookie });
    }

    // Protected Routes — Verify Authentication
    const user = await auth.getAuthStatus(req);
    if (!user.isAuthenticated) {
      return sendJson(401, {
        error: 'Unauthorized. Master login required.',
        code: 'AUTH_REQUIRED'
      });
    }

    if (pathname === '/api/auth/change-password' && method === 'POST') {
      const result = await auth.changePassword(user.userId, body.currentPassword, body.newPassword);
      if (result.error) {
        return sendJson(result.status || 400, { error: result.error });
      }
      const cookie = `toji_session=${result.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 3600}`;
      return sendJson(200, { success: true }, { 'Set-Cookie': cookie });
    }

    // Tasks CRUD
    if (pathname === '/api/tasks' && method === 'GET') {
      const tasks = await db.getTasks({
        date: query.date,
        status: query.status,
        category: query.category,
        search: query.search
      });
      return sendJson(200, { tasks });
    }

    if (pathname === '/api/tasks' && method === 'POST') {
      if (!body.title || !body.title.trim()) {
        return sendJson(400, { error: 'Task title is required.' });
      }
      const task = await db.createTask(body);
      return sendJson(201, { task });
    }

    if (pathname === '/api/tasks/reorder' && method === 'POST') {
      if (Array.isArray(body.taskIds)) {
        await db.reorderTasks(body.taskIds);
      }
      return sendJson(200, { success: true });
    }

    const logTimeMatch = pathname.match(/^\/api\/tasks\/([^/]+)\/log-time$/);
    if (logTimeMatch && method === 'POST') {
      const taskId = logTimeMatch[1];
      const durationSeconds = Number(body.durationSeconds) || 0;
      const log = await db.addTimeLog({
        taskId,
        durationSeconds,
        type: body.type || 'focus',
        notes: body.notes || ''
      });
      const updatedTask = await db.getTaskById(taskId);
      return sendJson(200, { log, task: updatedTask });
    }

    const taskMatch = pathname.match(/^\/api\/tasks\/([^/]+)$/);
    if (taskMatch) {
      const taskId = taskMatch[1];
      if (method === 'GET') {
        const task = await db.getTaskById(taskId);
        if (!task) return sendJson(404, { error: 'Task not found' });
        return sendJson(200, { task });
      }
      if (method === 'PUT') {
        const task = await db.updateTask(taskId, body);
        return sendJson(200, { task });
      }
      if (method === 'DELETE') {
        await db.deleteTask(taskId);
        return sendJson(200, { success: true, id: taskId });
      }
    }

    // Time Logs
    if (pathname === '/api/timelogs' && method === 'GET') {
      const logs = await db.getTimeLogs({
        taskId: query.taskId,
        date: query.date
      });
      return sendJson(200, { logs });
    }

    if (pathname === '/api/timelogs' && method === 'POST') {
      const log = await db.addTimeLog(body);
      return sendJson(201, { log });
    }

    // Daily Standup & Journal
    const journalMatch = pathname.match(/^\/api\/journal\/([^/]+)$/);
    if (journalMatch) {
      const date = journalMatch[1];
      if (method === 'GET') {
        const summary = (await db.getDailySummary(date)) || {
          date,
          summary_text: '',
          mood: 'productive',
          blockers: '',
          goals_tomorrow: ''
        };
        return sendJson(200, { summary });
      }
      if (method === 'PUT') {
        const summary = await db.saveDailySummary(date, body);
        return sendJson(200, { summary });
      }
    }

    const standupGenerateMatch = pathname.match(/^\/api\/journal\/generate\/([^/]+)$/);
    if (standupGenerateMatch && method === 'POST') {
      const date = standupGenerateMatch[1];
      const standup = await db.generateDailyStandup(date);
      return sendJson(200, { standup });
    }

    // Analytics
    if (pathname === '/api/analytics' && method === 'GET') {
      const range = query.range || '30d';
      const analytics = await db.getAnalytics(range);
      return sendJson(200, { analytics });
    }

    // Settings
    if (pathname === '/api/settings' && method === 'GET') {
      const settings = await db.getSettings();
      return sendJson(200, { settings });
    }

    if (pathname === '/api/settings' && method === 'PUT') {
      const settings = await db.updateSettings(body.settings || body);
      return sendJson(200, { settings });
    }

    // Classes, Workouts, BTech, Coding, Works
    if (pathname === '/api/classes' && method === 'GET') {
      const classes = await db.getClasses(query.platform);
      return sendJson(200, { classes });
    }
    if (pathname === '/api/classes' && method === 'POST') {
      if (!body.title || !body.title.trim()) return sendJson(400, { error: 'Class title is required.' });
      const cls = await db.createClass(body);
      return sendJson(201, { class: cls });
    }
    const classMatch = pathname.match(/^\/api\/classes\/([^/]+)$/);
    if (classMatch) {
      const clsId = classMatch[1];
      if (method === 'PUT') {
        const cls = await db.updateClass(clsId, body);
        return sendJson(200, { class: cls });
      }
      if (method === 'DELETE') {
        await db.deleteClass(clsId);
        return sendJson(200, { success: true, id: clsId });
      }
    }

    if (pathname === '/api/workouts' && method === 'GET') {
      const workouts = await db.getWorkouts(query.date);
      return sendJson(200, { workouts });
    }
    if (pathname === '/api/workouts' && method === 'POST') {
      if (!body.exercise || !body.exercise.trim()) return sendJson(400, { error: 'Exercise name is required.' });
      const wrk = await db.createWorkout(body);
      return sendJson(201, { workout: wrk });
    }
    const workoutMatch = pathname.match(/^\/api\/workouts\/([^/]+)$/);
    if (workoutMatch) {
      const wrkId = workoutMatch[1];
      if (method === 'PUT') {
        const wrk = await db.updateWorkout(wrkId, body);
        return sendJson(200, { workout: wrk });
      }
      if (method === 'DELETE') {
        await db.deleteWorkout(wrkId);
        return sendJson(200, { success: true, id: wrkId });
      }
    }

    if (pathname === '/api/btech' && method === 'GET') {
      const subjects = await db.getBTechSubjects(query.semester);
      return sendJson(200, { subjects });
    }
    if (pathname === '/api/btech' && method === 'POST') {
      const sub = await db.createBTechSubject(body);
      return sendJson(201, { subject: sub });
    }
    const btechMatch = pathname.match(/^\/api\/btech\/([^/]+)$/);
    if (btechMatch) {
      const subId = btechMatch[1];
      if (method === 'PUT') {
        const sub = await db.updateBTechSubject(subId, body);
        return sendJson(200, { subject: sub });
      }
      if (method === 'DELETE') {
        await db.deleteBTechSubject(subId);
        return sendJson(200, { success: true, id: subId });
      }
    }

    const btechWorksMatch = pathname.match(/^\/api\/btech\/([^/]+)\/works$/);
    if (btechWorksMatch) {
      const subjectId = btechWorksMatch[1];
      if (method === 'GET') {
        const works = await db.getSubjectWorks(subjectId);
        return sendJson(200, { works });
      }
      if (method === 'POST') {
        const work = await db.createSubjectWork({ ...body, subjectId });
        return sendJson(201, { work });
      }
    }
    const workMatch = pathname.match(/^\/api\/works\/([^/]+)$/);
    if (workMatch) {
      const workId = workMatch[1];
      if (method === 'PUT') {
        const work = await db.updateSubjectWork(workId, body);
        return sendJson(200, { work });
      }
      if (method === 'DELETE') {
        await db.deleteSubjectWork(workId);
        return sendJson(200, { success: true, id: workId });
      }
    }

    if (pathname === '/api/coding' && method === 'GET') {
      const coding = await db.getCodingPractice();
      return sendJson(200, { coding });
    }
    if (pathname === '/api/coding' && method === 'POST') {
      const cod = await db.createCodingPractice(body);
      return sendJson(201, { coding: cod });
    }
    const codingMatch = pathname.match(/^\/api\/coding\/([^/]+)$/);
    if (codingMatch) {
      const codId = codingMatch[1];
      if (method === 'DELETE') {
        await db.deleteCodingPractice(codId);
        return sendJson(200, { success: true, id: codId });
      }
    }

    if (pathname === '/api/sample-data' && method === 'POST') {
      await db.seedSampleData();
      return sendJson(200, { success: true, message: 'Sample data seeded.' });
    }

    if (pathname === '/api/clear-data' && method === 'POST') {
      await db.clearWorkData();
      return sendJson(200, { success: true, message: 'All work records purged.' });
    }

    return sendJson(404, { error: 'API route not found', path: pathname });

  } catch (err) {
    console.error('API Error:', err);
    return sendJson(500, { error: 'Internal Server Error', message: err.message });
  }
};
