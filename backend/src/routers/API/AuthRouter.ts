import { Router } from 'express';

import AuthController from '../../controllers/AuthController'

const AuthRouter = Router();

AuthRouter.post('/signon', AuthController.signOn);
AuthRouter.post('/signin', AuthController.signIn);
AuthRouter.post('/forgottenpassword', AuthController.forgottenPassword);
AuthRouter.post('/renewtoken', AuthController.renewToken);
AuthRouter.post('/signout', AuthController.signOut);

export default AuthRouter;