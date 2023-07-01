import { Body, Controller, Get, HttpCode, HttpException, Logger, Param, Post, Query, Redirect, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { User } from 'src/users/user.interface';
import { EmailSignupDto, LoginEmailDto } from './auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import * as Joi from 'joi'
import { EMAIL_VALIDATOR, PASSWORD_VALIDATOR, USERNAME_VALIDATOR, processError, validateInput } from 'src/utils/utils';
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
    try {
      return await this.authService.registerWithEmail(data)
    } catch (error) {
      throw processError(error, "problems during signup")
    }
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
    } catch (error) {
      throw processError(error, "problems during signup")
    }
  }

  @Post('login')
  async login42(@Body() data: {code: string}) {
    try {
      const res = await this.authService.signIn42(data.code)
      return res
    } catch (error) {
      throw processError(error, "problems during login")
    }
  }

  @Get('2fa/qr')
  async generateQr(@Req() req, @Res() response: Response) {    
    try {
      const authToken = getAuthToken(req)
      const user : User = await this.authService.getUserById(authToken.userId)
      
      const tentative = await this.authService.generateTwoFactorAuthenticationSecret(user)
      // update user secret
      this.usersService.setTentativeTwofaSecret(user.id, tentative.secret)
      // return qr
      this.authService.pipeQrCodeStream(response, tentative.otpauthUrl)
    } catch (error) {
      throw processError(error, "problems generting qr")
    }
  }

  @Post('2fa/turn-on/:code')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async turnOnTwoFactorAuthentication(@Req() req, @Param('code') twoFactorCode: string) {
    validateInput(Joi.object({
      twoFactorCode: Joi.string().pattern(/^\d{6}$/).required()
    }), {twoFactorCode});

    try {
      const authToken = getAuthToken(req)
      const user = await this.usersRepo.findOne({ 
        where: { id: authToken.userId },
        select: ["id", "email", "username", "password", "role", "is2fa", "twofaSecret", "tentativeTwofaSecret"] })
        
        Logger.log("turnOnTwoFactorAuthentication with 2fa code : " + twoFactorCode + " for user " + user.username)
        
        const isCodeValid = await this.authService.isTwoFactorAuthenticationCodeValid(twoFactorCode, user.tentativeTwofaSecret)
        if (!isCodeValid) {
          throw new UnauthorizedException('Wrong authentication code');
        }
        return await this.usersService.EnableTwofa(user.id);
      } catch (error) {
        throw processError(error, "problems during turnOnTwoFactorAuthentication")
      }
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
      return await this.authService.loginWith2fa(authToken.userId, twoFactorCode);
    } catch (error) {
      throw processError(error, "problems during authenticate")
    }
  }
}
