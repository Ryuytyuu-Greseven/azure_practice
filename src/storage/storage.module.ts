import { Module } from '@nestjs/common';
import { StorageController } from './storage/storage.controller';
import { StorageService } from './storage/storage.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [StorageController],
  providers: [StorageService],
})
export class StorageModule {}
