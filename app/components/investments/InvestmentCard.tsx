import React from "react";
import { Building, Landmark, Pencil, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { InvestmentProps } from "@/types/investments";
import Image from "next/image";
import Link from "next/link";
import { ConfirmModal } from "@/app/components/modals/ConfirmModal";

interface InvestmentCardProps {
  investment: InvestmentProps;
  handleDelete: (id: string) => Promise<boolean>;
  role: string;
}

const InvestmentCard: React.FC<InvestmentCardProps> = ({
  investment,
  handleDelete,
  role,
}) => {
  const {
    _id,
    productId,
    featuredImage,
    category,
    status,
    title,
    tagline,
    expectedValue,
    investmentDuration,
    commitmentDeadline,
  } = investment;

  const isExpired =
    commitmentDeadline && new Date(commitmentDeadline) < new Date();

  return (
    <Card className="group">
      <CardHeader className="relative w-full h-[200px] p-0 overflow-hidden">
        {featuredImage ? (
          <Image
            src={featuredImage}
            fill
            className="object-cover rounded-tl-md rounded-tr-md"
            alt={title || "Investment image"}
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="bg-gray-200 w-full h-full flex items-center justify-center text-gray-500 text-sm">
            No Image Available
          </div>
        )}

        {/* Category (top-left) */}
        <div className="absolute top-2 left-2 bg-black/60 text-white text-sm px-3 py-1 rounded">
          {category || "Uncategorized"}
        </div>

        {/* Status (top-right) */}
        <div className="absolute top-2 right-2 bg-black/60 text-white text-sm px-3 py-1 rounded">
          {status ? "Active" : "Inactive"}
        </div>

        {/* Edit/Delete Icons (admin only) */}
        {role === "Admin" && (
          <div className="absolute bottom-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link
              href={`/dashboard/investments/${_id}/edit`}
              className="bg-white/80 p-1 rounded hover:bg-primaryBG hover:text-white"
            >
              <Pencil size={18} />
            </Link>
            <ConfirmModal
              title="Delete Investment?"
              description="Are you sure you want to delete this investment? This action cannot be undone."
              onConfirm={() => handleDelete(_id)}
            >
              <button className="bg-white/80 p-1 rounded hover:bg-red-200">
                <Trash2 size={18} className="text-red-600" />
              </button>
            </ConfirmModal>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-1 mt-2">
        {/* Product ID */}
        <div className="my-5 flex gap-2 items-center text-sm text-muted-foreground border rounded-md w-fit px-2 py-1">
          <Landmark size={18} />
          <p>
            Investment ID: <b>#{productId || "N/A"}</b>
          </p>
        </div>

        {/* Title */}
        <CardTitle className="text-lg">
          {title || "Untitled Investment"}
        </CardTitle>

        {/* Tagline */}
        <CardDescription className="!mb-10">
          {tagline || "No tagline provided."}
        </CardDescription>

        <div className="mt-10 !mb-3 bg-gray-200 flex gap-2 justify-between items-center text-sm text-muted-foreground border p-2">
          <p className="text-gray-600">Expected Profit:</p>
          <p className="text-black font-semibold">
            {expectedValue ? `AED ${expectedValue.toLocaleString()}` : "-"}
          </p>
        </div>

        <div className="mt-10 !mb-3 bg-gray-200 flex gap-2 justify-between items-center text-sm text-muted-foreground border p-2">
          <p className="text-gray-600">Project Duration:</p>
          <p className="text-black font-semibold">
            {investmentDuration ? `${investmentDuration} years` : "-"}
          </p>
        </div>

        <div
          className={`mt-10 !mb-3 flex gap-2 justify-between items-center text-sm border p-2 
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
      </CardContent>

      <CardFooter>
        <Link
          href={`/dashboard/investments/${_id}`}
          className="text-sm bg-primaryBG text-white text-center w-full px-5 py-2 font-medium rounded-md"
        >
          View Investment
        </Link>
      </CardFooter>
    </Card>
  );
};

export default InvestmentCard;
