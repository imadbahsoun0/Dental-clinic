import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Organization, Attachment } from '../../common/entities';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { FilesService } from '../files/files.service';

@Injectable()
export class OrganizationsService {
    constructor(
        private em: EntityManager,
        private filesService: FilesService,
    ) { }

    async create(createOrgDto: CreateOrganizationDto, createdBy: string) {
        const organization = new Organization(createOrgDto.name);
        organization.location = createOrgDto.location;
        organization.phone = createOrgDto.phone;
        organization.email = createOrgDto.email;
        organization.website = createOrgDto.website;
        if (createOrgDto.timeZone) organization.timeZone = createOrgDto.timeZone;
        organization.createdBy = createdBy;

        this.em.persist(organization);
        await this.em.flush();

        return this.mapToResponse(organization);
    }

    async findOne(orgId: string) {
        const organization = await this.em.findOne(Organization, { id: orgId }, { populate: ['logo'] });

        if (!organization) {
            throw new NotFoundException('Organization not found');
        }

        return this.mapToResponse(organization);
    }

    async findOnePublic(orgId: string) {
        const organization = await this.em.findOne(Organization, { id: orgId }, { populate: ['logo'] });

        if (!organization) {
            throw new NotFoundException('Organization not found');
        }

        let logoUrl: string | null = null;
        if (organization.logo) {
            try {
                logoUrl = await this.filesService.getSignedUrl(organization.logo);
            } catch (e) {
                console.error('Failed to generate logo URL', e);
            }
        }

        return {
            name: organization.name,
            logo: logoUrl,
        };
    }

    async update(orgId: string, updateOrgDto: UpdateOrganizationDto, updatedBy: string) {
        const organization = await this.em.findOne(Organization, { id: orgId });

        if (!organization) {
            throw new NotFoundException('Organization not found');
        }

        // Update fields
        if (updateOrgDto.name) organization.name = updateOrgDto.name;
        if (updateOrgDto.location !== undefined) organization.location = updateOrgDto.location;
        if (updateOrgDto.phone !== undefined) organization.phone = updateOrgDto.phone;
        if (updateOrgDto.email !== undefined) organization.email = updateOrgDto.email;
        if (updateOrgDto.website !== undefined) organization.website = updateOrgDto.website;
        if (updateOrgDto.timeZone !== undefined) organization.timeZone = updateOrgDto.timeZone;
        if (updateOrgDto.logoId) {
            organization.logo = this.em.getReference(Attachment, updateOrgDto.logoId);
        }
        if (updateOrgDto.isActive !== undefined) organization.isActive = updateOrgDto.isActive;

        organization.updatedBy = updatedBy;

        await this.em.flush();

        // Re-fetch to ensure logo is populated if changed (though ref is enough, but mapToResponse needs data for URL)
        // If updated logoId, organization.logo is Reference.
        // mapToResponse needs entity.
        if (updateOrgDto.logoId) {
            await this.em.populate(organization, ['logo']);
        }

        return this.mapToResponse(organization);
    }

    private async mapToResponse(org: Organization) {
        let logoUrl: string | null = null;
        if (org.logo) {
            try {
                logoUrl = await this.filesService.getSignedUrl(org.logo);
            } catch (e) {
                console.error('Failed to generate logo URL', e);
            }
        }

        return {
            id: org.id,
            name: org.name,
            location: org.location,
            phone: org.phone,
            email: org.email,
            website: org.website,
            logo: org.logo ? { ...org.logo, url: logoUrl } : null,
            isActive: org.isActive,
            timeZone: org.timeZone,
            createdAt: org.createdAt,
            updatedAt: org.updatedAt,
        };
    }
}
