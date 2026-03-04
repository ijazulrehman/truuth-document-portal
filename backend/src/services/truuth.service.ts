import axios, { AxiosInstance } from 'axios';
import config from '../config';
import { DocumentType } from '../models';
import { AppError } from '../utils/errors';
import {
  ErrorCode,
  TRUUTH_DOCUMENT_TYPE_MAP,
  EXPECTED_CLASSIFICATIONS,
  VERIFICATION_REQUIRED_CHECKS,
} from '../utils/constants';

interface ClassifyResponse {
  country?: { code: string };
  documentType?: { code: string };
}

interface VerifySubmitResponse {
  documentVerifyId: string;
}

interface CheckResult {
  completedAt?: string;
  name: string;
  result: {
    status: string;
    message: string;
    checkMetadata?: Record<string, unknown>;
    checkResponse?: Record<string, unknown>;
  };
}

interface VerifyResultResponse {
  status: string;
  result?: Record<string, unknown>;
  checkResults?: Record<string, CheckResult>;
  outcomes?: Array<{
    name: string;
    type: string;
    score: number;
    status: string;
    message: string;
  }>;
  document?: {
    documentId: string;
    countryCode: string;
    documentType: string;
  };
  documentVerifyId?: string;
  externalRefId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class TruuthService {
  private classifierClient: AxiosInstance;
  private verifyClient: AxiosInstance;
  private classifierBaseUrl: string;
  private verifyBaseUrl: string;

  constructor() {
    const { apiKey, apiSecret, tenantAlias, verifyBaseUrl, classifierUrl } = config.truuth;

    this.classifierBaseUrl = classifierUrl;
    this.verifyBaseUrl = `${verifyBaseUrl}/${tenantAlias}/documents`;

    // Basic Auth: apiKey as username, apiSecret as password
    const authHeader = `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`;

    // Classifier API client
    this.classifierClient = axios.create({
      baseURL: this.classifierBaseUrl,
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Verify API client
    // URL: https://submissions.api.au.truuth.id/verify-document/v1/tenants/{tenantAlias}/documents
    this.verifyClient = axios.create({
      baseURL: this.verifyBaseUrl,
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
    expectedType: DocumentType
  ): Promise<{ isValid: boolean; response: ClassifyResponse | null }> {
    try {
      const response = await this.classifierClient.post<ClassifyResponse>('', {
        images: [
          {
            image: imageBase64,
            mimeType,
          },
        ],
      });

      const classificationResult = response.data;

      // Validate the classification matches expected type
      const expectedClassification =
        EXPECTED_CLASSIFICATIONS[expectedType as keyof typeof EXPECTED_CLASSIFICATIONS];

      if (!expectedClassification) {
        // Resume doesn't need classification
        return { isValid: true, response: classificationResult };
      }

      const isValid =
        classificationResult.country?.code === expectedClassification.countryCode &&
        classificationResult.documentType?.code === expectedClassification.documentTypeCode;

      return { isValid, response: classificationResult };
    } catch {
      throw new AppError(
        400,
        ErrorCode.TRUUTH_API_ERROR,
        'Failed to classify document. Please try again.'
      );
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
    externalRefId?: string
  ): Promise<VerifySubmitResponse> {
    const truuthDocumentType =
      TRUUTH_DOCUMENT_TYPE_MAP[documentType as keyof typeof TRUUTH_DOCUMENT_TYPE_MAP] || 'OTHER';

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

      const response = await this.verifyClient.post<VerifySubmitResponse>('/submit', requestBody);
      return response.data;
    } catch {
      throw new AppError(
        400,
        ErrorCode.VERIFICATION_FAILED,
        'Failed to submit document for verification. Please try again.'
      );
    }
  }

  /**
   * Get verification result by document verify ID
   * GET /tenants/{tenantAlias}/documents/{documentVerifyId}
   */
  async getVerificationResult(documentVerifyId: string): Promise<VerifyResultResponse> {
    try {
      const response = await this.verifyClient.get<VerifyResultResponse>(`/${documentVerifyId}`);
      return response.data;
    } catch {
      throw new AppError(
        400,
        ErrorCode.TRUUTH_API_ERROR,
        'Failed to get verification result. Please try again.'
      );
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
      [DocumentType.AUSTRALIAN_PASSPORT]: 'Australian Passport',
      [DocumentType.AUSTRALIAN_DRIVERS_LICENCE]: "Australian Driver's Licence",
      [DocumentType.RESUME]: 'Resume',
    };
    return names[documentType] || documentType;
  }
}
