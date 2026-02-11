import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from '../entities/movie.entity';
import { CreateMovieDto } from '../dtos/create-movie.dto';
import { UpdateMovieDto } from '../dtos/update-movie.dto';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
  ) {}

  async create(createMovieDto: CreateMovieDto): Promise<Movie> {
    const movie = this.movieRepository.create(createMovieDto);
    return await this.movieRepository.save(movie);
  }

  async findAll(): Promise<Movie[]> {
    return await this.movieRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Movie> {
    const movie = await this.movieRepository.findOne({ where: { id } });
    if (!movie) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }
    return movie;
  }

  async update(id: string, updateMovieDto: UpdateMovieDto): Promise<Movie> {
    const movie = await this.findOne(id);
    
    // Update movie properties
    Object.assign(movie, updateMovieDto);
    
    return await this.movieRepository.save(movie);
  }

  async remove(id: string): Promise<void> {
    const movie = await this.findOne(id);
    await this.movieRepository.remove(movie);
  }

  async searchByName(name: string): Promise<Movie[]> {
    return await this.movieRepository
      .createQueryBuilder('movie')
      .where('LOWER(movie.name) LIKE LOWER(:name)', { name: `%${name}%` })
      .orderBy('movie.name', 'ASC')
      .getMany();
  }

  async findByGenre(genre: string): Promise<Movie[]> {
    return await this.movieRepository
      .createQueryBuilder('movie')
      .where(':genre = ANY(movie.genre)', { genre })
      .orderBy('movie.year', 'DESC')
      .getMany();
  }

  async findByYearRange(startYear: number, endYear: number): Promise<Movie[]> {
    return await this.movieRepository
      .createQueryBuilder('movie')
      .where('movie.year BETWEEN :startYear AND :endYear', { startYear, endYear })
      .orderBy('movie.year', 'ASC')
      .getMany();
  }

  async findByDirector(director: string): Promise<Movie[]> {
    return await this.movieRepository
      .createQueryBuilder('movie')
      .where('LOWER(movie.director) LIKE LOWER(:director)', { director: `%${director}%` })
      .orderBy('movie.director', 'ASC')
      .getMany();
  }
}