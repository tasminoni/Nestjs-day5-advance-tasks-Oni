import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { QueryUserDto } from '../dto/query-user.dto';
import { BulkCreateUserDto } from '../dto/bulk-create-user.dto';
import { ApiResponse, PaginationMeta, BulkCreateResult } from '../interfaces/api-response.interface';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new this.userModel(createUserDto);
    return user.save();
  }

  async findAll(queryDto: QueryUserDto): Promise<{ data: User[]; meta: PaginationMeta }> {
    const {
      search,
      minAge,
      maxAge,
      isDeleted = false,
      page = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryDto;

    // Build filter object
    const filter: any = { isDeleted };

    // Add search filter (case-insensitive)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Add age filters
    if (minAge !== undefined || maxAge !== undefined) {
      filter.age = {};
      if (minAge !== undefined) filter.age.$gte = minAge;
      if (maxAge !== undefined) filter.age.$lte = maxAge;
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * pageSize;

    // Execute queries in parallel
    const [users, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select('-__v -isDeleted -deletedAt')
        .lean()
        .sort(sort)
        .skip(skip)
        .limit(pageSize),
      this.userModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    const meta: PaginationMeta = {
      total,
      page,
      pageSize,
      totalPages,
    };

    return { data: users, meta };
  }

  async findOne(id: string): Promise<User> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid user ID');
    }

    const user = await this.userModel
      .findOne({ _id: id, isDeleted: false })
      .select('-__v -isDeleted -deletedAt')
      .lean();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid user ID');
    }

    const user = await this.userModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        updateUserDto,
        { new: true, runValidators: true }
      )
      .select('-__v -isDeleted -deletedAt')
      .lean();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid user ID');
    }

    const user = await this.userModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { 
        isDeleted: true, 
        deletedAt: new Date() 
      },
      { new: true }
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }
  }

  async restore(id: string): Promise<User> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid user ID');
    }

    const user = await this.userModel
      .findOneAndUpdate(
        { _id: id, isDeleted: true },
        { 
          $unset: { isDeleted: 1, deletedAt: 1 } 
        },
        { new: true }
      )
      .select('-__v -isDeleted -deletedAt')
      .lean();

    if (!user) {
      throw new NotFoundException('Deleted user not found');
    }

    return user;
  }

  async bulkCreate(bulkCreateDto: BulkCreateUserDto): Promise<BulkCreateResult> {
    const { users } = bulkCreateDto;
    const insertedCount = 0;
    const skipped: Array<{ email: string; reason: string }> = [];

    // Check for existing emails
    const emails = users.map(user => user.email);
    const existingUsers = await this.userModel.find({
      email: { $in: emails }
    }).select('email');

    const existingEmails = new Set(existingUsers.map(user => user.email));

    // Filter out duplicate emails
    const validUsers = users.filter(user => {
      if (existingEmails.has(user.email)) {
        skipped.push({
          email: user.email,
          reason: 'Email already exists'
        });
        return false;
      }
      return true;
    });

    // Insert valid users
    if (validUsers.length > 0) {
      await this.userModel.insertMany(validUsers);
    }

    return {
      insertedCount: validUsers.length,
      skipped,
    };
  }
}
