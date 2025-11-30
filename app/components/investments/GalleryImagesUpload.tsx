import { X } from "lucide-react";
import { Controller, useWatch } from "react-hook-form";
import { useRef, useEffect } from "react";

interface GalleryImagesUploadProps {
  control: any;
  errors: any;
  defaultPreviews?: string[];
  setValue?: (name: string, value: any) => void;
}

export function GalleryImagesUpload({
  control,
  errors,
  defaultPreviews = [],
  setValue,
}: GalleryImagesUploadProps) {
  const hydrated = useRef(false);

  // Watch current field value
  const currentValue = useWatch({
    control,
    name: "galleryImages",
    defaultValue: [],
  });

  useEffect(() => {
    // Only run once when field is empty and we have default previews
    if (
      !hydrated.current &&
      defaultPreviews.length > 0 &&
      Array.isArray(currentValue) &&
      currentValue.length === 0
    ) {
      const merged = [...defaultPreviews];
      if (setValue) {
        setValue("galleryImages", merged);
      }
      hydrated.current = true;
    }
  }, []); // empty dependency array ensures this runs only once

  return (
    <Controller
      name="galleryImages"
      control={control}
      render={({ field }) => {
        const value: (File | string)[] = field.value ?? [];

        const previews = value.map((item) =>
          typeof item === "string" ? item : URL.createObjectURL(item)
        );

        const handleRemove = (index: number) => {
          const updated = [...value];
          updated.splice(index, 1);
          field.onChange(updated);
        };

        return (
          <>
            <label className="relative block h-48 w-full border-4 border-dotted rounded-md cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const selected = Array.from(e.target.files || []);
                  const updated = [...value, ...selected];
                  field.onChange(updated);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-sm text-center">
                  Upload gallery images (multiple)
                </p>
              </div>
            </label>

            {errors?.galleryImages && (
              <p className="text-sm text-red-500 mt-1">
                {errors.galleryImages.message}
              </p>
            )}

            <div className="flex flex-wrap gap-3 mt-4">
              {previews.map((src, index) => (
                <div key={index} className="relative inline-block">
                  <img
                    src={src}
                    alt={`preview-${index}`}
                    className="w-32 h-20 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full p-1 transform translate-x-1/2 -translate-y-1/2 hover:bg-red-700"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </>
        );
      }}
    />
  );
}
