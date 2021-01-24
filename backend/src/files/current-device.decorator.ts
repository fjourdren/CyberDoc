import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDevice } from '../schemas/user-device.schema';
import { parse } from 'express-useragent';

export const CurrentDevice = createParamDecorator(
  (requiredAccess: number, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const rawUserAgent = request.headers['user-agent'];
    const userAgent = parse(rawUserAgent);

    const device = new UserDevice();
    device.os = userAgent.os;
    device.browser = userAgent.browser;
    if (request.user) {
      device.name = request.user.currentDeviceName;
    } else {
      // for UserController.createProfile
      device.name = 'Your device';
    }

    return device;
  },
);
