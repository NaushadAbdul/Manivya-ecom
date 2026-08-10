"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'manivya-demo',
    api_key: process.env.CLOUDINARY_API_KEY || '123456789',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'secret',
});
const uploadToCloudinary = async (fileBuffer, folder = 'manivya') => {
    return new Promise((resolve) => {
        const isPlaceholder = !process.env.CLOUDINARY_CLOUD_NAME ||
            process.env.CLOUDINARY_API_KEY === '123456789012345' ||
            process.env.CLOUDINARY_CLOUD_NAME === 'manivya-cloud' ||
            process.env.CLOUDINARY_CLOUD_NAME === 'manivya-demo';
        if (isPlaceholder) {
            const base64 = `data:image/png;base64,${fileBuffer.toString('base64')}`;
            return resolve(base64);
        }
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({ folder, resource_type: 'auto' }, (error, result) => {
            if (error || !result) {
                const base64 = `data:image/png;base64,${fileBuffer.toString('base64')}`;
                return resolve(base64);
            }
            resolve(result.secure_url);
        });
        uploadStream.end(fileBuffer);
    });
};
exports.uploadToCloudinary = uploadToCloudinary;
exports.default = cloudinary_1.v2;
