const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const Admin = require('../models/Admin');
const FormField = require('../models/FormField');
const FormSettings = require('../models/FormSettings');
const Submission = require('../models/Submission');

const TEST_DB = 'mongodb://localhost:27017/student_reg_test';

let adminToken;

beforeAll(async () => {
  await mongoose.connect(TEST_DB);
  await Admin.deleteMany({});
  await FormField.deleteMany({});
  await FormSettings.deleteMany({});
  await Submission.deleteMany({});

  await Admin.create({ email: 'test@admin.com', password: 'TestPass123', name: 'Test Admin' });
  await FormSettings.create({
    formTitle: 'Test Registration',
    registrationEnabled: true,
    allowStudentEdits: true
  });
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

describe('Health Check', () => {
  it('should return ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Auth', () => {
  it('should login with valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@admin.com',
      password: 'TestPass123'
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    adminToken = res.body.token;
  });

  it('should reject invalid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@admin.com',
      password: 'WrongPassword'
    });
    expect(res.status).toBe(401);
  });

  it('should get admin profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('test@admin.com');
  });

  it('should reject requests without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

describe('Form Fields', () => {
  let fieldId;

  it('should create a field', async () => {
    const res = await request(app)
      .post('/api/form/fields')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ label: 'Full Name', name: 'full_name', type: 'text', required: true, validation: { minLength: 2, maxLength: 100 } });
    expect(res.status).toBe(201);
    expect(res.body.label).toBe('Full Name');
    fieldId = res.body._id;
  });

  it('should create an email field', async () => {
    const res = await request(app)
      .post('/api/form/fields')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ label: 'Email', name: 'email', type: 'email', required: true });
    expect(res.status).toBe(201);
  });

  it('should create a dropdown field', async () => {
    const res = await request(app)
      .post('/api/form/fields')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ label: 'Department', name: 'department', type: 'dropdown', options: ['CS', 'EE', 'ME'], required: true });
    expect(res.status).toBe(201);
  });

  it('should reject duplicate field names', async () => {
    const res = await request(app)
      .post('/api/form/fields')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ label: 'Full Name Again', name: 'full_name', type: 'text' });
    expect(res.status).toBe(400);
  });

  it('should get all active fields (public)', async () => {
    const res = await request(app).get('/api/form/fields');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(3);
  });

  it('should update a field', async () => {
    const res = await request(app)
      .put(`/api/form/fields/${fieldId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ placeholder: 'Enter your full name' });
    expect(res.status).toBe(200);
    expect(res.body.placeholder).toBe('Enter your full name');
  });

  it('should not allow unauthenticated field creation', async () => {
    const res = await request(app)
      .post('/api/form/fields')
      .send({ label: 'Test', name: 'test_unauth', type: 'text' });
    expect(res.status).toBe(401);
  });
});

describe('Form Settings', () => {
  it('should get settings (public)', async () => {
    const res = await request(app).get('/api/settings');
    expect(res.status).toBe(200);
    expect(res.body.formTitle).toBeDefined();
  });

  it('should update settings (admin)', async () => {
    const res = await request(app)
      .put('/api/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ formTitle: 'Updated Title', registrationEnabled: true });
    expect(res.status).toBe(200);
    expect(res.body.formTitle).toBe('Updated Title');
  });
});

describe('Submissions', () => {
  let submissionId;
  let editToken;

  it('should submit a registration', async () => {
    const res = await request(app)
      .post('/api/submissions')
      .send({ full_name: 'John Doe', email: 'john@example.com', department: 'CS' });
    expect(res.status).toBe(201);
    expect(res.body.editToken).toBeDefined();
    submissionId = res.body.submissionId;
    editToken = res.body.editToken;
  });

  it('should reject invalid submission', async () => {
    const res = await request(app)
      .post('/api/submissions')
      .send({ full_name: '', email: 'invalid-email', department: 'CS' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('should get own submission with edit token', async () => {
    const res = await request(app).get(`/api/submissions/mine/${editToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.full_name).toBe('John Doe');
  });

  it('should update own submission with edit token', async () => {
    const res = await request(app)
      .put(`/api/submissions/mine/${editToken}`)
      .send({ full_name: 'John Updated', email: 'john@example.com', department: 'EE' });
    expect(res.status).toBe(200);
    expect(res.body.submission.data.full_name).toBe('John Updated');
  });

  it('should list submissions (admin)', async () => {
    const res = await request(app)
      .get('/api/submissions')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.submissions.length).toBeGreaterThanOrEqual(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('should search submissions (admin)', async () => {
    const res = await request(app)
      .get('/api/submissions?search=John')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  it('should export submissions as CSV (admin)', async () => {
    const res = await request(app)
      .get('/api/submissions/export/csv')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
  });

  it('should export submissions as Excel (admin)', async () => {
    const res = await request(app)
      .get('/api/submissions/export/excel')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  it('should admin update submission', async () => {
    const res = await request(app)
      .put(`/api/submissions/${submissionId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ data: { full_name: 'Admin Updated' } });
    expect(res.status).toBe(200);
  });

  it('should admin delete submission', async () => {
    const createRes = await request(app)
      .post('/api/submissions')
      .send({ full_name: 'Delete Me', email: 'delete@test.com', department: 'ME' });
    const delId = createRes.body.submissionId;

    const res = await request(app)
      .delete(`/api/submissions/${delId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });
});

describe('Registration Disabled', () => {
  it('should reject submissions when registration is disabled', async () => {
    await request(app)
      .put('/api/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ registrationEnabled: false });

    const res = await request(app)
      .post('/api/submissions')
      .send({ full_name: 'Blocked', email: 'blocked@test.com', department: 'CS' });
    expect(res.status).toBe(403);

    await request(app)
      .put('/api/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ registrationEnabled: true });
  });
});
