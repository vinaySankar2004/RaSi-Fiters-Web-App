const jwt = require("jsonwebtoken");

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid token." });
    }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: "Authentication required." });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Access denied. Admin privileges required." });
    }

    next();
};

// Middleware to check if user can modify a workout log
const canModifyLog = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: "Authentication required." });
    }

    // Admin can modify any log
    if (req.user.role === 'admin') {
        return next();
    }

    // For members, check if the log belongs to them
    const memberName = req.body.member_name || req.query.member_name;
    
    if (req.user.member_name !== memberName) {
        return res.status(403).json({ error: "Access denied. You can only modify your own logs." });
    }

    next();
};

module.exports = { authenticateToken, isAdmin, canModifyLog };