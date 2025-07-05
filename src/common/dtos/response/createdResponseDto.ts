import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CreatedResponseDto {
  @Expose()
  id!: string;
}
