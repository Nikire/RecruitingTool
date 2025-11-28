import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

/**
 * Filter to handle Prisma errors and return user-friendly messages
 * Handles unique constraints, foreign key violations, check constraints, etc.
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);
  private readonly isProduction = process.env.NODE_ENV === 'production';
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database operation failed';
    let error = 'DatabaseError';

    // Handle different Prisma error codes
    switch (exception.code) {
      // Unique constraint violation
      case 'P2002': {
        status = HttpStatus.CONFLICT;
        error = 'UniqueConstraintViolation';
        message = this.handleUniqueConstraintViolation(exception);
        break;
      }

      // Foreign key constraint violation
      case 'P2003': {
        status = HttpStatus.BAD_REQUEST;
        error = 'ForeignKeyConstraintViolation';
        message = 'The operation references a record that does not exist.';
        break;
      }

      // Record not found
      case 'P2025': {
        status = HttpStatus.NOT_FOUND;
        error = 'RecordNotFound';
        message = 'The requested record does not exist.';
        break;
      }

      // Check constraint violation
      case 'P2004': {
        status = HttpStatus.BAD_REQUEST;
        error = 'CheckConstraintViolation';
        message = this.handleCheckConstraintViolation(exception);
        break;
      }

      // Record to delete/update not found
      case 'P2016': {
        status = HttpStatus.NOT_FOUND;
        error = 'RecordNotFound';
        message = 'The record you are trying to modify does not exist.';
        break;
      }

      // Related record not found
      case 'P2018': {
        status = HttpStatus.BAD_REQUEST;
        error = 'RelatedRecordNotFound';
        message = 'One or more related records do not exist.';
        break;
      }

      // Dependent records exist (restrict delete)
      case 'P2014': {
        status = HttpStatus.CONFLICT;
        error = 'DependentRecordsExist';
        message = 'Cannot delete this record because other records depend on it.';
        break;
      }

      // Null constraint violation
      case 'P2011': {
        status = HttpStatus.BAD_REQUEST;
        error = 'NullConstraintViolation';
        message = 'A required field is missing.';
        break;
      }

      default: {
        // Log unknown Prisma errors for debugging
        this.logger.error('Unknown Prisma error:', {
          code: exception.code,
          message: exception.message,
          meta: exception.meta,
        });
        message = 'A database error occurred.';
      }
    }

    // Log full error details server-side (always, regardless of environment)
    this.logger.error(
      `[${new Date().toISOString()}] ${request.method} ${request.url}`,
      JSON.stringify({
        status,
        error,
        message,
        prismaCode: exception.code,
        meta: exception.meta,
        // Log request details for debugging
        userAgent: request.headers['user-agent'],
        ip: request.ip,
      }),
    );

    // Build response object
    const errorResponse: any = {
      success: false,
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Only include Prisma metadata in development (contains sensitive database info)
    if (!this.isProduction) {
      errorResponse.prismaCode = exception.code;
      errorResponse.prismaTarget = exception.meta?.target;
    }

    // Send formatted response
    response.status(status).json(errorResponse);
  }

  /**
   * Handle unique constraint violations with user-friendly messages
   */
  private handleUniqueConstraintViolation(exception: Prisma.PrismaClientKnownRequestError): string {
    const target = exception.meta?.target as string[] | undefined;

    if (!target || target.length === 0) {
      return 'This record already exists.';
    }

    // Handle case-insensitive email constraints
    if (target.some((field) => field.toLowerCase().includes('email'))) {
      const constraintName = target.join('_');

      if (constraintName.includes('User_email')) {
        return 'A user with this email address already exists (case-insensitive).';
      }

      if (constraintName.includes('Candidate_email')) {
        return 'A candidate with this email address already exists (case-insensitive).';
      }

      if (constraintName.includes('Application_jobPosition_email')) {
        return 'This email has already been used to apply for this job position.';
      }

      return 'This email address is already in use.';
    }

    // Handle other unique constraints
    if (target.includes('uid')) {
      return 'This unique identifier already exists.';
    }

    if (target.includes('token')) {
      return 'This token already exists.';
    }

    if (target.includes('hiringProcessId') && target.includes('position')) {
      return 'A stage already exists at this position in the hiring process.';
    }

    if (target.includes('interviewId') && target.includes('userId')) {
      return 'This user is already assigned as an interviewer for this interview.';
    }

    if (target.includes('scorecardId') && target.includes('criterionId')) {
      return 'A score already exists for this criterion.';
    }

    if (target.includes('candidateId') && target.includes('jobPositionId')) {
      // Check if this is a HiringProcess constraint or CandidateScore constraint
      const constraintName = exception.meta?.constraint_name as string | undefined;

      if (constraintName && constraintName.includes('HiringProcess')) {
        return 'This candidate has already applied to this job position.';
      }

      return 'A score already exists for this candidate and job position combination.';
    }

    if (target.includes('companyId') && target.includes('quotaType')) {
      return 'A quota of this type already exists for this company.';
    }

    // Generic fallback
    const fields = target.join(', ');
    return `A record with these values already exists: ${fields}.`;
  }

  /**
   * Handle check constraint violations with user-friendly messages
   */
  private handleCheckConstraintViolation(exception: Prisma.PrismaClientKnownRequestError): string {
    const constraintMessage = exception.message;

    // Extract constraint name from error message
    if (constraintMessage.includes('Stage_position_check')) {
      return 'Stage position must be a non-negative number.';
    }

    if (constraintMessage.includes('FileUpload_size_check')) {
      return 'File size must be greater than 0.';
    }

    if (constraintMessage.includes('Interview_duration_check')) {
      return 'Interview duration must be a positive number.';
    }

    if (constraintMessage.includes('StageTimeLog_duration_check')) {
      return 'Stage duration must be a non-negative number.';
    }

    if (constraintMessage.includes('HRSchedule_dayOfWeek_check')) {
      return 'Day of week must be between 0 (Sunday) and 6 (Saturday).';
    }

    if (constraintMessage.includes('AIQuota_limit_check')) {
      return 'Quota limit must be a positive number.';
    }

    if (constraintMessage.includes('AIQuota_used_check')) {
      return 'Quota used must be a non-negative number.';
    }

    if (constraintMessage.includes('Scorecard_overallScore_check')) {
      return 'Overall score must be between 0 and 100.';
    }

    if (constraintMessage.includes('ScorecardCriterion_maxScore_check')) {
      return 'Maximum score must be a positive number.';
    }

    if (constraintMessage.includes('ScorecardScore_score_check')) {
      return 'Score must be a non-negative number.';
    }

    if (constraintMessage.includes('ScorecardCategory_weight_check')) {
      return 'Category weight must be a positive number.';
    }

    if (
      constraintMessage.includes('CandidateScore_overallScore_check') ||
      constraintMessage.includes('CandidateScore_skillsScore_check') ||
      constraintMessage.includes('CandidateScore_experienceScore_check') ||
      constraintMessage.includes('CandidateScore_educationScore_check')
    ) {
      return 'Candidate scores must be between 0 and 100.';
    }

    if (
      constraintMessage.includes('BatchScoringJob_totalCandidates_check') ||
      constraintMessage.includes('BatchScoringJob_processedCount_check') ||
      constraintMessage.includes('BatchScoringJob_failedCount_check')
    ) {
      return 'Batch scoring job counts must be non-negative numbers.';
    }

    if (constraintMessage.includes('Interview_rescheduledCount_check')) {
      return 'Rescheduled count must be a non-negative number.';
    }

    // Generic fallback
    return 'The provided data violates a database constraint.';
  }
}
