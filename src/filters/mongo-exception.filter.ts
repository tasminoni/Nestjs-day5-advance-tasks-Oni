import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { MongoError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';

@Catch(MongoError, MongooseError, Error)
export class MongoExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(MongoExceptionFilter.name);

  catch(exception: MongoError | MongooseError | Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof MongoError) {
      if (exception.code === 11000) {
        // Duplicate key error
        status = HttpStatus.CONFLICT;
        message = 'Email already exists';
        
        // Extract field name from error message
        const field = exception.message.match(/index: (\w+)/)?.[1];
        if (field) {
          message = `${field} already exists`;
        }
      } else {
        status = HttpStatus.BAD_REQUEST;
        message = 'Database operation failed';
      }
    } else if (exception instanceof MongooseError && exception.name === 'CastError') {
      // Invalid ObjectId or type casting error
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid ID format';
    } else if (exception.message) {
      // Generic error with message
      if (exception.message.includes('validation')) {
        status = HttpStatus.BAD_REQUEST;
        message = exception.message;
      }
    }

    this.logger.error(
      `MongoDB Exception: ${exception.message}`,
      exception.stack,
    );

    response.status(status).json({
      success: false,
      message,
      statusCode: status,
      timestamp: new Date().toISOString(),
    });
  }
}
