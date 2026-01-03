import { ApiProperty } from '@nestjs/swagger';

export class OrganizationPublicResponseDto {
  @ApiProperty({ description: 'Organization name' })
  name!: string;

  @ApiProperty({
    description: 'Logo URL (S3 signed URL)',
    required: false,
    nullable: true,
  })
  logo!: string | null;
}
