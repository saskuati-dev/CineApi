import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SessionService } from '../services/session.service';
import { CreateSessionDto } from '../dtos/create-session.dto';
import { UpdateSessionDto } from '../dtos/update-session.dto';
import { BookSeatDto } from '../dtos/book-seat.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@ApiTags('sessions')
@ApiBearerAuth()
@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new session (Admin only)' })
  @ApiResponse({ status: 201, description: 'Session created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Movie or room not found' })
  @ApiResponse({ status: 409, description: 'Room already booked for this time' })
  @ApiBody({ type: CreateSessionDto })
  async create(@Body() createSessionDto: CreateSessionDto) {
    const session = await this.sessionService.create(createSessionDto);
    return {
      message: 'Session created successfully',
      session,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all sessions' })
  @ApiResponse({ status: 200, description: 'Sessions retrieved successfully' })
  async findAll() {
    const sessions = await this.sessionService.findAll();
    return {
      message: 'Sessions retrieved successfully',
      count: sessions.length,
      sessions,
    };
  }

  @Get('available')
  @ApiOperation({ summary: 'Get available (upcoming) sessions' })
  @ApiResponse({ status: 200, description: 'Available sessions retrieved successfully' })
  async findAvailable() {
    const sessions = await this.sessionService.findAvailableSessions();
    return {
      message: 'Available sessions retrieved successfully',
      count: sessions.length,
      sessions,
    };
  }

  @Get('movie/:movieId')
  @ApiOperation({ summary: 'Get sessions by movie' })
  @ApiResponse({ status: 200, description: 'Sessions retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  @ApiParam({ name: 'movieId', description: 'Movie ID' })
  async findByMovie(@Param('movieId') movieId: string) {
    const sessions = await this.sessionService.findSessionsByMovie(movieId);
    return {
      message: `Sessions for movie ${movieId} retrieved successfully`,
      count: sessions.length,
      sessions,
    };
  }

  @Get('room/:roomId')
  @ApiOperation({ summary: 'Get sessions by room' })
  @ApiResponse({ status: 200, description: 'Sessions retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @ApiParam({ name: 'roomId', description: 'Room ID' })
  async findByRoom(@Param('roomId') roomId: number) {
    const sessions = await this.sessionService.findSessionsByRoom(roomId);
    return {
      message: `Sessions for room ${roomId} retrieved successfully`,
      count: sessions.length,
      sessions,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get session by ID' })
  @ApiResponse({ status: 200, description: 'Session retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  async findOne(@Param('id') id: string) {
    const session = await this.sessionService.findOne(id);
    return {
      message: 'Session retrieved successfully',
      session,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a session (Admin only)' })
  @ApiResponse({ status: 200, description: 'Session updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Session, movie, or room not found' })
  @ApiResponse({ status: 409, description: 'Room already booked for this time' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiBody({ type: UpdateSessionDto })
  async update(
    @Param('id') id: string,
    @Body() updateSessionDto: UpdateSessionDto,
  ) {
    const session = await this.sessionService.update(id, updateSessionDto);
    return {
      message: 'Session updated successfully',
      session,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a session (Admin only)' })
  @ApiResponse({ status: 204, description: 'Session deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  async remove(@Param('id') id: string) {
    await this.sessionService.remove(id);
    return {
      message: 'Session deleted successfully',
    };
  }

  @Post(':id/book')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Book seats for a session' })
  @ApiResponse({ status: 200, description: 'Seats booked successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Session or seat not found' })
  @ApiResponse({ status: 409, description: 'Seat already booked' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiBody({ type: BookSeatDto })
  async bookSeats(
    @Param('id') id: string,
    @Body() bookSeatDto: BookSeatDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    const session = await this.sessionService.bookSeats(id, bookSeatDto, userId);
    return {
      message: 'Seats booked successfully',
      session,
    };
  }

  @Delete(':id/book/:seatLabel')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel seat booking' })
  @ApiResponse({ status: 204, description: 'Booking cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot cancel others bookings' })
  @ApiResponse({ status: 404, description: 'Session or seat not found' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiParam({ name: 'seatLabel', description: 'Seat label (e.g., A1)' })
  async cancelBooking(
    @Param('id') id: string,
    @Param('seatLabel') seatLabel: string,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    const seat = await this.sessionService.cancelSeatBooking(id, seatLabel, userId);
    return {
      message: `Booking for seat ${seatLabel} cancelled successfully`,
      seat,
    };
  }

  @Get('user/bookings')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user bookings' })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserBookings(@Request() req: any) {
    const userId = req.user.id;
    const bookings = await this.sessionService.getUserBookings(userId);
    return {
      message: 'Bookings retrieved successfully',
      count: bookings.length,
      bookings,
    };
  }

  @Get(':id/seats')
  @ApiOperation({ summary: 'Get seat map for a session' })
  @ApiResponse({ status: 200, description: 'Seat map retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  async getSeatMap(@Param('id') id: string) {
    const session = await this.sessionService.findOne(id);
    
    // Organize seats by row for easier frontend display
    const seatMap: Record<string, any[]> = {};
    session.seats.forEach((seat) => {
      if (!seatMap[seat.row]) {
        seatMap[seat.row] = [];
      }
      seatMap[seat.row].push({
        column: seat.column,
        label: seat.label,
        booked: seat.booked,
        isPremium: seat.isPremium,
        bookedBy: seat.user ? {
          id: seat.user.id,
          name: seat.user.name,
        } : null,
      });
    });

    return {
      message: 'Seat map retrieved successfully',
      session: {
        id: session.id,
        movie: session.movie,
        room: session.room,
        startTime: session.startTime,
        endTime: session.endTime,
        price: session.price,
        availableSeats: session.availableSeatsCount,
        bookedSeats: session.bookedSeatsCount,
        totalSeats: session.totalSeatsCount,
      },
      seatMap,
    };
  }
}