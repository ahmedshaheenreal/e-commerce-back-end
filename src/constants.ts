import { CookieOptions } from "express";

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

export const accessCookieOptions: CookieOptions =
  process.env.NODE_ENV === "production"
    ? {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 65 * 60 * 1000,
      }
    : {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 65 * 60 * 1000,
      };

export const refreshCookieOptions: CookieOptions =
  process.env.NODE_ENV === "production"
    ? {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 30 * 24 * 3600 * 60 * 1000,
      }
    : {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 30 * 24 * 3600 * 60 * 1000,
      };
