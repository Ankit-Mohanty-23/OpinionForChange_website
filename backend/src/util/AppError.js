export default class AppError extends Error{
    constructor(message, statusCode = 500, metadata = {}) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4")? "fail" : "error";
        this.isOperational = true;
        this.metadata = metadata

        Error.captureStackTrace(this, this.constructor);
    }
}