import { HttpException, HttpStatus, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { HttpStatusCode } from 'axios';
import * as Joi from 'joi';
const fs = require('fs');
const { PNG } = require('pngjs');
import * as jwt from 'jsonwebtoken';
import { User } from 'src/users/user.interface';

export const USERNAME_VALIDATOR = Joi.string().regex(/^[a-zA-Z0-9-_]+$/) //TODO: revisar si funcionará con los usuarios con nombres de la intra -> a las malas se puede asegurar si al hacer signup desde la intra transformamos el nombre cambiando cualquier caracter distinto de los aceptados por - o _
export const CHATNAME_VALIDATOR = Joi.string().regex(/^[a-zA-Z0-9-_?]+$/) //TODO: revisar con chatgpt si funciona con como creamos los chatnames
export const RESTRICTED_CHATNAME_VALIDATOR = Joi.string().regex(/^[a-zA-Z0-9-_]+$/)
export const ID_VALIDATOR = Joi.string().guid()
export const EMAIL_VALIDATOR = Joi.string().email()
export const PASSWORD_VALIDATOR = Joi.string()
export const CHATROOM_ID_VALIDATOR = Joi.number()
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

let blacklisted: { userId: string, monitorUntil: Date }[] = []
export function removeFromBlacklist(id) {
  blacklisted = blacklisted.filter(item => {
    if (item.userId === id || isPastDate(item.monitorUntil)) {
      return false; // Remove the item from the blacklist
    }
    return true; // Keep the item in the blacklist
  });
}

export function addToBlacklist(id: string) {
  const currentTime = new Date();
  const monitorUntil = new Date(currentTime.getTime() + 11 * 60000); // 11 minutes from now

  const existingItemIndex = blacklisted.findIndex(item => item.userId === id);
  if (existingItemIndex !== -1) {
    // Update monitorUntil for existing item
    blacklisted[existingItemIndex].monitorUntil = monitorUntil;
  } else {
    // Add new item to the blacklisted array
    blacklisted.push({
      userId: id,
      monitorUntil: monitorUntil
    });
  }
  console.log("blackLIst: " + JSON.stringify(blacklisted))
}
export function getAuthToken(request, validate = true) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    throw new NotFoundException('Token not found');
  try {
    const token = request.headers.authorization.split(' ')[1];

    const decodedToken = validate ?
      jwt.verify(token, process.env.JWT_KEY) as { [key: string]: any, role: string, userId: string, email: string, isTwoFactorAuthenticationEnabled: boolean, isTwoFactorAuthenticated: boolean } :
      jwt.decode(token) as { [key: string]: any, role: string, userId: string, email: string, isTwoFactorAuthenticationEnabled: boolean, isTwoFactorAuthenticated: boolean }

    let isAllowed = true

    blacklisted.forEach((it, index) => {
      if (it.userId === decodedToken.userId) {
        isAllowed = false;
      } else if (it.monitorUntil) {
        if (isPastDate(it.monitorUntil)) {
          console.log(`removing ${it.userId} from blacklisted, from now on other valid tokens will have isBanned set to true`)
          console.log(`blacklisted: ${JSON.stringify(blacklisted, null, 2)}`)
          blacklisted.splice(index, 1);
          index--;
        }
      }
    });
    if (!isAllowed)
      throw new HttpException("Requester is banned", HttpStatus.UNAUTHORIZED)
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
    throw new HttpException("Invalid token", HttpStatusCode.ImATeapot)
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

    console.log("decoded token:")
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
    Logger.log(ret)
    return ret;
  } catch (err) {
    throw new UnauthorizedException('Invalid token');
  }
}

export function isPastDate(date: Date): boolean {
  return date < new Date();
}

export function processError(error: any, defaultMsg: string): HttpException {
  console.log("processing error: " + JSON.stringify(error))
  if (error instanceof HttpException)
    return error
  return new HttpException(defaultMsg, HttpStatusCode.ImATeapot);
}

export const usersInGame = new Set<string>();