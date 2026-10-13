
/**
 * Login user controller
 * @param {import('express').Request} request Incoming HTTP request.
 * @param {import('express').Response} response Outgoing HTTP response.
 * @param {import('express').NextFunction} next Passes control to the next middleware.
 */
async function loginController(request, response, next) {
    // TODO (Charles): Logic for loginController
    const identifier =
        typeof request.body?.usernameOrEmail === 'string'
            ? request.body.usernameOrEmail.trim()
            : typeof request.body?.username === 'string'
                ? request.body.username.trim()
                : typeof request.body?.email === 'string'
                    ? request.body.email.trim()
                    : '';
    const password = request.body?.password;

    if (!identifier || typeof password !== 'string' || !password) {
        response.status(400).json({ error: 'Username and password are required' });
        return;
    }
    next(); //pass to checkUserCredentials
    /*
    try {
        const user = await getQuery(
            'SELECT id, username, email, password, created_at FROM users WHERE username = ? OR email = ?',
            [identifier, identifier.toLowerCase()],
        );
        
        const passwordMatches = user ? await bcrypt.compare(password, user.password) : false;

        if (!user || !passwordMatches) {
            response.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        response.json({ token: generateToken(user), user: publicUser(user) });
    } catch (error) {
        next(error);
    }
    */
}

module.exports = { loginController };