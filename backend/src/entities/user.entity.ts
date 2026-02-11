import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @Column({ 
    type: 'enum', 
    enum: UserRole, 
    default: UserRole.USER 
  })
  @IsEnum(UserRole, { message: 'Invalid role' })
  role: UserRole;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}