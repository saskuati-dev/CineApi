import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { User } from '../../users/entities/user.entity';

@Entity('seats')
export class Seat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'char', length: 1 })
  @IsNotEmpty({ message: 'Row is required' })
  @IsString({ message: 'Row must be a string' })
  row: string; // A, B, C, etc.

  @Column({ type: 'int' })
  @IsInt({ message: 'Column must be an integer' })
  @Min(1, { message: 'Column must be at least 1' })
  column: number; // 1, 2, 3, etc.

  @Column({ type: 'boolean', default: false })
  @IsBoolean({ message: 'Booked must be a boolean' })
  booked: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean({ message: 'Is premium must be a boolean' })
  isPremium: boolean;

  @ManyToOne('Session', (session: any) => session.seats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: any;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  @IsOptional()
  user: User | null;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  bookedAt: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  constructor(partial: Partial<Seat>) {
    Object.assign(this, partial);
  }

  // Helper method to get seat label (e.g., "A1", "B3")
  get label(): string {
    return `${this.row}${this.column}`;
  }
}
