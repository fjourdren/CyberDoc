import { Router } from 'express';
import slowDown from "express-slow-down";
import rateLimit from "express-rate-limit";

import AuthController from '../../controllers/AuthController'
import AuthMiddleware from '../../middlewares/AuthMiddleware';

const AuthRouter = Router();

const signinSpeedLimiter = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 5, // allow 5 requests to go at full-speed, then...
    delayMs: 100, // 6th request has a 100ms delay, 7th has a 200ms delay, 8th gets 300ms, etc.
    maxDelayMs: 5000,
});

const validatePasswordSpeedLimiter = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 5, // allow 5 requests to go at full-speed, then...
    delayMs: 100, // 6th request has a 100ms delay, 7th has a 200ms delay, 8th gets 300ms, etc.
    maxDelayMs: 5000,
});

const signupLimiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 1, // limit each IP to 1 requests per windowMs
    skipFailedRequests: true
});

const forgottenPasswordSpeedLimiter = slowDown({
    windowMs: 30 * 60 * 1000, // 30 minutes
    delayAfter: 2, // allow 2 requests to go at full-speed, then...
    delayMs: 500, // 6th request has a 500ms delay, 7th has a 1000ms delay, 8th gets 1500ms, etc.
    maxDelayMs: 5000,
});


AuthRouter.post('/signup', AuthMiddleware.isntAuthenticate, signupLimiter, AuthController.signup);
AuthRouter.post('/signin', AuthMiddleware.isntAuthenticate, signinSpeedLimiter, AuthController.signIn);
AuthRouter.post('/validatepassword', AuthMiddleware.isAuthenticate, validatePasswordSpeedLimiter, AuthController.validatePassword);
AuthRouter.post('/forgottenpassword', AuthMiddleware.isntAuthenticate, forgottenPasswordSpeedLimiter, AuthController.forgottenPassword);

export default AuthRouter;