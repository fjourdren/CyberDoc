import HttpCodes from "./HttpCodes";
import HTTPError from "./HTTPError";

// easy validate that a var contain a non null
export function requireNonNull<T>(val: T, code = HttpCodes.INTERNAL_ERROR, msg = "Internal Error"): NonNullable<T> {
    if (val == null)
        throw new HTTPError(code, msg);

    return val as NonNullable<T>;
}

// validate that a var is null
export function requireIsNull<T>(val: T, code = HttpCodes.INTERNAL_ERROR, msg = "Internal Error"): null {
    if (val != null)
        throw new HTTPError(code, msg);

    return null;
}