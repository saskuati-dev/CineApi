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
import { RoomService } from '../services/room.service';
import { CreateRoomDto } from '../dtos/create-room.dto';
import { UpdateRoomDto } from '../dtos/update-room.dto';
import { RoomType } from '../entities/room-type.enum';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@ApiTags('rooms')
@ApiBearerAuth()
@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new room (Admin only)' })
  @ApiResponse({ status: 201, description: 'Room created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiBody({ type: CreateRoomDto })
  async create(@Body() createRoomDto: CreateRoomDto) {
    const room = await this.roomService.create(createRoomDto);
    return {
      message: 'Room created successfully',
      room,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all rooms' })
  @ApiResponse({ status: 200, description: 'Rooms retrieved successfully' })
  async findAll() {
    const rooms = await this.roomService.findAll();
    return {
      message: 'Rooms retrieved successfully',
      count: rooms.length,
      rooms,
    };
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get rooms by type' })
  @ApiResponse({ status: 200, description: 'Rooms retrieved successfully' })
  @ApiParam({ name: 'type', description: 'Room type (2d or 3d)', enum: RoomType })
  async findByType(@Param('type') type: string) {
    // Convert string to RoomType enum
    const roomType = type as RoomType;
    const rooms = await this.roomService.findByType(roomType);
    return {
      message: `Rooms of type "${type}" retrieved successfully`,
      count: rooms.length,
      rooms,
    };
  }

  @Get('min-seats')
  @ApiOperation({ summary: 'Get rooms with minimum seats' })
  @ApiResponse({ status: 200, description: 'Rooms retrieved successfully' })
  @ApiQuery({ name: 'seats', required: true, description: 'Minimum number of seats' })
  async findByMinSeats(@Query('seats') seats: number) {
    const rooms = await this.roomService.findByMaxSeatsGreaterThan(seats);
    return {
      message: `Rooms with at least ${seats} seats retrieved successfully`,
      count: rooms.length,
      rooms,
    };
  }

  @Get('max-seats')
  @ApiOperation({ summary: 'Get rooms with maximum seats' })
  @ApiResponse({ status: 200, description: 'Rooms retrieved successfully' })
  @ApiQuery({ name: 'seats', required: true, description: 'Maximum number of seats' })
  async findByMaxSeats(@Query('seats') seats: number) {
    const rooms = await this.roomService.findByMaxSeatsLessThan(seats);
    return {
      message: `Rooms with at most ${seats} seats retrieved successfully`,
      count: rooms.length,
      rooms,
    };
  }

  @Get('number/:number')
  @ApiOperation({ summary: 'Get room by number' })
  @ApiResponse({ status: 200, description: 'Room retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @ApiParam({ name: 'number', description: 'Room number' })
  async findByNumber(@Param('number') number: number) {
    const room = await this.roomService.findByNumber(number);
    if (!room) {
      return {
        message: `Room with number ${number} not found`,
        room: null,
      };
    }
    return {
      message: 'Room retrieved successfully',
      room,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get room by ID' })
  @ApiResponse({ status: 200, description: 'Room retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  async findOne(@Param('id') id: number) {
    const room = await this.roomService.findOne(id);
    return {
      message: 'Room retrieved successfully',
      room,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a room (Admin only)' })
  @ApiResponse({ status: 200, description: 'Room updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  @ApiBody({ type: UpdateRoomDto })
  async update(
    @Param('id') id: number,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    const room = await this.roomService.update(id, updateRoomDto);
    return {
      message: 'Room updated successfully',
      room,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a room (Admin only)' })
  @ApiResponse({ status: 204, description: 'Room deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  async remove(@Param('id') id: number) {
    await this.roomService.remove(id);
    return {
      message: 'Room deleted successfully',
    };
  }
}