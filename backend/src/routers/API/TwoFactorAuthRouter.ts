import {Router} from 'express';

import TwoFactorAuthController from '../../controllers/TwoFactorAuthController'
import AuthMiddleware from '../../middlewares/AuthMiddleware';

const TwoFactorAuthRouter = Router();

TwoFactorAuthRouter.post('/send/sms', AuthMiddleware.isAuthenticateOrEditToken, TwoFactorAuthController.sendTokenBySms);
TwoFactorAuthRouter.post('/verify/token', AuthMiddleware.isAuthenticateOrEditToken, TwoFactorAuthController.verifyTokenAppSms);
TwoFactorAuthRouter.post('/verify/recoveryCode', AuthMiddleware.isAuthenticate, TwoFactorAuthController.verifyRecoveryCode);
TwoFactorAuthRouter.post('/secret', AuthMiddleware.isAuthenticate, TwoFactorAuthController.generateSecretUriAndQr);
TwoFactorAuthRouter.get('/recoveryCodes', AuthMiddleware.isAuthenticate, TwoFactorAuthController.generateRecoveryCodes);

export default TwoFactorAuthRouter;
