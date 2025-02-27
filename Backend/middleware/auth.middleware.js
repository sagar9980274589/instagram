import jwt from 'jsonwebtoken';
import User from '../model/user.model.js';
import cookieParser from 'cookie-parser';

cookieParser(); // ⚠️ Not needed here, remove this line

export const auth = async (req, res, next) => {
    try {
        let token = req.cookies?.token || req.headers.authorization?.split(" ")[1]; 

        // 🛑 If no token is found, return error
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token provided",
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET); // 🛠️ Decode token properly

            if (!decoded) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }

            // ✅ Fix: Use `_id` instead of `email` if you signed JWT with `_id`
            const user = await User.findById(decoded.id); 

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }

            req.id = user._id;
            req.email = user.email;
            next();
        } catch (err) {
            console.error("JWT Verification Error:", err);
            return res.status(401).json({ success: false, message: "Invalid token" });
        }
    } catch (err) {
        console.error("Auth Middleware Error:", err);
        res.status(500).json({ success: false, message: "Authentication error" });
    }
};
