import { Router } from 'express';

import FileController from '../../controllers/FileController'
import AuthMiddleware from '../../middlewares/AuthMiddleware';
import UserMiddleware from '../../middlewares/UserMiddleware';
import { Role } from '../../models/User';

const FileRouter = Router();

FileRouter.post('/', AuthMiddleware.isAuthenticate, UserMiddleware.hasRoles([Role.OWNER]), FileController.upload);
FileRouter.get('/:fileId', AuthMiddleware.isAuthenticate, FileController.get);
FileRouter.put('/:fileId', AuthMiddleware.isAuthenticate, FileController.updateContent);
FileRouter.patch('/:fileId', AuthMiddleware.isAuthenticate, FileController.edit);
FileRouter.delete('/:fileId', AuthMiddleware.isAuthenticate, FileController.delete);

FileRouter.post('/:fileId/copy', AuthMiddleware.isAuthenticate, FileController.copy);

//FileRouter.get('/:fileId/preview', AuthMiddleware.isAuthenticate, FileController.preview);
FileRouter.get('/:fileId/download', AuthMiddleware.isAuthenticate, FileController.download);

export default FileRouter;