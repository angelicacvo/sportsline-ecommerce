import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const req = context.switchToHttp().getRequest();
    console.log(`[INTERCEPTOR] ${req.method} ${req.url} - Start`);

    return next.handle().pipe(
      tap(() =>
        console.log(
          `[INTERCEPTOR] ${req.method} ${req.url} - End (${Date.now() - now}ms)`,
        ),
      ),
      map((data) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
