import { UserDevice } from '../schemas/user-device.schema';
import { ApiProperty } from '@nestjs/swagger';
import { GenericResponse } from '../generic-response.interceptor';

const CURRENT_DEVICE_EXAMPLE = new UserDevice();
CURRENT_DEVICE_EXAMPLE.name = 'My computer';
CURRENT_DEVICE_EXAMPLE.os = 'Windows 10';
CURRENT_DEVICE_EXAMPLE.browser = 'Chrome';

export class Session {
  @ApiProperty({ description: 'Device info', example: CURRENT_DEVICE_EXAMPLE })
  device: UserDevice;

  @ApiProperty({
    description: 'Hashed JWT',
    example:
      '9497b46eb40a3d2e050d110b94abefa90d335854f5e7e5a68c2fba9edc1ec8e1de8a53b98d9ebc1634a61cf047e8633ad20c35329e9e5bc8c12593402a1f0c85',
  })
  hashedJWT: string;

  @ApiProperty({ description: 'Device IP', example: '::1' })
  ip: string;

  @ApiProperty({ description: 'Session creation date', example: new Date() })
  creationDate: Date;
}

export class GetActiveSessionsResponse extends GenericResponse {
  @ApiProperty({ description: 'Active sessions', type: [Session] })
  sessions: Session[];
}
