import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { UploadDocumentDto, MAX_FILE_SIZE } from './dto/upload-document.dto';
import {
  DocumentDto,
  DocumentListResponseDto,
  DocumentResultDto,
} from './dto/document-response.dto';
import { PollResponseDto } from './dto/poll-response.dto';

@ApiTags('documents')
@ApiBearerAuth()
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
    }),
  )
  @ApiOperation({ summary: 'Upload a document for verification' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'documentType'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Document file (JPEG, PNG, or PDF)',
        },
        documentType: {
          type: 'string',
          enum: ['AUSTRALIAN_PASSPORT', 'AUSTRALIAN_DRIVERS_LICENCE', 'RESUME'],
          description: 'Type of document',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Document uploaded successfully',
    type: DocumentDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or classification failed',
  })
  @ApiResponse({
    status: 409,
    description: 'Document already uploaded',
  })
  async uploadDocument(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
  ): Promise<DocumentDto> {
    return this.documentsService.uploadDocument(
      user.sub,
      dto.documentType,
      file,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all documents for current user' })
  @ApiResponse({
    status: 200,
    description: 'List of documents with summary',
    type: DocumentListResponseDto,
  })
  async getDocuments(
    @CurrentUser() user: JwtPayload,
  ): Promise<DocumentListResponseDto> {
    return this.documentsService.getDocuments(user.sub);
  }

  @Get('poll')
  @ApiOperation({ summary: 'Poll for status updates on processing documents' })
  @ApiResponse({
    status: 200,
    description: 'List of documents with status updates',
    type: PollResponseDto,
  })
  async pollForUpdates(
    @CurrentUser() user: JwtPayload,
  ): Promise<PollResponseDto> {
    return this.documentsService.pollForUpdates(user.sub);
  }

  @Get(':id/result')
  @ApiOperation({ summary: 'Get verification result for a document' })
  @ApiResponse({
    status: 200,
    description: 'Document with verification result',
    type: DocumentResultDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Document not found',
  })
  async getDocumentResult(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DocumentResultDto> {
    return this.documentsService.getDocumentResult(user.sub, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a document submission' })
  @ApiResponse({
    status: 200,
    description: 'Document deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Document not found',
  })
  async deleteDocument(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    await this.documentsService.deleteDocument(user.sub, id);
    return { message: 'Document deleted successfully' };
  }
}
