import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'manivya-demo',
  api_key: process.env.CLOUDINARY_API_KEY || '123456789',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'secret',
});

export const uploadToCloudinary = async (fileBuffer: Buffer, folder: string = 'manivya'): Promise<string> => {
  return new Promise((resolve) => {
    const isPlaceholder =
      !process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_API_KEY === '123456789012345' ||
      process.env.CLOUDINARY_CLOUD_NAME === 'manivya-cloud' ||
      process.env.CLOUDINARY_CLOUD_NAME === 'manivya-demo';

    if (isPlaceholder) {
      const base64 = `data:image/png;base64,${fileBuffer.toString('base64')}`;
      return resolve(base64);
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error || !result) {
          const base64 = `data:image/png;base64,${fileBuffer.toString('base64')}`;
          return resolve(base64);
        }
        resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

export default cloudinary;
