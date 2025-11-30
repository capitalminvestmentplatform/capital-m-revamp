"use client";
import { InvestmentProps } from "@/types/investments";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import CustomButton from "@/app/components/Button";
import { getLoggedInUser } from "@/utils/client";
import { AddCommitmentModal } from "@/app/components/modals/AddCommitmentModal";
import { AddCallRequestModal } from "@/app/components/modals/AddCallRequestModal";
import { formatProjectedReturn } from "@/lib/utils";

const InvestmentPage = () => {
  const loggedInUser = getLoggedInUser();
  const role = loggedInUser?.role;
  const userId = loggedInUser?.id;

  const { id } = useParams();
  const [investment, setInvestment] = React.useState<InvestmentProps>(
    {} as InvestmentProps
  );
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvestment();
    fetchUsers();
  }, [id]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users?all=true", {
        method: "GET",
        credentials: "include", // Ensure cookies are sent if authentication is needed
      });

      const response = await res.json();

      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }

      const users = response.data.users;
      setUsers(users);
    } catch (error) {
      setError((error as Error).message);
    } finally {
    }
  };

  const fetchInvestment = async () => {
    try {
      const response = await fetch(`/api/products/${id}`);

      const result = await response.json();

      if (result.statusCode !== 200) {
        toast.error(result.message);
        throw new Error(result.message);
      }
      const investment = result.data;
      setInvestment(investment);
    } catch (err: any) {
    } finally {
      setLoading(false);
    }
  };

  const handleAddCommitment = async (data: any) => {
    try {
      const res = await fetch("/api/user-subscriptions/commitments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const response = await res.json();

      if (response.statusCode !== 201) {
        toast.error(response.message);
        return false;
      }

      toast.success(response.message);

      return true;
    } catch (error) {
      toast.error("An unexpected error occurred.");
      return false;
    }
  };

  const handleAddCallRequest = async (data: any) => {
    try {
      const res = await fetch("/api/user-subscriptions/call-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const response = await res.json();

      if (response.statusCode !== 201) {
        toast.error(response.message);
        return false;
      }

      toast.success(response.message);

      return true;
    } catch (error) {
      toast.error("An unexpected error occurred.");
      return false;
    }
  };

  const {
    title,
    tagline,
    description,
    category,
    currentValue,
    expectedValue,
    projectedReturn,
    minInvestment,
    subscriptionFee,
    managementFee,
    performanceFee,
    activationDate,
    expirationDate,
    commitmentDeadline,
    state,
    area,
    galleryImages,
    featuredImage,
    faqs,
    video,
    docs,
    terms,
    productId,
    investmentDuration,
  } = investment;

  const isExpired =
    commitmentDeadline && new Date(commitmentDeadline) < new Date();

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;

  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Featured Image Section */}
      <div
        className="relative w-full h-72 bg-cover bg-center rounded-md"
        style={{ backgroundImage: `url(${featuredImage})` }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black opacity-40 rounded-md"></div>

        {/* Content (Title and Tagline) */}
        <div className="absolute inset-0 flex justify-center items-center text-white text-center">
          <div>
            <h1 className="text-3xl font-semibold">{title}</h1>
            <p className="text-lg">{tagline}</p>
          </div>
        </div>
      </div>
      {/* Grid Section */}
      <div className="grid xl:grid-cols-3 gap-6 mt-8">
        {/* Left Column (70%) */}
        <div className="xl:col-span-2">
          <div className="bg-white p-3 lg:p-6 rounded-lg shadow-md">
            <Tabs defaultValue="gallery" className="mx-auto">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="gallery">Gallery Images</TabsTrigger>
                <TabsTrigger value="video">Video</TabsTrigger>
                <TabsTrigger value="docs">Docs</TabsTrigger>
              </TabsList>

              {/* Gallery Images Tab */}
              <TabsContent value="gallery">
                <div className="grid lg:grid-cols-2 gap-4">
                  {galleryImages?.map((image, index) => (
                    <div
                      key={index}
                      className="relative w-full h-64 bg-gray-200 rounded-md"
                    >
                      <Image
                        src={image}
                        alt={`Gallery Image ${index + 1}`}
                        layout="fill"
                        className="rounded-md w-full "
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Video Tab */}
              <TabsContent value="video">
                {video ? (
                  <div className="w-full h-64 bg-gray-200 rounded-md">
                    <video controls className="w-full h-full">
                      <source src={video} type="video/mp4" />
                    </video>
                  </div>
                ) : (
                  <p>No video available.</p>
                )}
              </TabsContent>

              {/* Docs Tab */}
              <TabsContent value="docs">
                {docs?.length === 0 ? (
                  <p>No documents available.</p>
                ) : (
                  <ul>
                    {docs?.map((doc, index) => (
                      <li key={index}>
                        <a href={doc} className="text-blue-500">
                          Document {index + 1}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>
            </Tabs>
          </div>
          <div className="bg-white p-3 lg:p-6 rounded-lg shadow-md">
            <Tabs defaultValue="description" className="mx-auto">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
              </TabsList>

              {/* Gallery Images Tab */}
              <TabsContent value="description">
                <div
                  className=""
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              </TabsContent>

              {/* Video Tab */}
              <TabsContent value="terms">
                <div className="" dangerouslySetInnerHTML={{ __html: terms }} />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Column (30%) */}
        <div className="xl:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="!mb-3 bg-gray-200 flex gap-2 justify-between items-center text-sm text-muted-foreground border p-2">
              <p className="text-gray-600">Investment ID:</p>
              <p className="text-black font-semibold">{productId}</p>
            </div>
            <div className="!mb-3 bg-gray-200 flex gap-2 justify-between items-center text-sm text-muted-foreground border p-2">
              <p className="text-gray-600">Category:</p>
              <p className="text-black font-semibold">{category}</p>
            </div>
            <div className="!mb-3 bg-gray-200 flex gap-2 justify-between items-center text-sm text-muted-foreground border p-2">
              <p className="text-gray-600">Minimum Investment:</p>
              <p className="text-black font-semibold">
                {minInvestment ? `AED ${minInvestment.toLocaleString()}` : "-"}
              </p>
            </div>
            <div className="!mb-3 bg-gray-200 flex gap-2 justify-between items-center text-sm text-muted-foreground border p-2">
              <p className="text-gray-600">Expected Profit:</p>
              <p className="text-black font-semibold">
                {projectedReturn ? formatProjectedReturn(projectedReturn) : "-"}
              </p>
            </div>
            <div className="!mb-3 bg-gray-200 flex gap-2 justify-between items-center text-sm text-muted-foreground border p-2">
              <p className="text-gray-600">Investment Duration:</p>
              <p className="text-black font-semibold">
                {investmentDuration ? `${investmentDuration} years` : "-"}
              </p>
            </div>
            <div
              className={`!mb-3 flex gap-2 justify-between items-center text-sm border p-2 
  ${isExpired ? "bg-red-100 border-red-300" : "bg-gray-200"}
`}
            >
              <p className={`${isExpired ? "text-red-600" : "text-gray-600"}`}>
                Commitment Deadline:
              </p>
              <p className="text-black font-semibold">
                {commitmentDeadline
                  ? new Date(commitmentDeadline).toLocaleDateString()
                  : "-"}
              </p>
            </div>

            {role === "Admin" ? (
              <div className="flex gap-4 mt-10">
                <AddCommitmentModal
                  users={users}
                  onSubmit={handleAddCommitment}
                  context="product-details"
                  selectedProductId={Array.isArray(id) ? id[0] : id}
                />
              </div>
            ) : !isExpired ? (
              <div className="flex gap-4 mt-10">
                <AddCallRequestModal
                  selectedProductId={Array.isArray(id) ? id[0] : id}
                  onSubmit={handleAddCallRequest}
                  context="product-details"
                />
                <AddCommitmentModal
                  users={users}
                  onSubmit={handleAddCommitment}
                  context="product-details"
                  selectedProductId={Array.isArray(id) ? id[0] : id}
                  selectedUserId={role !== "Admin" ? userId : ""}
                />
              </div>
            ) : (
              <p className="text-red-500 text-sm mt-10">
                Investment opportunity has expired. If you are still interested,
                please get in touch with us.
              </p>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md mt-10">
            <h2 className="text-lg font-semibold mb-4">Capital M Fees</h2>
            <div className="!mb-3 bg-gray-200 flex gap-2 justify-between items-center text-sm text-muted-foreground border p-2">
              <p className="text-gray-600">Subscription Fee:</p>
              <p className="text-black font-semibold">
                {subscriptionFee
                  ? `AED ${subscriptionFee.toLocaleString()}`
                  : "-"}
              </p>
            </div>
            <div className="!mb-3 bg-gray-200 flex gap-2 justify-between items-center text-sm text-muted-foreground border p-2">
              <p className="text-gray-600">Management Fee:</p>
              <p className="text-black font-semibold">
                {managementFee ? `AED ${managementFee.toLocaleString()}` : "-"}
              </p>
            </div>
            <div className="!mb-3 bg-gray-200 flex gap-2 justify-between items-center text-sm text-muted-foreground border p-2">
              <p className="text-gray-600">Performance Fee:</p>
              <p className="text-black font-semibold">
                {performanceFee
                  ? `AED ${performanceFee.toLocaleString()}`
                  : "-"}
              </p>
            </div>
          </div>

          <h3 className="text-xl font-semibold mt-10">FAQs</h3>
          <div className="space-y-4 mt-4">
            {faqs?.map((faq: any, index) => (
              <div key={index} className="border-b pb-4">
                <h4 className="font-medium">{faq.question}</h4>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* More content to follow... */}
    </div>
  );
};

export default InvestmentPage;
