import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  size: number;
  width?: number;
  height?: number;
}

export const uploadFile = async (
  file: string | Buffer,
  options: {
    folder?: string;
    resource_type?: "auto" | "image" | "video" | "raw";
    public_id?: string;
  } = {}
): Promise<UploadResult> => {
  const result = await cloudinary.uploader.upload(
    typeof file === "string" ? file : `data:application/octet-stream;base64,${file.toString("base64")}`,
    {
      folder: options.folder || "writeprof",
      resource_type: options.resource_type || "auto",
      public_id: options.public_id,
    }
  );

  return {
    url: result.secure_url,
    publicId: result.public_id,
    format: result.format,
    size: result.bytes,
    width: result.width,
    height: result.height,
  };
};

export const deleteFile = async (publicId: string) => {
  return cloudinary.uploader.destroy(publicId);
};

export const getSignedUploadParams = (folder = "writeprof") => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!
  );
  return {
    timestamp,
    signature,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  };
};

export default cloudinary;
