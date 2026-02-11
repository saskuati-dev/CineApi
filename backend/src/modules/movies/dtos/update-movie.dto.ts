import { IsArray, ArrayMinSize, IsInt, IsOptional, IsUrl, Max, Min, IsString } from 'class-validator';

export class UpdateMovieDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt({ message: 'Duration must be an integer' })
  @Min(1, { message: 'Duration must be at least 1 minute' })
  duration?: number;

  @IsOptional()
  @IsArray({ message: 'Genre must be an array' })
  @ArrayMinSize(1, { message: 'At least one genre is required' })
  @IsString({ each: true, message: 'Each genre must be a string' })
  genre?: string[];

  @IsOptional()
  @IsString()
  director?: string;

  @IsOptional()
  @IsInt({ message: 'Year must be an integer' })
  @Min(1888, { message: 'Year must be at least 1888 (first movie)' })
  @Max(new Date().getFullYear() + 1, { message: 'Year cannot be in the far future' })
  year?: number;

  @IsOptional()
  @IsUrl({}, { message: 'Poster URL must be a valid URL' })
  url_poster?: string;
}
