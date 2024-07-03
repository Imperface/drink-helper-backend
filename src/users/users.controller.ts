import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  ParseFilePipeBuilder,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UpdateUserInterface, UsersService } from './users.service';
import { SignUpUserDto } from './dto/signUpUser.dto';
import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { SignInUserDto } from './dto/signInUser.dto';
import { CloudinaryService } from 'src/helpers/cloudinary/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserDto } from './dto/updateUser.dto';
import { RequestService } from 'src/helpers/request/request.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly requestService: RequestService,
  ) {}

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

    // save userId in requestService
    this.requestService.setUserId(user.id);

    // return updated user with token
    return this.usersService.updateUserToken(newToken);
  }

  // signIn user
  @Post('signIn')
  @HttpCode(200)
  async signInUser(@Body() signInUserDto: SignInUserDto) {
    // return 401 if user not found in db
    const user = await this.usersService.getUserByEmail(signInUserDto.email);
    if (!user) throw new HttpException('Email or password is wrong', 401);

    // compare password
    const passwordCompare = await compare(
      signInUserDto.password,
      user.password,
    );

    // return 401 if password is wrong
    if (!passwordCompare)
      throw new HttpException('Email or password is wrong', 401);

    // create payload
    const payload = { id: user.id };

    // create token
    const newToken = sign(payload, process.env.SECRET_KEY, {
      expiresIn: '24h',
    });

    // save userId in requestService
    this.requestService.setUserId(user.id);

    // return updated user with token
    return this.usersService.updateUserToken(newToken);
  }

  // signOut user
  @Post('signOut')
  @HttpCode(204)
  async signOutUser() {
    const user = await this.usersService.updateUserToken('');
    if (!user) throw new HttpException('User not found', 404);
    return;
  }

  // current user
  @Get('current')
  @HttpCode(200)
  async getCurrentUser() {
    const user = await this.usersService.getUserById();
    if (!user) throw new HttpException('User not found', 404);
    return user;
  }

  // update user
  @Put('update')
  @UseInterceptors(FileInterceptor('userAvatar'))
  @HttpCode(200)
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: '.(png|jpeg|jpg)' })
        .addMaxSizeValidator({ maxSize: 1000000 })
        .build({ fileIsRequired: false }),
    )
    userAvatar: Express.Multer.File,
  ) {
    // return 404 if not received name or userAvatar
    if (!userAvatar && !updateUserDto.name)
      throw new HttpException('One of [userAvatar, name] is required', 400);

    // create obj for update user
    const updateUser: UpdateUserInterface = {};

    if (userAvatar) {
      // if userAvatar true send item to cloud
      // get secure_url
      // add the last one to update obj
      const avatar = await this.cloudinaryService.uploadFile(userAvatar);
      const url: string = avatar.secure_url;
      updateUser.avatarURL = url;
    }
    if (updateUserDto.name) {
      // if name add it to update obj
      updateUser.name = updateUserDto.name;
    }

    const user = await this.usersService.updateUser(updateUser);

    return user;
  }
}
