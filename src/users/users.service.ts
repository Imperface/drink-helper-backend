import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/User.schema';
import { SignUpUserDto } from './dto/signUpUser.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  createUser(signUpUserDto: SignUpUserDto) {
    return this.userModel.create(signUpUserDto);
  }

  updateUserToken(id: string, token: string) {
    return this.userModel.findByIdAndUpdate(id, { token }, { new: true });
  }

  getUsers() {
    return this.userModel.find();
  }

  getUserById(id: string) {
    return this.userModel.findById(id);
  }

  getUserByEmail(email: string) {
    return this.userModel.findOne({ email });
  }
}
