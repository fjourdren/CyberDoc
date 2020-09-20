import { Router } from 'express';

import AuthController from '../../controllers/AuthController'
import AuthMiddleware from '../../middlewares/AuthMiddleware';

const AuthRouter = Router();

AuthRouter.post('/signup', AuthMiddleware.test, AuthController.signup);
AuthRouter.post('/signin', AuthController.signIn);
AuthRouter.post('/forgottenpassword', AuthController.forgottenPassword);
AuthRouter.post('/renewtoken', AuthController.renewToken);

export default AuthRouter;