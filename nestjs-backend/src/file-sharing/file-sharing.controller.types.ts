import { ApiProperty } from "@nestjs/swagger";
import { FileInResponse } from "src/files/files.controller.types";
import { GenericResponse } from "src/generic-response.interceptor";

export class GetSharedFilesResponse extends GenericResponse {
    @ApiProperty({ description: "Files", type: [FileInResponse] })
    results: FileInResponse[];
}

export class GetSharingAccessResponse extends GenericResponse {
    @ApiProperty({ description: "Users who have access", example: ["mail@example.com"] })
    shared_users: string[];
    
    @ApiProperty({ description: "Users who have pending access", example: ["mail@example.com"] })
    shared_users_pending: string[];
}