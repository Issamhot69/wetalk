import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChannelsService } from './channels.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateDirectDto {
  @IsString() targetId: string;
}

export class CreateGroupDto {
  @IsString() name: string;
  @IsOptional() @IsString() description?: string;
  @IsArray() memberIds: string[];
}

@ApiTags('Channels')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('channels')
export class ChannelsController {
  constructor(private channelsService: ChannelsService) {}

  @Get()
  @ApiOperation({ summary: 'Mes conversations' })
  getMyChannels(@Req() req: any) {
    return this.channelsService.getUserChannels(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d un channel' })
  getChannel(@Param('id') id: string, @Req() req: any) {
    return this.channelsService.getChannel(id, req.user.id);
  }

  @Post('direct')
  @ApiOperation({ summary: 'Ouvrir une conversation directe' })
  createDirect(@Req() req: any, @Body() dto: CreateDirectDto) {
    return this.channelsService.createDirect(req.user.id, dto.targetId);
  }

  @Post('group')
  @ApiOperation({ summary: 'Créer un groupe' })
  createGroup(@Req() req: any, @Body() dto: CreateGroupDto) {
    return this.channelsService.createGroup({ ...dto, ownerId: req.user.id });
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Ajouter un membre' })
  addMember(@Param('id') id: string, @Req() req: any, @Body('userId') userId: string) {
    return this.channelsService.addMember(id, req.user.id, userId);
  }

  @Delete(':id/leave')
  @ApiOperation({ summary: 'Quitter un channel' })
  leave(@Param('id') id: string, @Req() req: any) {
    return this.channelsService.leave(id, req.user.id);
  }
}
