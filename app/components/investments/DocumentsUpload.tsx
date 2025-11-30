import { Controller } from "react-hook-form";

interface DocumentsUploadProps {
  control: any;
  errors: any;
  defaultPreviews?: string[]; // ✅ for existing document URLs
}

export function DocumentsUpload({
  control,
  errors,
  defaultPreviews = [],
}: DocumentsUploadProps) {
  return (
    <Controller
      name="docs"
      control={control}
      render={({ field }) => {
        const value: (File | string)[] = field.value ?? [];

        // Use defaultPreviews only if value is still empty
        const combinedDocs =
          value.length === 0 && defaultPreviews.length > 0
            ? defaultPreviews
            : value;

        const handleRemove = (index: number) => {
          const updated = [...combinedDocs];
          updated.splice(index, 1);
          field.onChange(updated);
        };

        return (
          <>
            <label className="relative block h-48 w-full border-4 border-dotted rounded-md cursor-pointer">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  const updated = [...combinedDocs, ...files];
                  field.onChange(updated);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-sm text-center">Attach documents</p>
              </div>
            </label>

            {errors?.docs && (
              <p className="text-sm text-red-500 mt-1">{errors.docs.message}</p>
            )}

            {combinedDocs.length > 0 && (
              <div className="mt-3 space-y-2">
                {combinedDocs.map((doc, index) => {
                  const isUrl = typeof doc === "string";
                  const safeUrl = isUrl
                    ? doc.includes("/upload/")
                      ? doc.replace("/upload/", "/upload/fl_attachment/")
                      : doc
                    : URL.createObjectURL(doc as File);

                  const displayName = isUrl
                    ? `Document ${index + 1}`
                    : (doc as File).name;

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-100 p-2 rounded"
                    >
                      <a
                        href={safeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 underline truncate max-w-[200px]"
                      >
                        {displayName}
                      </a>
                      <button
                        type="button"
                        onClick={() => handleRemove(index)}
                        className="ml-2 text-red-500 text-xs font-medium hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        );
      }}
    />
  );
}
