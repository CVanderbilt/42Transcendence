import { Body, Controller, Get, HttpCode, HttpException, Logger, Param, Post, Query, Redirect, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { Jwt2faAuthGuard } from './jwt-2fa-auth.guard';
import { User } from 'src/users/user.interface';
import { MeDto, Signin2faDto } from './auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) { }

  
  @Post('login')
  async login(@Body() data: any) {
    try {
      const res = await this.authService.signIn42(data.code)
      return res
    } catch (cause) {
      Logger.error(cause)
      throw new HttpException("Unauthorized user", 401, { cause })
    }
  }

  @Post('2fa/qr')
  @UseGuards(Jwt2faAuthGuard)
  async generateQr(@Body() dto: User, @Res() response: Response) {
    const secret = await this.authService.generateTwoFactorAuthenticationSecret(dto)
    // update user secret
    this.usersService.setTwofaSecret(dto.login42, secret.secret)
    // return qr
    this.authService.pipeQrCodeStream(response, secret.otpauthUrl)
  }

  @Post('2fa/turn-on')
  @HttpCode(200) // cambia el código por defecto que en post es 201
  @UseGuards(Jwt2faAuthGuard)
  async turnOnTwoFactorAuthentication(@Body() signin2faDto: Signin2faDto) {
    const isCodeValid = await this.authService.isTwoFactorAuthenticationCodeValid(signin2faDto)

    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }

    return await this.usersService.EnableTwofa(signin2faDto.login42, true);
  }

  @Post('2fa/authenticate')
  @HttpCode(200) // cambia el código por defecto que en post es 201
  @UseGuards(JwtAuthGuard)
  async authenticate(@Body() signin2faDto: Signin2faDto) {
    return this.authService.loginWith2fa(signin2faDto);
  }

  @Get('/me')
  @UseGuards(Jwt2faAuthGuard)
  async me(@Req() req) : Promise<any>{
    const me = await this.authService.me(req);
    Logger.log("me ok!")
    return me;
  }
}
