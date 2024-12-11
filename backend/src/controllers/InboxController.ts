import { Request, Response } from "express";
import jwt from 'jsonwebtoken'
import { pool } from "../database";
import { RowDataPacket } from "mysql2";
import {v4 as uuidv4} from 'uuid'


async function createInbox(req: Request, res: Response) {
    try {
        const accessToken = req.accessToken
        // console.log("Access token received:", accessToken) // Debug.
        const newAccessToken = req.newAccessToken
        // console.log("New access token received:", newAccessToken) // Debug.
        const metaData = jwt.decode(accessToken!) as jwt.JwtPayload
        // console.log(metaData) // Debug.
        const permissions = metaData.permissions
        const sender_id = metaData.user_id

        // Check the user permission
        if (permissions.includes('create_inbox')) {
            const isAdmin = !metaData.nama_mitra
            
            // Get request parameter.
            const {nama_mitra, email_receiver, subject, content} = req.body
            
            const inboxId = uuidv4()
            
            // Checking chatters rules
            if (!isAdmin) {
                
                if (!email_receiver || nama_mitra) {
                    res.status(400).json({message: "Bad request!"})
                    return
                }
                
                const [existingMitra] = await pool.execute<RowDataPacket[]>('SELECT mitra.nama FROM mitra_users INNER JOIN mitra ON mitra_users.mitra_id = mitra.id INNER JOIN users ON mitra_users.user_id = users.id WHERE mitra.nama = ?', [email_receiver!])
                if (existingMitra.length > 0) {
                    res.status(401).json({message: "Mitra is not allowed to send message to another mitra."})
                    return
                }
                
                const [admin_receiver] = await pool.execute<RowDataPacket[]>('SELECT id FROM users WHERE email = ?', [email_receiver!])
                if (admin_receiver.length === 0) {
                    res.status(409).json({message: "Failed to find user admin!"})
                    return
                }
                const receiver_id = admin_receiver[0].id
                await pool.execute('INSERT INTO inbox (id, sender_id, receiver_id, receiver_type, judul, isi, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)', [inboxId, sender_id, receiver_id, 'admin', subject.toLowerCase(), content, sender_id])
                
            } else {
                
                if (!nama_mitra || email_receiver) {
                    res.status(400).json({message: "Bad request (admin)!"})
                    return
                }
                
                const [existingMitra] = await pool.execute<RowDataPacket[]>('SELECT id FROM mitra WHERE nama = ?', [nama_mitra!])
                if (existingMitra.length === 0) {
                    res.status(409).json({message: "Failed to find mitra."})
                    return
                }
                
                const receiver_id = existingMitra[0].id
                await pool.execute('INSERT INTO inbox (id, sender_id, receiver_id, receiver_type, judul, isi, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)', [inboxId, sender_id, receiver_id, 'mitra', subject.toLowerCase(), content, sender_id])
                
            }
                        
            // Debug.
            res.status(201).json({
                message: "Inbox created successfully.",
                created_inbox: {
                    sender_id,
                    email_receiver,
                    nama_mitra,
                    subject,
                    content
                },
                newAccessToken
            })
            return
        } else {
            // User doesn't have the permission.
            res.status(401).json({message: "Unauthorized."})
            return
        }
        
    } catch (error) {
        console.error(error) //Debug.
        res.status(500).json({message: "Error creating inbox."})
        return
    }
}

async function getInboxes(req: Request, res: Response) {
    try {
        const accessToken = req.accessToken
        // console.log("Access token received:", accessToken) // Debug.
        const newAccessToken = req.newAccessToken
        // console.log("New access token received:", newAccessToken) // Debug.
        const metaData = jwt.decode(accessToken!) as jwt.JwtPayload
        // console.log(metaData) // Debug.
        const permissions = metaData.permissions

        // Check the user permission
        if (permissions.includes('create_inbox')) { // don't forget to change the permission (get_inboxes)
            // Get nama_mitra
            const nama_mitra = metaData.nama_mitra || req.body.nama_mitra
            if (!nama_mitra) {
                res.status(400).json({message: "Nama mitra is required."})
                return
            } else if (metaData.nama_mitra && req.body.nama_mitra && metaData.nama_mitra != req.body.nama_mitra) {
                res.status(401).json({message: "Unauthorized."})
                return
            }
            
            let inboxes
            
            const [existingMitraUsers] = await pool.execute<RowDataPacket[]>('SELECT user_id FROM mitra_users INNER JOIN mitra ON mitra_users.mitra_id = mitra.id WHERE mitra.nama = ?', [nama_mitra])
            const [existingMitra] = await pool.execute<RowDataPacket[]>('SELECT id FROM mitra WHERE nama = ?', [nama_mitra])
            
            if (existingMitra.length === 0) {
                res.status(409).json({message: "Failed to find mitra!"})
                return
            }
            
            if (existingMitraUsers.length > 0) {
                // Get inboxes
                const existingMitraUsersId = existingMitraUsers.map(user => user.user_id)
                existingMitraUsersId.push(existingMitra[0].id)
                const placeholders = existingMitraUsersId.map(() => '?').join(', ')
                const dynamicQuery = `
                    WITH latest_message AS (
                        SELECT judul, MAX(created_at) AS latest_created_at
                        FROM inbox
                        WHERE sender_id IN (${placeholders}) OR receiver_id IN (${placeholders})
                        GROUP BY judul
                    )
                    SELECT i.judul AS subject, i.isi AS last_message, i.created_at
                    FROM inbox i
                    INNER JOIN latest_message lm
                    ON i.judul = lm.judul AND i.created_at = lm.latest_created_at
                    ORDER BY lm.latest_created_at DESC
                `;
                const [rows] = await pool.execute<RowDataPacket[]>(dynamicQuery, [...existingMitraUsersId, ...existingMitraUsersId]);
                inboxes = rows
                console.log("Inboxes:", inboxes) //Debug.
                console.log('Existing mitra users:', existingMitraUsersId) //Debug.
            } else {
                console.log(existingMitraUsers) //Debug.
                res.status(409).json({message: "Failed to find any of mitra's user."})
                return
            }
            
            // Debug.
            res.status(201).json({
                message: "Inboxes retrieved successfully.",
                inboxes,
                newAccessToken
            })
            return
        } else {
            // User doesn't have the permission.
            res.status(401).json({message: "Unauthorized."})
            return
        }
    } catch (error) {
        console.error(error) //Debug.
        res.status(500).json({message: "Error getting inboxes."})
        return
    }
}

async function getInbox(req: Request, res: Response) {
    try {
        const accessToken = req.accessToken
        // console.log("Access token received:", accessToken) // Debug.
        const newAccessToken = req.newAccessToken
        // console.log("New access token received:", newAccessToken) // Debug.
        const metaData = jwt.decode(accessToken!) as jwt.JwtPayload
        // console.log(metaData) // Debug.
        const permissions = metaData.permissions

        // Check the user permission
        if (permissions.includes('create_inbox')) { // don't forget to change the permission (get_inboxes)
            // Get nama_mitra
            const nama_mitra = metaData.nama_mitra || req.body.nama_mitra
            const {subject} = req.body
            
            if (!nama_mitra) {
                res.status(400).json({message: "Nama mitra is required."})
                return
            } else if (metaData.nama_mitra && req.body.nama_mitra && metaData.nama_mitra != req.body.nama_mitra) {
                res.status(401).json({message: "Unauthorized."})
                return
            }
            
            if (!subject) {
                res.status(400).json({ message: "Subject is required." });
                return;
            }
            
            
            let inboxMessages
            
            const [existingMitraUsers] = await pool.execute<RowDataPacket[]>('SELECT user_id FROM mitra_users INNER JOIN mitra ON mitra_users.mitra_id = mitra.id WHERE mitra.nama = ?', [nama_mitra])
            const [existingMitra] = await pool.execute<RowDataPacket[]>('SELECT id FROM mitra WHERE nama = ?', [nama_mitra])
            
            if (existingMitra.length === 0) {
                res.status(409).json({message: "Failed to find mitra!"})
                return
            }
            
            if (existingMitraUsers.length > 0) {
                // Get inboxes
                const existingMitraUsersId = existingMitraUsers.map(user => user.user_id);
                existingMitraUsersId.push(existingMitra[0].id);
                const placeholders = existingMitraUsersId.map(() => '?').join(', ');
                const dynamicQuery = `
                    SELECT 
                        i.judul AS subject, 
                        i.isi AS content, 
                        i.sender_id, 
                        mitra.nama AS sender_nama_mitra,
                        sender.email AS sender_email,  
                        sender.nama_lengkap AS sender_nama_lengkap, 
                        i.receiver_id, 
                        -- Check if receiver_id is a mitra (match against mitra table)
                        CASE 
                            WHEN mitra.id IS NOT NULL THEN mitra.nama  -- If receiver is a mitra, fetch mitra's name
                            ELSE NULL  -- If receiver is a user, return NULL for mitra-specific fields
                        END AS receiver_nama_mitra,  
                        -- Check if receiver_id is a user (match against users table)
                        CASE 
                            WHEN receiver.id IS NOT NULL THEN receiver.email  -- If receiver is a user, fetch their email
                            ELSE NULL  -- If receiver is a mitra, return NULL for user-specific fields
                        END AS receiver_email,  
                        CASE 
                            WHEN receiver.id IS NOT NULL THEN receiver.nama_lengkap  -- If receiver is a user, fetch their full name
                            ELSE NULL  -- If receiver is a mitra, return NULL for user-specific fields
                        END AS receiver_nama_lengkap,
                        i.created_at
                    FROM inbox i
                    INNER JOIN users sender ON i.sender_id = sender.id  -- Sender is always a user
                    -- If receiver_id corresponds to a user, fetch user details
                    LEFT JOIN users receiver ON i.receiver_id = receiver.id  -- Join with users for the receiver (if it's a user)
                    -- If receiver_id corresponds to a mitra, fetch mitra details
                    LEFT JOIN mitra ON i.receiver_id = mitra.id  -- Join mitra table to get mitra details (if receiver is a mitra)
                    WHERE (i.sender_id IN (${placeholders}) OR i.receiver_id IN (${placeholders})) 
                    AND i.judul = ?
                    ORDER BY i.created_at ASC;
                `;
                const [rows] = await pool.execute<RowDataPacket[]>(dynamicQuery, [...existingMitraUsersId, ...existingMitraUsersId, subject]);
                inboxMessages = rows
                console.log("Inboxes:", inboxMessages) //Debug.
                console.log('Existing mitra users:', existingMitraUsersId) //Debug.
            } else {
                console.log(existingMitraUsers) //Debug.
                res.status(409).json({message: "Failed to find any of mitra's user."})
                return
            }
            
            // Debug.
            res.status(201).json({
                message: "Inbox messages retrieved successfully.",
                inboxMessages,
                newAccessToken
            })
            return
        } else {
            // User doesn't have the permission.
            res.status(401).json({message: "Unauthorized."})
            return
        }
    } catch (error) {
        console.error(error) //Debug.
        res.status(500).json({message: "Error getting inbox."})
        return
    }
}

export default {
    createInbox,
    getInboxes,
    getInbox
}