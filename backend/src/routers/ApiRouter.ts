import express from 'express';

import AuthRouter from './API/AuthRouter';
import UserRouter from './API/UserRouter';
import DocumentRouter from './API/DocumentRouter';

// main Router
const api = express.Router();

api.use('/auth',  AuthRouter);
api.use('/users', UserRouter);
//api.use('/documents', DocumentRouter);

export default api;