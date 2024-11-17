export enum HttpCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,

  /**
   * In reality this means unauthenticated
   */
  UNAUTHORIZED = 401,

  /**
   * In reality this means unauthorized
   */
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
}

interface AppErrorArgs {
  name?: string;
  httpCode: HttpCode;
  description: string;
  isOperational?: boolean;
}

export class AppError extends Error {
  public readonly name: string;
  public readonly httpCode: HttpCode;
  public readonly isOperational: boolean = true;

  /**
   * Constructor for AppError.
   *
   * @param {AppErrorArgs} params - Parameters used to construct an AppError.
   */
  constructor({
    name = "Error",
    httpCode,
    description,
    isOperational = true,
  }: AppErrorArgs) {
    super(description);

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = name;
    this.httpCode = httpCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this);
  }
}
