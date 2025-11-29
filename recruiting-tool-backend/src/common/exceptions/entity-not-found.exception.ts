import { NotFoundException } from '@nestjs/common';

/**
 * Exception for entity not found errors
 * Provides consistent error messages for missing entities
 */
export class EntityNotFoundException extends NotFoundException {
  constructor(entityName: string, identifier: string) {
    super(`${entityName} with identifier '${identifier}' not found`);
    this.name = 'EntityNotFoundException';
  }
}
