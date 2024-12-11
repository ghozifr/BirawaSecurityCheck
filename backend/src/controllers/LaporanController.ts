import { Request, Response } from "express";
import { pool } from "../database";
import { RowDataPacket } from "mysql2";
import {v4 as uuidv4} from 'uuid'
import jwt from 'jsonwebtoken'
import { Aktivitas, Cuaca, TenagaKerja } from "../types";
import { uploadImages } from "../lib/utils";

async function createLaporan(req: Request, res: Response) {
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

        // Check the user permission
        if (permissions.includes('create_laporan')) { // don't forget to change the permissions
            // Begin transactions
            await connection.beginTransaction()
            // Get request parameter
            const {nama_mitra, nomor_kontrak, nama_pekerjaan, tanggal, shift, tenaga_kerja_arr, aktivitas_arr, cuaca_arr} = req.body
            // Get request files (images)
            const files = req.files as Express.Multer.File[]

            console.log("Request values: ", {nama_mitra, nomor_kontrak, nama_pekerjaan, tanggal, shift, tenaga_kerja_arr, aktivitas_arr, cuaca_arr}) //Debug.

            // Check if pekerjaan exists.
            const [pekerjaan] = await connection.execute<RowDataPacket[]>('SELECT kontrak_ss_pekerjaan.id FROM kontrak INNER JOIN kontrak_ss_pekerjaan ON kontrak.id = kontrak_ss_pekerjaan.kontrak_id WHERE kontrak.nomor = ? AND kontrak_ss_pekerjaan.nama = ?', [nomor_kontrak, nama_pekerjaan])
            if (pekerjaan.length === 0) {
                res.status(409).json({message: "Pekerjaan doesn't exist."})
                return
            }
            // Acquire pekerjaan id
            const kontrak_ss_pekerjaan_id = pekerjaan[0].id

            // Creating shift.
                // Initiating shiftId.
            let shiftId
                // Check if the shift for this specific laporan already exists.
            const [existingShiftLaporan]= await connection.execute<RowDataPacket[]>('SELECT * FROM mitra INNER JOIN kontrak ON mitra.id = kontrak.mitra_id INNER JOIN kontrak_ss_pekerjaan ON kontrak.id = kontrak_ss_pekerjaan.kontrak_id INNER JOIN tenaga_kerja ON kontrak_ss_pekerjaan.id = tenaga_kerja.kontrak_ss_pekerjaan_id INNER JOIN shift ON tenaga_kerja.shift_id = shift.id INNER JOIN peran_tenaga_kerja ON tenaga_kerja.peran_tenaga_kerja_id = peran_tenaga_kerja.id WHERE mitra.nama = ? AND kontrak.nomor = ? AND kontrak_ss_pekerjaan.nama = ? AND tenaga_kerja.tanggal = ? AND shift.nama = ?', [nama_mitra, nomor_kontrak, nama_pekerjaan, tanggal, shift.nama])
            if (existingShiftLaporan.length > 0) {
                res.status(409).json({message: `This shift for laporan with mitra: ${nama_mitra}, nomor kontrak: ${nomor_kontrak}, pekerjaan: ${nama_pekerjaan} for tanggal ${tanggal} already exists.`})
                return
            } else {
                // Check if the shift is already exists.
                const [existingShift] = await connection.execute<RowDataPacket[]>('SELECT id FROM shift WHERE nama = ? AND waktu_mulai = ? AND waktu_berakhir = ?', [shift.nama, shift.waktu_mulai, shift.waktu_berakhir])
                    // Generate shift id if it doesn't exist already and insert it into the database.
                if (existingShift.length > 0) {
                    shiftId = existingShift[0].id
                    console.log("Shift that is already exists in the database:", existingShift[0]) //Debug.
                } else {
                    shiftId = uuidv4()
                    console.log("Shift to create:", shift) //Debug.
                    await connection.execute('INSERT INTO shift (id, nama, waktu_mulai, waktu_berakhir, created_by) VALUES (?, ?, ?, ?, ?)', [shiftId, shift.nama, shift.waktu_mulai, shift.waktu_berakhir, creator_id])
                    console.log("Shift successfully created:", shift) //Debug.
                }
            }
            
            // Creating tenaga_kerja.
                // Mapping array of tenaga_kerja.
            await Promise.all(
                tenaga_kerja_arr.map(async (tenaga_kerja: TenagaKerja) => {
                    console.log("Tenaga kerja to create:", tenaga_kerja) //Debug.
                // Checking if peran_tenaga_kerja exists.
                    const [peranTenagaKerja] = await connection.execute<RowDataPacket[]>('SELECT id FROM peran_tenaga_kerja WHERE nama = ?', [tenaga_kerja.peran])
                    // Initiating peran_tenaga_kerja_id.
                    let peranTenagaKerjaId;
                    if (peranTenagaKerja.length === 0) {
                    // Generate peran_tenaga_kerja_id and insert new peran_tenaga_kerja into the database if peran_tenaga_kerja doesn't exist.
                        peranTenagaKerjaId = uuidv4()
                        await connection.execute('INSERT INTO peran_tenaga_kerja (id, tipe_tenaga_kerja_id, nama, created_by) VALUES (?, (SELECT id FROM tipe_tenaga_kerja WHERE nama = ?), ?, ?)', [peranTenagaKerjaId, tenaga_kerja.tipe, tenaga_kerja.peran, creator_id])
                        console.log(`Tenaga kerja "${tenaga_kerja.peran}" berhasil dibuat.`) //Debug.
                    } else {
                    // Assign peran_tenaga_kerja_id to the existing peran_tenaga_kerja's id
                        peranTenagaKerjaId = peranTenagaKerja[0].id
                    }
                // Generate tenaga_kerja_id and insert tenaga_kerja into the database
                    const tenagaKerjaId = uuidv4()
                    await connection.execute('INSERT INTO tenaga_kerja (id, kontrak_ss_pekerjaan_id, shift_id, peran_tenaga_kerja_id, jumlah, tanggal, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)', [tenagaKerjaId, kontrak_ss_pekerjaan_id, shiftId, peranTenagaKerjaId, tenaga_kerja.jumlah, tanggal, creator_id])
                    console.log(`Tenaga kerja "${tenaga_kerja.peran}" dengan jumlah ${tenaga_kerja.jumlah} orang successfully created pada tanggal "${tanggal}}".`) //Debug.
                })
            )
            console.log("Tenaga Kerja successfully created:", tenaga_kerja_arr) //Debug.
            
    
            // Creating aktivitas.
                // Checking the existence of tipe_aktivitas in the database.    
                for (const aktivitas of aktivitas_arr) {
                    const [existingTipeAktivitas] = await connection.execute<RowDataPacket[]>('SELECT id FROM tipe_aktivitas WHERE nama = ?', [aktivitas.tipe])
                    console.log(existingTipeAktivitas) //Debug.
                // Initiating tipe_aktivitas_id 
                    let tipeAktivitasId
                    if (existingTipeAktivitas.length === 0){
                // Generate tipe_aktivitas_id and insert new tipe_aktivitas into the database if tipe_aktivitas doesn't exist.
                    tipeAktivitasId = uuidv4()
                    await connection.execute('INSERT INTO tipe_aktivitas (id, nama, created_by) VALUES (?, ?, ?)', [tipeAktivitasId, aktivitas.tipe, creator_id])
                    console.log(`Tipe aktivitas "${aktivitas.tipe}" berhasil dibuat.`) //Debug.
                } else {
                // Assign tipe_aktivitas_id to the existing tipe_aktivitas's id.
                    tipeAktivitasId = existingTipeAktivitas[0].id
                }
            }
                // Mapping array of aktivitas.
            let imagesContainer_debug: string[] = [] //Debug.
            await Promise.all(
                aktivitas_arr.map(async (aktivitas: Aktivitas, index_aktivitas: number) => {
                    console.log("Aktivitas to create:", aktivitas) //Debug.
                
                // Generate aktivitas_id and insert aktivitas into the database.
                    const aktivitasId = uuidv4()
                    await connection.execute('INSERT INTO aktivitas (id, kontrak_ss_pekerjaan_id, tipe_aktivitas_id, nama, tanggal, created_by) VALUES (?, ?, (SELECT id FROM tipe_aktivitas WHERE nama = ?), ?, ?, ?)', [aktivitasId, kontrak_ss_pekerjaan_id, aktivitas.tipe, aktivitas.nama, tanggal, creator_id])
                    console.log(`Aktivitas "${aktivitas.nama}" berhasil dibuat pada pekerjaan "${nama_pekerjaan}" pada tanggal ${tanggal}`) //Debug.

                // Creating documentation
                    // Get images (2) for each activity
                const activityImageFiles = files.slice(index_aktivitas * 2, (index_aktivitas * 2) + 2)
                    // Upload both images and get the URLs
                const uploadedImageUrls = await uploadImages(activityImageFiles, nama_mitra, nomor_kontrak, nama_pekerjaan, aktivitas.nama, tanggal)
                for (const url of uploadedImageUrls) {imagesContainer_debug.push(url)} // Debug.
                // Loop through the uploaded images
                await Promise.all(
                    uploadedImageUrls.map(async (imageUrl: string, index_dokumentasi: number) => {
                    // Generate dokumentasi_id and insert dokumentasi into the database
                        const dokumentasiId = uuidv4()
                        const deskripsiDokumentasi = aktivitas.dokumentasi[index_dokumentasi].deskripsi
                        await connection.execute('INSERT INTO dokumentasi (id, aktivitas_id, link, deskripsi, created_by) VALUES (?, ?, ?, ?, ?)', [dokumentasiId, aktivitasId, imageUrl, deskripsiDokumentasi, creator_id])
                        console.log(`Dokumentasi aktivitas "${aktivitas.tipe}" dengan link "${imageUrl}" dan deskripsi "${deskripsiDokumentasi}" berhasil dibuat.`) //Debug.
                    })
                )
                console.log("Dokumentasi successfully created:", uploadedImageUrls, aktivitas.dokumentasi) //Debug.
                })
            )
            console.log("Aktivitas successfully created:", aktivitas_arr) //Debug.
    
            // Creating cuaca.
                // Mapping array of cuaca.
            await Promise.all(
                cuaca_arr.map(async (cuaca: Cuaca) => {
                    console.log("Cuaca to create:", cuaca) //Debug.
                // Checking if tipe_cuaca exists.
                    const [tipeCuaca] = await connection.execute<RowDataPacket[]>('SELECT id FROM tipe_cuaca WHERE nama = ?', [cuaca.tipe])
                    if (tipeCuaca.length === 0) {
                    // Throw error if tipe_cuaca doesn't exists in the database.
                        throw new Error ("Failed to find tipe cuaca.")
                    }
                // Checking if tipe_cuaca is 'cerah'
                    let waktu_mulai: string = "";
                    let waktu_berakhir: string = "";
                    if (cuaca.tipe == 'cerah') {
                        switch (cuaca.waktu) {
                            case 'pagi':
                                waktu_mulai = '06:00:00'
                                waktu_berakhir = '11:59:59'
                                break
                            case 'siang':
                                waktu_mulai = '12:00:00'
                                waktu_berakhir = '14:59:59'
                                break
                            case 'sore':
                                waktu_mulai = '15:00:00'
                                waktu_berakhir = '17:59:59'
                                break
                            case 'malam':
                                waktu_mulai = '18:00:00'
                                waktu_berakhir = '22:00:00'
                                break
                            default:
                                throw new Error("Invalid waktu provided for 'cerah' type.")
                        }
                    } else if (['gerimis', 'hujan'].includes(cuaca.tipe)) {
                        // For 'gerimis' and 'hujan', use the provided waktu_mulai and waktu_berakhir from the request.
                        if (!cuaca.waktu_mulai || !cuaca.waktu_berakhir) {
                            throw new Error(`Missing waktu_mulai or waktu_berakhir for cuaca type '${cuaca.tipe}'.`);
                        }
                        waktu_mulai = cuaca.waktu_mulai;
                        waktu_berakhir = cuaca.waktu_berakhir;
                    } else {
                        // Handle unexpected cuaca types.
                        throw new Error(`Unsupported cuaca type '${cuaca.tipe}'.`);
                    }
                    
                    const [existingCuaca] = await connection.execute<RowDataPacket[]>('SELECT * FROM cuaca WHERE kontrak_ss_pekerjaan_id = ? AND waktu = ? AND tanggal = ?', [kontrak_ss_pekerjaan_id, cuaca.waktu, tanggal])
                    if (existingCuaca.length > 0) {
                        // Compare the existing and the new waktu_mulai and pick the earliest one.
                        const existingWaktuMulai = existingCuaca[0].waktu_mulai;
                        const earliestWaktuMulai = new Date(Math.min(new Date(`1970-01-01T${existingWaktuMulai}Z`).getTime(), new Date(`1970-01-01T${waktu_mulai}Z`).getTime()));
                        
                        // Format earliestWaktuMulai as 'hh:mm:ss' for MySQL
                        const formattedEarliestWaktuMulai = earliestWaktuMulai.toISOString().slice(11, 19);
                        
                        // Update cuaca with the earliest waktu_mulai and the new waktu_berakhir
                        await connection.execute(
                          'UPDATE cuaca SET waktu_mulai = ?, waktu_berakhir = ? WHERE id = ?', 
                          [formattedEarliestWaktuMulai, waktu_berakhir, existingCuaca[0].id]
                        );
                        
                        console.log(`Cuaca updated for ${cuaca.tipe} on ${tanggal} with earliest waktu_mulai.`); // Debug.                        
                    } else {
                    // Generate cuaca_id and insert it into the database if tipe_cuaca exists.
                        const cuacaId = uuidv4()
                        await connection.execute('INSERT INTO cuaca (id, kontrak_ss_pekerjaan_id, tipe_cuaca_id, waktu, waktu_mulai, waktu_berakhir, tanggal, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [cuacaId, kontrak_ss_pekerjaan_id, tipeCuaca[0].id, cuaca.waktu, waktu_mulai, waktu_berakhir, tanggal, creator_id])
                        console.log(`Cuaca "${cuaca.tipe}" berhasil dibuat untuk tanggal ${tanggal}`) //Debug.
                    }
                })
            )
            console.log("Cuaca successfully created:", cuaca_arr) //Debug.
            
            // Creating laporan
            const laporanId = uuidv4()
            await connection.execute('INSERT INTO laporan (id, kontrak_ss_pekerjaan_id, tanggal, created_by) VALUES (?, ?, ?, ?)', [laporanId, kontrak_ss_pekerjaan_id, tanggal, creator_id])
            console.log("Laporan created successfully.")
            
            
            // Commit all the queries
            await connection.commit()
    
            res.status(201).json({
                message: "Laporan created successfully.",
                created_shift: shift,
                created_tenaga_kerja: tenaga_kerja_arr,
                created_aktivitas: aktivitas_arr,
                uploaded_images: imagesContainer_debug,
                created_cuaca: cuaca_arr,
                newAccessToken
            })
            return
        } else {
        // User doesn't have the permissions.
            res.status(401).json({message: "Unauthorized."})
            return
        }
    } catch (error) {
        // Rollback the connection if there's error.
        await connection.rollback()
        console.error("Failed to start transaction.\nError:", error) // Debug.
        res.status(500).json({message: "Error creating Laporan."})
        return
        
    } finally {
        // Release the connection.
        connection.release()
    }
}

async function getLaporan(req: Request, res: Response) {
    try {
        const accessToken = req.accessToken
        // console.log("Access token received:", accessToken) // Debug.
        const newAccessToken = req.newAccessToken
        // console.log("New access token received:", newAccessToken) // Debug.
        const metaData = jwt.decode(accessToken!) as jwt.JwtPayload
        // console.log(metaData) // Debug.
        const permissions = metaData.permissions
        
        if (permissions.includes('get_laporan')) {
            const {laporanId} = req.params
            
            const [existingLaporan] = await pool.execute<RowDataPacket[]>('SELECT id, kontrak_ss_pekerjaan_id, tanggal, created_by FROM laporan WHERE id = ?', [laporanId])
            
            if (existingLaporan.length > 0) {
                const [laporanTenagaKerja] = await pool.execute<RowDataPacket[]>('SELECT m.nama AS mitra_nama, k.nomor AS kontrak_nomor, ksp.nama AS kontrak_ss_pekerjaan_nama, l.tanggal AS laporan_tanggal, s.nama AS shift_nama, s.waktu_mulai AS shift_waktu_mulai, s.waktu_berakhir AS shift_waktu_berakhir, ptk.nama AS peran_tenaga_kerja_nama, tk.jumlah AS tenaga_kerja_jumlah FROM laporan l JOIN kontrak_ss_pekerjaan ksp ON l.kontrak_ss_pekerjaan_id = ksp.id JOIN kontrak k ON ksp.kontrak_id = k.id JOIN mitra m ON k.mitra_id = m.id JOIN tenaga_kerja tk ON ksp.id = tk.kontrak_ss_pekerjaan_id AND l.tanggal = tk.tanggal JOIN shift s ON tk.shift_id = s.id JOIN peran_tenaga_kerja ptk ON tk.peran_tenaga_kerja_id = ptk.id WHERE l.id = ? AND l.deleted_at IS NULL', [laporanId])
                const [laporanAktivitasRaw] = await pool.execute<RowDataPacket[]>('SELECT m.nama AS mitra_nama, k.nomor AS kontrak_nomor, ksp.nama AS kontrak_ss_pekerjaan_nama, l.tanggal AS laporan_tanggal, ta.nama AS tipe_aktivitas_nama, a.nama AS aktivitas_nama, d.link AS url, d.deskripsi AS deskripsi FROM laporan l JOIN kontrak_ss_pekerjaan ksp ON l.kontrak_ss_pekerjaan_id = ksp.id JOIN kontrak k ON ksp.kontrak_id = k.id JOIN mitra m ON k.mitra_id = m.id JOIN aktivitas a ON ksp.id = a.kontrak_ss_pekerjaan_id AND l.tanggal = a.tanggal JOIN tipe_aktivitas ta ON a.tipe_aktivitas_id = ta.id LEFT JOIN dokumentasi d ON a.id = d.aktivitas_id WHERE  l.id = ? AND l.deleted_at IS NULL AND m.deleted_at IS NULL AND k.deleted_at IS NULL AND ksp.deleted_at IS NULL AND a.deleted_at IS NULL AND ta.deleted_at IS NULL', [laporanId])
                const [laporanCuacaRaw] = await pool.execute<RowDataPacket[]>('SELECT tc.nama AS tipe_cuaca_nama, c.waktu, c.waktu_mulai, c.waktu_berakhir FROM cuaca c JOIN tipe_cuaca tc ON c.tipe_cuaca_id = tc.id WHERE c.kontrak_ss_pekerjaan_id = ? AND c.tanggal = ? AND c.deleted_at IS NULL AND tc.deleted_at IS NULL',[existingLaporan[0].kontrak_ss_pekerjaan_id, existingLaporan[0].tanggal])
                
                // Group the laporanTenagaKerja by shift_nama and peran_tenaga_kerja_nama
                const groupedLaporanTenagaKerja = laporanTenagaKerja.reduce((acc: any, row: any) => {
                    const shiftKey = row.shift_nama
                
                    if (!acc[shiftKey]) {
                        acc[shiftKey] = {
                            shift_nama: row.shift_nama,
                            shift_waktu_mulai: row.shift_waktu_mulai,
                            shift_waktu_berakhir: row.shift_waktu_berakhir,
                            peran_tenaga_kerja_arr: []
                        };
                    }
                
                    const peranTenagaKerja = acc[shiftKey].peran_tenaga_kerja_arr.find((ptk: any) => ptk.nama === row.peran_tenaga_kerja_nama);
                    if (!peranTenagaKerja) {
                        acc[shiftKey].peran_tenaga_kerja_arr.push({
                            nama: row.peran_tenaga_kerja_nama,
                            jumlah: row.tenaga_kerja_jumlah,
                            aktivitas_arr: []
                        });
                    }
                
                    return acc;
                }, {});
                
                // Map laporanAktivitasRaw to aktivitas_arr within the corresponding peran_tenaga_kerja
                laporanAktivitasRaw.forEach((row: any) => {
                    const tipeAktivitas = row.tipe_aktivitas_nama.split(' ').slice(1).join(' '); // Extract other than the first word
                    const aktivitasNama = row.aktivitas_nama;
                
                    Object.values(groupedLaporanTenagaKerja).forEach((shift: any) => {
                        shift.peran_tenaga_kerja_arr.forEach((ptk: any) => {
                            const peranTenagaKerja = ptk.nama.split(' ').slice(1).join(' '); // Extract other than the first word
                            if (tipeAktivitas.toLowerCase() === peranTenagaKerja.toLowerCase()) {
                                // Find or add the aktivitas
                                let aktivitas = ptk.aktivitas_arr.find((a: any) => a.nama === aktivitasNama);
                                if (!aktivitas) {
                                    aktivitas = {
                                        nama: aktivitasNama,
                                        dokumentasi_arr: []
                                    };
                                    ptk.aktivitas_arr.push(aktivitas);
                                }
                
                                // Add dokumentasi
                                if (row.deskripsi || row.url) {
                                    aktivitas.dokumentasi_arr.push({
                                        deskripsi: row.deskripsi,
                                        url: row.url
                                    });
                                }
                            }
                        });
                    });
                });
                
                // Convert laporanCuacaRaw to structured cuaca array
                const cuaca = laporanCuacaRaw.map((row: any) => ({
                    tipe: row.tipe_cuaca_nama,
                    waktu: row.waktu,
                    waktu_mulai: row.waktu_mulai,
                    waktu_berakhir: row.waktu_berakhir
                }));
                
                // Convert the grouped object into an array
                const laporan = Object.values(groupedLaporanTenagaKerja);
                
                // Get pembuat laporan
                const [user] = await pool.execute<RowDataPacket[]>('SELECT nama_lengkap FROM users WHERE id = ?', [existingLaporan[0].created_by])
                console.log(existingLaporan[0].created_by) //Debug.
                if (user.length === 0) {
                    res.status(409).json({message: "Failed to find pembuat laporan."})
                    return
                }
                
                const pembuat_laporan = user[0].nama_lengkap
                
                res.status(200).json({
                    message: "Successfully retrieved laporan.",
                    pembuat_laporan,
                    laporan,
                    cuaca,
                    newAccessToken
                })
                return
            } else {
                res.status(409).json({message: "Failed to find laporan."})
                return
            }
        } else {
            console.log(permissions) //Debug.
            res.status(401).json({message: "Unauthorized."})
            return
        }
    } catch (error) {
        console.error(error) // Debug.
        res.status(500).json({message: "Error retrieving laporan."})
        return
    }
}

async function getPekerjaanLaporans(req: Request, res: Response) {
    try {
        const accessToken = req.accessToken
        // console.log("Access token received:", accessToken) // Debug.
        const newAccessToken = req.newAccessToken
        // console.log("New access token received:", newAccessToken) // Debug.
        const metaData = jwt.decode(accessToken!) as jwt.JwtPayload
        // console.log(metaData) // Debug.
        const permissions = metaData.permissions
        
        if (permissions.includes('get_pekerjaan_laporans')) {
            const nama_mitra = metaData.nama_mitra || req.body.nama_mitra
            
            if (!nama_mitra) {
                res.status(400).json({message: "Nama mitra is required."})
                return
            } else if (metaData.nama_mitra && req.body.nama_mitra && metaData.nama_mitra != req.body.nama_mitra) {
                res.status(401).json({message: "Unauthorized."})
                return
            }

            const {nomor_kontrak, nama_pekerjaan} = req.body
            const [existingPekerjaanLaporans] = await pool.execute<RowDataPacket[]>('SELECT laporan.id, kontrak_ss_pekerjaan.nama, laporan.tanggal FROM laporan INNER JOIN kontrak_ss_pekerjaan ON kontrak_ss_pekerjaan.id = laporan.kontrak_ss_pekerjaan_id INNER JOIN kontrak ON kontrak_ss_pekerjaan.kontrak_id = kontrak.id INNER JOIN mitra ON kontrak.mitra_id = mitra.id WHERE mitra.nama = ? AND kontrak.nomor = ? AND kontrak_ss_pekerjaan.nama = ?', [nama_mitra, nomor_kontrak, nama_pekerjaan])
            if (existingPekerjaanLaporans.length > 0) {
                res.status(200).json({
                    message: "Successfully retrieved pekerjaan's laporan(s).",
                    pekerjaan_laporans: existingPekerjaanLaporans,
                    newAccessToken
                })
                return
            } else {
                res.status(409).json({message: "Failed to find any pekerjaan's laporan(s)."})
                return
            }
        } else {
            console.log(permissions) //Debug.
            res.status(401).json({message: "Unauthorized."})
            return
        }
    } catch (error) {
        console.error(error) // Debug.
        res.status(500).json({message: "Error retrieving pekerjaan's laporans."})
        return
    }
}

async function getLaporans(req: Request, res: Response) {
    try {
        const accessToken = req.accessToken
        // console.log("Access token received:", accessToken) // Debug.
        const newAccessToken = req.newAccessToken
        // console.log("New access token received:", newAccessToken) // Debug.
        const metaData = jwt.decode(accessToken!) as jwt.JwtPayload
        // console.log(metaData) // Debug.
        const permissions = metaData.permissions
        
        if (permissions.includes('view_all_laporan')) {
            const [laporan] = await pool.execute<RowDataPacket[]>('SELECT id, kontrak_ss_pekerjaan_id FROM laporan')
            if (laporan.length > 0) {
                res.status(409).json({
                    message: "Successfully retrieved all laporan.",
                    laporan,
                    newAccessToken
                })
                return
            } else {
                res.status(409).json({message: "Failed to find laporan."})
                return
            }
        } else {
            res.status(401).json({message: "Unauthorized."})
            return
        }
    } catch (error) {
        console.error(error) // Debug.
        res.status(500).json({message: "Error retrieving all laporan."})
        return
    }
}

async function updateLaporan(req: Request, res: Response) {}

async function deleteLaporan(req: Request, res: Response) {}

export default {
    createLaporan,
    getLaporan,
    getPekerjaanLaporans,
    getLaporans,
    updateLaporan,
    deleteLaporan
}