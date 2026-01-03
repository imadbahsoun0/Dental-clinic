import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private readonly logger = new Logger(S3Service.name);

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
  }

  async uploadFile(
    bucket: string,
    key: string,
    body: Buffer | Uint8Array | string,
    mimeType: string,
  ): Promise<void> {
    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: mimeType,
      });
      await this.s3Client.send(command);
      this.logger.log(`File uploaded successfully to ${bucket}/${key}`);
    } catch (error) {
      this.logger.error(`Failed to upload file to ${bucket}/${key}`, error);
      throw error;
    }
  }

  async getSignedUrl(
    bucket: string,
    key: string,
    expiresIn = 3600,
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });
      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      this.logger.error(
        `Failed to generate signed URL for ${bucket}/${key}`,
        error,
      );
      throw error;
    }
  }

  async deleteFile(bucket: string, key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      });
      await this.s3Client.send(command);
      this.logger.log(`File deleted successfully from ${bucket}/${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file from ${bucket}/${key}`, error);
      throw error;
    }
  }
}
