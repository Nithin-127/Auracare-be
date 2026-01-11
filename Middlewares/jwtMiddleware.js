const jwt = require("jsonwebtoken");

const jwtMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "No token found, please login" });
        }

        const token = authHeader.split(" ")[1];
        const jwtData = jwt.verify(token, process.env.JWT_SECRET);

        if (jwtData) {
            req.userId = jwtData.userId;
            req.email = jwtData.email;
            req.role = jwtData.role;
            next();
        } else {
            res.status(401).json({ message: "Invalid token, please login" });
        }
    } catch (error) {
        console.error("JWT Error:", error);
        res.status(401).json({ message: "Error validating token" });
    }
};

module.exports = jwtMiddleware;
