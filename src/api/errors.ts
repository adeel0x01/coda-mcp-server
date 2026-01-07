/**
 * Base error class for all Coda API errors
 */
export class CodaAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'CodaAPIError';
  }
}

/**
 * Authentication error (401)
 */
export class AuthenticationError extends CodaAPIError {
  constructor(message: string = 'Invalid or expired API token') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * Permission/Authorization error (403)
 */
export class PermissionError extends CodaAPIError {
  constructor(message: string = 'Permission denied for this operation') {
    super(message, 403);
    this.name = 'PermissionError';
  }
}

/**
 * Resource not found error (404)
 */
export class NotFoundError extends CodaAPIError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Rate limit exceeded error (429)
 */
export class RateLimitError extends CodaAPIError {
  constructor(
    message: string = 'Rate limit exceeded',
    public retryAfter?: number
  ) {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}

/**
 * Validation/Bad request error (400)
 */
export class ValidationError extends CodaAPIError {
  constructor(message: string = 'Invalid request parameters') {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

/**
 * Server error (500+)
 */
export class ServerError extends CodaAPIError {
  constructor(message: string = 'Coda server error', statusCode: number = 500) {
    super(message, statusCode);
    this.name = 'ServerError';
  }
}

/**
 * Helper function to create appropriate error based on HTTP status code
 */
export function createErrorFromResponse(
  statusCode: number,
  message: string,
  response?: any
): CodaAPIError {
  switch (statusCode) {
    case 401:
      return new AuthenticationError(message);
    case 403:
      return new PermissionError(message);
    case 404:
      return new NotFoundError(message);
    case 429:
      const retryAfter = response?.headers?.get?.('Retry-After');
      return new RateLimitError(message, retryAfter ? parseInt(retryAfter) : undefined);
    case 400:
      return new ValidationError(message);
    default:
      if (statusCode >= 500) {
        return new ServerError(message, statusCode);
      }
      return new CodaAPIError(message, statusCode, response);
  }
}
