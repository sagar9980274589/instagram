import multer from 'multer';
import fs from 'fs';
import sharp from 'sharp'; // Import sharp
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config({});

cloudinary.config({ 
    cloud_name: process.env.API_CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET 
});

const upload = multer({ dest: 'uploads/' });

const optimizeImage = async (filePath) => {
    const optimizedPath = filePath + '-optimized.webp'; // Save optimized version
    try {
        await sharp(filePath)
            .resize(1080, 1080, { fit: 'inside' }) // Resize to max 1080x1080 (optional)
            .webp({ quality: 80 }) // Convert to WebP with 80% quality
            .toFile(optimizedPath);
        return optimizedPath;
    } catch (err) {
        console.error('Error optimizing image:', err);
        throw err;
    }
};

const uploadToCloudinary = async (filePath) => {
    try {
        const optimizedPath = await optimizeImage(filePath);

        const result = await cloudinary.uploader.upload(optimizedPath, { folder: 'uploads' });

        // Delete both original and optimized images
        fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting original file:', err);
        });

        fs.unlink(optimizedPath, (err) => {
            if (err) console.error('Error deleting optimized file:', err);
        });

        return result.secure_url;
    } catch (error) {
        throw error;
    }
};

export { upload, uploadToCloudinary };
