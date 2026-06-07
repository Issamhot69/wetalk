import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsString() username?: string;
  @IsOptional() @IsString() bio?: string;
  @IsOptional() @IsString() avatar?: string;
}

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('search')
  @ApiOperation({ summary: 'Rechercher des utilisateurs' })
  search(@Query('q') query: string) {
    return this.usersService.search(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Profil d un utilisateur' })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Modifier son profil' })
  updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, dto);
  }
}
