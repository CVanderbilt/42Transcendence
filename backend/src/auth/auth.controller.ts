import { Body, Controller, Get, HttpCode, HttpException, Logger, Param, Post, Query, Redirect, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { Jwt2faAuthGuard } from './jwt-2fa-auth.guard';
import { User } from 'src/users/user.interface';
import { EmailSignupDto, LoginEmailDto } from './auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import * as Joi from 'joi'
import { validateInput } from 'src/utils/utils';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) { }

  @Post('esignup')
  async signup(@Body() data: EmailSignupDto) {
    validateInput(Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      username: Joi.string().regex(/^[a-zA-Z0-9-_]+$/).required(),
    }), data);
    return await this.authService.registerWithEmail(data)
  }

  @HttpCode(200) // cambia el código por defecto que en post es 201
  @Post('elogin')
  async loginEmail(@Body() data: LoginEmailDto) {
    validateInput(Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }), data);
    try {
      return this.authService.loginWithEmail(data);
    }
    catch (cause) {
      Logger.log(cause)
      throw cause
    }
  }

  @Post('login')
  async login42(@Body() data: {code: string}) {
    validateInput(Joi.object({
      code: Joi.string().required(), //todo: a lo mejor -> Joi.string().regex(/^[a-zA-Z0-9-_]+$/).required()
    }), data);
    try {
      const res = await this.authService.signIn42(data.code)
      return res
    } catch (cause) {
        Logger.log(cause)
    }
  }

  @Get('2fa/qr')
  @UseGuards(Jwt2faAuthGuard)
  async generateQr(@Req() req, @Res() response: Response) {    
    const dto : User = req.user
    // validando solo los campos de user que realmente se usan
    validateInput(Joi.object({
      login42: Joi.string().regex(/^[a-zA-Z0-9-_]+$/).required(),
      id: Joi.string().guid().required(),
    }), dto);
    const secret = await this.authService.generateTwoFactorAuthenticationSecret(dto)
    // update user secret
    this.usersService.setTwofaSecret(dto.id, secret.secret)
    // return qr
    this.authService.pipeQrCodeStream(response, secret.otpauthUrl)
  }

  @Post('2fa/turn-on/:code')
  @HttpCode(200) // cambia el código por defecto que en post es 201
  @UseGuards(Jwt2faAuthGuard)
  async turnOnTwoFactorAuthentication(@Req() request, @Param('code') twoFactorCode: string) {
    validateInput(Joi.object({
      login42: Joi.string().regex(/^[a-zA-Z0-9-_]+$/).required(),
      id: Joi.string().guid().required()
    }), request.user);
    const isCodeValid = await this.authService.isTwoFactorAuthenticationCodeValid(request.user.id, twoFactorCode)
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }

    return await this.usersService.EnableTwofa(request.user.login42, true);
  }

  @Post('2fa/authenticate/:code')
  @HttpCode(200) // cambia el código por defecto que en post es 201
  @UseGuards(JwtAuthGuard)
  async authenticate(@Req() request, @Param('code') twoFactorCode: string) {
    validateInput(Joi.object({
      login42: Joi.string().regex(/^[a-zA-Z0-9-_]+$/).required(),
      id: Joi.string().guid().required()
    }), request.user);
    Logger.log("authenticate with 2fa code : " + twoFactorCode + " for user " + request.user.login42)
    return this.authService.loginWith2fa(request.user.id, twoFactorCode);
  }

  @Get('/me')
  @UseGuards(Jwt2faAuthGuard)
  async me(@Req() req) : Promise<any> {
    // no estoy muy seguro de como validar este input
    const me = await this.authService.me(req);
    return me;
  }
}
