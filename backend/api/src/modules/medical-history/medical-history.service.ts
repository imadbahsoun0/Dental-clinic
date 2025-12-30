import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { MedicalHistoryQuestion } from '../../common/entities/medical-history-question.entity';
import { CreateMedicalHistoryQuestionDto } from './dto/create-medical-history-question.dto';
import { UpdateMedicalHistoryQuestionDto } from './dto/update-medical-history-question.dto';

@Injectable()
export class MedicalHistoryService {
    constructor(private readonly em: EntityManager) {}

    async create(createDto: CreateMedicalHistoryQuestionDto, orgId: string) {
        const question = this.em.create(MedicalHistoryQuestion, {
            ...createDto,
            orgId,
        } as any);

        await this.em.persistAndFlush(question);
        return question;
    }

    async findAll(orgId: string) {
        const questions = await this.em.find(
            MedicalHistoryQuestion,
            { orgId },
            { orderBy: { order: 'ASC' } },
        );

        return questions;
    }

    async findOne(id: string, orgId: string) {
        const question = await this.em.findOne(MedicalHistoryQuestion, {
            id,
            orgId,
        });

        if (!question) {
            throw new NotFoundException('Medical history question not found');
        }

        return question;
    }

    async update(id: string, orgId: string, updateDto: UpdateMedicalHistoryQuestionDto) {
        const question = await this.findOne(id, orgId);

        this.em.assign(question, updateDto);
        await this.em.flush();

        return question;
    }

    async remove(id: string, orgId: string) {
        const question = await this.findOne(id, orgId);

        await this.em.removeAndFlush(question);
        return { message: 'Medical history question deleted successfully' };
    }
}
