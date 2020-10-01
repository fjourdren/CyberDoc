import { Router } from 'express';

import UserController from '../../controllers/UserController'
import AuthMiddleware from '../../middlewares/AuthMiddleware';

const UserRouter = Router();

UserRouter.get('/profile', AuthMiddleware.isAuthenticate, UserController.profile);
UserRouter.post('/profile', AuthMiddleware.isAuthenticate, UserController.settings);
UserRouter.delete('/profile', AuthMiddleware.isAuthenticate, UserController.delete);

export default UserRouter;