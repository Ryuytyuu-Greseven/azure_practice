import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  Body,
  UploadedFile,
} from '@nestjs/common';
import { StorageService } from './storage.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('storage')
export class StorageController {
  constructor(private storageService: StorageService) {}

  @Post('upload_file')
  @UseInterceptors(FileInterceptor('sample_file'))
  sampleUploadFile(
    @Body() body: { container_name: string },
    @UploadedFile() sampleFile: Express.Multer.File,
  ) {
    console.log('Body', body, '\nfile', sampleFile);
    return this.storageService.uploadFile(sampleFile, body.container_name);
  }

  @Get('containers')
  getContainers() {
    return this.storageService.listContainer();
  }
}
