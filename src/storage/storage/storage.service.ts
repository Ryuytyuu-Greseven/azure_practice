import { BlobServiceClient } from '@azure/storage-blob';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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
    const folderStatus = await this.createNewFolder(containerName, 'test');
    console.log('Folder status', folderStatus);

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
  // dont know
  async createNewFolder(containerName: string, folderName: string) {
    return this.blobServiceClient
      .getContainerClient(containerName)
      .getAppendBlobClient(folderName);
  }
}
