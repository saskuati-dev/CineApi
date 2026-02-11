import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSessionDto {
  @ApiProperty({
    description: 'Movie ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'Movie ID must be a valid UUID' })
  movieId?: string;

  @ApiProperty({
    description: 'Room ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Room ID must be a number' })
  roomId?: number;

  @ApiProperty({
    description: 'Session start time',
    example: '2024-12-25T19:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDate({ message: 'Start time must be a valid date' })
  @Type(() => Date)
  startTime?: Date;

  @ApiProperty({
    description: 'Price per seat for this session',
    example: 28.0,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Price must be a number' })
  @IsPositive({ message: 'Price must be positive' })
  @Min(0, { message: 'Price cannot be negative' })
  price?: number;
}