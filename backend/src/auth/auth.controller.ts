import { Body, Controller, Get, HttpCode, HttpException, Logger, Post, Query, Redirect, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Signin2faDto } from './signin2fa.dto';
// import { Jwt2faAuthGuard } from './jwt-2fa-auth.guard';
import { Login42dto } from './login42.dto';
import { authorize } from 'passport';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) { }

  @Get('hi5')
  hi5() {
    Logger.log("en hi5")
    return "hola!"
  }

  @Post('login')
  async login(@Body() data: {code: string}) {
    try {
      return await this.authService.signIn42(data.code)
    } catch (cause) {
      Logger.error(cause)
      throw new HttpException("Unauthorized user", 401, { cause }) 
    }
  }

  @Get('callback')
  callback(@Query('code') code: string, @Res() res: any) {
    Logger.log("from callback")
    // const params = new URLSearchParams();
    // params.append('code', code);
    // params.append('client_id', process.env.ID_42);
    // params.append('client_secret', process.env.SECRET_42);
    // params.append('redirect_uri', process.env.REDIRECT_URI);
    // params.append('grant_type', 'authorization_code');
    // const { data } = await axios.post(process.env.GET_TOKEN_URL_42, params);
    // const { access_token, id_token } = data;

    // const userInfo = await axios.get("https://api.intra.42.fr/v2/me", { headers: { Authorization: "Bearer " + access_token } });

    // Logger.log(userInfo);

    // res.redirect('/home');
    return "ok"
  }

  // @Post('2fa/qr')
  // @UseGuards(Jwt2faAuthGuard)
  // async generateQr(@Body() dto: User, @Res() response: Response) {
  //   const secret = await this.authService.generateTwoFactorAuthenticationSecret(dto)
  //   // update user secret
  //   this.usersService.setTwofaSecret(dto.email, secret.secret)
  //   // return qr
  //   this.authService.pipeQrCodeStream(response, secret.otpauthUrl)
  // }

  // @Post('2fa/turn-on')
  // @HttpCode(200) // cambia el código por defecto que en post es 201
  // @UseGuards(Jwt2faAuthGuard)
  // async turnOnTwoFactorAuthentication(@Body() signin2faDto: Signin2faDto) {
  //   const isCodeValid = await this.authService.isTwoFactorAuthenticationCodeValid(signin2faDto)

  //   if (!isCodeValid) {
  //     throw new UnauthorizedException('Wrong authentication code');
  //   }

  //   return await this.usersService.EnableTwofa(signin2faDto.email, true);
  // }

  // @Post('2fa/authenticate')
  // @HttpCode(200) // cambia el código por defecto que en post es 201
  // @UseGuards(JwtAuthGuard)
  // async authenticate(@Body() signin2faDto: Signin2faDto) {
  //   return this.authService.loginWith2fa(signin2faDto);
  // }

  // @Get()
  // @UseGuards(Jwt2faAuthGuard)
  // async youarein() {
  //   return "You are in!"
  // }



}
