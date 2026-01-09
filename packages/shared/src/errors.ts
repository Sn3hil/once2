export const ERROR_CODES = {
    // Validation errors (400)
    VALIDATION_ERROR: { status: 400, message: "Validation failed" },
    INVALID_ID: { status: 400, message: "Invalid ID format" },
    MISSING_FIELD: { status: 400, message: "Required field missing" },

    // Authentication errors (401)
    UNAUTHORIZED: { status: 401, message: "Authentication required" },
    INVALID_TOKEN: { status: 401, message: "Invalid or expired token" },

    // Authorization errors (403)
    // FORBIDDEN: { status: 403, message: "Access denied" },
    NOT_OWNER: { status: 403, message: "You do not own this resource" },
    FORBIDDEN: { status: 403, message: "You don't have permission to do this" },

    // Not found errors (404)
    NOT_FOUND: { status: 404, message: "Resource not found" },
    STORY_NOT_FOUND: { status: 404, message: "Story not found" },
    PROTAGONIST_NOT_FOUND: { status: 404, message: "Protagonist not found" },
    SCENE_NOT_FOUND: { status: 404, message: "Scene not found" },

    // Conflict errors (409)
    ALREADY_EXISTS: { status: 409, message: "Resource already exists" },
    STORY_COMPLETED: { status: 409, message: "Cannot modify completed story" },

    // Rate limiting (429)
    RATE_LIMITED: { status: 429, message: "Too many requests" },

    // Server errors (500)
    INTERNAL_ERROR: { status: 500, message: "Internal server error" },
    LLM_ERROR: { status: 500, message: "AI service error" },
    DATABASE_ERROR: { status: 500, message: "Database error" },

    // Client-side errors
    NETWORK_ERROR: { status: 0, message: "Network error" },
    UNKNOWN: { status: 500, message: "Unknown error" },
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

export function getErrorStatus(code: ErrorCode): number {
    return ERROR_CODES[code].status;
}

export function getErrorMessage(code: ErrorCode): string {
    return ERROR_CODES[code].message;
}