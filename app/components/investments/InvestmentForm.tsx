"use client";

import {
  useFieldArray,
  Controller,
  UseFormReturn,
  useWatch,
} from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import RichTextEditor from "@/app/components/textEditor/RichTextEditor";
import CustomButton from "@/app/components/Button";
import { FeaturedImageUpload } from "./FeaturedImageUpload";
import { GalleryImagesUpload } from "./GalleryImagesUpload";
import { VideoUpload } from "./VideoUpload";
import { DocumentsUpload } from "./DocumentsUpload";
import { InvestmentField } from "./InvestmentField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ManageCategoriesModal } from "../modals/ManageCategoriesModal";
import { useEffect } from "react";

interface InvestmentFormProps {
  form: UseFormReturn<any>;
  onSubmit: (data: any, isDraft?: boolean) => void; // ✅ allow isDraft
  categories: { _id: string; name: string }[];
  onError?: (errors: any) => void;
  fetchCategories: () => Promise<void>;
  mediaPreview?: {
    featuredImage?: string;
    galleryImages?: string[];
    video?: string;
    docs?: string[];
  };
}

export const InvestmentForm = ({
  form,
  onSubmit,
  loadingAction,
  categories,
  onError = () => toast.error("❌ Please fix the form errors."),
  mediaPreview,
  fetchCategories,
}: InvestmentFormProps & { loadingAction?: "draft" | "publish" | null }) => {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  // Watches for conditional UI
  const prType = useWatch({ control, name: "projectedReturn.type" });
  const prMode = useWatch({ control, name: "projectedReturn.mode" });

  useEffect(() => {
    if (!prType)
      setValue("projectedReturn.type", "percentage", { shouldValidate: false });
    if (!prMode)
      setValue("projectedReturn.mode", "fixed", { shouldValidate: false });
  }, [prType, prMode, setValue]);

  // keep the existing effects that clear irrelevant fields:
  useEffect(() => {
    if (prMode === "fixed") {
      setValue("projectedReturn.minValue", undefined, { shouldValidate: true });
      setValue("projectedReturn.maxValue", undefined, { shouldValidate: true });
    } else if (prMode === "range") {
      setValue("projectedReturn.fixedValue", undefined, {
        shouldValidate: true,
      });
    }
  }, [prMode, setValue]);

  useEffect(() => {
    if (prType === "amount") {
      const c = form.getValues("projectedReturn.currency");
      if (!c)
        setValue("projectedReturn.currency", "AED", { shouldValidate: false });
    } else if (prType === "percentage") {
      setValue("projectedReturn.currency", undefined, {
        shouldValidate: false,
      });
    }
  }, [prType, form, setValue]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "faqs",
  });

  const handleDraft = () => {
    handleSubmit((data) => {
      onSubmit(data, true);
    }, onError)();
  };

  return (
    <form
      className="grid lg:grid-cols-[70%_30%] gap-4"
      onSubmit={handleSubmit((data) => onSubmit(data, false), onError)} // ✅ default: not a draft
    >
      <div>
        {/* Main Left Section */}
        <div className="flex flex-col lg:flex-row gap-4">
          <InvestmentField
            name="title"
            label="Title"
            placeholder="Enter title"
            register={register}
            errors={errors}
            classes="lg:w-1/2"
          />
          <InvestmentField
            name="tagline"
            label="Tagline"
            placeholder="Enter tagline"
            register={register}
            errors={errors}
            classes="lg:w-1/2"
          />
        </div>

        <div className="mt-5">
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <RichTextEditor content={field.value} onChange={field.onChange} />
            )}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-4 mt-5">
          <InvestmentField
            name="investmentType"
            label="Investment Type"
            placeholder="Enter Investment Type"
            register={register}
            errors={errors}
          />
          <InvestmentField
            name="expectedValue"
            label="Expected Value"
            placeholder="Enter Expected Value"
            register={register}
            errors={errors}
            type="number"
          />
          <InvestmentField
            name="currentValue"
            label="Current Value"
            placeholder="Enter Current Value"
            register={register}
            errors={errors}
            type="number"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-4 mt-5">
          <InvestmentField
            name="activationDate"
            label="Activation Date"
            type="date"
            placeholder="Enter Activation Date"
            register={register}
            errors={errors}
          />
          <InvestmentField
            name="commitmentDeadline"
            label="Commitment Deadline"
            type="date"
            placeholder="Enter Commitment Deadline"
            register={register}
            errors={errors}
          />
          <InvestmentField
            name="expirationDate"
            label="Expiry Date"
            type="date"
            placeholder="Enter Expiry Date"
            register={register}
            errors={errors}
          />
        </div>

        <Tabs defaultValue="thumbnail" className="mx-auto mt-5">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="thumbnail" className="lg:hidden">
              Thumbnail
            </TabsTrigger>
            <TabsTrigger value="thumbnail" className="hidden lg:block">
              Thumbnail (1200x675)
            </TabsTrigger>
            <TabsTrigger value="gallery">Gallery Images</TabsTrigger>
            <TabsTrigger value="video">Video</TabsTrigger>
          </TabsList>
          <TabsContent value="thumbnail">
            <Card className="p-6">
              <FeaturedImageUpload
                control={control}
                errors={errors}
                defaultPreview={mediaPreview?.featuredImage}
              />
            </Card>
          </TabsContent>
          <TabsContent value="gallery">
            <Card className="p-6">
              <GalleryImagesUpload
                control={control}
                errors={errors}
                setValue={setValue}
                defaultPreviews={mediaPreview?.galleryImages}
              />
            </Card>
          </TabsContent>
          <TabsContent value="video">
            <Card className="p-6">
              <VideoUpload
                control={control}
                errors={errors}
                defaultPreview={mediaPreview?.video}
              />
            </Card>
          </TabsContent>
        </Tabs>

        <Tabs defaultValue="document" className="mx-auto mt-5">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="document">Documents</TabsTrigger>
            <TabsTrigger value="terms" className="lg:hidden">
              Terms
            </TabsTrigger>
            <TabsTrigger value="terms" className="hidden lg:block">
              Terms & Conditions
            </TabsTrigger>
            <TabsTrigger value="faqs">FAQs</TabsTrigger>
          </TabsList>
          <TabsContent value="document">
            <Card className="p-6">
              <DocumentsUpload
                control={control}
                errors={errors}
                defaultPreviews={mediaPreview?.docs}
              />
            </Card>
          </TabsContent>
          <TabsContent value="terms">
            <Card className="p-6">
              <Controller
                name="terms"
                control={control}
                render={({ field }) => (
                  <RichTextEditor
                    content={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </Card>
          </TabsContent>
          <TabsContent value="faqs">
            <Card className="p-6">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="mb-4 space-y-2 border p-3 rounded"
                >
                  <InvestmentField
                    name={`faqs.${index}.question`}
                    label="Question"
                    placeholder="Enter question"
                    register={register}
                    errors={errors}
                  />
                  <InvestmentField
                    name={`faqs.${index}.answer`}
                    label="Answer"
                    placeholder="Enter answer"
                    register={register}
                    errors={errors}
                  />
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-red-500 mt-2 text-sm"
                  >
                    Remove FAQ
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => append({ question: "", answer: "" })}
                className="text-blue-600 font-medium text-sm"
              >
                + Add FAQ
              </button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Sidebar */}
      <div>
        <div className="flex gap-4">
          <CustomButton
            type="button"
            classes="me-3 bg-primaryBG w-full"
            name={watch("isDraft") ? "Save Draft Changes" : "Save Draft"}
            onClick={handleDraft}
            disabled={loadingAction === "publish" || watch("isPublished")} // Disable only if publishing
            state={loadingAction === "draft"} // Show loading only when saving draft
          />
          <CustomButton
            type="submit"
            classes="me-3 bg-primaryBG w-full"
            name={watch("isPublished") ? "Edit" : "Publish Now"}
            disabled={loadingAction === "draft"} // Disable only if saving draft
            state={loadingAction === "publish"} // Show loading only when publishing
          />
        </div>

        {/* <InvestmentField
          name="projectedReturn"
          label="Projected Return (%)"
          placeholder="Enter Projected Return"
          register={register}
          errors={errors}
          classes="mt-5"
          type="number"
        /> */}
        {/* Projected Return */}
        <div className="mt-5 space-y-3">
          <Label className="font-medium">Projected Return</Label>

          <div className="grid grid-cols-2 gap-3">
            <Controller
              name="projectedReturn.type"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="amount">Amount (e.g., AED)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />

            <Controller
              name="projectedReturn.mode"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed</SelectItem>
                    <SelectItem value="range">Range</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Currency (only for amount) */}
          {/* {prType === "amount" && (
            <InvestmentField
              name="projectedReturn.currency"
              label="Currency"
              placeholder="AED"
              register={register}
              errors={errors}
            />
          )} */}

          {/* Fixed value */}
          {prMode === "fixed" && (
            <InvestmentField
              name="projectedReturn.fixedValue"
              label={
                prType === "percentage"
                  ? "Fixed Value (%)"
                  : "Fixed Value (Amount)"
              }
              placeholder={prType === "percentage" ? "e.g. 20" : "e.g. 200000"}
              register={register}
              errors={errors}
              type="number"
            />
          )}

          {/* Range values */}
          {prMode === "range" && (
            <div className="grid lg:grid-cols-2 gap-3">
              <InvestmentField
                name="projectedReturn.minValue"
                label={prType === "percentage" ? "Min (%)" : "Min (Amount)"}
                placeholder={
                  prType === "percentage" ? "e.g. 10" : "e.g. 100000"
                }
                register={register}
                errors={errors}
                type="number"
              />
              <InvestmentField
                name="projectedReturn.maxValue"
                label={prType === "percentage" ? "Max (%)" : "Max (Amount)"}
                placeholder={
                  prType === "percentage" ? "e.g. 20" : "e.g. 150000"
                }
                register={register}
                errors={errors}
                type="number"
              />
            </div>
          )}

          {/* Top-level projectedReturn error (if any general error bubbles up) */}
          {errors.projectedReturn &&
            typeof errors.projectedReturn?.message === "string" && (
              <p className="text-sm text-red-500">
                {errors.projectedReturn?.message as string}
              </p>
            )}
        </div>

        <InvestmentField
          name="investmentDuration"
          label="Investment Duration (years)"
          placeholder="Enter Investment Duration"
          register={register}
          errors={errors}
          classes="mt-5"
          type="number"
        />
        <InvestmentField
          name="minInvestment"
          label="Minimum Investment (AED)"
          placeholder="Enter Minimum Investment"
          register={register}
          errors={errors}
          classes="mt-5"
          type="number"
        />

        <div className="flex flex-col lg:flex-row gap-4 mt-5">
          <InvestmentField
            name="state"
            label="State"
            placeholder="Enter State"
            register={register}
            errors={errors}
            classes="lg:w-1/2"
          />
          <InvestmentField
            name="area"
            label="Area"
            placeholder="Enter Area"
            register={register}
            errors={errors}
            classes="lg:w-1/2"
          />
        </div>

        <div className="mt-5">
          <div className="flex gap-2 mb-2 items-center">
            <Label htmlFor="category">Category</Label>
            <p className="text-red-500 text-xs">(Required)</p>
            <ManageCategoriesModal
              fetchCategories={fetchCategories}
              categories={categories}
            />
          </div>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <div>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat, index) => (
                      <SelectItem key={index} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.category.message as string}
                  </p>
                )}
              </div>
            )}
          />
        </div>

        <div className="flex items-center mt-5 space-x-2">
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Switch
                id="status"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label htmlFor="status">Active</Label>
        </div>

        <InvestmentField
          name="subscriptionFee"
          label="Subscription Fee (AED)"
          placeholder="Enter Subscription Fee"
          register={register}
          errors={errors}
          classes="mt-5"
          type="number"
        />
        <InvestmentField
          name="managementFee"
          label="Management Fee (AED)"
          placeholder="Enter Management Fee"
          register={register}
          errors={errors}
          classes="mt-5"
          type="number"
        />
        <InvestmentField
          name="performanceFee"
          label="Performance Fee (AED)"
          placeholder="Enter Performance Fee"
          register={register}
          errors={errors}
          classes="mt-5"
          type="number"
        />
      </div>
    </form>
  );
};
