import { Module } from '@nestjs/common';
import { TruuthService } from './truuth.service';

@Module({
  providers: [TruuthService],
  exports: [TruuthService],
})
export class TruuthModule {}
