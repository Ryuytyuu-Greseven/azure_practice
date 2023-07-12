import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  Body,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { StorageService } from './storage.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

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

  @Get('download_file')
  getFile(
    @Res({ passthrough: true }) response: Response,
    @Body() body: { container_name: string; file_name: string },
  ) {
    return this.storageService.downloadFile(
      response,
      body.container_name,
      body.file_name,
    );
  }
}
