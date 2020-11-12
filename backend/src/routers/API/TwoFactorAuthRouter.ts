import {Router} from 'express';

import TwoFactorAuthController from '../../controllers/TwoFactorAuthController'
import AuthMiddleware from '../../middlewares/AuthMiddleware';

const TwoFactorAuthRouter = Router();

TwoFactorAuthRouter.post('/send/sms', AuthMiddleware.isAuthenticateOrEditToken, TwoFactorAuthController.sendTokenBySms);
TwoFactorAuthRouter.post('/verify/token', AuthMiddleware.isAuthenticateOrEditToken, TwoFactorAuthController.verifyTokenAppSms);
TwoFactorAuthRouter.post('/secret', AuthMiddleware.isAuthenticate, TwoFactorAuthController.generateSecretUriAndQr);
TwoFactorAuthRouter.get('/generateRecoveryCodes', AuthMiddleware.isAuthenticate, TwoFactorAuthController.generateRecoveryCodes);
TwoFactorAuthRouter.post('/useRecoveryCode', AuthMiddleware.isAuthenticate, TwoFactorAuthController.useRecoveryCode);

export default TwoFactorAuthRouter;
