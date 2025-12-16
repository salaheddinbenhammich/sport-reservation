import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../entities/users.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { QueryUserDto } from '../dto/query-user.dto';
import { UserRole } from 'src/auth/enums/roles.enum';
import { Reservation } from 'src/reservations/entities/reservations.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Reservation.name)
    private readonly reservationModel: Model<Reservation>,
  ) {}

  // create a new user, admin can set role but normal users cannot
  async create(
    userData: Partial<User>,
    currentUser?: User,
  ): Promise<Partial<User>> {
    // check for duplicate email before creation
    const existingUser = await this.userModel
      .findOne({ email: userData.email })
      .exec();
    if (existingUser) {
      throw new BadRequestException('email already attached to an account');
    }

    // determine role (only admin can set role manually)
    let role: UserRole = UserRole.USER;
    if (userData.role) {
      if (!currentUser || currentUser.role !== UserRole.ADMIN) {
        throw new ForbiddenException('only admin can assign roles');
      }
      role = userData.role;
    }

    // ensure password exists and hash it
    if (!userData.password) {
      throw new BadRequestException('password is required');
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // create the user object
    const user = new this.userModel({
      ...userData,
      password: hashedPassword,
      role,
    });

    const savedUser = await user.save();

    /**
     * check for existing reservations that contain this user's email
     * if found, replace that email string with the user's real ObjectId
     * this links invited users to their reservations automatically
     */
    await this.reservationModel.updateMany(
      { players: savedUser.email },
      { $set: { 'players.$': savedUser._id } },
    );

    // remove sensitive data before returning
    const { password, ...result } = savedUser.toObject();
    return result;
  }

  // find all users with optional filters (role, active state, username, etc)
  async findAll(query?: QueryUserDto): Promise<Partial<User>[]> {
    const filter: any = {};

    if (query) {
      if (query.role) filter.role = query.role;
      if (query.isActive !== undefined)
        filter.isActive = query.isActive === 'true';
      if (query.username)
        filter.username = { $regex: query.username, $options: 'i' };
      if (query.email) filter.email = { $regex: query.email, $options: 'i' };
    }

    const users = await this.userModel.find(filter).exec();
    return users.map(({ password, ...rest }) => rest);
  }

  // find one user by id
  async findById(id: string): Promise<Partial<User>> {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('user not found');
    const { password, ...result } = user.toObject();
    return result;
  }

  // find one user by email
  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  // update user data (with protection rules for normal users)
  async update(
    id: string,
    updateUserDto: UpdateUserDto & {
      currentPassword?: string;
      newPassword?: string;
    },
    currentUser?: User,
  ): Promise<Partial<User>> {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('user not found');

    // role and isActive fields can only be changed by admin
    if (
      (updateUserDto.role || updateUserDto.isActive !== undefined) &&
      currentUser?.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('only admin can update role or isActive');
    }

    // check for duplicate email before updating
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userModel
        .findOne({ email: updateUserDto.email })
        .exec();
      if (existingUser) throw new BadRequestException('email already exists');
    }

    // handle password change (requires current password check)
    if (updateUserDto.newPassword) {
      if (!updateUserDto.currentPassword) {
        throw new BadRequestException(
          'current password is required to change password',
        );
      }

      const isMatch = await bcrypt.compare(
        updateUserDto.currentPassword,
        user.password,
      );
      if (!isMatch) {
        throw new BadRequestException('current password is incorrect');
      }

      const hashed = await bcrypt.hash(updateUserDto.newPassword, 10);
      user.password = hashed;
    }

    // assign only defined fields to avoid overwriting with undefined
    Object.entries(updateUserDto).forEach(([key, value]) => {
      if (value === undefined) return;
      if (key === 'confirmPassword') return;
      (user as any)[key] = value;
    });

    const updatedUser = await user.save({ validateBeforeSave: false });
    const { password, ...result } = updatedUser.toObject();
    return result;
  }

  // delete user (only admin can perform this)
  async remove(id: string, currentUser: User): Promise<{ message: string }> {
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('only admin can delete users');
    }

    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('user not found');

    await this.userModel.deleteOne({ _id: id }).exec();
    return { message: 'user deleted successfully' };
  }

  // search users by username or email for autocomplete or filters
  async searchByUsernameOrEmail(search: string): Promise<Partial<User>[]> {
    const users = await this.userModel
      .find({
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      })
      .exec();
    return users.map(({ password, ...rest }) => rest);
  }
}
