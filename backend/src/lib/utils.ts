import sharp from "sharp"
import cloudinary from 'cloudinary'

export async function uploadImages(
    files: Express.Multer.File[], 
    namaMitra: string,
    nomorKontrak: string,
    namaPekerjaan: string,
    namaAktivitas: string,
    tanggal: string
): Promise<string[]> {
    // Initiating the image url's response
    const uploadedImageUrls: string[] = []
    // Looping through each image
    for (const file of files) {
        try {
            // Optimize the image with 800 px width and 80% quality of the original image, format it into a WEBP image, and turn it into a raw binary
            const optimizedBuffer = await sharp(file.buffer)
                .resize({width: 800})
                .webp({quality: 80})
                .toBuffer()
            // Uploading the optimized image into the cloudinary with WEBP format.
                // Creating the folder path
            const folderPath = `Mitra Telkom Property/${namaMitra}/Nomor_Kontrak[${nomorKontrak}]/Nama_Pekerjaan[${namaPekerjaan}]/${tanggal}/${namaAktivitas}/`
            const uploadResult = await new Promise<cloudinary.UploadApiResponse>((resolve, reject) => {
                const uploadStream = cloudinary.v2.uploader.upload_stream({
                    folder: folderPath,
                    format: 'webp'
                }, (error, result) => {
                    if (error) {
                        reject(error)
                    } else if (result) {
                        resolve(result)
                    } else {
                        reject(new Error("Upload result is undefined"))
                    }
                    
                })
                uploadStream.end(optimizedBuffer)
            }) 
            // Pushing the image url into the image url's array
            uploadedImageUrls.push(uploadResult.secure_url)
                
        } catch (error) {
            console.error(`Failed to process or upload image: ${error}`) // Debug.
            throw new Error("Failed to upload images.")
        }
    }
    return uploadedImageUrls
}
