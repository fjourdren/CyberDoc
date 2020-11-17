import { Router } from 'express';

import UserController from '../../controllers/UserController'
import UserDeviceController from '../../controllers/UserDeviceController';
import UserEncryptionController from '../../controllers/UserEncryptionController';
import UserTagController from '../../controllers/UserTagController';
import AuthMiddleware from '../../middlewares/AuthMiddleware';

const UserRouter = Router();

// profile
UserRouter.get('/profile', AuthMiddleware.isAuthenticate, UserController.profile);
UserRouter.post('/profile', AuthMiddleware.isAuthenticateOrEditToken, UserController.settings);
UserRouter.delete('/profile', AuthMiddleware.isAuthenticate, UserController.delete);

// tag management
UserRouter.post('/tags', AuthMiddleware.isAuthenticate, UserTagController.create);
UserRouter.patch('/tags/:tagId', AuthMiddleware.isAuthenticate, UserTagController.edit);
UserRouter.delete('/tags/:tagId', AuthMiddleware.isAuthenticate, UserTagController.delete);

UserRouter.post('/devices', AuthMiddleware.isAuthenticate, UserDeviceController.create);
UserRouter.get('/devices', AuthMiddleware.isAuthenticate, UserDeviceController.get);
UserRouter.patch('/devices/:name', AuthMiddleware.isAuthenticate, UserDeviceController.edit);
UserRouter.delete('/devices/:name', AuthMiddleware.isAuthenticate, UserDeviceController.delete);
// import and export user's encryption keys
UserRouter.get('/keys', AuthMiddleware.isAuthenticate, UserEncryptionController.export);
UserRouter.post('/keys', AuthMiddleware.isAuthenticateOrEditToken, UserEncryptionController.import);

export default UserRouter;