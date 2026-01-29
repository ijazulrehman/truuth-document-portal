import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { TruuthModule } from '../truuth/truuth.module';
import { MAX_FILE_SIZE } from './dto/upload-document.dto';

@Module({
  imports: [
    TruuthModule,
    MulterModule.register({
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
    }),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
