import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse, PaginationMeta } from '../interfaces/api-response.interface';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse();
        
        // If data has pagination info, extract meta
        let meta: PaginationMeta | undefined;
        let responseData = data;
        
        if (data && typeof data === 'object' && 'data' in data && 'meta' in data) {
          responseData = data.data;
          meta = data.meta;
        }

        return {
          success: true,
          message: this.getMessageByStatus(response.statusCode),
          data: responseData,
          ...(meta && { meta }),
        };
      }),
    );
  }

  private getMessageByStatus(statusCode: number): string {
    switch (statusCode) {
      case 200:
        return 'Success';
      case 201:
        return 'Created successfully';
      case 204:
        return 'Updated successfully';
      default:
        return 'Operation completed';
    }
  }
}
