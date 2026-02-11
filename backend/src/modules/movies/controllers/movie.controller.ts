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
} from '@nestjs/common';
import { MovieService } from '../services/movie.service';
import { CreateMovieDto } from '../dtos/create-movie.dto';
import { UpdateMovieDto } from '../dtos/update-movie.dto';

@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createMovieDto: CreateMovieDto) {
    const movie = await this.movieService.create(createMovieDto);
    return {
      message: 'Movie created successfully',
      movie,
    };
  }

  @Get()
  async findAll() {
    const movies = await this.movieService.findAll();
    return {
      message: 'Movies retrieved successfully',
      count: movies.length,
      movies,
    };
  }

  @Get('search')
  async searchByName(@Query('name') name: string) {
    const movies = await this.movieService.searchByName(name);
    return {
      message: 'Movies found successfully',
      count: movies.length,
      movies,
    };
  }

  @Get('genre/:genre')
  async findByGenre(@Param('genre') genre: string) {
    const movies = await this.movieService.findByGenre(genre);
    return {
      message: `Movies in genre "${genre}" retrieved successfully`,
      count: movies.length,
      movies,
    };
  }

  @Get('director')
  async findByDirector(@Query('director') director: string) {
    const movies = await this.movieService.findByDirector(director);
    return {
      message: 'Movies by director retrieved successfully',
      count: movies.length,
      movies,
    };
  }

  @Get('year-range')
  async findByYearRange(
    @Query('start') startYear: number,
    @Query('end') endYear: number,
  ) {
    const movies = await this.movieService.findByYearRange(startYear, endYear);
    return {
      message: `Movies from ${startYear} to ${endYear} retrieved successfully`,
      count: movies.length,
      movies,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const movie = await this.movieService.findOne(id);
    return {
      message: 'Movie retrieved successfully',
      movie,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMovieDto: UpdateMovieDto,
  ) {
    const movie = await this.movieService.update(id, updateMovieDto);
    return {
      message: 'Movie updated successfully',
      movie,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.movieService.remove(id);
    return {
      message: 'Movie deleted successfully',
    };
  }
}