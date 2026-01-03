import { Module, forwardRef } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { Message } from '../../common/entities/message.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([Message]),
    forwardRef(() => require('../reminders/reminders.module').RemindersModule),
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
