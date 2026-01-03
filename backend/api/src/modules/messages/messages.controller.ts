import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { ReminderService } from '../reminders/reminder.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { FilterMessageDto } from './dto/filter-message.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OrgScopeGuard } from '../../common/guards/org-scope.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ParseUUIDPipe } from '../../common/pipes/parse-uuid.pipe';
import { ApiStandardResponse } from '../../common/decorators/api-standard-response.decorator';
import { StandardResponse } from '../../common/dto/standard-response.dto';
import { Message } from '../../common/entities/message.entity';

@ApiTags('messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrgScopeGuard)
@Controller('messages')
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly reminderService: ReminderService,
  ) {}

  @Post()
  @ApiStandardResponse(Message, false, 'created')
  async create(
    @Body() createMessageDto: CreateMessageDto,
    @CurrentUser('orgId') orgId: string,
  ) {
    return this.messagesService.create(createMessageDto, orgId);
  }

  @Get()
  @ApiStandardResponse(Message, true)
  async findAll(
    @Query() filterDto: FilterMessageDto,
    @CurrentUser('orgId') orgId: string,
  ) {
    const result = await this.messagesService.findAll(filterDto, orgId);
    return new StandardResponse({ data: result.data, meta: result }, 'Messages retrieved successfully');
  }

  @Get(':id')
  @ApiStandardResponse(Message)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('orgId') orgId: string,
  ) {
    const result = await this.messagesService.findOne(id, orgId);
    return new StandardResponse(result);
  }

  @Post(':id/resend')
  @ApiStandardResponse(Object)
  async resendMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('orgId') orgId: string,
  ) {
    await this.reminderService.resendMessage(id, orgId);
    return new StandardResponse(null, 'Message resent successfully');
  }
}
