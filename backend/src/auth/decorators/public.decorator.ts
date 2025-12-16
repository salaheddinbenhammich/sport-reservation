import { SetMetadata } from '@nestjs/common';

// it is used by the guard to check if a route is public or not
export const IS_PUBLIC_KEY = 'isPublic';

// Marks a route as public (no JWT required)
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
