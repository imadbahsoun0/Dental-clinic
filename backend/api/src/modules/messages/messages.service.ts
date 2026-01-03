import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Message, MessageStatus } from '../../common/entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { FilterMessageDto } from './dto/filter-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: EntityRepository<Message>,
    private readonly em: EntityManager,
  ) {}

  async create(createMessageDto: CreateMessageDto, orgId: string): Promise<Message> {
    const message = this.messageRepository.create({
      patient: createMessageDto.patientId as any,
      type: createMessageDto.type,
      content: createMessageDto.content,
      metadata: createMessageDto.metadata,
      orgId,
      status: MessageStatus.PENDING,
    } as any);

    await this.em.persistAndFlush(message);
    return message;
  }

  async findAll(filterDto: FilterMessageDto, orgId: string) {
    const { page = 1, limit = 20, patientId, type, status } = filterDto;

    const where: any = { orgId };
    if (patientId) {
      where.patient = { id: patientId };
    }
    if (type) where.type = type;
    if (status) where.status = status;

    const [data, total] = await this.messageRepository.findAndCount(where, {
      limit,
      offset: (page - 1) * limit,
      orderBy: { createdAt: 'DESC' },
      populate: ['patient'],
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, orgId: string): Promise<Message> {
    return this.messageRepository.findOneOrFail(
      { id, orgId },
      { populate: ['patient'] },
    );
  }

  async updateStatus(
    id: string,
    status: MessageStatus,
    error?: string,
  ): Promise<Message> {
    const message = await this.messageRepository.findOneOrFail({ id });
    message.status = status;
    message.sentAt = status === MessageStatus.SENT ? new Date() : message.sentAt;
    if (error) message.error = error;

    await this.em.flush();
    return message;
  }

  async getPatientMessages(patientId: string, orgId: string): Promise<Message[]> {
    return this.messageRepository.find(
      { patient: { id: patientId }, orgId },
      { orderBy: { createdAt: 'DESC' } },
    );
  }
}
