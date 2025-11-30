import { Controller } from "react-hook-form";

interface VideoUploadProps {
  control: any;
  errors: any;
  defaultPreview?: string; // ✅ for Cloudinary video
}

export function VideoUpload({
  control,
  errors,
  defaultPreview,
}: VideoUploadProps) {
  return (
    <Controller
      name="video"
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
                accept="video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    field.onChange(file);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-sm text-center">Attach video</p>
              </div>
            </label>

            {errors?.video && (
              <p className="text-sm text-red-500 mt-1">
                {errors.video.message}
              </p>
            )}

            {previewUrl && (
              <div className="mt-3 space-y-2 relative w-full max-w-md">
                <video controls src={previewUrl} className="w-full rounded" />
                <button
                  type="button"
                  onClick={() => field.onChange(undefined)}
                  className="mt-2 text-red-500 text-xs font-medium hover:underline"
                >
                  Remove Video
                </button>
              </div>
            )}
          </>
        );
      }}
    />
  );
}
