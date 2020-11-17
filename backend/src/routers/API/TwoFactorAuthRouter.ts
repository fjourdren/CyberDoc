import {Router} from 'express';

import TwoFactorAuthController from '../../controllers/TwoFactorAuthController'
import AuthMiddleware from '../../middlewares/AuthMiddleware';

const TwoFactorAuthRouter = Router();

TwoFactorAuthRouter.post('/send/sms', AuthMiddleware.isAuthenticateOrEditToken, TwoFactorAuthController.sendTokenBySms);
TwoFactorAuthRouter.post('/verify/token/app', AuthMiddleware.isAuthenticateOrEditToken, TwoFactorAuthController.verifyTokenApp);
TwoFactorAuthRouter.post('/verify/token/sms', AuthMiddleware.isAuthenticateOrEditToken, TwoFactorAuthController.verifyTokenSms);
TwoFactorAuthRouter.post('/secret', AuthMiddleware.isAuthenticate, TwoFactorAuthController.generateSecretUriAndQr);

export default TwoFactorAuthRouter;
