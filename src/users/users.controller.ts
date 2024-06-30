import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { SignUpUserDto } from './dto/signUpUser.dto';
import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { SignInUserDto } from './dto/signInUser.dto';
import { IdUserDto } from './dto/idUser.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // update user

  // signUp user
  @Post('signUp')
  @HttpCode(201)
  async signUpUser(@Body() signUpUserDto: SignUpUserDto) {
    // check duplicate by email
    const isUserAlreadyCreated = await this.usersService.getUserByEmail(
      signUpUserDto.email,
    );
    if (isUserAlreadyCreated) throw new HttpException('Email in use', 409);

    // create hash password
    const hashedPassword = await hash(
      signUpUserDto.password,
      process.env.HASH_SALT,
    );

    // create user
    const user = await this.usersService.createUser({
      ...signUpUserDto,
      password: hashedPassword,
    });

    // create payload
    const payload = { id: user.id };

    // create token
    const newToken = sign(payload, process.env.SECRET_KEY, {
      expiresIn: '24h',
    });

    // update token of user
    const updatedUser = await this.usersService.updateUserToken(
      user.id,
      newToken,
    );

    return updatedUser;
  }

  // signIn user
  @Post('signIn')
  @HttpCode(200)
  async signInUser(@Body() signInUserDto: SignInUserDto) {
    const user = await this.usersService.getUserByEmail(signInUserDto.email);
    if (!user) throw new HttpException('Email or password is wrong', 401);

    const passwordCompare = await compare(
      signInUserDto.password,
      user.password,
    );

    if (!passwordCompare)
      throw new HttpException('Email or password is wrong', 401);

    const payload = { id: user.id };

    const newToken = sign(payload, process.env.SECRET_KEY, {
      expiresIn: '24h',
    });

    // update token of user
    const updatedUser = await this.usersService.updateUserToken(
      user.id,
      newToken,
    );

    return updatedUser;
  }

  // signOut user

  @Post('signOut')
  @HttpCode(204)
  async signOutUser(@Body() idUserDto: IdUserDto) {
    const user = await this.usersService.updateUserToken(idUserDto.id, '');
    if (!user) throw new HttpException('User not found', 404);
    return;
  }

  @Post('current')
  @HttpCode(200)
  async getCurrentUser(@Body() idUserDto: IdUserDto) {
    const user = await this.usersService.getUserById(idUserDto);
    return user;
  }
}
