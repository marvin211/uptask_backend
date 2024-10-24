import { beforeAll, afterAll, describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../src/server';
import mongoose from 'mongoose';

beforeAll(async () => {
  // Conectar a la base de datos real usando la variable de entorno
  await mongoose.connect(process.env.DATABASE_URL as string);
});

afterAll(async () => {
  // Desconectar de la base de datos después de todas las pruebas
  await mongoose.disconnect();
});

describe('API Tests', () => {
  let authToken: string;
  let projectId: string;

  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Usuario creado correctamente');
  });

  it('should login a user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
    authToken = response.body.token;
  });

  it('should create a new project', async () => {
    const response = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        projectName: 'Test Project',
        clientName: 'Test Client',
        description: 'This is a test project'
      });
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Proyecto Creando Correctamente');
  });

  it('should get all projects', async () => {
    const response = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${authToken}`);
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
    projectId = response.body[0]._id;
  });

  it('should get a project by id', async () => {
    const response = await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('_id', projectId);
  });

  it('should update a project', async () => {
    const response = await request(app)
      .put(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        projectName: 'Updated Project Name',
        clientName: 'Updated Client Name',
        description: 'This is an updated project description'
      });
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Proyecto Actualizado');
  });

  it('should create a task for a project', async () => {
    const response = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Task',
        description: 'This is a test task'
      });
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Tarea creada correctamente');
  });

  it('should get all tasks for a project', async () => {
    const response = await request(app)
      .get(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
  });

  it('should delete a project', async () => {
    const response = await request(app)
      .delete(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Proyecto Eliminado');
  });
});
