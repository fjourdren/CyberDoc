import HttpCodes from "./HttpCodes";
import HTTPError from "./HTTPError";

// easy validate that a var contain a non null
export function requireNonNull<T>(val: T): NonNullable<T> {
    if (val == null)
        throw new HTTPError(HttpCodes.INTERNAL_ERROR, "Internal Error: Require non null");

    return val as NonNullable<T>;
}

// validate that a var is null
export function requireIsNull<T>(val: T): NonNullable<T> {
    if (val != null)
        throw new HTTPError(HttpCodes.INTERNAL_ERROR, "Internal Error: Require null");

    return val as NonNullable<T>;
}