import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";

function parseBodyData(req: Request, res: Response, next: NextFunction) {
    try {
        console.log("Validating Laporan Request...") // Debug.
        
        if (req.body && req.body.data) {
            try {
                const parsedData = JSON.parse(req.body.data);
                req.body = { ...req.body, ...parsedData };
            } catch (error) {
                res.status(400).json({ message: "Invalid JSON in body.data" });
                return
            }
        }
        
        next();
    } catch (error) {
        res.status(400).send()
        return
    }
    
}

export function validateNumberOfFiles(req: Request, res: Response, next: NextFunction) {
    
    console.log('Validating Number of Images...') // Debug.
    try {
        const files = req.files as Express.Multer.File[]
        const {aktivitas_arr} = req.body
        
        const expectedFileCount = aktivitas_arr.length * 2
        
        if (files.length != expectedFileCount) {
            res.status(400).json({
                message: `Expected ${expectedFileCount} images for ${aktivitas_arr.length} aktivitas. Received ${files.length} instead.`
            })
            return
        }
        
        console.log("Number of Images Validated. Proceeding to the controller...") // Debug.
        
        next() 
        
    } catch (error) {
        res.status(400).send()
        return
    }
}

async function handleValidationErrors (req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({errors: errors.array()})
        return
    }
    
    console.log("Request Validated. Proceeding to the next middleware ...") // Debug.
    
    next()
}

export const validateUserRequest = [
    body("nama_lengkap").isString().notEmpty().withMessage("Nama lengkap user must be a string."),
    body("email").trim().isEmail().notEmpty().withMessage("Email user must be valid."),
    body("nomor_telepon").isMobilePhone("any", {strictMode: true}).notEmpty().withMessage("Nomor telepon user must be a string."),
    body("nama_mitra").isString().notEmpty().withMessage("Nama mitra  user must be a string."),
    handleValidationErrors
]

export const validatePekerjaanRequest = [
    body("nama_mitra").isString().notEmpty().withMessage("Nama mitra pekerjaan must be a string."),
    body("nomor_kontrak").isString().notEmpty().withMessage("Nomor kontrak pekerjaan must be a string."),
    body("pekerjaan_arr").isArray().withMessage("Pekerjaan must be an array."),
    body("pekerjaan_arr.*").isObject().withMessage("Each pekerjaan must be an object."),
    body("pekerjaan_arr.*.nama").isString().notEmpty().withMessage("Nama pekerjaan must be a string."),
    body("pekerjaan_arr.*.lokasi").isString().notEmpty().withMessage("Lokasi pekerjaan must be a string."),
    handleValidationErrors
]

export const validateMitraRequest = [
    body("mitra").isObject().notEmpty().withMessage("Mitra must be an object."),
    body("mitra.nama").isString().notEmpty().withMessage("Nama mitra must be a string."),
    body("mitra.nomor_telepon").isMobilePhone("any", {strictMode: true}).notEmpty().withMessage("Nomor telepon mitra must be a string."),
    body("mitra.alamat").isString().notEmpty().withMessage("Alamat mitra must be a string."),
    body("kontrak").isObject().notEmpty().withMessage("Nomor kontrak mitra must be a string."),
    body("kontrak.nama").isString().notEmpty().withMessage("Nama kontrak mitra must be a string."),
    body("kontrak.nomor").isString().notEmpty().withMessage("Nomor kontrak mitra must be a string."),
    body("kontrak.tanggal").isISO8601().withMessage("Tanggal kontrak mitra must be a valid date."),
    body("kontrak.nilai").isInt({min: 1}).notEmpty().withMessage("Nilai kontrak mitra must be an integer."),
    body("kontrak.jangka_waktu").isInt({min: 1}).notEmpty().withMessage("Jangka waktu kontrak mitra must be an integer."),
    body("pekerjaan_arr").isArray().withMessage("Pekerjaan mitra must be an array."),
    body("pekerjaan_arr.*").isObject().withMessage("Each pekerjaan mitra must be an object."),
    body("pekerjaan_arr.*.nama").isString().notEmpty().withMessage("Nama pekerjaan mitra must be a string."),
    body("pekerjaan_arr.*.lokasi").isString().notEmpty().withMessage("Lokasi pekerjaan mitra must be a string."),
    body("user").isObject().notEmpty().withMessage("User mitra must be an object."),
    body("user.email").trim().isEmail().notEmpty().withMessage("Email user mitra must be valid."),
    body("user.nama_lengkap").isString().notEmpty().withMessage("Nama lengkap user mitra must be a string."),
    body("user.nomor_telepon").isMobilePhone("any", {strictMode: true}).notEmpty().withMessage("Nomor telepon user mitra must be a string."),
    handleValidationErrors
]

export const validateLaporanRequest = [
    parseBodyData,
    body("nama_mitra").isString().notEmpty().withMessage("Nama mitra laporan must be a string."),
    body("nomor_kontrak").isString().notEmpty().withMessage("Nomor kontrak laporan must be a string."),
    body("nama_pekerjaan").isString().notEmpty().withMessage("Nama pekerjaan laporan must be a string."),
    body("tanggal").isISO8601().withMessage("Tanggal laporan must be a valid date."),
    body("shift").isObject().notEmpty().withMessage("Shift laporan must be an object."),
    body("shift.nama").isString().notEmpty().withMessage("Nama shift laporan must be a string."),
    body("shift.waktu_mulai").matches(/^([01]?[0-9]|2[0-3]):([0-5]?[0-9]):([0-5]?[0-9])$/).withMessage("Waktu mulai shift laporan must be in 'hh:mm:ss' format."),
    body("shift.waktu_berakhir").matches(/^([01]?[0-9]|2[0-3]):([0-5]?[0-9]):([0-5]?[0-9])$/).withMessage("Waktu berakhir shift laporan must be in 'hh:mm:ss' format."),
    body("tenaga_kerja_arr").isArray().withMessage("Tenaga kerja laporan must be an array."),
    body("tenaga_kerja_arr.*").isObject().withMessage("Each tenaga kerja laporan must be an object."),
    body("tenaga_kerja_arr.*.tipe").isString().notEmpty().withMessage("Tipe tenaga kerja laporan must be a string."),
    body("tenaga_kerja_arr.*.peran").isString().notEmpty().withMessage("Peran tenaga kerja laporan must be a string."),
    body("tenaga_kerja_arr.*.jumlah").isInt({min: 1}).notEmpty().withMessage("Jumlah tenaga kerja laporan must be an integer."),
    body("aktivitas_arr").isArray().withMessage("Aktivitas laporan must be an array."),
    body("aktivitas_arr.*").isObject().withMessage("Each aktivitas laporan must be an object."),
    body("aktivitas_arr.*.tipe").isString().notEmpty().withMessage("Tipe aktivitas laporan must be a string."),
    body("aktivitas_arr.*.nama").isString().notEmpty().withMessage("Nama aktivitas laporan must be a string."),
    body("cuaca_arr").isArray().withMessage("Cuaca laporan must be an array."),
    body("cuaca_arr.*").isObject().withMessage("Each cuaca laporan must be an object."),
    body("cuaca_arr.*.tipe").isString().notEmpty().withMessage("Tipe cuaca laporan must be a string."),
    body("cuaca_arr.*.waktu").isString().notEmpty().withMessage("Waktu cuaca laporan must be a string."),
    body("cuaca_arr.*.waktu_mulai").optional().matches(/^([01]?[0-9]|2[0-3]):([0-5]?[0-9]):([0-5]?[0-9])$/).withMessage("Waktu mulai cuaca laporan must be in 'hh:mm:ss' format."),
    body("cuaca_arr.*.waktu_berakhir").optional().matches(/^([01]?[0-9]|2[0-3]):([0-5]?[0-9]):([0-5]?[0-9])$/).withMessage("Waktu berakhir cuaca laporan must be in 'hh:mm:ss' format."),   
    handleValidationErrors
]

export const validateKontrakRequest = [
    body("nama_mitra").isString().notEmpty().withMessage("Nama mitra kontrak must be a string."),
    body("nama").isString().notEmpty().withMessage("Nama kontrak must be a string."),
    body("nomor").isString().notEmpty().withMessage("Nomor kontrak must be a string."),
    body("tanggal").isISO8601().withMessage("Tanggal kontrak must be a valid date."),
    body("nilai").isInt({min: 1}).notEmpty().withMessage("Nilai kontrak must be an integer."),
    body("jangka_waktu").isInt({min: 1}).notEmpty().withMessage("Jangka waktu kontrak must be an integer."),
    handleValidationErrors
]