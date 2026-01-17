import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import {
  OrganizationVariable,
  OrganizationVariableKey,
} from '../../common/entities/organization-variable.entity';

@Injectable()
export class OrganizationVariablesService {
  constructor(private readonly em: EntityManager) {}

  async getValue(orgId: string, key: OrganizationVariableKey): Promise<string | undefined> {
    const row = await this.em.findOne(OrganizationVariable, { orgId, key });
    return row?.value ?? undefined;
  }

  async setValue(
    orgId: string,
    key: OrganizationVariableKey,
    value: string | undefined,
    updatedBy?: string,
  ): Promise<void> {
    const existing = await this.em.findOne(OrganizationVariable, { orgId, key });

    if (!existing) {
      const created = this.em.create(OrganizationVariable, {
        orgId,
        key,
        value,
        createdBy: updatedBy,
      } as OrganizationVariable);
      await this.em.persistAndFlush(created);
      return;
    }

    existing.value = value;
    if (updatedBy) existing.updatedBy = updatedBy;
    await this.em.flush();
  }

  async getMany(
    orgId: string,
    keys: OrganizationVariableKey[],
  ): Promise<Record<OrganizationVariableKey, string | undefined>> {
    const rows = await this.em.find(OrganizationVariable, {
      orgId,
      key: { $in: keys },
    });

    const result = {} as Record<OrganizationVariableKey, string | undefined>;
    for (const key of keys) {
      result[key] = undefined;
    }

    for (const row of rows) {
      result[row.key] = row.value ?? undefined;
    }

    return result;
  }
}
