import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { EntityManager } from '@mikro-orm/core';
import { Attachment } from '../../common/entities';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FilesService {
  private s3Client: S3Client;
  private bucketName: string;
  private readonly logger = new Logger(FilesService.name);

  constructor(
    private configService: ConfigService,
    private em: EntityManager,
  ) {
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY') || '',
      },
    });
    this.bucketName =
      this.configService.get('AWS_S3_BUCKET') || 'dentil-clinic-dev';
  }

  async uploadFile(
    file: Express.Multer.File,
    orgId?: string,
    createdBy?: string,
  ): Promise<Attachment> {
    const fileKey = `${uuidv4()}-${file.originalname}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: fileKey,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      this.logger.log(`File uploaded to S3: ${fileKey}`);

      const attachment = new Attachment(
        file.originalname,
        fileKey,
        this.bucketName,
        file.mimetype,
        file.size,
      );

      if (createdBy) attachment.createdBy = createdBy;
      if (orgId) attachment.orgId = orgId;

      this.em.persist(attachment);
      await this.em.flush(); // Commit to get ID

      return attachment;
    } catch (error) {
      this.logger.error('S3 Upload Error', error);
      throw new Error('Failed to upload file');
    }
  }

  async getSignedUrl(attachment: Attachment): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: attachment.bucket,
      Key: attachment.s3Key,
    });
    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 }); // 1 hour
  }
}
