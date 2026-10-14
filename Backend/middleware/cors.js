const cors = require('cors');

module.exports = {
    corsMiddleware: cors({
        origin: 'http://localhost:5173', // Replace with your frontend's actual URL/port if different
        credentials: true
    })
};


