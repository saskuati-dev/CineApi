
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual, Not } from 'typeorm';
import { Session } from '../entities/session.entity';
import { Seat } from '../entities/seat.entity';
import { Movie } from '../../movies/entities/movie.entity';
import { Room } from '../../rooms/entities/room.entity';
import { User } from '../../users/entities/user.entity';
import { CreateSessionDto } from '../dtos/create-session.dto';
import { UpdateSessionDto } from '../dtos/update-session.dto';
import { BookSeatDto } from '../dtos/book-seat.dto';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    @InjectRepository(Seat)
    private seatRepository: Repository<Seat>,
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createSessionDto: CreateSessionDto): Promise<Session> {
    // Find movie and room
    const movie = await this.movieRepository.findOne({
      where: { id: createSessionDto.movieId },
    });
    if (!movie) {
      throw new NotFoundException(`Movie with ID ${createSessionDto.movieId} not found`);
    }

    const room = await this.roomRepository.findOne({
      where: { id: createSessionDto.roomId },
    });
    if (!room) {
      throw new NotFoundException(`Room with ID ${createSessionDto.roomId} not found`);
    }

    // Calculate end time: startTime + movie duration + 20 minutes
    const endTime = new Date(createSessionDto.startTime);
    endTime.setMinutes(endTime.getMinutes() + movie.duration + 20);

    // Check for overlapping sessions in the same room
    const overlappingSession = await this.sessionRepository.findOne({
      where: {
        room: { id: room.id },
        startTime: LessThanOrEqual(endTime),
        endTime: MoreThanOrEqual(createSessionDto.startTime),
      },
    });

    if (overlappingSession) {
      throw new ConflictException(
        `Room ${room.number} is already booked for another session during this time`,
      );
    }

    // Create session
    const session = this.sessionRepository.create({
      movie,
      room,
      startTime: createSessionDto.startTime,
      endTime,
      price: createSessionDto.price,
    });

    const savedSession = await this.sessionRepository.save(session);

    // Generate seats based on room layout
    await this.generateSeatsForSession(savedSession, room);

    // Reload session with seats
    const reloadedSession = await this.sessionRepository.findOne({
      where: { id: savedSession.id },
      relations: ['seats'],
    });
    
    if (!reloadedSession) {
      throw new NotFoundException('Failed to create session');
    }
    
    return reloadedSession;
  }

  private async generateSeatsForSession(session: Session, room: Room): Promise<void> {
    const seats: Seat[] = [];
    const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    // Generate seats based on room layout
    for (let i = 0; i < room.rowsCount; i++) {
      const rowLetter = rowLetters[i];
      const seatsInRow = room.seatsPerRow[i];
      const isPremiumRow = room.premiumRows?.includes(rowLetter) || false;

      for (let j = 1; j <= seatsInRow; j++) {
        const seat = this.seatRepository.create({
          row: rowLetter,
          column: j,
          isPremium: isPremiumRow,
          session,
        });
        seats.push(seat);
      }
    }

    await this.seatRepository.save(seats);
  }

  async findAll(): Promise<Session[]> {
    return await this.sessionRepository.find({
      relations: ['movie', 'room', 'seats'],
      order: { startTime: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Session> {
    const session = await this.sessionRepository.findOne({
      where: { id },
      relations: ['movie', 'room', 'seats', 'seats.user'],
    });

    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    return session;
  }

  async update(id: string, updateSessionDto: UpdateSessionDto): Promise<Session> {
    const session = await this.findOne(id);

    // If updating movie, find new movie
    if (updateSessionDto.movieId) {
      const movie = await this.movieRepository.findOne({
        where: { id: updateSessionDto.movieId },
      });
      if (!movie) {
        throw new NotFoundException(`Movie with ID ${updateSessionDto.movieId} not found`);
      }
      session.movie = movie;
    }

    // If updating room, find new room and check for overlaps
    if (updateSessionDto.roomId) {
      const room = await this.roomRepository.findOne({
        where: { id: updateSessionDto.roomId },
      });
      if (!room) {
        throw new NotFoundException(`Room with ID ${updateSessionDto.roomId} not found`);
      }

      // Recalculate end time if movie or start time changed
      const movie = session.movie;
      const startTime = updateSessionDto.startTime || session.startTime;
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + movie.duration + 20);

      // Check for overlapping sessions in the new room (excluding current session)
      const overlappingSession = await this.sessionRepository.findOne({
        where: {
          id: Not(session.id),
          room: { id: room.id },
          startTime: LessThanOrEqual(endTime),
          endTime: MoreThanOrEqual(startTime),
        },
      });

      if (overlappingSession) {
        throw new ConflictException(
          `Room ${room.number} is already booked for another session during this time`,
        );
      }

      session.room = room;
      session.endTime = endTime;
    }

    // Update other fields
    if (updateSessionDto.startTime) {
      session.startTime = updateSessionDto.startTime;
      // Recalculate end time
      const endTime = new Date(updateSessionDto.startTime);
      endTime.setMinutes(endTime.getMinutes() + session.movie.duration + 20);
      session.endTime = endTime;
    }

    if (updateSessionDto.price !== undefined) {
      session.price = updateSessionDto.price;
    }

    return await this.sessionRepository.save(session);
  }

  async remove(id: string): Promise<void> {
    const session = await this.findOne(id);
    await this.sessionRepository.remove(session);
  }

  async bookSeats(sessionId: string, bookSeatDto: BookSeatDto, userId: string): Promise<Session> {
    const session = await this.findOne(sessionId);
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if session is in the past
    if (session.isPast) {
      throw new BadRequestException('Cannot book seats for a past session');
    }

    const seatsToBook: Seat[] = [];
    const unavailableSeats: string[] = [];

    // Find and validate each seat
    for (const seatLabel of bookSeatDto.seats) {
      const [row, columnStr] = [seatLabel[0], seatLabel.slice(1)];
      const column = parseInt(columnStr, 10);

      const seat = session.seats.find(
        (s) => s.row === row && s.column === column,
      );

      if (!seat) {
        throw new NotFoundException(`Seat ${seatLabel} not found in this session`);
      }

      if (seat.booked) {
        unavailableSeats.push(seatLabel);
      } else {
        seat.booked = true;
        seat.user = user;
        seat.bookedAt = new Date();
        seatsToBook.push(seat);
      }
    }

    if (unavailableSeats.length > 0) {
      throw new ConflictException(
        `The following seats are already booked: ${unavailableSeats.join(', ')}`,
      );
    }

    // Save all booked seats
    await this.seatRepository.save(seatsToBook);

    // Reload session with updated seats
    return await this.findOne(sessionId);
  }

  async cancelSeatBooking(sessionId: string, seatLabel: string, userId: string): Promise<Seat> {
    const session = await this.findOne(sessionId);
    const [row, columnStr] = [seatLabel[0], seatLabel.slice(1)];
    const column = parseInt(columnStr, 10);

    const seat = session.seats.find(
      (s) => s.row === row && s.column === column,
    );

    if (!seat) {
      throw new NotFoundException(`Seat ${seatLabel} not found in this session`);
    }

    if (!seat.booked) {
      throw new BadRequestException(`Seat ${seatLabel} is not booked`);
    }

    // Check if user owns the seat or is admin
    if (seat.user?.id !== userId) {
      // In a real system, we'd check user role here
      throw new ForbiddenException('You can only cancel your own bookings');
    }

    // Check if session has already started
    if (session.isOngoing || session.isPast) {
      throw new BadRequestException('Cannot cancel booking for an ongoing or past session');
    }

    seat.booked = false;
    seat.user = null;
    seat.bookedAt = null;

    return await this.seatRepository.save(seat);
  }

  async findAvailableSessions(): Promise<Session[]> {
    const now = new Date();
    return await this.sessionRepository.find({
      where: {
        endTime: MoreThanOrEqual(now),
      },
      relations: ['movie', 'room', 'seats'],
      order: { startTime: 'ASC' },
    });
  }

  async findSessionsByMovie(movieId: string): Promise<Session[]> {
    const movie = await this.movieRepository.findOne({ where: { id: movieId } });
    if (!movie) {
      throw new NotFoundException(`Movie with ID ${movieId} not found`);
    }

    return await this.sessionRepository.find({
      where: {
        movie: { id: movieId },
        endTime: MoreThanOrEqual(new Date()),
      },
      relations: ['movie', 'room', 'seats'],
      order: { startTime: 'ASC' },
    });
  }

  async findSessionsByRoom(roomId: number): Promise<Session[]> {
    const room = await this.roomRepository.findOne({ where: { id: roomId } });
    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }

    return await this.sessionRepository.find({
      where: {
        room: { id: roomId },
      },
      relations: ['movie', 'room', 'seats'],
      order: { startTime: 'ASC' },
    });
  }

  async getUserBookings(userId: string): Promise<Seat[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return await this.seatRepository.find({
      where: {
        user: { id: userId },
        booked: true,
      },
      relations: ['session', 'session.movie', 'session.room'],
      order: { bookedAt: 'DESC' },
    });
  }
}