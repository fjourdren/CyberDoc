import { Router } from 'express';

import AuthController from '../../controllers/AuthController'
import AuthMiddleware from '../../middlewares/AuthMiddleware';

const AuthRouter = Router();

AuthRouter.post('/signup',            AuthMiddleware.isAuthenticate, AuthController.signup);
AuthRouter.post('/signin',            AuthMiddleware.isntAuthenticate, AuthController.signIn);
//AuthRouter.get('/forgottenpassword',  AuthMiddleware.isntAuthenticate, AuthController.forgottenPassword);
//AuthRouter.post('/renewtoken',        AuthMiddleware.isAuthenticate,   AuthController.renewToken);

export default AuthRouter;