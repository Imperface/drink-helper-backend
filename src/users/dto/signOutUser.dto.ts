import { IsObjectId } from 'class-validator-mongo-object-id';

export class SignOutUserDto {
  @IsObjectId({ message: 'invalid id' })
  id: string;
}
