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
import { MovieService } from '../services/movie.service';
import { CreateMovieDto } from '../dtos/create-movie.dto';
import { UpdateMovieDto } from '../dtos/update-movie.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@ApiTags('movies')
@ApiBearerAuth()
@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new movie (Admin only)' })
  @ApiResponse({ status: 201, description: 'Movie created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiBody({ type: CreateMovieDto })
  async create(@Body() createMovieDto: CreateMovieDto) {
    const movie = await this.movieService.create(createMovieDto);
    return {
      message: 'Movie created successfully',
      movie,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all movies' })
  @ApiResponse({ status: 200, description: 'Movies retrieved successfully' })
  async findAll() {
    const movies = await this.movieService.findAll();
    return {
      message: 'Movies retrieved successfully',
      count: movies.length,
      movies,
    };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search movies by name' })
  @ApiResponse({ status: 200, description: 'Movies found successfully' })
  @ApiQuery({ name: 'name', required: true, description: 'Movie name to search' })
  async searchByName(@Query('name') name: string) {
    const movies = await this.movieService.searchByName(name);
    return {
      message: 'Movies found successfully',
      count: movies.length,
      movies,
    };
  }

  @Get('genre/:genre')
  @ApiOperation({ summary: 'Get movies by genre' })
  @ApiResponse({ status: 200, description: 'Movies retrieved successfully' })
  @ApiParam({ name: 'genre', description: 'Movie genre' })
  async findByGenre(@Param('genre') genre: string) {
    const movies = await this.movieService.findByGenre(genre);
    return {
      message: `Movies in genre "${genre}" retrieved successfully`,
      count: movies.length,
      movies,
    };
  }

  @Get('director')
  @ApiOperation({ summary: 'Get movies by director' })
  @ApiResponse({ status: 200, description: 'Movies retrieved successfully' })
  @ApiQuery({ name: 'director', required: true, description: 'Director name' })
  async findByDirector(@Query('director') director: string) {
    const movies = await this.movieService.findByDirector(director);
    return {
      message: 'Movies by director retrieved successfully',
      count: movies.length,
      movies,
    };
  }

  @Get('year-range')
  @ApiOperation({ summary: 'Get movies by year range' })
  @ApiResponse({ status: 200, description: 'Movies retrieved successfully' })
  @ApiQuery({ name: 'start', required: true, description: 'Start year' })
  @ApiQuery({ name: 'end', required: true, description: 'End year' })
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
  @ApiOperation({ summary: 'Get movie by ID' })
  @ApiResponse({ status: 200, description: 'Movie retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  @ApiParam({ name: 'id', description: 'Movie ID' })
  async findOne(@Param('id') id: string) {
    const movie = await this.movieService.findOne(id);
    return {
      message: 'Movie retrieved successfully',
      movie,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a movie (Admin only)' })
  @ApiResponse({ status: 200, description: 'Movie updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  @ApiParam({ name: 'id', description: 'Movie ID' })
  @ApiBody({ type: UpdateMovieDto })
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a movie (Admin only)' })
  @ApiResponse({ status: 204, description: 'Movie deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  @ApiParam({ name: 'id', description: 'Movie ID' })
  async remove(@Param('id') id: string) {
    await this.movieService.remove(id);
    return {
      message: 'Movie deleted successfully',
    };
  }
}
