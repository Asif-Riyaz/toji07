const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { eq, and, gte, lte, desc, asc, sql } = require('drizzle-orm');
const schema = require('./db/schema');
const crypto = require('node:crypto');

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/toji';
const client = postgres(connectionString);
const db = drizzle(client, { schema });

const dbApi = {
  async getUserCount() {
    const result = await db.select({ count: sql`count(*)` }).from(schema.users);
    return Number(result[0]?.count || 0);
  },

  async getOwner() {
    const result = await db.select().from(schema.users).limit(1);
    if (!result.length) return null;
    const u = result[0];
    return {
      id: u.id,
      username: u.username,
      password_hash: u.passwordHash,
      password_salt: u.passwordSalt,
      created_at: u.createdAt,
      last_login_at: u.lastLoginAt
    };
  },

  async createOwner(username, passwordHash, passwordSalt) {
    const now = new Date().toISOString();
    const [user] = await db.insert(schema.users).values({
      username,
      passwordHash,
      passwordSalt,
      createdAt: now,
      lastLoginAt: now
    }).returning();

    return { id: user.id, username: user.username, created_at: now };
  },

  async updateOwnerPassword(userId, passwordHash, passwordSalt) {
    await db.update(schema.users)
      .set({ passwordHash, passwordSalt })
      .where(eq(schema.users.id, userId));
  },

  async updateLastLogin(userId) {
    await db.update(schema.users)
      .set({ lastLoginAt: new Date().toISOString() })
      .where(eq(schema.users.id, userId));
  },

  // Sessions
  async createSession(token, userId, expiresAt, ipAddress = '', userAgent = '') {
    const now = new Date().toISOString();
    await db.insert(schema.sessions).values({
      token,
      userId,
      createdAt: now,
      expiresAt,
      lastActivityAt: now,
      ipAddress,
      userAgent
    }).onConflictDoUpdate({
      target: schema.sessions.token,
      set: { lastActivityAt: now, expiresAt }
    });
  },

  async getSession(token) {
    const now = new Date().toISOString();
    const result = await db.select({
      token: schema.sessions.token,
      userId: schema.sessions.userId,
      expiresAt: schema.sessions.expiresAt,
      username: schema.users.username
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.users.id, schema.sessions.userId))
    .where(and(eq(schema.sessions.token, token), gte(schema.sessions.expiresAt, now)));

    if (!result.length) return null;
    const s = result[0];
    return {
      token: s.token,
      user_id: s.userId,
      expires_at: s.expiresAt,
      username: s.username
    };
  },

  async touchSession(token) {
    await db.update(schema.sessions)
      .set({ lastActivityAt: new Date().toISOString() })
      .where(eq(schema.sessions.token, token));
  },

  async deleteSession(token) {
    await db.delete(schema.sessions).where(eq(schema.sessions.token, token));
  },

  async deleteUserSessions(userId) {
    await db.delete(schema.sessions).where(eq(schema.sessions.userId, userId));
  },

  async cleanupExpiredSessions() {
    const now = new Date().toISOString();
    await db.delete(schema.sessions).where(lte(schema.sessions.expiresAt, now));
  },

  // Tasks
  async getTasks({ date, status, category, search } = {}) {
    let query = db.select().from(schema.tasks);
    const conditions = [];

    if (date) conditions.push(eq(schema.tasks.date, date));
    if (status && status !== 'all') conditions.push(eq(schema.tasks.status, status));
    if (category && category !== 'all') conditions.push(eq(schema.tasks.category, category));
    if (search) {
      conditions.push(sql`(${schema.tasks.title} ILIKE ${'%' + search + '%'} OR ${schema.tasks.notes} ILIKE ${'%' + search + '%'})`);
    }

    if (conditions.length) {
      query = query.where(and(...conditions));
    }

    const tasksList = await query.orderBy(asc(schema.tasks.sortOrder), desc(schema.tasks.createdAt));
    return tasksList.map(t => ({
      id: t.id,
      title: t.title,
      notes: t.notes,
      category: t.category,
      priority: t.priority,
      status: t.status,
      planned_mins: t.plannedMins,
      actual_mins: t.actualMins,
      date: t.date,
      sort_order: t.sortOrder,
      created_at: t.createdAt,
      completed_at: t.completedAt,
      subject_id: t.subjectId
    }));
  },

  async getTaskById(id) {
    const result = await db.select().from(schema.tasks).where(eq(schema.tasks.id, id));
    if (!result.length) return null;
    const t = result[0];
    return {
      id: t.id,
      title: t.title,
      notes: t.notes,
      category: t.category,
      priority: t.priority,
      status: t.status,
      planned_mins: t.plannedMins,
      actual_mins: t.actualMins,
      date: t.date,
      sort_order: t.sortOrder,
      created_at: t.createdAt,
      completed_at: t.completedAt,
      subject_id: t.subjectId
    };
  },

  async createTask({ id, title, notes = '', category = 'Engineering', priority = 'Medium', plannedMins = 45, date, subject_id = null }) {
    const taskId = id || 'task_' + crypto.randomBytes(8).toString('hex');
    const taskDate = date || new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    const [newTask] = await db.insert(schema.tasks).values({
      id: taskId,
      title: title.trim(),
      notes: notes.trim(),
      category,
      priority,
      status: 'active',
      plannedMins: Number(plannedMins) || 45,
      actualMins: 0,
      date: taskDate,
      sortOrder: 0,
      createdAt: now,
      subjectId: subject_id
    }).returning();

    return this.getTaskById(newTask.id);
  },

  async updateTask(id, fields) {
    const updateData = {};
    if (fields.title !== undefined) updateData.title = fields.title;
    if (fields.notes !== undefined) updateData.notes = fields.notes;
    if (fields.category !== undefined) updateData.category = fields.category;
    if (fields.priority !== undefined) updateData.priority = fields.priority;
    if (fields.status !== undefined) updateData.status = fields.status;
    if (fields.planned_mins !== undefined) updateData.plannedMins = fields.planned_mins;
    if (fields.actual_mins !== undefined) updateData.actualMins = fields.actual_mins;
    if (fields.date !== undefined) updateData.date = fields.date;
    if (fields.sort_order !== undefined) updateData.sortOrder = fields.sort_order;
    if (fields.completed_at !== undefined) updateData.completedAt = fields.completed_at;
    if (fields.subject_id !== undefined) updateData.subjectId = fields.subject_id;

    if (Object.keys(updateData).length === 0) return this.getTaskById(id);

    await db.update(schema.tasks).set(updateData).where(eq(schema.tasks.id, id));
    return this.getTaskById(id);
  },

  async deleteTask(id) {
    await db.delete(schema.tasks).where(eq(schema.tasks.id, id));
  },

  async reorderTasks(taskIds) {
    for (let i = 0; i < taskIds.length; i++) {
      await db.update(schema.tasks).set({ sortOrder: i }).where(eq(schema.tasks.id, taskIds[i]));
    }
  },

  // Time Logs
  async addTimeLog({ taskId = null, durationSeconds, type = 'focus', startedAt, endedAt, notes = '' } = {}) {
    const id = 'log_' + crypto.randomBytes(8).toString('hex');
    const now = new Date().toISOString();
    const start = startedAt || new Date(Date.now() - durationSeconds * 1000).toISOString();
    const end = endedAt || now;

    const [log] = await db.insert(schema.timeLogs).values({
      id,
      taskId,
      durationSeconds: Number(durationSeconds) || 0,
      type: type || 'focus',
      startedAt: start,
      endedAt: end,
      notes: notes || '',
      createdAt: now
    }).returning();

    if (taskId) {
      const addedMins = Math.round(Number(durationSeconds) / 60);
      if (addedMins > 0) {
        await db.update(schema.tasks)
          .set({ actualMins: sql`${schema.tasks.actualMins} + ${addedMins}` })
          .where(eq(schema.tasks.id, taskId));
      }
    }

    return log;
  },

  async getTimeLogs({ taskId, date } = {}) {
    let query = db.select({
      id: schema.timeLogs.id,
      task_id: schema.timeLogs.taskId,
      duration_seconds: schema.timeLogs.durationSeconds,
      type: schema.timeLogs.type,
      started_at: schema.timeLogs.startedAt,
      ended_at: schema.timeLogs.endedAt,
      notes: schema.timeLogs.notes,
      created_at: schema.timeLogs.createdAt,
      task_title: schema.tasks.title,
      task_category: schema.tasks.category
    })
    .from(schema.timeLogs)
    .leftJoin(schema.tasks, eq(schema.tasks.id, schema.timeLogs.taskId));

    const conditions = [];
    if (taskId) conditions.push(eq(schema.timeLogs.taskId, taskId));
    if (date) conditions.push(sql`${schema.timeLogs.startedAt} LIKE ${date + '%'}`);

    if (conditions.length) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(schema.timeLogs.startedAt));
  },

  // Daily Standup & Journal
  async getDailySummary(date) {
    const result = await db.select().from(schema.dailySummaries).where(eq(schema.dailySummaries.date, date));
    if (!result.length) return null;
    const s = result[0];
    return {
      date: s.date,
      summary_text: s.summaryText,
      mood: s.mood,
      blockers: s.blockers,
      goals_tomorrow: s.goalsTomorrow,
      key_takeaways: s.keyTakeaways,
      energy_rating: s.energyRating,
      created_at: s.createdAt,
      updated_at: s.updatedAt
    };
  },

  async saveDailySummary(date, params = {}) {
    const summaryText = params.summary_text !== undefined ? params.summary_text : (params.summaryText || '');
    const mood = params.mood || 'productive';
    const blockers = params.blockers || '';
    const goalsTomorrow = params.goals_tomorrow !== undefined ? params.goals_tomorrow : (params.goalsTomorrow || '');
    const keyTakeaways = params.key_takeaways !== undefined ? params.key_takeaways : (params.keyTakeaways || '');
    const energyRating = params.energy_rating !== undefined ? parseInt(params.energy_rating) : 3;
    const now = new Date().toISOString();

    await db.insert(schema.dailySummaries).values({
      date,
      summaryText,
      mood,
      blockers,
      goalsTomorrow,
      keyTakeaways,
      energyRating,
      createdAt: now,
      updatedAt: now
    }).onConflictDoUpdate({
      target: schema.dailySummaries.date,
      set: {
        summaryText,
        mood,
        blockers,
        goalsTomorrow,
        keyTakeaways,
        energyRating,
        updatedAt: now
      }
    });

    return this.getDailySummary(date);
  },

  async generateDailyStandup(date) {
    const tasks = await this.getTasks({ date });
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const inProgressTasks = tasks.filter(t => t.status === 'active');

    const logs = await this.getTimeLogs({ date });
    const totalSeconds = logs.reduce((sum, l) => sum + (Number(l.duration_seconds) || 0), 0);
    const focusSeconds = logs.reduce((sum, l) => sum + (l.type === 'focus' ? (Number(l.duration_seconds) || 0) : 0), 0);

    const totalHours = (totalSeconds / 3600).toFixed(1);
    const focusHours = (focusSeconds / 3600).toFixed(1);
    const existingJournal = (await this.getDailySummary(date)) || {};

    let markdown = `# 📋 Daily Standup — ${date}\n\n`;
    markdown += `**⏱️ Total Time Tracked:** ${totalHours}h (${focusHours}h Deep Focus)\n`;
    markdown += `**✅ Tasks Completed:** ${completedTasks.length}/${tasks.length}\n\n`;

    markdown += `### 🎯 Accomplished Today\n`;
    if (completedTasks.length === 0) {
      markdown += `- No tasks marked completed yet for today.\n`;
    } else {
      for (const t of completedTasks) {
        markdown += `- [x] **[${t.category}]** ${t.title} (${t.actual_mins}m logged / ${t.planned_mins}m planned)\n`;
        if (t.notes) markdown += `  - *Notes:* ${t.notes}\n`;
      }
    }

    markdown += `\n### ⏳ In Progress & Carry-over\n`;
    if (inProgressTasks.length === 0) {
      markdown += `- All planned tasks for today completed!\n`;
    } else {
      for (const t of inProgressTasks) {
        markdown += `- [ ] **[${t.category}]** ${t.title} (${t.actual_mins}m logged so far)\n`;
      }
    }

    if (existingJournal.blockers) {
      markdown += `\n### 🛑 Blockers & Obstacles\n${existingJournal.blockers}\n`;
    }

    if (existingJournal.goals_tomorrow) {
      markdown += `\n### 🚀 Goals for Tomorrow\n${existingJournal.goals_tomorrow}\n`;
    }

    return {
      date,
      markdown,
      totalHours,
      focusHours,
      completedCount: completedTasks.length,
      activeCount: inProgressTasks.length,
      mood: existingJournal.mood || 'productive'
    };
  },

  async getAnalytics(range = '30d') {
    const now = new Date();
    let startDate;

    if (range === 'today') {
      startDate = now.toISOString().split('T')[0];
    } else if (range === '7d') {
      const d = new Date(now);
      d.setDate(now.getDate() - 6);
      startDate = d.toISOString().split('T')[0];
    } else if (range === '30d') {
      const d = new Date(now);
      d.setDate(now.getDate() - 29);
      startDate = d.toISOString().split('T')[0];
    } else {
      startDate = '1970-01-01';
    }

    const logs = await db.select().from(schema.timeLogs).where(gte(schema.timeLogs.startedAt, startDate));
    const totalDuration = logs.reduce((sum, l) => sum + (Number(l.durationSeconds) || 0), 0);
    const focusDuration = logs.reduce((sum, l) => sum + (l.type === 'focus' ? (Number(l.durationSeconds) || 0) : 0), 0);

    const totalHours = (totalDuration / 3600).toFixed(1);
    const focusHours = (focusDuration / 3600).toFixed(1);

    const tasksList = await db.select().from(schema.tasks).where(gte(schema.tasks.date, startDate));
    const totalTasks = tasksList.length;
    const completedTasks = tasksList.filter(t => t.status === 'completed').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

    const deepFocusScore = totalTasks > 0
      ? Math.min(100, Math.round((completionRate * 0.5) + (Number(focusHours) > 0 ? 50 : 20)))
      : 85;

    const categoryMap = new Map();
    tasksList.forEach(t => {
      const cat = t.category || 'Engineering';
      const current = categoryMap.get(cat) || { category: cat, total_mins: 0, task_count: 0 };
      current.total_mins += Number(t.actualMins) || 0;
      current.task_count += 1;
      categoryMap.set(cat, current);
    });
    const categories = Array.from(categoryMap.values());

    return {
      totalHours: Number(totalHours),
      focusHours: Number(focusHours),
      totalTasks,
      completedTasks,
      completionRate,
      deepFocusScore,
      streak: 1,
      categories,
      heatmap: [],
      workload: []
    };
  },

  async getSettings() {
    const rows = await db.select().from(schema.settings);
    const map = {};
    rows.forEach(r => { map[r.key] = r.value; });
    return map;
  },

  async updateSettings(settingsObj) {
    for (const [k, v] of Object.entries(settingsObj)) {
      await db.insert(schema.settings)
        .values({ key: k, value: String(v) })
        .onConflictDoUpdate({
          target: schema.settings.key,
          set: { value: String(v) }
        });
    }
    return this.getSettings();
  },

  async getClasses(platform) {
    let query = db.select().from(schema.classes);
    if (platform && platform !== 'all') {
      query = query.where(eq(schema.classes.platform, platform));
    }
    return await query.orderBy(desc(schema.classes.createdAt));
  },

  async createClass({ platform, title, module = '', status = 'pending', notes = '', date }) {
    const id = 'cls_' + crypto.randomBytes(8).toString('hex');
    const classDate = date || new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    const [cls] = await db.insert(schema.classes).values({
      id,
      platform,
      title: title.trim(),
      module: module.trim(),
      status,
      notes: notes.trim(),
      date: classDate,
      createdAt: now
    }).returning();

    return cls;
  },

  async updateClass(id, fields) {
    await db.update(schema.classes).set(fields).where(eq(schema.classes.id, id));
    const result = await db.select().from(schema.classes).where(eq(schema.classes.id, id));
    return result[0] || null;
  },

  async deleteClass(id) {
    await db.delete(schema.classes).where(eq(schema.classes.id, id));
  },

  async getWorkouts(date) {
    let query = db.select().from(schema.workouts);
    if (date) {
      query = query.where(eq(schema.workouts.date, date));
    }
    return await query.orderBy(desc(schema.workouts.createdAt));
  },

  async createWorkout({ exercise, category = 'Push', sets = 3, reps = '12', weight = 'Bodyweight', status = 'pending', date }) {
    const id = 'wrk_' + crypto.randomBytes(8).toString('hex');
    const wDate = date || new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    const [wrk] = await db.insert(schema.workouts).values({
      id,
      exercise: exercise.trim(),
      category,
      sets,
      reps,
      weight,
      status,
      date: wDate,
      createdAt: now
    }).returning();

    return wrk;
  },

  async updateWorkout(id, fields) {
    await db.update(schema.workouts).set(fields).where(eq(schema.workouts.id, id));
    const result = await db.select().from(schema.workouts).where(eq(schema.workouts.id, id));
    return result[0] || null;
  },

  async deleteWorkout(id) {
    await db.delete(schema.workouts).where(eq(schema.workouts.id, id));
  },

  async getBTechSubjects(semester) {
    let query = db.select().from(schema.btechSubjects);
    if (semester && semester !== 'all') {
      query = query.where(eq(schema.btechSubjects.semester, parseInt(semester)));
    }
    return await query.orderBy(asc(schema.btechSubjects.semester), asc(schema.btechSubjects.code));
  },

  async createBTechSubject({ subject_name, code, credits = 3, internal_marks = 0, external_marks = 0, grade = 'A', status = 'ongoing', semester = 5 }) {
    const id = 'sub_' + crypto.randomBytes(8).toString('hex');
    const [sub] = await db.insert(schema.btechSubjects).values({
      id,
      subjectName: subject_name.trim(),
      code: code.trim(),
      credits,
      internalMarks: internal_marks,
      externalMarks: external_marks,
      grade,
      status,
      semester: parseInt(semester) || 5
    }).returning();

    return sub;
  },

  async updateBTechSubject(id, fields) {
    const updateData = {};
    if (fields.subject_name !== undefined) updateData.subjectName = fields.subject_name;
    if (fields.code !== undefined) updateData.code = fields.code;
    if (fields.credits !== undefined) updateData.credits = fields.credits;
    if (fields.internal_marks !== undefined) updateData.internalMarks = fields.internal_marks;
    if (fields.external_marks !== undefined) updateData.externalMarks = fields.external_marks;
    if (fields.grade !== undefined) updateData.grade = fields.grade;
    if (fields.status !== undefined) updateData.status = fields.status;
    if (fields.semester !== undefined) updateData.semester = parseInt(fields.semester);

    await db.update(schema.btechSubjects).set(updateData).where(eq(schema.btechSubjects.id, id));
    const result = await db.select().from(schema.btechSubjects).where(eq(schema.btechSubjects.id, id));
    return result[0] || null;
  },

  async deleteBTechSubject(id) {
    await db.delete(schema.btechSubjects).where(eq(schema.btechSubjects.id, id));
  },

  async getCodingPractice() {
    return await db.select().from(schema.codingPractice).orderBy(desc(schema.codingPractice.date));
  },

  async createCodingPractice({ platform = 'LeetCode', problem_title, difficulty = 'Medium', status = 'solved', date, notes = '' }) {
    const id = 'cod_' + crypto.randomBytes(8).toString('hex');
    const cDate = date || new Date().toISOString().split('T')[0];

    const [cod] = await db.insert(schema.codingPractice).values({
      id,
      platform,
      problemTitle: problem_title.trim(),
      difficulty,
      status,
      date: cDate,
      notes: notes.trim()
    }).returning();

    return cod;
  },

  async deleteCodingPractice(id) {
    await db.delete(schema.codingPractice).where(eq(schema.codingPractice.id, id));
  },

  async getSubjectWorks(subjectId) {
    return await db.select().from(schema.subjectWorks)
      .where(eq(schema.subjectWorks.subjectId, subjectId))
      .orderBy(asc(schema.subjectWorks.deadline));
  },

  async createSubjectWork({ subjectId, title, type = 'Assignment', status = 'pending', deadline = '' }) {
    const id = 'work_' + crypto.randomBytes(8).toString('hex');
    const now = new Date().toISOString();

    const [work] = await db.insert(schema.subjectWorks).values({
      id,
      subjectId,
      title: title.trim(),
      type,
      status,
      deadline,
      createdAt: now
    }).returning();

    return work;
  },

  async updateSubjectWork(id, fields) {
    await db.update(schema.subjectWorks).set(fields).where(eq(schema.subjectWorks.id, id));
    const result = await db.select().from(schema.subjectWorks).where(eq(schema.subjectWorks.id, id));
    return result[0] || null;
  },

  async deleteSubjectWork(id) {
    await db.delete(schema.subjectWorks).where(eq(schema.subjectWorks.id, id));
  },

  async clearWorkData() {
    await db.delete(schema.timeLogs);
    await db.delete(schema.tasks);
    await db.delete(schema.dailySummaries);
    await db.delete(schema.classes);
    await db.delete(schema.workouts);
    await db.delete(schema.btechSubjects);
    await db.delete(schema.codingPractice);
    await db.delete(schema.subjectWorks);
  },

  async seedSampleData() {
    await this.clearWorkData();
  }
};

module.exports = dbApi;
