import { z } from 'zod';
import { DocumentType } from '../models';

export const uploadDocumentSchema = {
  body: z.object({
    documentType: z.nativeEnum(DocumentType, {
      required_error: 'Document type is required',
      invalid_type_error: 'Invalid document type',
    }),
  }),
};

export const documentIdSchema = {
  params: z.object({
    id: z
      .string({
        required_error: 'Document ID is required',
      })
      .regex(/^[a-f\d]{24}$/i, 'Invalid document ID format'),
  }),
};
