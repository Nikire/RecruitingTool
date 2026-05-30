import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ApiKeyCryptoService {
  generate(): { rawKey: string; hashedKey: string; keyPrefix: string } {
    const randomPart = crypto.randomBytes(16).toString('hex');
    const rawKey = `blss_live_${randomPart}`;
    const hashedKey = bcrypt.hashSync(rawKey, 10);
    const keyPrefix = rawKey.substring(0, 16);
    return { rawKey, hashedKey, keyPrefix };
  }

  async compare(rawKey: string, hashedKey: string): Promise<boolean> {
    return bcrypt.compare(rawKey, hashedKey);
  }
}
