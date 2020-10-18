import {Router} from 'express';

import TwoFactorAuthController from '../../controllers/TwoFactorAuthController'
import AuthMiddleware from '../../middlewares/AuthMiddleware';

const TwoFactorAuthRouter = Router();

TwoFactorAuthRouter.post('/send/email', AuthMiddleware.isAuthenticate, TwoFactorAuthController.sendTokenByEmail);
TwoFactorAuthRouter.post('/send/sms', AuthMiddleware.isAuthenticate, TwoFactorAuthController.sendTokenBySms);

TwoFactorAuthRouter.post('/verify/token', AuthMiddleware.isAuthenticate, TwoFactorAuthController.verifyTokenAppSmsEmail);

TwoFactorAuthRouter.get('/status/sms', AuthMiddleware.isAuthenticate, TwoFactorAuthController.checkStatusSms);
TwoFactorAuthRouter.get('/status/email', AuthMiddleware.isAuthenticate, TwoFactorAuthController.checkStatusEmail);

TwoFactorAuthRouter.post('/secret', AuthMiddleware.isAuthenticate, TwoFactorAuthController.generateSecretUriAndQr)

export default TwoFactorAuthRouter;