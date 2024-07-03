import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/User.schema';
import { RequestModule } from 'src/helpers/request/request.module';
import { CloudinaryModule } from 'src/helpers/cloudinary/cloudinary.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    RequestModule,
    CloudinaryModule,
  ],
  exports: [UsersService],
})
export class UsersModule {}
