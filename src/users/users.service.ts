import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/User.schema';
import { SignUpUserDto } from './dto/signUpUser.dto';
import { RequestService } from 'src/helpers/request/request.service';

export interface UpdateUserInterface {
  name?: string;
  avatarURL?: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly requestService: RequestService,
  ) {}

  createUser(signUpUserDto: SignUpUserDto) {
    return this.userModel.create(signUpUserDto);
  }

  updateUserToken(token: string) {
    return this.userModel.findByIdAndUpdate(
      this.requestService.getUserId(),
      { token },
      { new: true, fields: '-password' },
    );
  }

  updateUser({ name, avatarURL }: UpdateUserInterface) {
    return this.userModel.findByIdAndUpdate(
      this.requestService.getUserId(),
      { name, avatarURL },
      {
        new: true,
        fields: '-password -token',
      },
    );
  }

  getUserById() {
    return this.userModel.findById(
      this.requestService.getUserId(),
      '-password',
    );
  }

  getUserByEmail(email: string) {
    return this.userModel.findOne({ email }, '-token');
  }
}
