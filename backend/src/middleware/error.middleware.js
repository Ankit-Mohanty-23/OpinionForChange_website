import AppError from "../util/AppError.js";

export default function globalErrorHandler(err, req, res, next){
    let error = err;

    if(error.code === "CastError"){
        error = new AppError("Invalid resource indentifier", 400);
    }

    if(error.code === 11000){
        const field = Object.keys(error.keyValue)[0];
        error = new AppError(`${field} already exists`, 409);
    }

    if(error.name === "DocumentNotFoundError"){
        error = new AppError("Resource not found", 404);
    }

    if(error.name === "JsonWebTokenError"){
        error = new AppError("Invalid token", 401);
    }

    if(error.name === "TokenExpiredError"){
        error = new AppError("Invalid token", 401);
    }

    if (err.code === "EAUTH" || err.code === "ECONNECTION") {
        err = new AppError("Email service unavailable", 502);
    }      

    if (err instanceof multer.MulterError) {
        err = new AppError(err.message, 400);
    }

    logger.error("API Error", {
        message: err.message,
        statusCode: err.statusCode || 500,

        //Identify API
        method: req.method,
        url: req.originalUrl,
        baseUrl: req.baseUrl,
        path: req.path,
        
        //User ID
        user: req.user?._id,

        //error details
        stack: err.stack,
        metadata: err.metadata || null,
    });

    res.status(err.statusCode || 500).json({
        success: false,
        message: 
            err.isOperational
                ? err.message 
                : "Internal Server Error",
    });
}