import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TreatmentTypesService } from './treatment-types.service';
import { CreateTreatmentCategoryDto } from './dto/create-treatment-category.dto';
import { UpdateTreatmentCategoryDto } from './dto/update-treatment-category.dto';
import { CreateTreatmentTypeDto } from './dto/create-treatment-type.dto';
import { UpdateTreatmentTypeDto } from './dto/update-treatment-type.dto';
import { TreatmentCategoryResponseDto } from './dto/treatment-category-response.dto';
import { TreatmentTypeResponseDto } from './dto/treatment-type-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../common/decorators/current-user.decorator';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { ApiStandardResponse } from '../../common/decorators/api-standard-response.decorator';
import { StandardResponse } from '../../common/dto/standard-response.dto';

@ApiTags('Treatment Types')
@Controller('treatment-types')
@ApiBearerAuth()
export class TreatmentTypesController {
  constructor(private readonly treatmentTypesService: TreatmentTypesService) {}

  // Categories
  @Post('categories')
  @Roles(UserRole.ADMIN, UserRole.DENTIST)
  @ApiOperation({ summary: 'Create a treatment category' })
  @ApiStandardResponse(TreatmentCategoryResponseDto)
  async createCategory(
    @Body() createDto: CreateTreatmentCategoryDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    const result = await this.treatmentTypesService.createCategory(
      createDto,
      user.orgId,
    );
    return new StandardResponse(result, 'Category created successfully');
  }

  @Get('categories')
  @Roles(UserRole.ADMIN, UserRole.DENTIST, UserRole.SECRETARY)
  @ApiOperation({ summary: 'Get all treatment categories' })
  @ApiStandardResponse(TreatmentCategoryResponseDto, true)
  async findAllCategories(@CurrentUser() user: CurrentUserData) {
    const result = await this.treatmentTypesService.findAllCategories(
      user.orgId,
    );
    return new StandardResponse(result);
  }

  @Patch('categories/:id')
  @Roles(UserRole.ADMIN, UserRole.DENTIST)
  @ApiOperation({ summary: 'Update a treatment category' })
  @ApiStandardResponse(TreatmentCategoryResponseDto)
  async updateCategory(
    @Param('id') id: string,
    @Body() updateDto: UpdateTreatmentCategoryDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    const result = await this.treatmentTypesService.updateCategory(
      id,
      updateDto,
      user.orgId,
    );
    return new StandardResponse(result, 'Category updated successfully');
  }

  @Delete('categories/:id')
  @Roles(UserRole.ADMIN, UserRole.DENTIST)
  @ApiOperation({ summary: 'Delete a treatment category' })
  async removeCategory(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    await this.treatmentTypesService.removeCategory(id, user.orgId);
    return new StandardResponse(null, 'Category deleted successfully');
  }

  // Types
  @Post('types')
  @Roles(UserRole.ADMIN, UserRole.DENTIST)
  @ApiOperation({ summary: 'Create a treatment type' })
  @ApiStandardResponse(TreatmentTypeResponseDto)
  async createType(
    @Body() createDto: CreateTreatmentTypeDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    const result = await this.treatmentTypesService.createType(
      createDto,
      user.orgId,
    );
    return new StandardResponse(result, 'Type created successfully');
  }

  @Get('types')
  @Roles(UserRole.ADMIN, UserRole.DENTIST, UserRole.SECRETARY)
  @ApiOperation({ summary: 'Get all treatment types' })
  @ApiStandardResponse(TreatmentTypeResponseDto, true)
  async findAllTypes(@CurrentUser() user: CurrentUserData) {
    const result = await this.treatmentTypesService.findAllTypes(user.orgId);
    return new StandardResponse(result);
  }

  @Patch('types/:id')
  @Roles(UserRole.ADMIN, UserRole.DENTIST)
  @ApiOperation({ summary: 'Update a treatment type' })
  @ApiStandardResponse(TreatmentTypeResponseDto)
  async updateType(
    @Param('id') id: string,
    @Body() updateDto: UpdateTreatmentTypeDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    const result = await this.treatmentTypesService.updateType(
      id,
      updateDto,
      user.orgId,
    );
    return new StandardResponse(result, 'Type updated successfully');
  }

  @Delete('types/:id')
  @Roles(UserRole.ADMIN, UserRole.DENTIST)
  @ApiOperation({ summary: 'Delete a treatment type' })
  async removeType(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    await this.treatmentTypesService.removeType(id, user.orgId);
    return new StandardResponse(null, 'Type deleted successfully');
  }
}
