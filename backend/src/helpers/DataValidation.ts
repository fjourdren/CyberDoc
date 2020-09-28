// easy validate that a var contain a non null
export function requireNonNull<T>(val: T): NonNullable<T> {
    if (val == null)
        throw new TypeError();

    return val as NonNullable<T>;
}

// validate that a var is null
export function requireIsNull<T>(val: T): NonNullable<T> {
    if (val != null)
        throw new TypeError();

    return val as NonNullable<T>;
}