import { BadRequestException } from '@nestjs/common';

/**
 * Exception for business logic violations
 * Use when the request is technically valid but violates business rules
 * Example: "Cannot delete candidate with active applications"
 */
export class BusinessLogicException extends BadRequestException {
  constructor(message: string) {
    super(message);
    this.name = 'BusinessLogicException';
  }
}
