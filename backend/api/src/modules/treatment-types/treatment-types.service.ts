import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, wrap, EntityManager } from '@mikro-orm/core';
import { TreatmentCategory } from '../../common/entities/treatment-category.entity';
import { TreatmentType } from '../../common/entities/treatment-type.entity';
import { CreateTreatmentCategoryDto } from './dto/create-treatment-category.dto';
import { UpdateTreatmentCategoryDto } from './dto/update-treatment-category.dto';
import { CreateTreatmentTypeDto } from './dto/create-treatment-type.dto';
import { UpdateTreatmentTypeDto } from './dto/update-treatment-type.dto';
import { TreatmentCategoryResponseDto } from './dto/treatment-category-response.dto';
import { TreatmentTypeResponseDto } from './dto/treatment-type-response.dto';

@Injectable()
export class TreatmentTypesService {
    constructor(
        @InjectRepository(TreatmentCategory)
        private readonly categoryRepository: EntityRepository<TreatmentCategory>,
        @InjectRepository(TreatmentType)
        private readonly typeRepository: EntityRepository<TreatmentType>,
        private readonly em: EntityManager,
    ) { }

    // Categories
    async createCategory(createDto: CreateTreatmentCategoryDto, orgId: string): Promise<TreatmentCategory> {
        const category = this.categoryRepository.create({
            ...createDto,
            icon: createDto.icon || '🦷',
            order: createDto.order || 0,
            orgId,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        await this.em.persistAndFlush(category);
        return category;
    }

    async findAllCategories(orgId: string): Promise<TreatmentCategoryResponseDto[]> {
        const categories = await this.categoryRepository.find(
            { orgId },
            { orderBy: { order: 'ASC' } },
        );
        return categories.map(c => ({
            id: c.id,
            name: c.name,
            icon: c.icon,
            order: c.order,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt
        }));
    }

    async updateCategory(id: string, updateDto: UpdateTreatmentCategoryDto, orgId: string): Promise<TreatmentCategory> {
        const category = await this.categoryRepository.findOneOrFail({ id, orgId });
        wrap(category).assign(updateDto);
        await this.em.flush();
        return category;
    }

    async removeCategory(id: string, orgId: string): Promise<void> {
        const category = await this.categoryRepository.findOneOrFail({ id, orgId });
        await this.em.removeAndFlush(category);
    }

    // Types
    async createType(createDto: CreateTreatmentTypeDto, orgId: string): Promise<TreatmentType> {
        const { categoryId, ...rest } = createDto;
        const category = await this.categoryRepository.findOneOrFail({ id: categoryId, orgId });
        const type = this.typeRepository.create({
            ...rest,
            category,
            orgId,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        await this.em.persistAndFlush(type);
        return type;
    }

    async findAllTypes(orgId: string): Promise<TreatmentTypeResponseDto[]> {
        const types = await this.typeRepository.find(
            { orgId },
            { populate: ['category'] },
        );

        return types.map(t => ({
            id: t.id,
            name: t.name,
            categoryId: t.category?.id || '',
            priceVariants: t.priceVariants,
            duration: t.duration,
            color: t.color,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
        }));
    }

    async updateType(id: string, updateDto: UpdateTreatmentTypeDto, orgId: string): Promise<TreatmentType> {
        const type = await this.typeRepository.findOneOrFail({ id, orgId });

        if (updateDto.categoryId) {
            const category = await this.categoryRepository.findOneOrFail({ id: updateDto.categoryId, orgId });
            type.category = category;
        }

        wrap(type).assign(updateDto);
        await this.em.flush();
        return type;
    }

    async removeType(id: string, orgId: string): Promise<void> {
        const type = await this.typeRepository.findOneOrFail({ id, orgId });
        await this.em.removeAndFlush(type);
    }
}
