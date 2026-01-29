import {
  Injectable,
  Logger,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { DocumentType, VerificationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TruuthService } from '../truuth/truuth.service';
import { ErrorCode } from '../common/interfaces/api-response.interface';
import {
  DocumentDto,
  DocumentListResponseDto,
  DocumentResultDto,
  DocumentSummaryDto,
} from './dto/document-response.dto';
import { PollResponseDto, DocumentUpdateDto } from './dto/poll-response.dto';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from './dto/upload-document.dto';

// Total required documents
const TOTAL_REQUIRED_DOCUMENTS = 3;

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly truuthService: TruuthService,
  ) {}

  /**
   * Upload and submit a document for verification
   */
  async uploadDocument(
    userId: string,
    documentType: DocumentType,
    file: Express.Multer.File,
  ): Promise<DocumentDto> {
    this.logger.log(`Processing upload for user ${userId}, type: ${documentType}`);

    // Validate file
    this.validateFile(file);

    // Check if document already exists for this user and type
    const existingDocument = await this.prisma.documentSubmission.findUnique({
      where: {
        userId_documentType: {
          userId,
          documentType,
        },
      },
    });

    if (existingDocument) {
      throw new ConflictException({
        code: ErrorCode.DUPLICATE_DOCUMENT,
        message: `You have already uploaded ${this.truuthService.getDocumentTypeName(documentType)}.`,
      });
    }

    // Convert file to base64
    const imageBase64 = file.buffer.toString('base64');

    // Step 1: Classification (only for Passport and Driver's Licence)
    if (this.truuthService.requiresClassification(documentType)) {
      this.logger.log(`Classifying document: ${documentType}`);

      const { isValid } = await this.truuthService.classifyDocument(
        imageBase64,
        file.mimetype,
        documentType,
      );

      if (!isValid) {
        const expectedTypeName = this.truuthService.getDocumentTypeName(documentType);
        throw new BadRequestException({
          code: ErrorCode.CLASSIFICATION_FAILED,
          message: `The uploaded document does not appear to be an ${expectedTypeName}. Please upload a valid ${expectedTypeName}.`,
        });
      }

      this.logger.log('Classification passed');
    }

    // Step 2: Submit for verification
    this.logger.log('Submitting document for verification');
    const verifyResponse = await this.truuthService.submitForVerification(
      imageBase64,
      file.mimetype,
      documentType,
      `user-${userId}-${documentType}`,
    );

    // Step 3: Store submission in database
    const submission = await this.prisma.documentSubmission.create({
      data: {
        userId,
        documentType,
        documentVerifyId: verifyResponse.documentVerifyId,
        status: VerificationStatus.PROCESSING,
        fileName: file.originalname,
        mimeType: file.mimetype,
      },
    });

    this.logger.log(`Document submitted successfully: ${submission.id}`);

    return this.mapToDocumentDto(submission);
  }

  /**
   * Get all documents for a user
   */
  async getDocuments(userId: string): Promise<DocumentListResponseDto> {
    const documents = await this.prisma.documentSubmission.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const documentDtos = documents.map((doc) => this.mapToDocumentDto(doc));
    const summary = this.calculateSummary(documents);

    return {
      documents: documentDtos,
      summary,
    };
  }

  /**
   * Poll for status updates on processing documents
   */
  async pollForUpdates(userId: string): Promise<PollResponseDto> {
    // Get all processing documents for this user
    const processingDocs = await this.prisma.documentSubmission.findMany({
      where: {
        userId,
        status: VerificationStatus.PROCESSING,
      },
    });

    if (processingDocs.length === 0) {
      return { updates: [] };
    }

    const updates: DocumentUpdateDto[] = [];

    // Check each processing document with Truuth API
    for (const doc of processingDocs) {
      if (!doc.documentVerifyId) continue;

      try {
        const result = await this.truuthService.getVerificationResult(
          doc.documentVerifyId,
        );

        // If status changed from PROCESSING, update database
        if (result.status === 'DONE' || result.status === 'FAILED') {
          const newStatus =
            result.status === 'DONE'
              ? VerificationStatus.DONE
              : VerificationStatus.FAILED;

          await this.prisma.documentSubmission.update({
            where: { id: doc.id },
            data: {
              status: newStatus,
              verificationResult: (result.result || result) as object,
            },
          });

          updates.push({
            id: doc.id,
            documentType: doc.documentType,
            status: newStatus,
            hasResult: true,
          });

          this.logger.log(
            `Document ${doc.id} verification completed: ${newStatus}`,
          );
        }
      } catch (error) {
        this.logger.error(
          `Error polling document ${doc.id}: ${error.message}`,
        );
        // Continue with other documents
      }
    }

    return { updates };
  }

  /**
   * Get verification result for a specific document
   */
  async getDocumentResult(
    userId: string,
    documentId: string,
  ): Promise<DocumentResultDto> {
    const document = await this.prisma.documentSubmission.findFirst({
      where: {
        id: documentId,
        userId, // Ensure user can only access their own documents
      },
    });

    if (!document) {
      throw new NotFoundException({
        code: ErrorCode.NOT_FOUND,
        message: 'Document not found',
      });
    }

    return {
      id: document.id,
      documentType: document.documentType,
      status: document.status,
      fileName: document.fileName,
      hasResult: !!document.verificationResult,
      verificationResult: document.verificationResult as Record<string, unknown>,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      completedAt:
        document.status !== VerificationStatus.PROCESSING
          ? document.updatedAt
          : undefined,
    };
  }

  /**
   * Delete a document submission (for re-upload)
   */
  async deleteDocument(userId: string, documentId: string): Promise<void> {
    const document = await this.prisma.documentSubmission.findFirst({
      where: {
        id: documentId,
        userId,
      },
    });

    if (!document) {
      throw new NotFoundException({
        code: ErrorCode.NOT_FOUND,
        message: 'Document not found',
      });
    }

    await this.prisma.documentSubmission.delete({
      where: { id: documentId },
    });

    this.logger.log(`Document deleted: ${documentId}`);
  }

  /**
   * Validate uploaded file
   */
  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Please select a file to upload',
      });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype as any)) {
      throw new BadRequestException({
        code: ErrorCode.INVALID_FILE_TYPE,
        message: 'Please upload an image (JPEG, PNG) or PDF file.',
      });
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException({
        code: ErrorCode.FILE_TOO_LARGE,
        message: 'File is too large. Maximum size is 10MB.',
      });
    }
  }

  /**
   * Map database entity to DTO
   */
  private mapToDocumentDto(doc: any): DocumentDto {
    return {
      id: doc.id,
      documentType: doc.documentType,
      status: doc.status,
      fileName: doc.fileName,
      hasResult: !!doc.verificationResult,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  /**
   * Calculate document summary
   */
  private calculateSummary(documents: any[]): DocumentSummaryDto {
    return {
      total: TOTAL_REQUIRED_DOCUMENTS,
      uploaded: documents.length,
      processing: documents.filter(
        (d) => d.status === VerificationStatus.PROCESSING,
      ).length,
      completed: documents.filter((d) => d.status === VerificationStatus.DONE)
        .length,
      failed: documents.filter((d) => d.status === VerificationStatus.FAILED)
        .length,
    };
  }
}
