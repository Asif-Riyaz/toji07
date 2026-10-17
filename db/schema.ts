import { pgTable, serial, text, integer, doublePrecision } from 'drizzle-orm/pg-core';

export const planets = pgTable('planets', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  massKg: doublePrecision('mass_kg').notNull(),
  temperatureCelsius: integer('temperature_celsius').notNull(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  passwordSalt: text('password_salt').notNull(),
  createdAt: text('created_at').notNull(),
  lastLoginAt: text('last_login_at'),
});

export const sessions = pgTable('sessions', {
  token: text('token').primaryKey(),
  userId: integer('user_id').notNull(),
  createdAt: text('created_at').notNull(),
  expiresAt: text('expires_at').notNull(),
  lastActivityAt: text('last_activity_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
});

export const tasks = pgTable('tasks', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  notes: text('notes').default(''),
  category: text('category').default('Engineering').notNull(),
  priority: text('priority').default('Medium').notNull(),
  status: text('status').default('active').notNull(),
  plannedMins: integer('planned_mins').default(45).notNull(),
  actualMins: integer('actual_mins').default(0).notNull(),
  date: text('date').notNull(),
  sortOrder: integer('sort_order').default(0),
  createdAt: text('created_at').notNull(),
  completedAt: text('completed_at'),
  subjectId: text('subject_id'),
});

export const timeLogs = pgTable('time_logs', {
  id: text('id').primaryKey(),
  taskId: text('task_id'),
  durationSeconds: integer('duration_seconds').notNull(),
  type: text('type').default('focus').notNull(),
  startedAt: text('started_at').notNull(),
  endedAt: text('ended_at').notNull(),
  notes: text('notes').default(''),
  createdAt: text('created_at').notNull(),
});

export const dailySummaries = pgTable('daily_summaries', {
  date: text('date').primaryKey(),
  summaryText: text('summary_text').default(''),
  mood: text('mood').default('productive'),
  blockers: text('blockers').default(''),
  goalsTomorrow: text('goals_tomorrow').default(''),
  keyTakeaways: text('key_takeaways').default(''),
  energyRating: integer('energy_rating').default(3),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

export const classes = pgTable('classes', {
  id: text('id').primaryKey(),
  platform: text('platform').notNull(),
  title: text('title').notNull(),
  module: text('module').default(''),
  status: text('status').default('pending').notNull(),
  notes: text('notes').default(''),
  date: text('date').notNull(),
  createdAt: text('created_at').notNull(),
});

export const workouts = pgTable('workouts', {
  id: text('id').primaryKey(),
  exercise: text('exercise').notNull(),
  category: text('category').default('Push').notNull(),
  sets: integer('sets').default(3),
  reps: text('reps').default('12'),
  weight: text('weight').default('Bodyweight'),
  status: text('status').default('pending').notNull(),
  date: text('date').notNull(),
  createdAt: text('created_at').notNull(),
});

export const btechSubjects = pgTable('btech_subjects', {
  id: text('id').primaryKey(),
  subjectName: text('subject_name').notNull(),
  code: text('code').notNull(),
  credits: integer('credits').default(3),
  internalMarks: integer('internal_marks').default(0),
  externalMarks: integer('external_marks').default(0),
  grade: text('grade').default('A'),
  status: text('status').default('ongoing').notNull(),
  semester: integer('semester').default(5),
});

export const codingPractice = pgTable('coding_practice', {
  id: text('id').primaryKey(),
  platform: text('platform').notNull(),
  problemTitle: text('problem_title').notNull(),
  difficulty: text('difficulty').default('Medium').notNull(),
  status: text('status').default('solved').notNull(),
  date: text('date').notNull(),
  notes: text('notes').default(''),
});

export const subjectWorks = pgTable('subject_works', {
  id: text('id').primaryKey(),
  subjectId: text('subject_id').notNull(),
  title: text('title').notNull(),
  type: text('type').default('Assignment').notNull(),
  status: text('status').default('pending').notNull(),
  deadline: text('deadline'),
  createdAt: text('created_at').notNull(),
});
