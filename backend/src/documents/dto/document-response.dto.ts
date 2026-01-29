import { ApiProperty } from '@nestjs/swagger';
import { DocumentType, VerificationStatus } from '@prisma/client';

export class DocumentDto {
  @ApiProperty({
    description: 'Document submission ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Document type',
    enum: DocumentType,
    example: 'AUSTRALIAN_PASSPORT',
  })
  documentType: DocumentType;

  @ApiProperty({
    description: 'Verification status',
    enum: VerificationStatus,
    example: 'PROCESSING',
  })
  status: VerificationStatus;

  @ApiProperty({
    description: 'Original file name',
    example: 'passport.jpg',
  })
  fileName: string;

  @ApiProperty({
    description: 'Whether verification result is available',
    example: true,
  })
  hasResult: boolean;

  @ApiProperty({
    description: 'Document submission timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:35:00.000Z',
  })
  updatedAt: Date;
}

export class DocumentSummaryDto {
  @ApiProperty({
    description: 'Total required documents',
    example: 3,
  })
  total: number;

  @ApiProperty({
    description: 'Number of uploaded documents',
    example: 2,
  })
  uploaded: number;

  @ApiProperty({
    description: 'Number of documents still processing',
    example: 1,
  })
  processing: number;

  @ApiProperty({
    description: 'Number of completed verifications',
    example: 1,
  })
  completed: number;

  @ApiProperty({
    description: 'Number of failed verifications',
    example: 0,
  })
  failed: number;
}

export class DocumentListResponseDto {
  @ApiProperty({
    description: 'List of documents',
    type: [DocumentDto],
  })
  documents: DocumentDto[];

  @ApiProperty({
    description: 'Document summary',
    type: DocumentSummaryDto,
  })
  summary: DocumentSummaryDto;
}

export class DocumentResultDto extends DocumentDto {
  @ApiProperty({
    description: 'Full verification result JSON',
    required: false,
  })
  verificationResult?: Record<string, unknown>;

  @ApiProperty({
    description: 'Verification completion timestamp',
    required: false,
  })
  completedAt?: Date;
}
