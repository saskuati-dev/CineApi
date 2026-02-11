import { IsArray, ArrayMinSize, IsInt, IsOptional, IsUrl, Max, Min, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMovieDto {
  @ApiProperty({
    description: 'Movie name',
    example: 'Inception',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Movie duration in minutes',
    example: 148,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Duration must be an integer' })
  @Min(1, { message: 'Duration must be at least 1 minute' })
  duration?: number;

  @ApiProperty({
    description: 'Movie genres',
    example: ['Action', 'Sci-Fi', 'Thriller'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'Genre must be an array' })
  @ArrayMinSize(1, { message: 'At least one genre is required' })
  @IsString({ each: true, message: 'Each genre must be a string' })
  genre?: string[];

  @ApiProperty({
    description: 'Movie director',
    example: 'Christopher Nolan',
    required: false,
  })
  @IsOptional()
  @IsString()
  director?: string;

  @ApiProperty({
    description: 'Release year',
    example: 2010,
    minimum: 1888,
    maximum: new Date().getFullYear() + 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Year must be an integer' })
  @Min(1888, { message: 'Year must be at least 1888 (first movie)' })
  @Max(new Date().getFullYear() + 1, { message: 'Year cannot be in the far future' })
  year?: number;

  @ApiProperty({
    description: 'Movie poster URL',
    example: 'https://example.com/poster.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: 'Poster URL must be a valid URL' })
  url_poster?: string;
}
