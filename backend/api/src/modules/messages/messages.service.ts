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

  async create(
    createMessageDto: CreateMessageDto,
    orgId: string,
  ): Promise<Message> {
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
    console.log('[MessagesService.findAll] called', { filterDto, orgId });

    const { page = 1, limit = 20, patientId, type, status } = filterDto;
    console.log('[MessagesService.findAll] pagination', { page, limit });
    console.log('[MessagesService.findAll] filters', {
      patientId,
      type,
      status,
    });

    // Use query builder for more control
    const qb = this.em.createQueryBuilder(Message, 'm');
    console.log('[MessagesService.findAll] created QueryBuilder');
    console.log('[MessagesService.findAll] applying orgId filter', orgId);
    qb.where({ orgId });
    console.log('[MessagesService.findAll] applied orgId filter', orgId);

    if (patientId) {
      // Use explicit join column filtering to avoid any relation issues
      qb.andWhere({ patient: { id: patientId } });
      console.log(
        '[MessagesService.findAll] applied patientId filter',
        patientId,
      );
    }
    if (type) {
      qb.andWhere({ type });
      console.log('[MessagesService.findAll] applied type filter', type);
    }
    if (status) {
      qb.andWhere({ status });
      console.log('[MessagesService.findAll] applied status filter', status);
    }

    qb.orderBy({ createdAt: 'DESC' })
      .limit(limit)
      .offset((page - 1) * limit);

    console.log('[MessagesService.findAll] executing query', {
      orderBy: { createdAt: 'DESC' },
      limit,
      offset: (page - 1) * limit,
    });

    const [data, total] = await qb.getResultAndCount();
    console.log('[MessagesService.findAll] query result', {
      total,
      dataCount: data.length,
    });

    const result = {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    console.log('[MessagesService.findAll] returning', {
      totalPages: result.totalPages,
    });
    return result;
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
    message.sentAt =
      status === MessageStatus.SENT ? new Date() : message.sentAt;
    if (error) message.error = error;

    await this.em.flush();
    return message;
  }

  async getPatientMessages(
    patientId: string,
    orgId: string,
  ): Promise<Message[]> {
    return this.messageRepository.find(
      { patient: { id: patientId }, orgId },
      { orderBy: { createdAt: 'DESC' } },
    );
  }
}
