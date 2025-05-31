import { Controller, Get, Post, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { Notification } from '../entities/Notification';

interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
  };
}

@ApiTags('notifications')
@Controller('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить все уведомления пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Список уведомлений пользователя',
    type: [Notification],
  })
  async getUserNotifications(@Req() req: RequestWithUser): Promise<Notification[]> {
    return this.notificationsService.getUserNotifications(req.user.id);
  }

  @Get('unread')
  @ApiOperation({ summary: 'Получить непрочитанные уведомления пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Список непрочитанных уведомлений пользователя',
    type: [Notification],
  })
  async getUnreadNotifications(@Req() req: RequestWithUser): Promise<Notification[]> {
    return this.notificationsService.getUserUnreadNotifications(req.user.id);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Отметить уведомление как прочитанное' })
  @ApiResponse({
    status: 200,
    description: 'Уведомление отмечено как прочитанное',
    type: Notification,
  })
  async markAsRead(@Param('id') id: string): Promise<Notification> {
    return this.notificationsService.markAsRead(id);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Отметить все уведомления пользователя как прочитанные' })
  @ApiResponse({
    status: 200,
    description: 'Все уведомления пользователя отмечены как прочитанные',
  })
  async markAllAsRead(@Req() req: RequestWithUser): Promise<void> {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить уведомление' })
  @ApiResponse({
    status: 200,
    description: 'Уведомление удалено',
  })
  async deleteNotification(@Param('id') id: string): Promise<void> {
    return this.notificationsService.deleteNotification(id);
  }

  @Delete()
  @ApiOperation({ summary: 'Удалить все уведомления пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Все уведомления пользователя удалены',
  })
  async deleteAllNotifications(@Req() req: RequestWithUser): Promise<void> {
    return this.notificationsService.deleteAllUserNotifications(req.user.id);
  }
} 