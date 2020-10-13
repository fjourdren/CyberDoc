import { Router } from 'express';

import TwoFactorAuthController from '../../controllers/TwoFactorAuthController'
import TwoFactorAuthMiddleware from '../../middlewares/TwoFactorAuthMiddleware';
import AuthMiddleware from '../../middlewares/AuthMiddleware';

const TwoFactorAuthRouter = Router();

TwoFactorAuthRouter.post('/send/email', AuthMiddleware.isAuthenticate, TwoFactorAuthController.sendTokenByEmail);
TwoFactorAuthRouter.post('/send/sms', AuthMiddleware.isAuthenticate, TwoFactorAuthController.sendTokenBySms);
TwoFactorAuthRouter.post('/send/push', AuthMiddleware.isAuthenticate, TwoFactorAuthController.sendPushNotification);
TwoFactorAuthRouter.post('/verify/token', AuthMiddleware.isAuthenticate, TwoFactorAuthController.verifyToken);
TwoFactorAuthRouter.post('/verify/push', AuthMiddleware.isAuthenticate, TwoFactorAuthController.verifyPushNotification);
TwoFactorAuthRouter.get('/status/app', AuthMiddleware.isAuthenticate, TwoFactorAuthController.checkStatusApp);
TwoFactorAuthRouter.get('/status/sms', AuthMiddleware.isAuthenticate, TwoFactorAuthController.checkStatusSms);
TwoFactorAuthRouter.get('/status/email', AuthMiddleware.isAuthenticate, TwoFactorAuthController.checkStatusEmail);
TwoFactorAuthRouter.post('/add', AuthMiddleware.isAuthenticate, TwoFactorAuthController.add);
TwoFactorAuthRouter.post('/delete', [AuthMiddleware.isAuthenticate, TwoFactorAuthMiddleware.isTwoFactorActivated], TwoFactorAuthController.delete);
TwoFactorAuthRouter.post('/qrcode', AuthMiddleware.isAuthenticate, TwoFactorAuthController.generateQrCode);

export default TwoFactorAuthRouter;