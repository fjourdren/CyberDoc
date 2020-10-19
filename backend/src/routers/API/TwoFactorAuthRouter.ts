import {Router} from 'express';

import TwoFactorAuthController from '../../controllers/TwoFactorAuthController'
import AuthMiddleware from '../../middlewares/AuthMiddleware';

const TwoFactorAuthRouter = Router();

TwoFactorAuthRouter.post('/send/email', AuthMiddleware.isAuthenticateOrEditToken, TwoFactorAuthController.sendTokenByEmail);
TwoFactorAuthRouter.post('/send/sms', AuthMiddleware.isAuthenticateOrEditToken, TwoFactorAuthController.sendTokenBySms);
TwoFactorAuthRouter.post('/verify/token', AuthMiddleware.isAuthenticateOrEditToken, TwoFactorAuthController.verifyTokenAppSmsEmail);
TwoFactorAuthRouter.post('/secret', AuthMiddleware.isAuthenticate, TwoFactorAuthController.generateSecretUriAndQr);

export default TwoFactorAuthRouter;