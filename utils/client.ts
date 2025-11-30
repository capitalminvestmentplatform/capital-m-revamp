import {
  AggregatedClosingBalanceProps,
  PortfolioItemProps,
} from "@/types/pandaConnect";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

// Define the shape of your token's payload
type TokenPayload = {
  id: string; // adjust according to your token structure
  role: string; // optional, adjust as needed
  email: string; // optional, adjust as needed
  portfolioId: number; // optional, adjust as needed
  name: string;
  // ... other claims if needed
};

export const convertImageUrlToBase64 = async (
  url: string
): Promise<string | null> => {
  try {
    const res = await fetch(url, { mode: "cors" });
    const blob = await res.blob();

    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Failed to convert image to base64:", error);
    return null;
  }
};

const base64ToFile = (base64: string, filename: string): File => {
  const arr = base64.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
};

export const processTiptapImages = async (
  html: string,
  folder: string
): Promise<string> => {
  const imgTagRegex = /<img[^>]+src="([^">]+)"/g;
  let match: RegExpExecArray | null;
  const uploads: { original: string; uploaded: string }[] = [];

  while ((match = imgTagRegex.exec(html)) !== null) {
    const src = match[1];

    if (!src.startsWith("data:image") || src.includes("res.cloudinary.com"))
      continue;

    try {
      const folderName =
        process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER_NAME + folder;

      const file = base64ToFile(src, "editor-image.png"); // name can be dynamic
      const uploadedUrl = await uploadFileToCloudinary(file, folderName);

      if (uploadedUrl) {
        uploads.push({ original: src, uploaded: uploadedUrl });
      }
    } catch (error) {
      console.error("Error processing image:", error);
    }
  }

  let updatedHtml = html;
  for (const { original, uploaded } of uploads) {
    updatedHtml = updatedHtml.replace(original, uploaded);
  }

  return updatedHtml;
};

export const uploadFileToCloudinary = async (
  file: File,
  folder: string
): Promise<string | null> => {
  const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    process.env.NEXT_PUBLIC_CLOUDINARY_PRESET || ""
  );

  const folderName = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER_NAME + folder;
  formData.append("folder", folderName);

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
};

export const getLoggedInUser = (): TokenPayload | null => {
  const token = Cookies.get("token");

  if (token) {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      return decoded; // or decoded.email, depending on your requirement
    } catch (error) {
      console.error("Invalid token", error);

      return null;
    }
  }

  return null;
};

export const calculatePortfolioSums = (data: PortfolioItemProps[]) => {
  const toCamelCase = (str: string) =>
    str
      .replace(/\s(.)/g, (match) => match.toUpperCase())
      .replace(/\s/g, "")
      .replace(/^(.)/, (match) => match.toLowerCase());

  const aggregatedData: Record<string, AggregatedClosingBalanceProps> = {};

  for (const item of data) {
    const userKey = `${item.email}-${item.clientCode}`;
    const subCategory = toCamelCase(item.subCategory);

    if (!aggregatedData[userKey]) {
      aggregatedData[userKey] = {
        email: item.email,
        clientCode: item.clientCode,
        cash: 0,
        equity: 0,
        fixedIncome: 0,
        realEstate: 0,
      };
    }

    (aggregatedData[userKey] as any)[subCategory] =
      (aggregatedData[userKey] as any)[subCategory] + item.marketValue || 0;
  }

  return Object.values(aggregatedData);
};

export const fetchCategories = async () => {
  try {
    const response = await fetch("/api/categories");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();

    return data.data;
  } catch (error) {
    return (error as Error).message;
  }
};
