import { BlobServiceClient } from '@azure/storage-blob';
import { Injectable, StreamableFile } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { log } from 'console';
import { Response } from 'express';
import { Readable } from 'stream';

@Injectable()
export class StorageService {
  blobServiceClient: BlobServiceClient;

  constructor(private configService: ConfigService) {
    const SAS = this.configService.get('AZURE_SAS');
    const ACCOUNT_NAME = this.configService.get('ACCOUNT_NAME');
    this.blobServiceClient = new BlobServiceClient(
      `https://${ACCOUNT_NAME}.blob.core.windows.net${SAS}`,
    );
  }

  async uploadFile(file: Express.Multer.File, containerName: string) {
    const result = {
      success: false,
      message: 'Working on it!',
    };

    console.log(this.blobServiceClient.accountName);
    // this.blobServiceClient.createContainer(containerName);

    const creationStatus = await this.createNewContainer(containerName);

    const containerInfo =
      this.blobServiceClient.getContainerClient(containerName);
    const blobClient = containerInfo.getBlockBlobClient(
      `chunk/inner_chunk/${file.originalname}`,
    );
    const readableUploadFile = Readable.from(file.buffer);

    // let fileChunk = '';
    // const readableStream = readableUploadFile.pipe()
    // readableStream.on('data', (chunk) => {
    //   fileChunk += chunk;
    // })
    // readableStream.on('end', () => {
    //   console.log('End');
    // })
    const uploadResponse = await blobClient.uploadStream(readableUploadFile);
    console.log('Upload status', uploadResponse);

    result.success = creationStatus.succeeded;
    result.message = `The Response is ${creationStatus.errorCode}`;
    console.log('Creation status', creationStatus);
    return result;
  }

  async listContainer() {
    console.log(this.blobServiceClient.accountName);
    const result = {
      containers: [],
    };
    for await (const container of this.blobServiceClient.listContainers()) {
      //   console.log(container.name);
      result.containers.push(container.name);
    }
    return result;
  }

  // create a new container dynamically
  async createNewContainer(containerName: string) {
    return await this.blobServiceClient
      .getContainerClient(containerName)
      .createIfNotExists();
  }

  // download a file to local or stream a file
  async downloadFile(
    response: Response,
    containerName: string,
    fileNameWithPath: string,
  ) {
    log('Container Name : ', containerName, '\n File Name: ', fileNameWithPath);
    const blobClient = this.blobServiceClient
      .getContainerClient(containerName)
      .getBlockBlobClient(fileNameWithPath);
    const blobResponse = await blobClient.download();
    const readableStream = Readable.from(blobResponse.readableStreamBody);
    response.setHeader('Content-Type', 'image/jpeg');

    // local file streaming
    // readableStream.pipe(createWriteStream(`files/sample.jpg`));
    // const file = createReadStream('files/sample.jpg');

    return new StreamableFile(readableStream);
  }
  // sample payload
  //   {
  //     "container_name":"office",
  //     "file_name":"chunk/SavedImage_20220605_201140_09.jpg"
  // }
}
