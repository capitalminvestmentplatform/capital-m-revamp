"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fetchCategories, uploadFileToCloudinary } from "@/utils/client";
import { investmentSchema } from "../../../../components/investments/InvestmentSchema";
import { toast } from "sonner";
import { InvestmentForm } from "../../../../components/investments/InvestmentForm";

const EditInvestmentPage = () => {
  const { id } = useParams();
  const router = useRouter();

  const [loadingAction, setLoadingAction] = useState<
    "draft" | "publish" | null
  >(null);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mediaPreview, setMediaPreview] = useState({
    featuredImage: "",
    video: "",
    galleryImages: [] as string[],
    docs: [] as string[],
  });

  const form = useForm({
    resolver: zodResolver(investmentSchema(!!id)),
    defaultValues: {
      galleryImages: [],
      docs: [],
      faqs: [{ question: "", answer: "" }],
      status: true,
    },
  });

  useEffect(() => {
    fetchInitialData();
    fetchCategoryList();
  }, [id]);

  const formatDate = (date: string) =>
    new Date(date).toISOString().split("T")[0];

  const fetchInitialData = async () => {
    try {
      const response = await fetch(`/api/products/${id}`);

      const result = await response.json();

      if (result.statusCode !== 200) {
        toast.error(result.message);
        throw new Error(result.message);
      }

      const product = result.data;

      setMediaPreview({
        featuredImage: product.featuredImage || "",
        galleryImages: product.galleryImages || [],
        video: product.video || "",
        docs: product.docs || [],
      });

      // Populate form
      form.reset({
        ...product,
        status: !!product.status,
        category: product.category || "",
        activationDate: formatDate(product.activationDate),
        commitmentDeadline: formatDate(product.commitmentDeadline),
        expirationDate: formatDate(product.expirationDate),
        expectedValue: product.expectedValue.toString(),
        currentValue: product.currentValue.toString(),
        // projectedReturn: product.projectedReturn.toString(),
        investmentDuration: product.investmentDuration.toString(),
        minInvestment: product.minInvestment.toString(),
        subscriptionFee: product.subscriptionFee.toString(),
        managementFee: product.managementFee.toString(),
        performanceFee: product.performanceFee.toString(),
        faqs:
          product.faqs.length > 0
            ? product.faqs
            : [{ question: "", answer: "" }],
        featuredImage: product.featuredImage ?? null,
        galleryImages: product.galleryImages ?? [],
        video: product.video ?? null,
        docs: product.docs ?? [],
      });

      setMediaPreview({
        featuredImage: product.featuredImage,
        video: product.video,
        galleryImages: product.galleryImages,
        docs: product.docs,
      });
    } catch (err: any) {
      toast.error("Failed to fetch investment data.");
      console.error(err);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryList = async () => {
    const cats = await fetchCategories();
    setCategories(cats.map((cat: any) => ({ _id: cat._id, name: cat.name })));
  };

  const onSubmit = async (data: any, isDraft: boolean = false) => {
    try {
      if (isDraft) {
        setLoadingAction("draft");
      } else {
        setLoadingAction("publish");
      }

      // Upload featuredImage if it's a File
      let featuredImage = data.featuredImage;
      if (featuredImage instanceof File) {
        featuredImage = await uploadFileToCloudinary(
          featuredImage,
          `investments/${data.title}/featured`
        );
      }

      // Upload video if it's a File
      let video = data.video;
      if (video instanceof File) {
        video = await uploadFileToCloudinary(
          video,
          `investments/${data.title}/videos`
        );
      }

      // Upload galleryImages if any are Files
      let galleryImages: string[] = [];
      if (Array.isArray(data.galleryImages)) {
        const uploaded = await Promise.all(
          data.galleryImages.map(async (item: any) =>
            item instanceof File
              ? await uploadFileToCloudinary(
                  item,
                  `investments/${data.title}/gallery`
                )
              : item
          )
        );
        galleryImages = uploaded.filter(Boolean);
      }

      // Upload docs if any are Files
      let docs: string[] = [];
      if (Array.isArray(data.docs)) {
        const uploaded = await Promise.all(
          data.docs.map(async (item: any) =>
            item instanceof File
              ? await uploadFileToCloudinary(
                  item,
                  `investments/${data.title}/docs`
                )
              : item
          )
        );
        docs = uploaded.filter(Boolean);
      }

      // Format final data
      const formattedData = {
        ...data,
        featuredImage,
        video,
        galleryImages,
        docs,
        faqs: Array.isArray(data.faqs)
          ? data.faqs.filter(
              (faq: any) => faq.question?.trim() || faq.answer?.trim()
            )
          : [],
        expectedValue: +data.expectedValue,
        currentValue: +data.currentValue,
        projectedReturn: data.projectedReturn,
        investmentDuration: +data.investmentDuration,
        minInvestment: +data.minInvestment,
        subscriptionFee: +data.subscriptionFee,
        managementFee: +data.managementFee,
        performanceFee: +data.performanceFee,
        isDraft,
        status: isDraft ? false : data.status,
      };

      // Submit via PUT
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });

      const response = await res.json();

      if (!res.ok) throw new Error(response.message);

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

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;

  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="container mx-auto max-w-[1440px] px-4">
      <p className="text-xl font-semibold mb-5">Edit Investment</p>

      <InvestmentForm
        form={form}
        onSubmit={onSubmit}
        categories={categories}
        loadingAction={loadingAction} // ✅ pass here
        mediaPreview={{
          featuredImage: mediaPreview?.featuredImage,
          galleryImages: mediaPreview?.galleryImages,
          video: mediaPreview?.video,
          docs: mediaPreview?.docs,
        }}
        fetchCategories={fetchCategoryList} // ✅ added
      />
    </div>
  );
};

export default EditInvestmentPage;
