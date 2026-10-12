/**
 * Register user controller
 * @param {import('express').Request} request Incoming HTTP request.
 * @param {import('express').Response} response Outgoing HTTP response.
 * @param {import('express').NextFunction} next Passes control to the next middleware.
 */
async function registerController(request, response, next) {
    // TODO (Charles): Logic for registerController
    const validationError = validateRegistration(request.body);

    if (validationError) {
        response.status(400).json({ error: validationError });
        return;
    }

    const username = request.body.username.trim();
    const email = request.body.email.trim().toLowerCase();

    try {
        const existingUser = await getQuery('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);

        if (existingUser) {
            response.status(409).json({ error: 'Username or email is already registered' });
            return;
        }

        const passwordHash = await bcrypt.hash(request.body.password, 12);
        const result = await runQuery('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [
            username,
            email,
            passwordHash,
        ]);
        const user = await getQuery('SELECT id, username, email, created_at FROM users WHERE id = ?', [result.id]);

        response.status(201).json({ user: { ...publicUser(user), created_at: user.created_at } });
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT') {
            response.status(409).json({ error: 'Username or email is already registered' });
            return;
        }

        next(error);
    }
}

module.exports = { registerController };