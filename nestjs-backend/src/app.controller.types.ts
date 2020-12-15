import { ApiProperty } from '@nestjs/swagger';
import { GenericResponse } from './generic-response.interceptor';

export class GetAPIInfoResponse extends GenericResponse {

    @ApiProperty({ description: "App name", example: "MyAPI" })
    name: string;

    @ApiProperty({ description: "App version", example: "v1.0.0" })
    version: string;
}