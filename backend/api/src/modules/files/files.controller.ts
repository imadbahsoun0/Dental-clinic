import { Controller, Post, UploadedFile, UseInterceptors, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody, ApiOperation } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../common/decorators/current-user.decorator';
import { ApiStandardResponse } from '../../common/decorators/api-standard-response.decorator';
import { StandardResponse } from '../../common/dto/standard-response.dto';

@ApiTags('Files')
@ApiBearerAuth('JWT-auth')
@Controller('files')
export class FilesController {
    constructor(private readonly filesService: FilesService) { }

    @Post('upload')
    @ApiOperation({ summary: 'Upload a file' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    // Max size 5MB
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
                    // Allow images
                    //   new FileTypeValidator({ fileType: '.(png|jpeg|jpg|pdf)' }),
                ],
            }),
        )
        file: Express.Multer.File,
        @CurrentUser() user: CurrentUserData,
    ) {
        const attachment = await this.filesService.uploadFile(file, user.orgId, user.id);
        // In real app, we might return DTO with Signed URL if needed immediately
        // For now returning Attachment entity (which doesn't have URL property yet)

        // Generate URL for response
        const url = await this.filesService.getSignedUrl(attachment);

        return new StandardResponse({ ...attachment, url }, 'File uploaded successfully');
    }
}
