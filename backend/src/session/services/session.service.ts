import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Session,
  SessionDocument,
  SessionStatus,
} from '../entities/session.entity';
import { CreateSessionDto } from '../dto/create-session.dto';
import { UpdateSessionDto } from '../dto/update-session.dto';
import { QuerySessionDto } from '../dto/query-session.dto';

@Injectable()
export class SessionService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
  ) {}

  // Create a new session (Admin only)
  async create(createSessionDto: CreateSessionDto): Promise<Session> {
    const { stadium, date, startTime, endTime, price } = createSessionDto;

    // Validate times
    if (startTime >= endTime) {
      throw new BadRequestException('startTime must be earlier than endTime');
    }

    // Validate price
    if (price < 0) {
      throw new BadRequestException('Price cannot be negative');
    }

    // Check overlapping sessions for same stadium and date
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const overlap = await this.sessionModel.findOne({
      stadium,
      date,
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
      ],
    });

    if (overlap) {
      throw new ConflictException('Session overlaps with an existing one');
    }

    // create and save session
    const newSession = new this.sessionModel({
      ...createSessionDto,
      stadium: new Types.ObjectId(createSessionDto.stadium),
      status: createSessionDto.status || SessionStatus.AVAILABLE,
    });

    return newSession.save();
  }

  // Get all sessions (public, with filters)
  async findAll(query: QuerySessionDto): Promise<Session[]> {
    const filter: any = {};

    // ✅ Filter by stadium
    if (query.stadiumId) {
      filter.stadium = new Types.ObjectId(query.stadiumId);
    }

    // ✅ Filter by date (the full day)
    if (query.date) {
      const start = new Date(query.date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(query.date);
      end.setHours(23, 59, 59, 999);

      filter.date = { $gte: start, $lt: end };
    }

    // ✅ Filter by status optionally
    if (query.status) {
      filter.status = query.status;
    }

    return this.sessionModel
      .find(filter)
      .populate('stadium')
      .sort({ startTime: 1 }) // newer time first
      .exec();
  }


  // Get one session by ID
  async findOne(id: string): Promise<Session> {
    const session = await this.sessionModel.findById(id).populate('stadium').exec();
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  // Update session (Admin only)
  async update(id: string, updateSessionDto: UpdateSessionDto): Promise<Session> {
    const session = await this.sessionModel.findById(id);
    if (!session) throw new NotFoundException('Session not found');

    // Validate times if both are provided
    if (updateSessionDto.startTime && updateSessionDto.endTime) {
      if (updateSessionDto.startTime >= updateSessionDto.endTime) {
        throw new BadRequestException('startTime must be earlier than endTime');
      }
    }

    // Validate price if provided
    if (updateSessionDto.price !== undefined && updateSessionDto.price < 0) {
      throw new BadRequestException('Price cannot be negative');
    }

    Object.assign(session, updateSessionDto);
    return session.save();
  }

  // delete session (Admin only)
  async remove(id: string): Promise<void> {
    const result = await this.sessionModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Session not found');
  }
}
