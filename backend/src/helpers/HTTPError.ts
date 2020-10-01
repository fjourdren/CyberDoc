export default class HTTPError extends Error {

    public statusCode: number;
    public message: string;

    constructor(statusCode: number, message: string) {
        super();
        this.statusCode = statusCode;
        this.message = message;
    }

    public toString(): string {
        return "[" + this.statusCode + "] : " + this.message;
    }
}