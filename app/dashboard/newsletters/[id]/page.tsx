"use client";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { NewsletterProps } from "@/types/newsletter";

const NewsLetterPage = () => {
  const { id } = useParams();
  const [newsletter, setNewsletter] = useState<NewsletterProps>(
    {} as NewsletterProps
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNewsletter();
  }, [id]);

  const fetchNewsletter = async () => {
    try {
      const response = await fetch(`/api/newsletters/${id}`);

      const result = await response.json();

      if (result.statusCode !== 200) {
        setError(result.message);
        toast.error(result.message);
        throw new Error(result.message);
      }
      const newsletter = result.data;
      // loadSignatureCanvas();
      setNewsletter(newsletter);
    } catch (err: any) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const { subject, description, investmentTitle, category } = newsletter;

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;

  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="mt-10">
      <div className="flex flex-wrap gap-10 items-center justify-between">
        <p className="text-2xl">Newsletter Details</p>
      </div>
      <p className="text-sm mb-2 mt-10">
        Newsletter Title: <span className="font-semibold">{subject}</span>{" "}
      </p>

      <p className="text-sm mb-2">
        Category: <span className="font-semibold">{category}</span>{" "}
      </p>
      {investmentTitle && (
        <p className="text-sm mb-2">
          Investment Title:{" "}
          <span className="font-semibold">{investmentTitle}</span>{" "}
        </p>
      )}

      <div
        dangerouslySetInnerHTML={{ __html: description }}
        className="text-gray-500 mb-10"
      />
    </div>
  );
};

export default NewsLetterPage;
