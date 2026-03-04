import { Request, Response, NextFunction } from 'express';
import { DocumentsService } from '../services';
import { AuthenticatedRequest } from '../types';
import { DocumentType } from '../models';
import { AppError } from '../utils/errors';
import { ErrorCode } from '../utils/constants';

export class DocumentsController {
  private documentsService: DocumentsService;

  constructor() {
    this.documentsService = new DocumentsService();
  }

  /**
   * POST /api/documents/upload
   * Upload and submit a document for verification
   */
  upload = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.sub;

      if (!userId) {
        throw new AppError(401, ErrorCode.UNAUTHORIZED, 'Authentication required.');
      }

      const { documentType } = req.body;
      const file = req.file;

      if (!file) {
        throw new AppError(400, ErrorCode.VALIDATION_ERROR, 'Please select a file to upload.');
      }

      const result = await this.documentsService.uploadDocument(
        userId,
        documentType as DocumentType,
        file
      );

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/documents
   * Get all documents for the current user
   */
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.sub;

      if (!userId) {
        throw new AppError(401, ErrorCode.UNAUTHORIZED, 'Authentication required.');
      }

      const result = await this.documentsService.getDocuments(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/documents/poll
   * Poll for verification status updates
   */
  poll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.sub;

      if (!userId) {
        throw new AppError(401, ErrorCode.UNAUTHORIZED, 'Authentication required.');
      }

      const result = await this.documentsService.pollForUpdates(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/documents/:id/result
   * Get verification result for a specific document
   */
  getResult = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.sub;
      const { id } = req.params;

      if (!userId) {
        throw new AppError(401, ErrorCode.UNAUTHORIZED, 'Authentication required.');
      }

      const result = await this.documentsService.getDocumentResult(userId, id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/documents/:id
   * Delete a document submission (for re-upload)
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.sub;
      const { id } = req.params;

      if (!userId) {
        throw new AppError(401, ErrorCode.UNAUTHORIZED, 'Authentication required.');
      }

      await this.documentsService.deleteDocument(userId, id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
