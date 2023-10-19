import * as NodeRSA from 'node-rsa';
import { Injectable } from '@nestjs/common';
import { log } from 'console';
import { readFileSync, writeFileSync } from 'fs';

@Injectable()
export class EncryptionService {
  rsaKey: NodeRSA;
  rsaPubKey: NodeRSA;

  constructor() {
    // this.rsaKey = new NodeRSA()
  }

  // generating new public & private keys
  generateKeys() {
    const key = new NodeRSA({ b: 2048 });

    const PEMStringPRV = key.exportKey('private');
    const prvkey = PEMStringPRV.replace(
      '-----BEGIN RSA PRIVATE KEY-----',
      '',
    ).replace('-----END RSA PRIVATE KEY-----', '');

    log('PEM\n', PEMStringPRV);
    writeFileSync('./file_1.txt', prvkey);
    const PEMStringPUB = key.exportKey('public');
    log('PEM\n', PEMStringPUB);

    const pubkey = PEMStringPUB.replace(
      '-----BEGIN PUBLIC KEY-----',
      '',
    ).replace('-----END PUBLIC KEY-----', '');
    writeFileSync('./file_2.txt', pubkey);

    log('\n', key.exportKey('public'));
    log(key.exportKey('private'));

    const encData = key.encrypt('checking', 'base64');
    log('ENC DATA/--> ', encData);
    const decData = key.decrypt(encData, 'utf8');
    log('DEC DATA/--> ', decData);
    return 'Keys Generated';
  }

  loadPemFiles() {
    this.rsaPubKey = new NodeRSA();
    this.rsaKey = new NodeRSA();

    const publicKey = readFileSync('./file_2.txt', { encoding: 'utf-8' });
    const privateKey = readFileSync('./file_1.txt', { encoding: 'utf-8' });

    log('Public Key: \n', publicKey, '\n Private Key: \n', privateKey);

    this.rsaPubKey.importKey(publicKey, 'public');
    this.rsaKey.importKey(privateKey, 'private');
    return 'Keys loaded!';
  }

  // encrypt some user data
  encryptSomeData(body: any) {
    // const data = {
    //   message: 'Testing',
    // };

    const encData = this.rsaPubKey.encrypt(body, 'base64');
    log('ENC DATA/--> ', encData);
    // writeFileSync('./encryptedCipher.txt', encData);
    const decData = this.rsaKey.decrypt(encData, 'utf8');
    log('DEC DATA/--> ', decData);
    return { encData };
  }
  // decrypt the data sent by user
  decryptSomeData(body: any) {
    // const encData = readFileSync('./encryptedCipher.txt', {
    //   encoding: 'utf-8',
    // });
    const decData = this.rsaKey.decrypt(body.encData, 'utf8');
    log('Started:', decData, ':END');
    return JSON.parse(decData);
  }
}
