import { StatusCodes } from 'http-status-codes';

class NotFoundError extends Error {
    statusCode: number;
    constructor(message: string) {
        super(message);
        this.statusCode = StatusCodes.NOT_FOUND;
    }
}

export default NotFoundError;
