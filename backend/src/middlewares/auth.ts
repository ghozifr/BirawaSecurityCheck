import 'dotenv/config'
import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { pool } from '../database'
import { RowDataPacket } from 'mysql2'
import bcrypt from 'bcrypt'

// Defining custom request
declare global {
    namespace Express {
        interface Request {
            accessToken?: string,
            refreshToken?: string,
            newAccessToken?: string
        }
    }
}

export function generateAccessToken (data: any) {
    return jwt.sign(data, process.env.ACCESS_TOKEN_SECRET_KEY as string, {expiresIn: '15m'})
}

export function generateRefreshToken (data: any) {
    return jwt.sign(data, process.env.REFRESH_TOKEN_SECRET_KEY as string, {expiresIn: '7d'})
}

export async function clientType(req: Request, res:Response, next: NextFunction) {
    
    console.log("\nChecking the client type...") // Debug.
    
    try {
        const clientType = req.headers['x-client-type']
        let accessToken: string | undefined
        let refreshToken: string | undefined
        
        
        if (clientType === 'web') {
            accessToken = req.cookies.accessToken
            refreshToken = req.cookies.refreshToken
        } else if (clientType === 'mobile') {
            // Fetch refresh token from header and checking the request input
            const refreshTokenHeader = req.headers['x-refresh-token'];
            if (Array.isArray(refreshTokenHeader)) {
                refreshToken = refreshTokenHeader[0]; // Use the first value if it's an array
            } else {
                refreshToken = refreshTokenHeader; // It's either a string or undefined
            }
            const authHeader = req.headers.authorization
            if (authHeader && authHeader.startsWith('Bearer ')) {
                accessToken = authHeader.split(' ')[1]
            }
        }

        // Check if there's refresh token
        if (!refreshToken) {
            // console.log("There's no refresh token.") // Debug.
            res.status(401).json({message: "Invalid refresh token."})
            return
        }

        // Set the access and refresh token
        req.accessToken = accessToken
        req.refreshToken = refreshToken
        
        console.log("Client type:", clientType) //Debug.
        console.log("Proceeding to check jwt...\n") //Debug.
        next()
    } catch (error) {
        console.error("Error fetching client type:", error)
        res.status(401).json({message: "Error fetching client type"})
    }
}

export async function jwtCheck(req: Request, res: Response, next: NextFunction) {
    console.log("JWT checking..."); // Debug.
    try {
        const accessToken = req.accessToken;
        const refreshToken = req.refreshToken;

        // If there's an access token, validate it normally
        if (accessToken && jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET_KEY as string)) {
            console.log('Successfully authenticating with access token. Proceeding to the controller...'); // Debug.
            next();
            
        } else if (refreshToken) {
            // If no access token but there is a refresh token, we try to renew the access token
            console.log("Access token is missing, but refresh token is present. Renewing access token...");

            // Decode the refresh token
            try {
                const decodedRefreshToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY as string) as jwt.JwtPayload;

                // Check if the user has the refresh token in the database
                const [user_hashed_refresh_token] = await pool.execute<RowDataPacket[]>('SELECT hashed_refresh_token FROM users_hashed_refresh_token WHERE user_id = ?', [decodedRefreshToken.user_id]);
                if (user_hashed_refresh_token.length === 0) {
                    res.status(401).json({ message: "Unauthorized." });
                    return
                }

                // Compare the refresh token to the one stored in the database
                const isValidRefreshToken = await bcrypt.compare(refreshToken, user_hashed_refresh_token[0].hashed_refresh_token);
                if (!isValidRefreshToken) {
                    res.status(401).json({ message: "Invalid refresh token." });
                    return
                }

                // If valid, generate a new access token
                const user_id = decodedRefreshToken.user_id;
                const permissions = decodedRefreshToken.permissions;
                const nama_mitra = decodedRefreshToken.nama_mitra || undefined;

                // Create a new access token
                const newAccessToken = generateAccessToken({ user_id, permissions, nama_mitra });

                // Set the new access token in the cookie for web clients
                const clientType = req.headers['x-client-type'];
                if (clientType === 'web') {
                    res.cookie('accessToken', newAccessToken, {
                        secure: true,
                        sameSite: 'none',  // Required for cross-site cookies (e.g., with CORS)
                        maxAge: 15 * 60 * 1000,  // 15 minutes
                        path: '/'
                    });
                } else {
                    // If mobile, send the new access token in the response body
                    req.newAccessToken = newAccessToken;
                }

                console.log("Successfully renewed access token:", newAccessToken); // Debug.
                next(); // Proceed to the next middleware or controller
            } catch (error) {
                console.log("Error while renewing access token:", error); // Debug.
                res.status(401).json({ message: "Unauthorized." });
                return
            }
        } else {
            // If no access token and no refresh token, deny the request
            console.log("No access token or refresh token found."); // Debug.
            res.status(401).json({ message: "Unauthorized." });
            return
        }
    } catch (error) {
        console.log("JWT verification failed:", error); // Debug.
        res.status(401).json({ message: "Unauthorized." });
        return
    }
}
