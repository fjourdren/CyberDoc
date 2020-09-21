import { Router } from 'express';

import UserController from '../../controllers/UserController'
import AuthMiddleware from '../../middlewares/AuthMiddleware';

const UserRouter = Router();

//UserRouter.get('/profile',    AuthMiddleware.isAuthenticate, UserController.profile);
//UserRouter.post('/settings',  AuthMiddleware.isAuthenticate, UserController.settings);
//UserRouter.delete('/account', AuthMiddleware.isAuthenticate, UserController.delete);

export default UserRouter;