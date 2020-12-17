import { SetMetadata } from '@nestjs/common';

export const SKIP_JWT_AUTH_KEY = 'skipJWTAuth';
export const SkipJWTAuth = () => SetMetadata(SKIP_JWT_AUTH_KEY, true);
