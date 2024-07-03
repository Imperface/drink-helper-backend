import { HttpException, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { RequestService } from 'src/helpers/request/request.service';
import { UsersService } from 'src/users/users.service';

interface JwtPayload {
  id: string;
}

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  constructor(
    private readonly usersService: UsersService,
    private readonly requestService: RequestService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // get token from request headers
    const { authorization = '' } = req.headers;

    // return 401 if token not found
    if (!authorization) throw new HttpException('not authorized', 401);

    // cut token
    const [bearer, token] = authorization.split(' ');

    // return 401 if Bearer of token not found
    if (bearer !== 'Bearer' || !token)
      throw new HttpException('not authorized', 401);

    // validate JWT token (expired also invalid token)
    try {
      // get id from token payload
      const { id } = verify(token, process.env.SECRET_KEY) as JwtPayload;

      // save userId in requestService
      this.requestService.setUserId(id);

      // looking for user in db, compare user token with received token
      const user = await this.usersService.getUserById();
      if (user === null || user.token === '' || user.token !== token) {
        throw new HttpException('not authorized', 401);
      }

      next();
    } catch (error) {
      throw new HttpException('not authorized', 401);
    }
  }
}
