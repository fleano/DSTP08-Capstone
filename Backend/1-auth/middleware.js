import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET || 'development-secret-change-me';

/**
 *  Auth Middleware to authenticate jwt token
 * @param {import('express').Request} request Incoming HTTP request.
 * @param {import('express').Response} response Outgoing HTTP response.
 * @param {import('express').NextFunction} next Passes control to the next middleware.
 */
export function authenticateToken(request, response, next) {
    const authorization = request.get('authorization');
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7).trim() : null;

    if (!token) {
        response.status(401).json({ error: 'Bearer token is required' });
        return;
    }

    try {
        request.user = jwt.verify(token, jwtSecret);
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            response.status(401).json({ error: 'Token has expired' });
            return;
        }

        response.status(401).json({ error: 'Invalid token' });
    }
}

export default authenticateToken;
