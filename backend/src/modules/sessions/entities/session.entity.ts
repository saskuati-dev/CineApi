import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsDate, IsDecimal, IsNotEmpty, IsNumber, IsPositive, Min } from 'class-validator';
import { Movie } from '../../movies/entities/movie.entity';
import { Room } from '../../rooms/entities/room.entity';
import { Seat } from './seat.entity';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Movie, { eager: true })
  @JoinColumn({ name: 'movie_id' })
  @IsNotEmpty({ message: 'Movie is required' })
  movie: Movie;

  @ManyToOne(() => Room, { eager: true })
  @JoinColumn({ name: 'room_id' })
  @IsNotEmpty({ message: 'Room is required' })
  room: Room;

  @Column({ type: 'timestamp' })
  @IsDate({ message: 'Start time must be a valid date' })
  @IsNotEmpty({ message: 'Start time is required' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  @IsDate({ message: 'End time must be a valid date' })
  @IsNotEmpty({ message: 'End time is required' })
  endTime: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @IsNumber({}, { message: 'Price must be a number' })
  @IsPositive({ message: 'Price must be positive' })
  @Min(0, { message: 'Price cannot be negative' })
  price: number;

  @OneToMany(() => Seat, (seat) => seat.session, { cascade: true })
  seats: Seat[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  constructor(partial: Partial<Session>) {
    Object.assign(this, partial);
  }

  // Helper method to check if session is in the past
  get isPast(): boolean {
    return new Date() > this.endTime;
  }

  // Helper method to check if session is ongoing
  get isOngoing(): boolean {
    const now = new Date();
    return now >= this.startTime && now <= this.endTime;
  }

  // Helper method to check if session is upcoming
  get isUpcoming(): boolean {
    return new Date() < this.startTime;
  }

  // Helper method to get available seats count
  get availableSeatsCount(): number {
    if (!this.seats) return 0;
    return this.seats.filter((seat) => !seat.booked).length;
  }

  // Helper method to get booked seats count
  get bookedSeatsCount(): number {
    if (!this.seats) return 0;
    return this.seats.filter((seat) => seat.booked).length;
  }

  // Helper method to get total seats count
  get totalSeatsCount(): number {
    if (!this.seats) return 0;
    return this.seats.length;
  }
}