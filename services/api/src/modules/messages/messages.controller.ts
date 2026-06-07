import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { IsString, IsOptional } from 'class-validator';

export class SendMessageDto {
  @IsString() content: string;
  @IsString() channelId: string;
  @IsOptional() @IsString() replyToId?: string;
  @IsOptional() @IsString() type?: string;
}

export class EditMessageDto {
  @IsString() content: string;
}

@ApiTags('Messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Envoyer un message' })
  send(@Req() req: any, @Body() dto: SendMessageDto) {
    return this.messagesService.send({ ...dto, senderId: req.user.id });
  }

  @Get('channel/:channelId')
  @ApiOperation({ summary: 'Messages d un channel' })
  getMessages(
    @Param('channelId') channelId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.messagesService.getChannelMessages(
      channelId,
      cursor,
      limit ? parseInt(limit) : 30,
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier un message' })
  edit(@Param('id') id: string, @Req() req: any, @Body() dto: EditMessageDto) {
    return this.messagesService.edit(id, req.user.id, dto.content);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un message' })
  delete(@Param('id') id: string, @Req() req: any) {
    return this.messagesService.delete(id, req.user.id);
  }

  @Post(':id/reactions')
  @ApiOperation({ summary: 'Ajouter une réaction' })
  addReaction(
    @Param('id') id: string,
    @Req() req: any,
    @Body('emoji') emoji: string,
  ) {
    return this.messagesService.addReaction(id, req.user.id, emoji);
  }

  @Delete(':id/reactions/:emoji')
  @ApiOperation({ summary: 'Retirer une réaction' })
  removeReaction(
    @Param('id') id: string,
    @Param('emoji') emoji: string,
    @Req() req: any,
  ) {
    return this.messagesService.removeReaction(id, req.user.id, emoji);
  }
}
