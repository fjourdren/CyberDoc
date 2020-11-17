import { Router } from 'express';

import AuthController from '../../controllers/AuthController'
import AuthMiddleware from '../../middlewares/AuthMiddleware';

const AuthRouter = Router();

AuthRouter.post('/signup', AuthMiddleware.isntAuthenticate, AuthController.signup);
AuthRouter.post('/signin', AuthMiddleware.isntAuthenticate, AuthController.signIn);
AuthRouter.post('/validatepassword', AuthMiddleware.isAuthenticate, AuthController.validatePassword);
AuthRouter.post('/forgottenpassword', AuthMiddleware.isntAuthenticate, AuthController.forgottenPassword);

export default AuthRouter;
