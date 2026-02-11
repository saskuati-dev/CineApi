import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsArray, ArrayMinSize, IsInt, IsNotEmpty, IsOptional, IsUrl, Max, Min, IsString } from 'class-validator';

@Entity('movies')
export class Movie {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty({ message: 'Movie name is required' })
  @IsString()
  name: string;

  @Column({ type: 'int' })
  @IsInt({ message: 'Duration must be an integer' })
  @Min(1, { message: 'Duration must be at least 1 minute' })
  duration: number; // in minutes

  @Column({ type: 'simple-array' })
  @IsArray({ message: 'Genre must be an array' })
  @ArrayMinSize(1, { message: 'At least one genre is required' })
  @IsString({ each: true, message: 'Each genre must be a string' })
  genre: string[];

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty({ message: 'Director name is required' })
  @IsString()
  director: string;

  @Column({ type: 'int' })
  @IsInt({ message: 'Year must be an integer' })
  @Min(1888, { message: 'Year must be at least 1888 (first movie)' })
  @Max(new Date().getFullYear() + 1, { message: 'Year cannot be in the far future' })
  year: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  @IsUrl({}, { message: 'Poster URL must be a valid URL' })
  @IsOptional()
  url_poster?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  constructor(partial: Partial<Movie>) {
    Object.assign(this, partial);
  }
}