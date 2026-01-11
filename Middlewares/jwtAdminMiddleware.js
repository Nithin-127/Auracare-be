const jwt = require("jsonwebtoken");

const jwtAdminMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "No token found, please login" });
        }

        const token = authHeader.split(" ")[1];
        const jwtData = jwt.verify(token, process.env.JWT_SECRET);

        if (jwtData && jwtData.role === 'admin') {
            req.userId = jwtData.userId;
            req.email = jwtData.email;
            req.role = jwtData.role;
            next();
        } else {
            res.status(403).json({ message: "Unauthorized: Admins only" });
        }
    } catch (error) {
        console.error("JWT Admin Error:", error);
        res.status(401).json({ message: "Error validating token" });
    }
};

module.exports = jwtAdminMiddleware;
