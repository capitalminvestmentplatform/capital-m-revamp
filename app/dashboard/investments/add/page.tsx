"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchCategories, processTiptapImages } from "../../../../utils/client";
import { investmentSchema } from "../../../components/investments/InvestmentSchema";
import { InvestmentForm } from "../../../components/investments/InvestmentForm";
import { uploadFileToCloudinary } from "@/utils/client";

const AddInvestmentPage = () => {
  const form = useForm({
    resolver: zodResolver(investmentSchema(false)),
    defaultValues: {
      galleryImages: [],
      docs: [], // ✅ important
      faqs: [{ question: "", answer: "" }], // ✅ initial one row
      status: true,
      projectedReturn: { type: "percentage", mode: "fixed", currency: "AED" },
    },
  });

  const router = useRouter();

  const [categories, setCategories] = useState<{ _id: string; name: string }[]>(
    []
  );
  const [loadingAction, setLoadingAction] = useState<
    "draft" | "publish" | null
  >(null);

  useEffect(() => {
    fetchCategoryList();
  }, []);

  const fetchCategoryList = async () => {
    const categories = await fetchCategories();

    setCategories(
      categories.map((category: { _id: string; name: string }) => ({
        _id: category._id,
        name: category.name,
      }))
    );
  };

  const onSubmit = async (data: any, isDraft: boolean = false) => {
    let description = data.description || "";
    if (data.description) {
      // Process images in the description
      description = await processTiptapImages(
        description,
        `investments/description`
      );
    }

    let formattedData = {
      ...data,
      expectedValue: +data.expectedValue,
      currentValue: +data.currentValue,
      projectedReturn: data.projectedReturn,
      investmentDuration: +data.investmentDuration,
      minInvestment: +data.minInvestment,
      subscriptionFee: +data.subscriptionFee,
      managementFee: +data.managementFee,
      performanceFee: +data.performanceFee,
      isDraft,
      description,
      status: isDraft ? false : data.status, // ✅ Auto-set status = false if saving as draft
    };

    try {
      if (isDraft) {
        setLoadingAction("draft");
      } else {
        setLoadingAction("publish");
      }

      // Upload featured image
      if (formattedData.featuredImage instanceof File) {
        const uploadedUrl = await uploadFileToCloudinary(
          formattedData.featuredImage,
          `investments/featured`
        );
        if (uploadedUrl) {
          formattedData.featuredImage = uploadedUrl;
        }
      }

      // Upload video
      if (formattedData.video instanceof File) {
        const uploadedUrl = await uploadFileToCloudinary(
          formattedData.video,
          `investments/videos`
        );
        if (uploadedUrl) {
          formattedData.video = uploadedUrl;
        }
      }

      // Upload gallery images
      if (Array.isArray(formattedData.galleryImages)) {
        const galleryUrls = await Promise.all(
          formattedData.galleryImages.map(async (file: any) =>
            (typeof window !== "undefined" && file instanceof window.File) ||
            (file && file.constructor && file.constructor.name === "File")
              ? await uploadFileToCloudinary(file, `investments/gallery`)
              : file
          )
        );
        formattedData.galleryImages = galleryUrls.filter(Boolean);
      }

      // Upload docs
      if (Array.isArray(formattedData.docs)) {
        const docUrls = await Promise.all(
          formattedData.docs.map(async (file: any) =>
            (typeof window !== "undefined" && file instanceof window.File) ||
            (file && file.constructor && file.constructor.name === "File")
              ? await uploadFileToCloudinary(file, `investments/docs`)
              : file
          )
        );
        formattedData.docs = docUrls.filter(Boolean);
      }

      const res = await fetch("/api/products", {
        method: "POST",
        body: JSON.stringify({
          ...formattedData,
          faqs: JSON.stringify(formattedData.faqs),
        }),
      });

      const response = await res.json();

      if (response.statusCode !== 201) {
        toast.error(response.message);
        throw new Error(response.message);
      }

      toast.success(response.message);

      setTimeout(() => {
        router.push("/dashboard/investments");
      }, 2000);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoadingAction(null);
    }
  };

  // const onSubmit = async (data: any, isDraft: boolean = false) => {
  //   console.log("data", data);
  // };
  return (
    <div>
      <div className="container mx-auto max-w-[1440px] px-4">
        <p className="text-xl font-semibold mb-5">Add New Investment</p>
        <InvestmentForm
          form={form}
          onSubmit={onSubmit}
          categories={categories}
          loadingAction={loadingAction} // ✅ pass here
          fetchCategories={fetchCategoryList} // ✅ added
        />
      </div>
    </div>
  );
};

export default AddInvestmentPage;
