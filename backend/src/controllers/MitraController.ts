import { Request, Response } from "express"
import { pool } from "../database"
import jwt from 'jsonwebtoken'
import { RowDataPacket } from "mysql2"
import {v4 as uuidv4} from 'uuid'
import bcrypt from 'bcrypt'
import nodemailer from 'nodemailer'
import { Pekerjaan } from "../types"

async function createMitra (req: Request, res: Response) {
    const connection = await pool.getConnection()
    try {
        const accessToken = req.accessToken
        // console.log("Access token received:", accessToken) // Debug.
        const newAccessToken = req.newAccessToken
        // console.log("New access token received:", newAccessToken) // Debug.
        const metaData = jwt.decode(accessToken!) as jwt.JwtPayload
        // console.log(metaData) // Debug.
        const permissions = metaData.permissions
        const creator_id = metaData.user_id

        if (permissions.includes('create_mitra')) {
            // Begin transaction
            await connection.beginTransaction()
            // Get request parameters.
            const {mitra, kontrak, pekerjaan_arr, user} = req.body
    
            // Creating mitra.
                // Checking if mitra already exists.
            const [existingMitra]= await connection.execute<RowDataPacket[]>('SELECT * FROM mitra WHERE nama = ?', [mitra.nama])
            if (existingMitra.length > 0) {
                throw new Error("Mitra already exists.")
            }
                // Generate mitra id and insert mitra into the database
            const mitraId = uuidv4()
            await connection.execute('INSERT INTO mitra (id, nama, nomor_telepon, alamat, created_by) VALUES (?, ?, ?, ?, ?)', [mitraId, mitra.nama, mitra.nomor_telepon, mitra.alamat, creator_id])
            console.log("Mitra successfully created:", mitraId, mitra) //Debug.
            
            // Creating kontrak
                // Generate kontrak id and insert kontrak into the database
            const kontrakId = uuidv4()
            await connection.execute('INSERT INTO kontrak (id, mitra_id, nama, nomor, tanggal, nilai, jangka_waktu, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [kontrakId, mitraId, kontrak.nama, kontrak.nomor, kontrak.tanggal, kontrak.nilai, kontrak.jangka_waktu, creator_id])
            console.log("Kontrak successfully created:", kontrakId, kontrak)
    
            // Creating pekerjaan
                // Mapping array of pekerjaan
            await Promise.all(
                pekerjaan_arr.map(async (pekerjaan: Pekerjaan) => {
                // Generate pekerjaan_id and insert it into the database.
                    const pekerjaanId = uuidv4()
                    await connection.execute('INSERT INTO kontrak_ss_pekerjaan (id, kontrak_id, nama, lokasi, created_by) VALUES (?, ?, ?, ?, ?)', [pekerjaanId, kontrakId, pekerjaan.nama, pekerjaan.lokasi, creator_id])
                    console.log(`Pekerjaan "${pekerjaan.nama}" di "${pekerjaan.lokasi}" successfully created.`) //Debug.
                })
            )
            console.log("Pekerjaan successfully created:", pekerjaan_arr) //Debug.
    
            // Creating user
                //Checking if the user is already exists.
            const [existingUser] = await pool.execute<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [user.email])
            if (existingUser.length > 0) {
                throw new Error("User already exists.")
            }
                
                // Assign id to user and insert it into the database.
            const userId = uuidv4()
            const verificationToken = uuidv4()
            await connection.execute('INSERT INTO users (id, role_id, email, nama_lengkap, nomor_telepon, verification_token, created_by) VALUES (?, (SELECT id FROM roles WHERE nama = "mitra"), ?, ?, ?, ?, ?)', [userId, user.email, user.nama_lengkap, user.nomor_telepon, verificationToken, creator_id])
    
                // Generate password and insert it into the database.
            const password = uuidv4()
            const hashed_password = await bcrypt.hash(password, 10)
            await connection.execute('INSERT INTO users_hashed_password (user_id, hashed_password, created_by) VALUES (?, ?, ?)', [userId, hashed_password, creator_id])
    
                // Generate mitra_users id and insert it into the database.
            const mitraUsersId = uuidv4()
            await connection.execute('INSERT INTO mitra_users (id, mitra_id, user_id, created_by) VALUES (?, ?, ?, ?)', [mitraUsersId, mitraId, userId, creator_id])
            
            // Commit all the queries
            await connection.commit()

            // Delivering the verification email to the user process
                // Creating the transporter
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.TRANSPORTER_EMAIL as string,
                    pass: process.env.TRANSPORTER_PASSWORD as string
                }
            })
                // Creating the verification token and url
            const verificationUrl = `${process.env.BASE_URL}/api/auth/verify-email?token=${verificationToken}`
    
                // Sending the email
            await transporter.sendMail({
                from: process.env.TRANSPORTER_EMAIL as string,
                to: user.email,
                subject: "Email Verification",
                html: `<h1>Please verify your email by clicking on the following link:<br></h1><a href="${verificationUrl}"><h2>Verify Email</h2></a><h3>Password: <b>${password}</b></h3>`
            })
    
            res.status(201).json({
                message: "Mitra created successfully. Check the email verification to verify the user account.",
                created_mitra: mitra,
                created_kontrak: kontrak,
                created_pekerjaan: pekerjaan_arr,
                created_user: user,
                newAccessToken
            })
            return
        } else {
            res.status(401).json({message: "Unauthorized."})
            return
        }
    } catch (error) {
        // Rollback the connection if there's error.
        await connection.rollback()
        console.error(error) // Debug.
        res.status(500).json({message: "Error creating Mitra."})
        return
        
    } finally {
        connection.release()
    }
}

async function getMitra(req: Request, res: Response) {
    try {
        const accessToken = req.accessToken
        // console.log("Access token received:", accessToken) // Debug.
        const newAccessToken = req.newAccessToken
        // console.log("New access token received:", newAccessToken) // Debug.
        const metaData = jwt.decode(accessToken!) as jwt.JwtPayload
        // console.log(metaData) // Debug.
        const userId = metaData.user_id
        const permissions = metaData.permissions

        if (permissions.includes('get_mitra')) {
            const [mitra] = await pool.execute<RowDataPacket[]>('SELECT mitra.nama FROM mitra_users INNER JOIN mitra ON mitra_users.mitra_id = mitra.id INNER JOIN users ON mitra_users.user_id = users.id WHERE users.id = ?', [userId])
            if (mitra.length === 0) {
                res.status(409).json({message: "Failed to find user's mitra."})
                return
            }
            const nama_mitra = mitra[0].nama
            res.status(200).json({
                message: "Successfully retrieved user's mitra.",
                nama_mitra,
                newAccessToken
            })
            return
        } else {
            res.status(401).json({message: "Unauthorized."})
            return
        }
    } catch (error) {
        console.error(error) //Debug.
        res.status(500).json({message: "Error getting mitras."})
        return
    }
}

async function getMitraUsers(req: Request, res: Response) {
    try {
        const accessToken = req.accessToken
        // console.log("Access token received:", accessToken) // Debug.
        const newAccessToken = req.newAccessToken
        // console.log("New access token received:", newAccessToken) // Debug.
        const metaData = jwt.decode(accessToken!) as jwt.JwtPayload
        // console.log(metaData) // Debug.
        const permissions = metaData.permissions
        
        if (permissions.includes('get_mitra_users')) {
            const {nama_mitra} = req.body
            
            const [existingMitraUsers] = await pool.execute<RowDataPacket[]>('SELECT users.email, users.nama_lengkap, users.nomor_telepon, users.is_verified, users.is_active FROM mitra_users INNER JOIN mitra ON mitra_users.mitra_id = mitra.id INNER JOIN users ON mitra_users.user_id = users.id WHERE mitra.nama = ?', [nama_mitra])
            if (existingMitraUsers.length > 0) {
                res.status(200).json({
                    message: "Successfully retrieved mitra's users.",
                    mitra_users: existingMitraUsers,
                    newAccessToken
                })
                return
            } else {
                res.status(409).json({message: "Failed to find Mitra."})
                return
            }
        } else {
            res.status(401).json({message: "Unauthorized."})
            return
        }
    } catch (error) {
        console.error(error) //Debug.
        res.status(500).json({message: "Error getting mitra's users."})
        return
    }
}

async function getMitraKontraks(req: Request, res: Response) {
    try {
        const accessToken = req.accessToken
        // console.log("Access token received:", accessToken) // Debug.
        const newAccessToken = req.newAccessToken
        // console.log("New access token received:", newAccessToken) // Debug.
        const metaData = jwt.decode(accessToken!) as jwt.JwtPayload
        // console.log(metaData) // Debug.
        const permissions = metaData.permissions
        
        if (permissions.includes('get_mitra_kontraks')) {
            const nama_mitra = metaData.nama_mitra || req.body.nama_mitra
            
            if (!nama_mitra) {
                res.status(400).json({message: "Nama mitra is required."})
                return
            } else if (metaData.nama_mitra && req.body.nama_mitra && metaData.nama_mitra != req.body.nama_mitra) {
                res.status(401).json({message: "Unauthorized."})
                return
            }
            
            const [existingMitraKontraks] = await pool.execute<RowDataPacket[]>('SELECT kontrak.nama, kontrak.nomor, kontrak.tanggal, kontrak.nilai, kontrak.jangka_waktu FROM kontrak INNER JOIN mitra ON kontrak.mitra_id = mitra.id WHERE mitra.nama = ?', [nama_mitra])
            if (existingMitraKontraks.length > 0) {
                res.status(200).json({
                    message: "Successfully retrieved mitra's kontraks.",
                    mitra_kontraks: existingMitraKontraks,
                    newAccessToken
                })
                return
            } else {
                res.status(409).json({message: "Failed to find Mitra."})
                return
            }
        } else {
            console.log(permissions) //Debug.
            res.status(401).json({message: "Unauthorized."})
            return
        }
    } catch (error) {
        console.error(error) //Debug.
        res.status(500).json({message: "Error getting mitra's kontraks."})
        return
    }
}

async function getMitras(req: Request, res: Response) {
    try {
        const accessToken = req.accessToken
        // console.log("Access token received:", accessToken) // Debug.
        const newAccessToken = req.newAccessToken
        // console.log("New access token received:", newAccessToken) // Debug.
        const metaData = jwt.decode(accessToken!) as jwt.JwtPayload
        // console.log(metaData) // Debug.
        const permissions = metaData.permissions

        if (permissions.includes('view_all_mitra')) {
            const [mitras] = await pool.execute<RowDataPacket[]>('SELECT id, nama, alamat, nomor_telepon FROM mitra WHERE is_active = 1')
            res.status(200).json({
                message: "Successfully retrieved all mitra.",
                mitras,
                newAccessToken
            })
            return
        } else {
            res.status(401).json({message: "Unauthorized."})
            return
        }
    } catch (error) {
        console.error(error) //Debug.
        res.status(500).json({message: "Error getting mitras."})
        return
    }
}

async function updateMitra (req: Request, res: Response) {
    try {
        const accessToken = req.accessToken
        // console.log("Access token received:", accessToken) // Debug.
        const newAccessToken = req.newAccessToken
        // console.log("New access token received:", newAccessToken) // Debug.
        const metaData = jwt.decode(accessToken!) as jwt.JwtPayload
        // console.log(metaData) // Debug.
        const permissions = metaData.permissions
        
        if (permissions.includes('update_mitra')) {
            const nama_mitra = metaData.nama_mitra || req.body.nama_mitra
            
            if (!nama_mitra) {
                res.status(400).json({message: "Nama mitra is required."})
                return
            }
            
            // Get request parameters.
            const {alamat, nomor_telepon} = req.body
            
            const [existingMitra] = await pool.execute<RowDataPacket[]>('SELECT * FROM mitra WHERE nama = ?', [nama_mitra])
            if (existingMitra.length > 0) {
                
                await pool.execute('UPDATE mitra SET alamat = ?, nomor_telepon = ? WHERE nama = ?', [alamat, nomor_telepon, nama_mitra])
                
                res.status(200).json({
                    message: "Mitra successfully updated."
                })
                return
            } else {
                res.status(409).json({
                    message: "Failed to find mitra.",
                    newAccessToken
                })
                return
            }
            
        } else {
            res.status(401).json({message: "Unauthorized."})
            return
        }
    } catch (error) {
        console.error(error) //Debug.
        res.status(500).json({message: "Error updating mitra."})
        return
    }
}

async function deleteMitra (req: Request, res: Response) {}

export default {
    createMitra,
    getMitra,
    getMitraUsers,
    getMitraKontraks,
    getMitras,
    updateMitra,
    deleteMitra
}