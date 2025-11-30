"use client";
import { X } from "lucide-react";
import { Controller } from "react-hook-form";

interface FeaturedImageUploadProps {
  control: any;
  errors: any;
  defaultPreview?: string; // ✅ for edit mode (Cloudinary URL)
}

export function FeaturedImageUpload({
  control,
  errors,
  defaultPreview,
}: FeaturedImageUploadProps) {
  return (
    <Controller
      name="featuredImage"
      control={control}
      render={({ field }) => {
        const file = field.value;
        const previewUrl =
          typeof file === "string"
            ? file
            : file instanceof File
              ? URL.createObjectURL(file)
              : defaultPreview || null;
        return (
          <>
            <label className="relative block h-48 w-full border-4 border-dotted rounded-md cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    field.onChange(file);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-sm text-center">Attach image (1200x675)</p>
              </div>
            </label>

            {errors?.featuredImage && (
              <p className="text-sm text-red-500 mt-1">
                {errors.featuredImage.message}
              </p>
            )}

            {previewUrl && (
              <div className="relative mt-10 inline-block">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-32 h-20 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => {
                    field.onChange(undefined);
                  }}
                  className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full p-1 transform translate-x-1/2 -translate-y-1/2 hover:bg-red-700"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </>
        );
      }}
    />
  );
}
