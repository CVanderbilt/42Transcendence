import { Logger } from '@nestjs/common';

export class Logger2 extends Logger {
  log(message: string) {
    const stack = new Error().stack.split('\n');
    const line = stack[2].trim().substring(3);
    super.log(`${message} - ${line}`);
  }
}