import { IsArray, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RoomType } from '../entities/room-type.enum';

export class UpdateRoomDto {
  @ApiProperty({
    description: 'Room number',
    example: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Room number must be an integer' })
  @Min(1, { message: 'Room number must be at least 1' })
  number?: number;

  @ApiProperty({
    description: 'Room type',
    example: RoomType.THREE_D,
    enum: RoomType,
    required: false,
  })
  @IsOptional()
  @IsEnum(RoomType, { message: 'Room type must be either "2d" or "3d"' })
  type?: RoomType;

  @ApiProperty({
    description: 'Maximum number of seats in the room',
    example: 120,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Max seats must be an integer' })
  @Min(1, { message: 'Max seats must be at least 1' })
  maxSeats?: number;

  @ApiProperty({
    description: 'Number of rows in the room',
    example: 8,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Rows count must be an integer' })
  @Min(1, { message: 'Rows count must be at least 1' })
  rowsCount?: number;

  @ApiProperty({
    description: 'Array of seat counts per row',
    example: [10, 12, 14, 16, 16, 14, 12, 10],
    type: [Number],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'Seats per row must be an array' })
  @IsInt({ each: true, message: 'Each seat count must be an integer' })
  seatsPerRow?: number[];

  @ApiProperty({
    description: 'Array of premium row letters',
    example: ['A', 'B'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'Premium rows must be an array' })
  premiumRows?: string[];
}
