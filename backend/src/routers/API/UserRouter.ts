import { Router } from 'express';

import UserController from '../../controllers/UserController'

const UserRouter = Router();

UserRouter.get('/profile', UserController.profile);

export default UserRouter;