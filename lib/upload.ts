import cloudinary from "@/lib/cloudinary";
import fs from "fs";
import { File } from "formidable";

export const uploadFileToCloudinaryNew = async (
  file: string,
  folder: string,
  publicId: string
) => {
  try {
    const upload = await cloudinary.uploader.upload(file, {
      folder,
      public_id: publicId,
      resource_type: "auto",
    });

    fs.unlinkSync(file); // Clean up temp file
    return upload.secure_url;
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
    throw new Error("File upload failed");
  }
};
export const uploadFileToCloudinary = async (file: File, folder: string) => {
  try {
    const isLargeFile = file.size > 100 * 1024 * 1024; // >100MB

    const upload = isLargeFile
      ? await cloudinary.uploader.upload_large(file.filepath, {
          folder,
          resource_type: "auto",
          chunk_size: 6_000_000, // 6MB chunks
        })
      : await cloudinary.uploader.upload(file.filepath, {
          folder,
          resource_type: "auto",
        });

    fs.unlinkSync(file.filepath); // Clean up temp file
    return upload.secure_url;
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
    throw new Error("File upload failed");
  }
};

export const uploadMultipleFilesToCloudinary = async (
  files: File[],
  folder: string
) => {
  const urls: string[] = [];

  for (const file of files) {
    if (file?.filepath && file?.originalFilename && file?.size > 0) {
      const url = await uploadFileToCloudinary(file, folder);
      urls.push(url);
    }
  }

  return urls;
};

// import cloudinary from "@/lib/cloudinary";
// import fs from "fs";
// import { File } from "formidable";
// import path from "path";

// /**
//  * Upload a single file to Cloudinary.
//  * @param file - The file object to be uploaded.
//  * @param folder - The folder name on Cloudinary where the file will be stored.
//  * @returns {string} The URL of the uploaded file.
//  */
// export const uploadFileToCloudinary = async (file: File, folder: string) => {
//   // Extract file extension
//   const ext = path.extname(file.originalFilename || "").toLowerCase();

//   // Determine resource type
//   let resourceType: "image" | "video" | "raw" = "image";
//   if (
//     [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".csv", ".zip"].includes(ext)
//   ) {
//     resourceType = "raw";
//   } else if ([".mp4", ".mov", ".avi", ".webm"].includes(ext)) {
//     resourceType = "video";
//   }
//   try {
//     const upload = await cloudinary.uploader.upload(file.filepath, {
//       folder,
//       resource_type: resourceType, // Supports images, videos, PDFs, etc.
//     });
//     fs.unlinkSync(file.filepath); // Clean up temp file
//     return upload.secure_url;
//   } catch (error) {
//     console.error("Error uploading file to Cloudinary:", error);
//     throw new Error("File upload failed");
//   }
// };

// /**
//  * Upload multiple files to Cloudinary.
//  * @param files - An array of file objects to be uploaded.
//  * @param folder - The folder name on Cloudinary where the files will be stored.
//  * @returns {string[]} The URLs of the uploaded files.
//  */
// export const uploadMultipleFilesToCloudinary = async (
//   files: File[],
//   folder: string
// ) => {
//   try {
//     const uploadPromises = files.map((file) =>
//       uploadFileToCloudinary(file, folder)
//     );
//     return await Promise.all(uploadPromises);
//   } catch (error) {
//     console.error("Error uploading multiple files to Cloudinary:", error);
//     throw new Error("Multiple file upload failed");
//   }
// };
