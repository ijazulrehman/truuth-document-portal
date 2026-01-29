import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { DocumentType } from '@prisma/client';

export class UploadDocumentDto {
  @ApiProperty({
    description: 'Type of document being uploaded',
    enum: DocumentType,
    example: 'AUSTRALIAN_PASSPORT',
  })
  @IsEnum(DocumentType, {
    message:
      'Document type must be one of: AUSTRALIAN_PASSPORT, AUSTRALIAN_DRIVERS_LICENCE, RESUME',
  })
  @IsNotEmpty({ message: 'Document type is required' })
  documentType: DocumentType;
}

// Allowed MIME types for upload
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

// Max file size (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
