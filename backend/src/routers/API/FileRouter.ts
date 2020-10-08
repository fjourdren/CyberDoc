import { Router } from 'express';

import FileController from '../../controllers/FileController'
import FileTagController from '../../controllers/FileTagController';
import AuthMiddleware from '../../middlewares/AuthMiddleware';
import UserMiddleware from '../../middlewares/UserMiddleware';
import { Role } from '../../models/User';

const FileRouter = Router();

FileRouter.post('/', AuthMiddleware.isAuthenticate, UserMiddleware.hasRoles([Role.OWNER]), FileController.upload);
FileRouter.post('/search', AuthMiddleware.isAuthenticate, FileController.search);
FileRouter.get('/:fileId', AuthMiddleware.isAuthenticate, FileController.get);
FileRouter.put('/:fileId', AuthMiddleware.isAuthenticate, FileController.updateContent);
FileRouter.patch('/:fileId', AuthMiddleware.isAuthenticate, UserMiddleware.hasRoles([Role.OWNER]), FileController.edit);
FileRouter.delete('/:fileId', AuthMiddleware.isAuthenticate, FileController.delete);

FileRouter.post('/:fileId/copy', AuthMiddleware.isAuthenticate, FileController.copy);

//FileRouter.get('/:fileId/preview', AuthMiddleware.isAuthenticate, FileController.preview);
FileRouter.get('/:fileId/download', AuthMiddleware.isAuthenticate, FileController.download);

// tag management
FileRouter.post('/:fileId/tags', AuthMiddleware.isAuthenticate, FileTagController.add);
FileRouter.delete('/:fileId/tags/:tagId', AuthMiddleware.isAuthenticate, FileTagController.remove);

export default FileRouter;