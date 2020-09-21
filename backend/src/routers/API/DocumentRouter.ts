import { Router } from 'express';

import DocumentController from '../../controllers/DocumentController'
import AuthMiddleware from '../../middlewares/AuthMiddleware';

const DocumentRouter = Router();

// DocumentRouter.get('/profile',    AuthMiddleware.isAuthenticate, DocumentController.todo);

export default DocumentRouter;