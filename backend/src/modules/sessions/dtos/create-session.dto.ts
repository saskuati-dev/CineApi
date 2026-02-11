import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSessionDto {
  @ApiProperty({
    description: 'Movie ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Movie ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Movie ID is required' })
  movieId: string;

  @ApiProperty({
    description: 'Room ID',
    example: 1,
  })
  @IsNumber({}, { message: 'Room ID must be a number' })
  @IsNotEmpty({ message: 'Room ID is required' })
  roomId: number;

  @ApiProperty({
    description: 'Session start time',
    example: '2024-12-25T18:00:00.000Z',
  })
  @IsDate({ message: 'Start time must be a valid date' })
  @IsNotEmpty({ message: 'Start time is required' })
  @Type(() => Date)
  startTime: Date;

  @ApiProperty({
    description: 'Price per seat for this session',
    example: 25.5,
    minimum: 0,
  })
  @IsNumber({}, { message: 'Price must be a number' })
  @IsPositive({ message: 'Price must be positive' })
  @Min(0, { message: 'Price cannot be negative' })
  price: number;
}