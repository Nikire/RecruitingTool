import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { StorageService } from '../../storage/storage.service';

@Injectable()
export class StorageHealthIndicator extends HealthIndicator {
  constructor(private readonly storageService: StorageService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.storageService.checkConnection();
      return this.getStatus(key, true, {
        message: 'Storage is healthy',
        endpoint: process.env.S3_ENDPOINT || 'http://minio:9000',
      });
    } catch (error) {
      return this.getStatus(key, false, {
        message: `Storage connection failed: ${error.message}`,
      });
    }
  }
}
