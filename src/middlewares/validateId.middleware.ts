import { HttpException, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

@Injectable()
export class ValidateIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const isValid = mongoose.Types.ObjectId.isValid(req.params.id);
    if (isValid) throw new HttpException('User not found', 404);
    next();
  }
}
