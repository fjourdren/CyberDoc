import express from 'express';

import AuthRouter from './API/AuthRouter';
import UserRouter from './API/UserRouter';

// main Router
const api = express.Router();

api.use('/auth', AuthRouter);
api.use('/user', UserRouter);

export default api;