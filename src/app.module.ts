import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';

import { UsersModule } from 'src/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryModule } from './helpers/cloudinary/cloudinary.module';
import { AuthenticationMiddleware } from './middlewares/authentication.middleware';
import { RequestModule } from './helpers/request/request.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.DB_URI),
    UsersModule,
    CloudinaryModule,
    RequestModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticationMiddleware)
      .exclude(
        { path: 'users/signUp', method: RequestMethod.POST },
        { path: 'users/signIn', method: RequestMethod.POST },
      )
      .forRoutes('*');
  }
}
