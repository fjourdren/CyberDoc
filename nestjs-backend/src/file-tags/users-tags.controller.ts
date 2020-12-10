import { Body, Controller, Delete, Get, Param, Post, Put, Req } from '@nestjs/common';
import { Request } from "express";
import { UsersService } from 'src/users/users.service';
import { CreateOrUpdateTagDto } from './dto/create-or-update-tag.dto';
import { UsersTagsService } from './users-tags.service';

@Controller('users')
export class UsersTagsController {

    constructor(
        private readonly usersService: UsersService,
        private readonly usersTagsService: UsersTagsService
    ) { }

    @Post("tags")
    async createTag(@Req() req: Request, @Body() dto: CreateOrUpdateTagDto) {
        const user = await this.usersService.findOneByID((req.user as any).userID);
        await this.usersTagsService.createTag(user, dto.name, dto.color);
    }

    @Put("tags/:tagID")
    async updateTag(@Req() req: Request, @Param('tagID') tagID: string, @Body() dto: CreateOrUpdateTagDto) {
        const user = await this.usersService.findOneByID((req.user as any).userID);
        await this.usersTagsService.updateTag(user, tagID, dto.name, dto.color);
    }

    @Delete("tags/:tagID")
    async deleteTag(@Req() req: Request, @Param('tagID') tagID: string) {
        const user = await this.usersService.findOneByID((req.user as any).userID);
        await this.usersTagsService.deleteTag(user, tagID);
    }

}
