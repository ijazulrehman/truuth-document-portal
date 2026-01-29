import { ApiProperty } from '@nestjs/swagger';

export class VerifyRequestDto {
  document: {
    countryCode: string;
    documentType: string;
    image: {
      content: string; // Base64 encoded
      mimeType: string;
    };
  };
  externalRefId?: string;
  options?: {
    requiredChecks: { name: string }[];
  };
}

export class VerifySubmitResponseDto {
  @ApiProperty({
    description: 'Document verification ID',
    example: 's3H80VD1S9CyhctLfCZd',
  })
  documentVerifyId: string;

  @ApiProperty({
    description: 'Verification status',
    example: 'PROCESSING',
  })
  status: 'PROCESSING' | 'DONE' | 'FAILED';
}

export class VerifyResultResponseDto {
  @ApiProperty({
    description: 'Document verification ID',
  })
  documentVerifyId: string;

  @ApiProperty({
    description: 'Verification status',
  })
  status: 'PROCESSING' | 'DONE' | 'FAILED';

  @ApiProperty({
    description: 'Full verification result (only present when status is DONE or FAILED)',
    required: false,
  })
  result?: Record<string, unknown>;
}

// Document type mapping for Truuth API
export const TRUUTH_DOCUMENT_TYPE_MAP = {
  AUSTRALIAN_PASSPORT: 'PASSPORT',
  AUSTRALIAN_DRIVERS_LICENCE: 'DRIVERS_LICENCE',
  RESUME: 'OTHER',
} as const;

// Required checks for verification
export const VERIFICATION_REQUIRED_CHECKS = [
  { name: 'ANNOTATION' },
  { name: 'C2PA' },
  { name: 'COMPRESSION_HEATMAP' },
  { name: 'DEEPFAKE_2' },
  { name: 'DEEPFAKE_3' },
  { name: 'DEEPFAKE_4' },
  { name: 'DEEPFAKE_5' },
  { name: 'DEEPFAKE_6' },
  { name: 'DEEPFAKE_7' },
  { name: 'DEEPFAKE' },
  { name: 'EOF_COUNT' },
  { name: 'HANDWRITING' },
  { name: 'INVOICE_DATE_ANOMALY_CHECK' },
  { name: 'INVOICE_TOTAL_ANOMALY_CHECK' },
  { name: 'SCREENSHOT' },
  { name: 'SOFTWARE_EDITOR' },
  { name: 'SOFTWARE_FINGERPRINT' },
  { name: 'TIMESTAMP' },
  { name: 'VENDOR_MISSING_FIELDS' },
  { name: 'VENDOR_VALIDATION' },
  { name: 'VISUAL_ANOMALY' },
  { name: 'WATERMARK_CHECK' },
];
