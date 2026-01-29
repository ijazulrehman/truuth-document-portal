import { ApiProperty } from '@nestjs/swagger';

export class ClassifyRequestDto {
  images: {
    image: string; // Base64 encoded
    mimeType: string;
  }[];
}

export class ClassifyResponseDto {
  @ApiProperty({
    description: 'Country information',
    example: { code: 'AUS', name: 'Australia' },
  })
  country: {
    code: string;
    name: string;
  };

  @ApiProperty({
    description: 'Document type information',
    example: { code: 'PASSPORT', name: 'Passport' },
  })
  documentType: {
    code: string;
    name: string;
  };
}

// Expected classification results for validation
export const EXPECTED_CLASSIFICATIONS = {
  AUSTRALIAN_PASSPORT: {
    countryCode: 'AUS',
    documentTypeCode: 'PASSPORT',
  },
  AUSTRALIAN_DRIVERS_LICENCE: {
    countryCode: 'AUS',
    documentTypeCode: 'DRIVERS_LICENCE',
  },
} as const;
