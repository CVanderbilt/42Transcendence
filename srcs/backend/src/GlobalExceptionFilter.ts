import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus() === HttpStatus.INTERNAL_SERVER_ERROR ? HttpStatus.I_AM_A_TEAPOT : exception.getStatus();
      const message = exception.getResponse();

      response.status(status).json({
        statusCode: status,
        message: message,
      });
    } else {
      console.log("handling non http exception in global hadler:" + JSON.stringify(exception))
      response.status(HttpStatus.I_AM_A_TEAPOT).json({
        statusCode: HttpStatus.I_AM_A_TEAPOT,
        message: 'error code: TEAPOT',
      });
    }
  }
}
