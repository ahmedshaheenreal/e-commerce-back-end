export const CONSTANTS = {
  MONTH_MAPPING: {
    1: 10,
    2: 11,
    3: 12,
  } as Record<number, number>,
  DISCOUNT_ZERO: 0,
  MONTHS_IN_YEAR: 12,
  DISCOUNT_PRECISION: 2,
  MAX_DISCOUNT_PERCENTAGE: 50,
  MIN_DISCOUNT_PERCENTAGE: 5,
};

export const FIELD_NAMES = {
  TOTAL_COUNT: "totalCount",
};

export const RATING = {
  DEFAULT_RATING: null,
  PRECISION: 2,
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 9,
  RELATED_PRODUCT_PAGE_SIZE: 4,
};

export const SEPARATOR = "-%-";

export const accessCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 15 * 60 * 1000 + 60 * 1000, // 15 minutes
};
export const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 15 * 24 * 3600 * 60 * 1000, // 15 days
};
