import type { ErrorCode } from "../errors";

export type ApiResponse<T> = {
    data?: T;
    error?: {
        message: string;
        code: ErrorCode;
    };
    meta?: {
        page?: number;
        pageSize?: number;
        total?: number;
    };
};