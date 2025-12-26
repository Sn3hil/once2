import { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { type ErrorCode, getErrorStatus, getErrorMessage } from "@once/shared";

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
    }
}

export function success<T>(c: Context, data: T, status: ContentfulStatusCode = 200) {
    return c.json({ data } as ApiResponse<T>, status);
}

export function error(c: Context, code: ErrorCode, customMessage?: string) {
    const status = getErrorStatus(code) as ContentfulStatusCode;
    const message = customMessage || getErrorMessage(code);
    return c.json({ error: { message, code } } as ApiResponse<never>, status);
}

export function paginated<T>(c: Context, data: T[], meta: { page: number; pageSize: number; total: number }) {
    return c.json({ data, meta } as ApiResponse<T[]>, 200);
}