import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { QueryUserDto } from '../dto/query-user.dto';
import { BulkCreateUserDto } from '../dto/bulk-create-user.dto';
import { User } from '../schemas/user.schema';
import { BulkCreateResult } from '../interfaces/api-response.interface';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @SwaggerApiResponse({ status: 201, description: 'User created successfully' })
  @SwaggerApiResponse({ status: 409, description: 'Email already exists' })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users with filters, pagination and sorting' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name or email' })
  @ApiQuery({ name: 'minAge', required: false, description: 'Minimum age filter' })
  @ApiQuery({ name: 'maxAge', required: false, description: 'Maximum age filter' })
  @ApiQuery({ name: 'isDeleted', required: false, description: 'Filter by deleted status' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'pageSize', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Field to sort by' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (asc/desc)' })
  @SwaggerApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async findAll(@Query() queryDto: QueryUserDto) {
    return this.usersService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @SwaggerApiResponse({ status: 200, description: 'User found' })
  @SwaggerApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @SwaggerApiResponse({ status: 200, description: 'User updated successfully' })
  @SwaggerApiResponse({ status: 404, description: 'User not found' })
  @SwaggerApiResponse({ status: 409, description: 'Email already exists' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @SwaggerApiResponse({ status: 200, description: 'User deleted successfully' })
  @SwaggerApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore soft deleted user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @SwaggerApiResponse({ status: 200, description: 'User restored successfully' })
  @SwaggerApiResponse({ status: 404, description: 'Deleted user not found' })
  async restore(@Param('id') id: string): Promise<User> {
    return this.usersService.restore(id);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple users (bulk create)' })
  @SwaggerApiResponse({ status: 201, description: 'Bulk create completed' })
  async bulkCreate(@Body() bulkCreateDto: BulkCreateUserDto): Promise<BulkCreateResult> {
    return this.usersService.bulkCreate(bulkCreateDto);
  }
}
