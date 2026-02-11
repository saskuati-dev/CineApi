import { IsArray, ArrayMinSize, IsInt, IsNotEmpty, IsOptional, IsUrl, Max, Min, IsString } from 'class-validator';

export class CreateMovieDto {
  @IsNotEmpty({ message: 'Movie name is required' })
  @IsString()
  name: string;

  @IsInt({ message: 'Duration must be an integer' })
  @Min(1, { message: 'Duration must be at least 1 minute' })
  duration: number;

  @IsArray({ message: 'Genre must be an array' })
  @ArrayMinSize(1, { message: 'At least one genre is required' })
  @IsString({ each: true, message: 'Each genre must be a string' })
  genre: string[];

  @IsNotEmpty({ message: 'Director name is required' })
  @IsString()
  director: string;

  @IsInt({ message: 'Year must be an integer' })
  @Min(1888, { message: 'Year must be at least 1888 (first movie)' })
  @Max(new Date().getFullYear() + 1, { message: 'Year cannot be in the far future' })
  year: number;

  @IsUrl({}, { message: 'Poster URL must be a valid URL' })
  @IsOptional()
  url_poster?: string;
}