import { Router } from 'express';

import UserController from '../../controllers/UserController'
import UserTagController from '../../controllers/UserTagController';
import AuthMiddleware from '../../middlewares/AuthMiddleware';
import UserMiddleware from '../../middlewares/UserMiddleware';
import { Role } from '../../models/User';

const UserRouter = Router();

UserRouter.get('/profile', AuthMiddleware.isAuthenticate, UserController.profile);
UserRouter.post('/profile', AuthMiddleware.isAuthenticate, UserController.settings);
UserRouter.delete('/profile', AuthMiddleware.isAuthenticate, UserController.delete);

UserRouter.post('/tags', AuthMiddleware.isAuthenticate, UserTagController.create);
UserRouter.patch('/tags/:tagId', AuthMiddleware.isAuthenticate, UserTagController.edit);
UserRouter.delete('/tags/:tagId', AuthMiddleware.isAuthenticate, UserTagController.delete);

export default UserRouter;