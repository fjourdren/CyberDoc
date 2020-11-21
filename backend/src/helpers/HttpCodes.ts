enum HttpCodes {
    OK               = 200,
    CREATED          = 201,
    ACCEPTED         = 202,
    BAD_REQUEST      = 400,
    UNAUTHORIZED     = 401,
    PAYMENT_REQUIRED = 402,
    FORBIDDEN        = 403,
    NOT_FOUND        = 404,
    TOO_MANY_REQUESTS = 429,
    INTERNAL_ERROR   = 500,
    NOT_IMPLEMENTED  = 501,
    INSUFFICIENT_STORAGE = 507,
}

export default HttpCodes;