import { BlobSASPermissions, BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';
import { Injectable, StreamableFile } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { log } from 'console';
import { Response } from 'express';
import { readFileSync } from 'fs';
import { BlockList } from 'net';
import { join } from 'path';
import { Readable } from 'stream';

@Injectable()
export class StorageService {
  blobServiceClient: BlobServiceClient;

  containerName = '';

  constructor(private configService: ConfigService) {
    const SAS = this.configService.get('AZURE_SAS');
    const ACCOUNT_NAME = this.configService.get('ACCOUNT_NAME');
    // const SHARED_KEY = this.configService.get('STORAGE_SHARED_KEY');
    this.containerName = this.configService.get('CONTAINER_NAME');

    // SAS
    // one of the approach to create a blob client using SAS token
    this.blobServiceClient = new BlobServiceClient(
      `https://${ACCOUNT_NAME}.blob.core.windows.net${SAS}`,
    );

    // SHARED KEY
    // const sharedKeyCredentials = new StorageSharedKeyCredential(ACCOUNT_NAME, SHARED_KEY)
    // this.blobServiceClient = new BlobServiceClient(
    //   `https://${ACCOUNT_NAME}.blob.core.windows.net`,
    //   sharedKeyCredentials
    // );
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
    containerName = 'jenkins',
    fileNameWithPath = 'chunk/inner_chunk/jnanesh_open_to_work.png',
  ) {
    log('Container Name : ', containerName, '\n File Name: ', fileNameWithPath);
    const blobClient = this.blobServiceClient
      .getContainerClient(containerName)
      .getBlockBlobClient(fileNameWithPath);
    const blobResponse = await blobClient.download();
    const bufferResponse = await blobClient.downloadToBuffer();
    const readableStream = Readable.from(blobResponse.readableStreamBody);
    const bufferData = Buffer.from(bufferResponse.toString(), 'base64');
    console.log('Buffer Data', bufferData)
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

  // delete a blob in container
  async deleteBlob(containerName = 'jenkins', fileNameWithPath: string) {
    const result = {
      success: true,
      message: `Deleted file: ${fileNameWithPath} `
    }
    console.log('FIle Name', fileNameWithPath);
    const blobClient = this.blobServiceClient.getContainerClient(containerName).getBlockBlobClient(fileNameWithPath);
    const deletionResponse = await blobClient.deleteIfExists();
    console.log('Deletion Response', deletionResponse);
    return result;
  }

  // get the access url to access from everywhere
  async fetchFileUrl(containerName: string, fileName: string) {
    const result = {
      success: true,
      message: `Use this URL to see file anywhere`,
      url: ''
    }
    const containerClient = this.blobServiceClient.getContainerClient(containerName)
    const blobClient = containerClient.getBlockBlobClient(fileName);
    result.url = await blobClient.generateSasUrl({ permissions: BlobSASPermissions.from({ read: true }), startsOn: new Date(), expiresOn: new Date('2023-07-21 12:25 pm') })
    return result;
  }

  async checkRead() {
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName)
    const blobClient = containerClient.getBlockBlobClient('comics/rewards_and_recognitions/check1.jpeg');
    // const filepath = join(process.cwd(), 'uploads','workflow_documents.jpg')
    // "R:\git_contributions\azure_practice\uploads\workflow_document.jpg"
    const filepath = './uploads/workflow_document.jpg'
    const file = readFileSync(filepath)
    console.log(file);

    // const buffer = Buffer.from(file.buffer)
    const readable = Readable.from(file)
    console.log(readable.readable)
    const res = await blobClient.uploadStream(readable).catch((error)=>{
      console.log(error);
      
    })

    let blobs = containerClient.listBlobsFlat();
    for await (const blob of blobs) {
      console.log(`Blob : ${blob.name}`);
    }
  }
}
