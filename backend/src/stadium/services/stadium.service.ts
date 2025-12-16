/* eslint-disable prettier/prettier */
import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Stadium, StadiumDocument } from '../entities/stadium.entity';
import { CreateStadiumDto } from '../dto/create-stadium.dto';
import { UpdateStadiumDto } from '../dto/update-stadium.dto';
import { QueryStadiumDto } from '../dto/query-stadium.dto';

type PaginatedResponse<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

@Injectable()
export class StadiumService {
  constructor(
    @InjectModel(Stadium.name)
    private readonly stadiumModel: Model<StadiumDocument>,
  ) {}

  // ================= Create a new stadium =================
  async create(createStadiumDto: CreateStadiumDto): Promise<Stadium> {
    const newStadium = new this.stadiumModel(createStadiumDto);
    try {
      return await newStadium.save();
    } catch (err: any) {
      // handle duplicate key (e.g., unique name)
      if (err && (err.code === 11000 || err.code === '11000')) {
        throw new ConflictException('Stadium with this name already exists');
      }
      // eslint-disable-next-line no-console
      console.error('Unexpected error saving stadium:', err);
      throw new InternalServerErrorException('Failed to save stadium');
    }
  }

  // ================= Paginated find with filters/sorting =================
  async findAllPaginated(query: QueryStadiumDto): Promise<PaginatedResponse<any>> {
    const {
      page = 1,
      limit = 12,
      name,
      location,
      minCapacity,
      maxCapacity,
      amenities,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const filter: any = {};

    // Text filters
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (location) filter.location = { $regex: location, $options: 'i' };

    // Capacity range
    if (minCapacity !== undefined || maxCapacity !== undefined) {
      filter.capacity = {};
      if (minCapacity !== undefined) filter.capacity.$gte = minCapacity;
      if (maxCapacity !== undefined) filter.capacity.$lte = maxCapacity;
    }

    // Amenities ($all means "must include all requested amenities")
    if (amenities && amenities.length > 0) {
      filter.amenities = { $all: amenities };
    }

    // Pagination math
    const safeLimit = Math.min(Math.max(1, Number(limit)), 100);
    const currentPage = Math.max(1, Number(page));
    const skip = (currentPage - 1) * safeLimit;

    // Sorting (map "price" to computed "minPrice")
    const sortField = sortBy === 'price' ? 'minPrice' : sortBy;
    const sortStage: Record<string, 1 | -1> = {
      [sortField]: sortOrder === 'asc' ? 1 : -1,
      // tie-breaker for stable sorts
      _id: 1,
    };

    // Build aggregation pipeline
    const pipeline: any[] = [
      { $match: filter },
      {
        $lookup: {
          from: 'sessions',
          localField: '_id',
          foreignField: 'stadium',
          as: 'sessions',
        },
      },
      // Compute minPrice from sessions (null if no sessions)
      {
        $addFields: {
          minPrice: {
            $cond: [
              { $gt: [{ $size: '$sessions' }, 0] },
              { $min: '$sessions.price' },
              null,
            ],
          },
        },
      },
    ];

    // Optional price filtering based on computed minPrice
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceMatch: any = {};
      if (minPrice !== undefined) priceMatch.$gte = Number(minPrice);
      if (maxPrice !== undefined) priceMatch.$lte = Number(maxPrice);

      // Only apply if we actually have a bound; also exclude nulls when filtering
      pipeline.push({
        $match: {
          minPrice: {
            ...(priceMatch.$gte !== undefined ? { $gte: priceMatch.$gte } : {}),
            ...(priceMatch.$lte !== undefined ? { $lte: priceMatch.$lte } : {}),
          },
        },
      });
    }

    // Remove heavy session array from final docs
    pipeline.push({ $project: { sessions: 0 } });

    // Sort + paginate + compute total in one go
    pipeline.push(
      { $sort: sortStage },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: safeLimit }],
          count: [{ $count: 'total' }],
        },
      },
      {
        $project: {
          data: 1,
          total: { $ifNull: [{ $arrayElemAt: ['$count.total', 0] }, 0] },
        },
      },
    );

    const agg = await this.stadiumModel.aggregate(pipeline).exec();

    const wrapped = agg[0] || { data: [], total: 0 };
    const total = wrapped.total || 0;
    const totalPages = Math.max(1, Math.ceil(total / safeLimit));

    return {
      data: wrapped.data,
      meta: {
        total,
        page: currentPage,
        limit: safeLimit,
        totalPages,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1,
      },
    };
  }

  // ================= Find one by ID =================
  async findOne(id: string): Promise<any> {
    const stadium = await this.stadiumModel.findById(id).lean().exec();
    if (!stadium) throw new NotFoundException(`Stadium with ID ${id} not found`);

    // Fetch sessions to compute min price
    const sessions = await this.stadiumModel.db
      .collection('sessions')
      .find({ stadium: stadium._id })
      .project({ price: 1 })
      .toArray();

    const minPrice = sessions.length
      ? Math.min(...sessions.map((s: any) => s.price))
      : null;

    return {
      ...stadium,
      minPrice,
    };
  }


  // ================= Update by ID =================
  async update(id: string, updateStadiumDto: UpdateStadiumDto): Promise<Stadium> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid stadium ID format');
    }

    const exists = await this.stadiumModel.findById(id).exec();
    if (!exists) {
      throw new NotFoundException(`Stadium with ID ${id} not found`);
    }

    const updated = await this.stadiumModel
      .findByIdAndUpdate(id, updateStadiumDto, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!updated) throw new NotFoundException(`Stadium with ID ${id} not found`);
    return updated;
    }

  // ================= Delete by ID =================
  async delete(id: string): Promise<{ message: string }> {
    const deleted = await this.stadiumModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Stadium not found');
    return { message: 'Stadium deleted successfully' };
  }
}
