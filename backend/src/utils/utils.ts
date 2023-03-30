import { HttpException, HttpStatus } from '@nestjs/common';
import * as Joi from 'joi'

export function validateInput(schema: Joi.ObjectSchema<any>, toValidate: any) {
  const validation = schema.validate(toValidate);
  if (validation.error !== undefined)
    throw new HttpException(validation.error.message, HttpStatus.BAD_REQUEST);
}