export interface AppError {
  type: ErrorType;
  message: string;
  details?: string;
  timestamp: Date;
  recoverable: boolean;
  retryAction?: () => void;
}

export enum ErrorType {
  NETWORK_ERROR = "NETWORK_ERROR",
  SERVER_ERROR = "SERVER_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  UNAUTHORIZED = "UNAUTHORIZED",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export class AppErrorHandler {
  static createError(
    type: ErrorType,
    message: string,
    details?: string,
    retryAction?: () => void
  ): AppError {
    return {
      type,
      message,
      details,
      timestamp: new Date(),
      recoverable: this.isRecoverable(type),
      retryAction,
    };
  }

  static isRecoverable(type: ErrorType): boolean {
    return [ErrorType.NETWORK_ERROR, ErrorType.SERVER_ERROR].includes(type);
  }

  static getDisplayMessage(error: AppError): string {
    switch (error.type) {
      case ErrorType.NETWORK_ERROR:
        return "Network connection issue. Please check your internet connection.";
      case ErrorType.SERVER_ERROR:
        return "Server is temporarily unavailable. Please try again later.";
      case ErrorType.NOT_FOUND:
        return "The requested content was not found.";
      case ErrorType.UNAUTHORIZED:
        return "You are not authorized to access this content.";
      default:
        return error.message || "An unexpected error occurred.";
    }
  }
}
