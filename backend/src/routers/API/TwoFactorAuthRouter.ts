import { Router } from 'express';

import TwoFactorAuthController from '../../controllers/TwoFactorAuthController'
import TwoFactorAuthMiddleware from '../../middlewares/TwoFactorAuthMiddleware';

const TwoFactorAuthRouter = Router();

TwoFactorAuthRouter.post('/send/email', TwoFactorAuthMiddleware.isTwoFactorActivated, TwoFactorAuthController.sendTokenByEmail);
TwoFactorAuthRouter.post('/send/sms', TwoFactorAuthMiddleware.isTwoFactorActivated, TwoFactorAuthController.sendTokenBySms);
TwoFactorAuthRouter.post('/send/push', TwoFactorAuthMiddleware.isTwoFactorActivated, TwoFactorAuthController.sendPushNotification);
TwoFactorAuthRouter.post('/verify/token', TwoFactorAuthMiddleware.isTwoFactorActivated, TwoFactorAuthController.verifyToken);
TwoFactorAuthRouter.post('/verify/push', TwoFactorAuthMiddleware.isTwoFactorActivated, TwoFactorAuthController.verifyPushNotification);
TwoFactorAuthRouter.post('/add', TwoFactorAuthController.add);
TwoFactorAuthRouter.post('/delete', TwoFactorAuthMiddleware.isTwoFactorActivated, TwoFactorAuthController.delete);
TwoFactorAuthRouter.post('/qrcode', TwoFactorAuthMiddleware.isTwoFactorActivated, TwoFactorAuthController.generateQrCode);

export default TwoFactorAuthRouter;