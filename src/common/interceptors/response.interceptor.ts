import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

/**
 * ResponseInterceptor - Formats all API responses and logs execution time
 * 
 * What it does:
 * 1. Wraps all successful responses in a standard format
 * 2. Adds metadata (timestamp, path, method)
 * 3. Logs execution time for performance monitoring
 * 
 * Before: { id: 1, name: "Product" }
 * After: {
 *   success: true,
 *   data: { id: 1, name: "Product" },
 *   timestamp: "2025-11-18T10:00:00.000Z",
 *   path: "/products/1",
 *   method: "GET"
 * }
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ResponseInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      // Log execution time
      tap(() => {
        const executionTime = Date.now() - startTime;
        this.logger.log(`${method} ${url} - Execution time: ${executionTime}ms`);
      }),
      // Transform response format
      map((data) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
        path: url,
        method,
      })),
    );
  }
}
