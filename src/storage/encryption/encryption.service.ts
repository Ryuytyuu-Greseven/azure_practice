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

  /** 
   * 
   * import { Component, OnInit } from '@angular/core';

import * as Forge from 'node-forge';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'rsa_encryption';

  constructor() {}

  ngOnInit() {
    const pubKey = `-----BEGIN PUBLIC KEY-----
    MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA7pNcxqed+vLJtvGnAo27
    pl69IZzo3rYvTdXGYALeKbvlpeUNZMXIeg2jAoCDAWgWo0SysXr96TqyrCtLT/J1
    hKhAtynprij2t5WMOjS9n/sDMeKqOMGVdGx8vur5m/RZmqNgFKCsG77/RfsZvKR3
    E1ZRlRFr0G1w1yRGhaqc/xEk/fsFNc7gY17YdDloDHVqBTyMG+UO6bzi+ufwAErh
    LzrHPmlLLDRxh96x1e5EuB9TmQYuRge8s+N0mB4hXYYxPTqdVROeB1v9Jphm6FaX
    HBrZqokx5tBy+dSUcZqGhz47MIa4dbs0+HN0+vNz9O8XLPhTpbkokoA95p3/euG8
    LQIDAQAB
    -----END PUBLIC KEY-----`;
    const prvKey = `-----BEGIN RSA PRIVATE KEY-----
    MIIEogIBAAKCAQEA7pNcxqed+vLJtvGnAo27pl69IZzo3rYvTdXGYALeKbvlpeUN
    ZMXIeg2jAoCDAWgWo0SysXr96TqyrCtLT/J1hKhAtynprij2t5WMOjS9n/sDMeKq
    OMGVdGx8vur5m/RZmqNgFKCsG77/RfsZvKR3E1ZRlRFr0G1w1yRGhaqc/xEk/fsF
    Nc7gY17YdDloDHVqBTyMG+UO6bzi+ufwAErhLzrHPmlLLDRxh96x1e5EuB9TmQYu
    Rge8s+N0mB4hXYYxPTqdVROeB1v9Jphm6FaXHBrZqokx5tBy+dSUcZqGhz47MIa4
    dbs0+HN0+vNz9O8XLPhTpbkokoA95p3/euG8LQIDAQABAoIBAAsF2/+BtxblKNS/
    DYxcqBLjxbFL4qaHnF/oRKYi+8jJ2a50is3hJYYeIy32ahcijAk3H1p76EdiYub5
    iR1EgpGChJrx4M4fLmcFDdmSnkBKBLfFVUASEamzaYAYsze1bn5qlgHd+pW9mWXO
    WD4TCz1le5d7mpOiutf14RxD6cUPGuHC124gpXXek0mELrpi4sNMZnzrMhMfOanT
    RHbOo0TcWcE64qcz2ri0OOw6yUziziLBJJliedi7KNEnenHbkBYNZeRz3wftwBX2
    YhpZ5kCQJGIrvVEsIv22zgQxKg4C7JJDytvr5sM8SxWffSRXWtI8Qrb/spKWi57K
    UkRtm7ECgYEA/lVmyeKp7hzLhi+6SzOLy0tr0VKOhWQTszXScQHLyHrppj1Zi6UI
    lGRoaNJq6Xxh6IIkNa0VBjKbsLPE1aKIpTwK8OSDzidAcuTAAAcDd/QgXaEU55Es
    HrF3LXg2YxEdOhpwP0KKNNgN/+ppEy++kNtXNeM8bWbBXXm14s9D6BcCgYEA8COH
    nlQnAqI36nCBHv9UDHLecaDz3+ZFBRIcEOlEapXpw4idytl5e1uwUGpX8Lw8/mcX
    dSvLjKNZ5VhRjTlMhBcK0ST/ytHWjPymAgqVA+TRJZsyujGsF+5CCF6TSxkMKDbc
    NkPd65IahiZN8uCKNl/pEU9Nl3gUP62sKk2dJFsCgYA2tAe3xJjoLilYY0uegSfA
    QiiejTM6XZwfH6Rzyf8az9URfICWGJkP0cjjQt7b+XTVnahMIz4yZxA1oXTkvmDF
    qXRw+7Wd0bN7AtiJKPkGA+wyN0NXy1HCCEmp7gFErZmrtaQO9zDizNW2BaU0C0Dh
    x0uqu4VzwnY0tMj6T7o7YQKBgGrqtsgkmZXPmeu0mZiuf8JnJmkbC1nl0VcXoA1b
    fo2iH4liezbEqxTkVtUG9A6IEPQH/Ga70A3W8QBu2ShymYG6LKO/wG+SC9+L4XHJ
    Ol2YdBI1TlmeIgwplZbaXOQzy7jf7B3xC46F529RAKWhmYfqHgAJ+fb1jLZpYd0X
    314/AoGAVoauDj6tCr7wI7ZZ92naRD5bQlBE7xiD3QC/eSuOeXmev+jYcaVPEnW/
    MwD0UMfz6jN6MxYSIDoxq0sqGF22BGGlG1djhk/wNJf5KT70lySwnYHhzidiQrhx
    FVNYkalAe0IkWRIDzw52QHrXTnxiA8td/IQxUk9IMBlEv7M//rw=
    -----END RSA PRIVATE KEY-----`;

    const publicKey = Forge.pki.publicKeyFromPem(pubKey);
    const privateKey = Forge.pki.privateKeyFromPem(prvKey);
    // console.log('Public Key:');

    const data = { message: 'something new' };
    const encData = window.btoa(
      publicKey.encrypt(JSON.stringify(data), 'RSA-OAEP')
    );
    console.log('Encrypted Data:', encData);

    const bytes = window.atob(encData);
    const decData = privateKey.decrypt(bytes, 'RSA-OAEP');
    console.log('Decrypted Data:', JSON.parse(decData));

    // symmetric key generation
    const rsa = Forge.pki.rsa;
    const asyKeys = rsa.generateKeyPair({ bits: 512 });
    console.log(asyKeys);

    // copied code
    const salt = Forge.random.getBytesSync(16);
    const iv = Forge.random.getBytesSync(16);

    const key = Forge.pkcs5.pbkdf2(
      'this_is_something_key',
      salt,
      100000,
      256 / 8,
      'sha256'
    );
    console.log('This is Key:', key);

    const cipher = Forge.cipher.createCipher('AES-CBC', key);

    cipher.start({ iv: iv });
    cipher.update(
      Forge.util.createBuffer('A text that is transcoded into cipher key')
    );
    cipher.finish();

    const encrypted = cipher.output.bytes();
    console.log('This is encrypted key', Forge.util.encode64(encrypted));

    // console.log({
    //   iv: Forge.util.encode64(iv),
    //   salt: Forge.util.encode64(salt),
    //   encrypted: Forge.util.encode64(encrypted),
    //   concatenned: Forge.util.encode64(salt + iv + encrypted),
    // });

    const decipher = Forge.cipher.createDecipher('AES-CBC', key);

    decipher.start({ iv: iv });
    decipher.update(Forge.util.createBuffer(encrypted));
    decipher.finish();

    console.log(decipher.output.toString());
  }
}

   * 
   */
}
