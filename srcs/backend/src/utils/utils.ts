import { HttpException, HttpStatus, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { HttpStatusCode } from 'axios';
import * as Joi from 'joi';
const fs = require('fs');
const { PNG } = require('pngjs');
import * as jwt from 'jsonwebtoken';
import { User } from 'src/users/user.interface';

export const USERNAME_VALIDATOR = Joi.string().regex(/^[a-zA-Z0-9-_]{1,22}$/);
export const CHATNAME_VALIDATOR = Joi.string().regex(/^[a-zA-Z0-9-_?]+$/) 
export const RESTRICTED_CHATNAME_VALIDATOR = Joi.string().regex(/^[a-zA-Z0-9-_]+$/)
export const ID_VALIDATOR = Joi.string().guid()
export const INT_VALIDATOR = Joi.number().allow(Joi.string())
export const EMAIL_VALIDATOR = Joi.string().email()
export const PASSWORD_VALIDATOR = Joi.string()
export const CHATROOM_ID_VALIDATOR = Joi.number().allow(Joi.string())
export const FORBIDDEN = Joi.forbidden()
export const DATE_VALIDATOR = Joi.date()
export const BOOLEAN_VALIDATOR = Joi.boolean()
export const MESSAGE_VALIDATOR = Joi.string().regex(/^[a-zA-Z0-9\s.,!?@#$%^&*()\-_+=~{}[\]|\\/<>:;'"`áéíóúÁÉÍÓÚñÑ]+$/);

export function validateInput(schema: Joi.ObjectSchema<any>, toValidate: any) {
  const validation = schema.validate(toValidate);
  if (validation.error !== undefined) {
    console.log("error validating: " + JSON.stringify(toValidate))
    console.log("error: " + validation.error.message)
    throw new HttpException(validation.error.message, HttpStatus.BAD_REQUEST);
  }
}

export function generateRandomSquaresImage() {
  const width = 500;
  const height = 500;
  const numSquares = 50;
  const minSize = 10;
  const maxSize = 50;

  const image = new PNG({ width, height });

  const gradient = {
    start: {
      r: Math.floor(Math.random() * 256),
      g: Math.floor(Math.random() * 256),
      b: Math.floor(Math.random() * 256),
    },
    end: {
      r: Math.floor(Math.random() * 256),
      g: Math.floor(Math.random() * 256),
      b: Math.floor(Math.random() * 256),
    },
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixelIndex = (y * width + x) << 2;
      const ratio = y / height;
      const color = {
        r: Math.floor(gradient.start.r + ratio * (gradient.end.r - gradient.start.r)),
        g: Math.floor(gradient.start.g + ratio * (gradient.end.g - gradient.start.g)),
        b: Math.floor(gradient.start.b + ratio * (gradient.end.b - gradient.start.b)),
      };
      image.data[pixelIndex] = color.r;
      image.data[pixelIndex + 1] = color.g;
      image.data[pixelIndex + 2] = color.b;
      image.data[pixelIndex + 3] = 255;
    }
  }

  for (let i = 0; i < numSquares; i++) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);
    const size = Math.floor(Math.random() * (maxSize - minSize + 1) + minSize);
    const color = {
      r: Math.floor(Math.random() * 256),
      g: Math.floor(Math.random() * 256),
      b: Math.floor(Math.random() * 256),
      a: Math.floor(Math.random() * 256),
    };

    for (let j = x; j < x + size; j++) {
      for (let k = y; k < y + size; k++) {
        const idx = (image.width * k + j) << 2;
        image.data[idx] = color.r;
        image.data[idx + 1] = color.g;
        image.data[idx + 2] = color.b;
        image.data[idx + 3] = color.a;
      }
    }
  }

  return image
}

export function decodeToken(token: string) {
  try {
    const decodedToken =
      jwt.decode(token) as { [key: string]: any, role: string, userId: string, email: string, isTwoFactorAuthenticationEnabled: boolean, isTwoFactorAuthenticated: boolean }

    const ret = {
      role: decodedToken.role,
      userId: decodedToken.userId,
      email: decodedToken.email,
      isTwoFactorAuthenticationEnabled: decodedToken.isTwoFactorAuthenticationEnabled,
      isTwoFactorAuthenticated: decodedToken.isTwoFactorAuthenticated,
      hasRightsOverUser: (token, user: User): boolean => {
        if (token.userId === user.id)
          return true;
        if (user.role === "OWNER")
          return false;
        if (token.role === "ADMIN" || token.role === "OWNER")
          return true;
        return false;
      }
    };
    return ret;
  } catch (err) {
    throw new UnauthorizedException('Invalid token');
  }
}

let blacklisted: { userId: string, invalidBefore: Date }[] = []

export function addToBlacklist(id: string) {
  const invalidBefore = new Date();
  const msDuration = process.env.TOKEN_LIFETIME_MIN as unknown as number * 60 * 1000;

  // remove elements that are no longer expired
  const currentTime = new Date().getTime();
  const updatedBlacklisted = blacklisted.filter(item => {
    return item.invalidBefore.getTime() + msDuration >= currentTime;
  });

  blacklisted = updatedBlacklisted;

  blacklisted.push({
    userId: id,
    invalidBefore: invalidBefore
  });
}

export function getAuthToken(request, validate = true) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    throw new HttpException('Token not found', 442);
  try {
    const token = request.headers.authorization.split(' ')[1];

    const decodedToken = validate ?
      jwt.verify(token, process.env.JWT_KEY) as { [key: string]: any, role: string, userId: string, email: string, isTwoFactorAuthenticationEnabled: boolean, isTwoFactorAuthenticated: boolean, iat: number } :
      jwt.decode(token) as { [key: string]: any, role: string, userId: string, email: string, isTwoFactorAuthenticationEnabled: boolean, isTwoFactorAuthenticated: boolean, iat: number }

    const entries = blacklisted.filter((it) => it.userId === decodedToken.userId)
    // get last entry
    const entrie = entries.length > 0 ? entries[entries.length - 1] : null;
    if (entrie) {
      if (decodedToken.iat < Math.round(entrie.invalidBefore.getTime() / 1000))
        throw new HttpException("Token no longer valid. Sign in again", 442)
    }

    const ret = {
      role: decodedToken.role,
      userId: decodedToken.userId,
      email: decodedToken.email,
      isTwoFactorAuthenticationEnabled: decodedToken.isTwoFactorAuthenticationEnabled,
      isTwoFactorAuthenticated: decodedToken.isTwoFactorAuthenticated,
      hasRightsOverUser: (token, user: User): boolean => {
        if (!user)
          throw new HttpException("Null user when checking for permissions", HttpStatusCode.NotFound)
        if (token.userId === user.id)
          return true;
        if (user.role === "OWNER")
          return false;
        if (token.role === "ADMIN" || token.role === "OWNER")
          return true;
        return false;
      }
    };
    return ret;
  } catch (err) {
    throw processError(err, "Invalid token")
  }
}

export function get42Token(request, validate = true) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    throw new NotFoundException('Token not found');
  try {
    const token = request.headers.authorization.split(' ')[1];

    const decodedToken = validate ?
      jwt.verify(token, process.env.JWT_KEY) as { [key: string]: any, role: string, userId: string, email: string, isTwoFactorAuthenticationEnabled: boolean, isTwoFactorAuthenticated: boolean } :
      jwt.decode(token) as { [key: string]: any, role: string, userId: string, email: string, isTwoFactorAuthenticationEnabled: boolean, isTwoFactorAuthenticated: boolean }

    console.log(decodedToken)
    const ret = {
      role: decodedToken.role,
      userId: decodedToken.userId,
      email: decodedToken.email,
      isTwoFactorAuthenticationEnabled: decodedToken.isTwoFactorAuthenticationEnabled,
      isTwoFactorAuthenticated: decodedToken.isTwoFactorAuthenticated,
      hasRightsOverUser: (token, user: User): boolean => {
        if (token.userId === user.id)
          return true;
        if (user.role === "OWNER")
          return false;
        if (token.role === "ADMIN" || token.role === "OWNER")
          return true;
        return false;
      }
    };
    return ret;
  } catch (err) {
    throw processError(err, "Invalid token")
  }
}

export function isPastDate(date: Date): boolean {
  return date < new Date();
}

export function processError(error: Error, defaultMsg: string): HttpException {
  if (error instanceof HttpException)
    return error

  console.log(error)
  return new HttpException(defaultMsg, HttpStatusCode.ImATeapot);

}

export const usersInGame = new Set<string>();