import { Router } from 'express';

import UserController from '../../controllers/UserController'
import UserDeviceController from '../../controllers/UserDeviceController';
import UserTagController from '../../controllers/UserTagController';
import AuthMiddleware from '../../middlewares/AuthMiddleware';

const UserRouter = Router();

UserRouter.get('/profile', AuthMiddleware.isAuthenticate, UserController.profile);
UserRouter.post('/profile', AuthMiddleware.isAuthenticateOrEditToken, UserController.settings);
UserRouter.delete('/profile', AuthMiddleware.isAuthenticate, UserController.delete);

UserRouter.post('/tags', AuthMiddleware.isAuthenticate, UserTagController.create);
UserRouter.patch('/tags/:tagId', AuthMiddleware.isAuthenticate, UserTagController.edit);
UserRouter.delete('/tags/:tagId', AuthMiddleware.isAuthenticate, UserTagController.delete);

UserRouter.post('/devices', AuthMiddleware.isAuthenticate, UserDeviceController.create);
UserRouter.get('/devices', AuthMiddleware.isAuthenticate, UserDeviceController.get);
UserRouter.delete('/devices/:name', AuthMiddleware.isAuthenticate, UserDeviceController.delete);

export default UserRouter;