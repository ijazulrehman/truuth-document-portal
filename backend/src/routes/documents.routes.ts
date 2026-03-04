import { Router } from 'express';
import multer from 'multer';
import { DocumentsController } from '../controllers';
import { validate } from '../middleware';
import { uploadDocumentSchema, documentIdSchema } from '../validators';
import { MAX_FILE_SIZE } from '../utils/constants';

const router = Router();
const documentsController = new DocumentsController();

// Multer configuration (memory storage for base64 conversion)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE, // 10MB
  },
});

/**
 * @swagger
 * /documents/upload:
 *   post:
 *     summary: Upload a document for verification
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - documentType
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Document file (JPEG, PNG, or PDF, max 10MB)
 *               documentType:
 *                 type: string
 *                 enum: [AUSTRALIAN_PASSPORT, AUSTRALIAN_DRIVERS_LICENCE, RESUME]
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Document'
 *       400:
 *         description: Validation error or classification failed
 *       409:
 *         description: Document already uploaded
 */
router.post(
  '/upload',
  upload.single('file'),
  validate(uploadDocumentSchema),
  documentsController.upload
);

/**
 * @swagger
 * /documents:
 *   get:
 *     summary: Get all documents for current user
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of documents with summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/DocumentListResponse'
 */
router.get('/', documentsController.list);

/**
 * @swagger
 * /documents/poll:
 *   get:
 *     summary: Poll for verification status updates
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of status updates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     updates:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           documentType:
 *                             type: string
 *                           status:
 *                             type: string
 *                           hasResult:
 *                             type: boolean
 */
router.get('/poll', documentsController.poll);

/**
 * @swagger
 * /documents/{id}/result:
 *   get:
 *     summary: Get verification result for a document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document verification result
 *       404:
 *         description: Document not found
 */
router.get('/:id/result', validate(documentIdSchema), documentsController.getResult);

/**
 * @swagger
 * /documents/{id}:
 *   delete:
 *     summary: Delete a document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       204:
 *         description: Document deleted successfully
 *       404:
 *         description: Document not found
 */
router.delete('/:id', validate(documentIdSchema), documentsController.delete);

export default router;
