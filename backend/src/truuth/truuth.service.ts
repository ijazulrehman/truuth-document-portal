import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { DocumentType } from '@prisma/client';
import {
  ClassifyResponseDto,
  EXPECTED_CLASSIFICATIONS,
} from './dto/classify.dto';
import {
  VerifySubmitResponseDto,
  VerifyResultResponseDto,
  TRUUTH_DOCUMENT_TYPE_MAP,
  VERIFICATION_REQUIRED_CHECKS,
} from './dto/verify.dto';
import { ErrorCode } from '../common/interfaces/api-response.interface';

@Injectable()
export class TruuthService {
  private readonly logger = new Logger(TruuthService.name);
  private readonly classifierClient: AxiosInstance;
  private readonly verifyClient: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('truuth.apiKey');
    const apiSecret = this.configService.get<string>('truuth.apiSecret');
    const tenantAlias = this.configService.get<string>('truuth.tenantAlias');
    const verifyBaseUrl = this.configService.get<string>('truuth.verifyBaseUrl');

    // Basic Auth: apiKey as username, apiSecret as password
    const authHeader = `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`;

    // Classifier API client
    this.classifierClient = axios.create({
      baseURL: this.configService.get<string>('truuth.classifierUrl'),
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Verify API client
    // URL: https://submissions.api.au.truuth.id/verify-document/v1/tenants/{tenantAlias}/documents
    this.verifyClient = axios.create({
      baseURL: `${verifyBaseUrl}/${tenantAlias}/documents`,
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    });
  }

  /**
   * Classify a document image to verify it matches the expected type
   * Only used for Passport and Driver's Licence
   */
  async classifyDocument(
    imageBase64: string,
    mimeType: string,
    expectedType: DocumentType,
  ): Promise<{ isValid: boolean; response: ClassifyResponseDto | null }> {
    this.logger.log(`Classifying document, expected type: ${expectedType}`);

    try {
      const response = await this.classifierClient.post<ClassifyResponseDto>('', {
        images: [
          {
            image: imageBase64,
            mimeType,
          },
        ],
      });

      const classificationResult = response.data;
      this.logger.log(
        `Classification result: ${JSON.stringify(classificationResult)}`,
      );

      // Validate the classification matches expected type
      const expectedClassification =
        EXPECTED_CLASSIFICATIONS[
          expectedType as keyof typeof EXPECTED_CLASSIFICATIONS
        ];

      if (!expectedClassification) {
        // Resume doesn't need classification
        return { isValid: true, response: classificationResult };
      }

      const isValid =
        classificationResult.country?.code === expectedClassification.countryCode &&
        classificationResult.documentType?.code ===
          expectedClassification.documentTypeCode;

      if (!isValid) {
        this.logger.warn(
          `Classification mismatch. Expected: ${JSON.stringify(expectedClassification)}, Got: ${JSON.stringify(classificationResult)}`,
        );
      }

      return { isValid, response: classificationResult };
    } catch (error) {
      this.logger.error('Classification API error:', error);
      throw new BadRequestException({
        code: ErrorCode.TRUUTH_API_ERROR,
        message: 'Failed to classify document. Please try again.',
      });
    }
  }

  /**
   * Submit a document for verification
   * POST /tenants/{tenantAlias}/documents/submit
   */
  async submitForVerification(
    imageBase64: string,
    mimeType: string,
    documentType: DocumentType,
    externalRefId?: string,
  ): Promise<VerifySubmitResponseDto> {
    this.logger.log(`Submitting document for verification: ${documentType}`);

    const truuthDocumentType =
      TRUUTH_DOCUMENT_TYPE_MAP[documentType as keyof typeof TRUUTH_DOCUMENT_TYPE_MAP] ||
      'OTHER';

    try {
      const requestBody = {
        document: {
          countryCode: 'AUS',
          documentType: truuthDocumentType,
          image: {
            content: imageBase64,
            mimeType,
          },
        },
        externalRefId: externalRefId || `portal-${Date.now()}`,
        options: {
          requiredChecks: VERIFICATION_REQUIRED_CHECKS,
        },
      };

      const response = await this.verifyClient.post<VerifySubmitResponseDto>(
        '/submit',
        requestBody,
      );

      this.logger.log(
        `Verification submitted. ID: ${response.data.documentVerifyId}`,
      );

      return response.data;
    } catch (error) {
      this.logger.error('Verification submit API error:', error);
      throw new BadRequestException({
        code: ErrorCode.VERIFICATION_FAILED,
        message: 'Failed to submit document for verification. Please try again.',
      });
    }
  }

  /**
   * Get verification result by document verify ID
   * GET /tenants/{tenantAlias}/documents/{documentVerifyId}
   */
  async getVerificationResult(
    documentVerifyId: string,
  ): Promise<VerifyResultResponseDto> {
    this.logger.log(`Getting verification result for: ${documentVerifyId}`);

    try {
      const response = await this.verifyClient.get<VerifyResultResponseDto>(
        `/${documentVerifyId}`,
      );

      this.logger.log(
        `Verification status for ${documentVerifyId}: ${response.data.status}`,
      );

      return response.data;
    } catch (error) {
      this.logger.error('Verification result API error:', error);
      throw new BadRequestException({
        code: ErrorCode.TRUUTH_API_ERROR,
        message: 'Failed to get verification result. Please try again.',
      });
    }
  }

  /**
   * Check if a document type requires classification
   */
  requiresClassification(documentType: DocumentType): boolean {
    return (
      documentType === DocumentType.AUSTRALIAN_PASSPORT ||
      documentType === DocumentType.AUSTRALIAN_DRIVERS_LICENCE
    );
  }

  /**
   * Get friendly document type name for error messages
   */
  getDocumentTypeName(documentType: DocumentType): string {
    const names: Record<DocumentType, string> = {
      AUSTRALIAN_PASSPORT: 'Australian Passport',
      AUSTRALIAN_DRIVERS_LICENCE: "Australian Driver's Licence",
      RESUME: 'Resume',
    };
    return names[documentType] || documentType;
  }
}
