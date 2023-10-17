import { Body, Controller, Get } from '@nestjs/common';
import { EncryptionService } from './encryption.service';

@Controller('encryption')
export class EncryptionController {
  constructor(private encryptionService: EncryptionService) {}
  // ============================= RSA encryption =============================  \\
  @Get('generate_keys')
  addNewKeys() {
    return this.encryptionService.generateKeys();
  }
  @Get('load_keys')
  loadKeys() {
    return this.encryptionService.loadPemFiles();
  }

  @Get('get_enc_data')
  fetchSomeData(@Body() body: any) {
    return this.encryptionService.encryptSomeData(body);
  }

  @Get('get_dec_data')
  loadSomeData(@Body() body: any) {
    return this.encryptionService.decryptSomeData(body);
  }
}
