import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class SelectOrganizationDto {
  @ApiProperty({ example: 'org-uuid-here' })
  @IsUUID()
  orgId!: string;
}
