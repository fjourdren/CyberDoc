import express from 'express';

import userRouter from './API/UserRouter';

// main Router
const api = express.Router();

api.use('/auth', userRouter);
api.use('/user', userRouter);

export default api;