import api from "./api";

export type Stadium = {
  _id: string;
  name: string;
  location: string;
  images: string[];
  capacity?: number;
  minPrice?: number | null;
};

export type Paginated<T> = {
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

export type StadiumQuery = {
  page?: number;
  limit?: number;
  name?: string;
  location?: string;
  minCapacity?: number;
  maxCapacity?: number;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  sortBy?: 'createdAt' | 'name' | 'price' | 'capacity' | 'location';
  sortOrder?: 'asc' | 'desc';
};

export async function getStadiums(params: StadiumQuery): Promise<Paginated<Stadium>> {
  const { data } = await api.get<Paginated<Stadium>>("/stadium", { params });
  return data;
}
