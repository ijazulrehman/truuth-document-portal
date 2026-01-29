import { ApiProperty } from '@nestjs/swagger';
import { DocumentType, VerificationStatus } from '@prisma/client';

export class DocumentUpdateDto {
  @ApiProperty({
    description: 'Document submission ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Document type',
    enum: DocumentType,
  })
  documentType: DocumentType;

  @ApiProperty({
    description: 'Updated verification status',
    enum: VerificationStatus,
  })
  status: VerificationStatus;

  @ApiProperty({
    description: 'Whether verification result is now available',
  })
  hasResult: boolean;
}

export class PollResponseDto {
  @ApiProperty({
    description: 'List of documents with status updates',
    type: [DocumentUpdateDto],
  })
  updates: DocumentUpdateDto[];
}
