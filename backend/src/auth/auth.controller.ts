import { Body, Controller, Get, HttpCode, HttpException, Logger, Param, Post, Query, Redirect, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { User } from 'src/users/user.interface';
import { EmailSignupDto, LoginEmailDto } from './auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import * as Joi from 'joi'
import { EMAIL_VALIDATOR, PASSWORD_VALIDATOR, USERNAME_VALIDATOR, validateInput } from 'src/utils/utils';
import { getAuthToken } from 'src/utils/utils';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/user.entity';
import { Repository } from 'typeorm';

@Controller('auth')
export class AuthController {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) { }

  @Post('esignup')
  async signup(@Body() data: EmailSignupDto) {
    validateInput(Joi.object({
      email: EMAIL_VALIDATOR.required(),
      password: PASSWORD_VALIDATOR.required(),
      username: USERNAME_VALIDATOR.required(),
    }), data);
    return await this.authService.registerWithEmail(data)
  }

  @HttpCode(200) // cambia el código por defecto que en post es 201
  @Post('elogin')
  async loginEmail(@Body() data: LoginEmailDto) {
    validateInput(Joi.object({
      email: EMAIL_VALIDATOR.required(),
      password: PASSWORD_VALIDATOR.required(),
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
    try {
      const res = await this.authService.signIn42(data.code)
      Logger.log(res)
      return res
    } catch (cause) {
        Logger.log(cause)
    }
  }

  @Get('2fa/qr')
  async generateQr(@Req() req, @Res() response: Response) {    
    const authToken = getAuthToken(req)
    const user : User = await this.authService.getUserById(authToken.userId)

    //TODO esta validación no funciona, sospecho que es porque es cuando el login 42 es null. Necesitamos validar aquí el login 42 ???
    // // validando solo los campos de user que realmente se usan
    // validateInput(Joi.object({
    //   login42: Joi.string().regex(/^[a-zA-Z0-9-_]+$/).required(),
    //   id: Joi.string().guid().required(),
    // }), user);
    
    const tentative = await this.authService.generateTwoFactorAuthenticationSecret(user)
    // update user secret
    this.usersService.setTentativeTwofaSecret(user.id, tentative.secret)
    // return qr
    this.authService.pipeQrCodeStream(response, tentative.otpauthUrl)
  }

  @Post('2fa/turn-on/:code')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async turnOnTwoFactorAuthentication(@Req() req, @Param('code') twoFactorCode: string) {
    validateInput(Joi.object({
      twoFactorCode: Joi.string().pattern(/^\d{6}$/).required()
    }), {twoFactorCode});

    console.log("turnOnTwoFactorAuthentication")
    const authToken = getAuthToken(req)
    const user = await this.usersRepo.findOne({ 
      where: { id: authToken.userId },
      select: ["id", "email", "username", "password", "role", "is2fa", "twofaSecret", "tentativeTwofaSecret"] })

    Logger.log("turnOnTwoFactorAuthentication with 2fa code : " + twoFactorCode + " for user " + user.username)
    console.log(user)

    const isCodeValid = await this.authService.isTwoFactorAuthenticationCodeValid(twoFactorCode, user.tentativeTwofaSecret)
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    return await this.usersService.EnableTwofa(user.id);
  }

  @Post('2fa/authenticate/:code')
  @HttpCode(200)
  // @UseGuards(JwtAuthGuard)
  async authenticate(@Req() request, @Param('code') twoFactorCode: string) {
    validateInput(Joi.object({
      twoFactorCode: Joi.string().pattern(/^\d{6}$/).required()
    }), {twoFactorCode});

    try {
      const authToken = getAuthToken(request)
      console.log(authToken)
      return await this.authService.loginWith2fa(authToken.userId, twoFactorCode);
    }
    catch (cause: any) {
      throw cause
    }
  }
}
