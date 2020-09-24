import { Router } from 'express';

import FileController from '../../controllers/FileController'
import AuthMiddleware from '../../middlewares/AuthMiddleware';

const FileRouter = Router();

//https://redocly.github.io/redoc/?url=https://pastebin.pl/view/raw/2faea685#/paths/~1file/post

FileRouter.post('/', AuthMiddleware.isAuthenticate, FileController.upload);
FileRouter.get('/:fileId', AuthMiddleware.isAuthenticate, FileController.get);
FileRouter.put('/:fileId', AuthMiddleware.isAuthenticate, FileController.update);
FileRouter.patch('/:fileId', AuthMiddleware.isAuthenticate, FileController.rename);
FileRouter.delete('/:fileId', AuthMiddleware.isAuthenticate, FileController.delete);

FileRouter.post('/:fileId/move', AuthMiddleware.isAuthenticate, FileController.move);
FileRouter.post('/:fileId/copy', AuthMiddleware.isAuthenticate, FileController.copy);

FileRouter.get('/:fileId/preview', AuthMiddleware.isAuthenticate, FileController.preview);
FileRouter.get('/:fileId/download', AuthMiddleware.isAuthenticate, FileController.download);

export default FileRouter;