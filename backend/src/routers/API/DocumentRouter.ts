import { Router } from 'express';

import DocumentController from '../../controllers/DocumentController'

const DocumentRouter = Router();

//DocumentRouter.get('/profile',    AuthMiddleware.isAuthenticate, DocumentController.profile);

export default DocumentRouter;