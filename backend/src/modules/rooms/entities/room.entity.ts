import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { RoomType } from './room-type.enum';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unique: true })
  @IsInt({ message: 'Room number must be an integer' })
  @Min(1, { message: 'Room number must be at least 1' })
  number: number;

  @Column({ type: 'enum', enum: RoomType })
  @IsEnum(RoomType, { message: 'Room type must be either "2d" or "3d"' })
  type: RoomType;

  @Column({ type: 'int', name: 'max_seats' })
  @IsInt({ message: 'Max seats must be an integer' })
  @Min(1, { message: 'Max seats must be at least 1' })
  maxSeats: number;

  @Column({ type: 'int', name: 'rows_count' })
  @IsInt({ message: 'Rows count must be an integer' })
  @Min(1, { message: 'Rows count must be at least 1' })
  rowsCount: number;

  @Column({ type: 'simple-array' })
  @IsArray({ message: 'Seats per row must be an array' })
  @IsInt({ each: true, message: 'Each seat count must be an integer' })
  seatsPerRow: number[];

  @Column({ type: 'simple-array', nullable: true })
  @IsArray({ message: 'Premium rows must be an array' })
  @IsOptional()
  premiumRows?: string[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  constructor(partial: Partial<Room>) {
    Object.assign(this, partial);
  }
}