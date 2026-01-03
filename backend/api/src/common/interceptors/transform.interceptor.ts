import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StandardResponse } from '../dto/standard-response.dto';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  StandardResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // If data is already a StandardResponse, return it
        if (data instanceof StandardResponse) {
          return data;
        }
        // Otherwise, wrap it
        return new StandardResponse(data);
      }),
    );
  }
}
