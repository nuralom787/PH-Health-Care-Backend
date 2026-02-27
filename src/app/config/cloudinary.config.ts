import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { env } from "./env";
import AppErrors from "../errorsHelpers/AppErrors";
import status from "http-status";

cloudinary.config({
    cloud_name: env.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY.CLOUDINARY_API_SECRET,
});

export const uploadFileToCloudinary = async (buffer: Buffer, fileName: string): Promise<UploadApiResponse> => {
    if (!buffer || fileName) {
        throw new AppErrors(status.BAD_REQUEST, "File Buffer & File Name are required for upload");
    };

    const extension = fileName.split(".").pop()?.toLowerCase();

    const fileNameWithoutExtension = fileName
        .split(".")
        .slice(0, -1)
        .join(".")
        .toLowerCase()
        .replace(/\s+/g, "-")
        // eslint-disable-next-line no-useless-escape
        .replace(/[^a-z0-9\-]/g, "");

    const uniqueName = Math.random().toString(36).substring(2) + "-" + Date.now() + "-" + fileNameWithoutExtension;

    const folder = extension === "pdf" ? "pdfs" : "images";

    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                resource_type: "auto",
                public_id: `ph-healthcare/${folder}/${uniqueName}`,
                folder: `ph-healthcare/${folder}`,
            },
            (error, result) => {
                if (error) {
                    return reject(new AppErrors(status.INTERNAL_SERVER_ERROR, "Failed to upload file to cloudinary"))
                }
                resolve(result as UploadApiResponse)
            }
        ).end(buffer);
    })

};

export const deleteFileFormCloudinary = async (url: string) => {
    try {
        const regex = /\/v\d+\/(.+?)(?:\.[a-zA-z0-9]+)+$/;

        const match = url.match(regex);

        if (match && match[1]) {
            const publicId = match[1];

            await cloudinary.uploader.destroy(publicId, {
                resource_type: "image"
            });

            console.log(`File ${publicId} deleted form cloudinary`);
        }
    } catch (err) {
        console.log("Error deleting image: ", err)
        throw new AppErrors(status.INTERNAL_SERVER_ERROR, "Failed to image form cloudinary");
    }
};

export const cloudinaryUpload = cloudinary;