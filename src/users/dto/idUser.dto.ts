import { IsNotEmpty } from 'class-validator';
import { IsObjectId } from 'class-validator-mongo-object-id';

export class IdUserDto {
  @IsNotEmpty()
  @IsObjectId({ message: 'invalid id' })
  id: string;
}
