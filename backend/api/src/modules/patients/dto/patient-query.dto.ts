import { IntersectionType } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { FilterDto } from '../../../common/dto/filter.dto';

export class PatientQueryDto extends IntersectionType(PaginationDto, FilterDto) { }
