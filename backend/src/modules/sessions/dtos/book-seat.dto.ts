import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, ArrayMinSize } from 'class-validator';

export class BookSeatDto {
  @ApiProperty({
    description: 'Array of seat labels to book (e.g., ["A1", "A2", "B3"])',
    example: ['A1', 'A2', 'B3'],
    type: [String],
  })
  @IsArray({ message: 'Seats must be an array' })
  @ArrayMinSize(1, { message: 'At least one seat must be selected' })
  @IsString({ each: true, message: 'Each seat label must be a string' })
  seats: string[];
}