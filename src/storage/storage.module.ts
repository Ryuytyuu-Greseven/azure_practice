import { Module } from '@nestjs/common';
import { StorageController } from './storage/storage.controller';
import { StorageService } from './storage/storage.service';
import { ConfigModule } from '@nestjs/config';
import { EncryptionService } from './encryption/encryption.service';
import { EncryptionController } from './encryption/encryption.controller';

@Module({
  imports: [ConfigModule],
  controllers: [StorageController, EncryptionController],
  providers: [StorageService, EncryptionService],
})
export class StorageModule {}
