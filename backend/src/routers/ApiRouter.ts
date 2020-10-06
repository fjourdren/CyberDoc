import express from 'express';

import AuthRouter from './API/AuthRouter';
import UserRouter from './API/UserRouter';
import FileRouter from './API/FileRouter';

// main Router
const api = express.Router();

api.use('/auth',  AuthRouter);
api.use('/users', UserRouter);
api.use('/files', FileRouter);

export default api;