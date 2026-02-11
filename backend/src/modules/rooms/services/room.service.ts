import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../entities/room.entity';
import { CreateRoomDto } from '../dtos/create-room.dto';
import { UpdateRoomDto } from '../dtos/update-room.dto';
import { RoomType } from '../entities/room-type.enum';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
  ) {}

  async create(createRoomDto: CreateRoomDto): Promise<Room> {
    const room = this.roomRepository.create(createRoomDto);
    return await this.roomRepository.save(room);
  }

  async findAll(): Promise<Room[]> {
    return await this.roomRepository.find({
      order: { number: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Room> {
    const room = await this.roomRepository.findOne({ where: { id } });
    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }
    return room;
  }

  async update(id: number, updateRoomDto: UpdateRoomDto): Promise<Room> {
    const room = await this.findOne(id);
    
    // Update room properties
    Object.assign(room, updateRoomDto);
    
    return await this.roomRepository.save(room);
  }

  async remove(id: number): Promise<void> {
    const room = await this.findOne(id);
    await this.roomRepository.remove(room);
  }

  async findByType(type: RoomType): Promise<Room[]> {
    return await this.roomRepository.find({
      where: { type },
      order: { number: 'ASC' },
    });
  }

  async findByMaxSeatsGreaterThan(minSeats: number): Promise<Room[]> {
    return await this.roomRepository
      .createQueryBuilder('room')
      .where('room.maxSeats >= :minSeats', { minSeats })
      .orderBy('room.maxSeats', 'ASC')
      .getMany();
  }

  async findByMaxSeatsLessThan(maxSeats: number): Promise<Room[]> {
    return await this.roomRepository
      .createQueryBuilder('room')
      .where('room.maxSeats <= :maxSeats', { maxSeats })
      .orderBy('room.maxSeats', 'DESC')
      .getMany();
  }

  async findByNumber(number: number): Promise<Room | null> {
    return await this.roomRepository.findOne({ where: { number } });
  }
}