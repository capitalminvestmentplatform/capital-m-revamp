"use client";
import { getLoggedInUser, uploadFileToCloudinary } from "@/utils/client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import DataTable from "./DataTable";
import { Input } from "@/components/ui/input";

const ReceiptsPage = () => {
  const router = useRouter();

  const loggedInUser = getLoggedInUser();
  const role = loggedInUser ? loggedInUser.role : null;
  const isAdmin = loggedInUser?.role === "Admin";

  const [loading, setLoading] = useState(true);
  const [uploadReceiptLoadingIndex, setUploadReceiptLoadingIndex] =
    useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [searchField, setSearchField] = useState("");

  const [receipts, setReceipts] = useState([]);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      const res = await fetch("/api/user-subscriptions/receipts");

      const response = await res.json();
      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }

      const receipts = response.data;
      setReceipts(receipts);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const uploadReceipt = async (data: any, file: File, index: number) => {
    setUploadReceiptLoadingIndex(index);
    try {
      const receiptFile = new File([file], "receipt.pdf", {
        type: "application/pdf",
      });
      const { email, username, title, commitmentAmount, createdAt, receiptId } =
        data;
      const receiptPdf =
        (await uploadFileToCloudinary(receiptFile, `receipts/${email}`)) ?? "";

      const res = await fetch(
        `/api/user-subscriptions/receipts/${data._id}/send`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            username,
            title,
            pdf: receiptPdf,
            commitmentAmount,
            createdAt,
            receiptId,
          }),
        }
      );

      const response = await res.json();
      if (response.statusCode !== 200) {
        toast.error(response.message);
      }

      fetchReceipts();
      setUploadReceiptLoadingIndex(-1);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/user-subscriptions/receipts/${id}`, {
        method: "DELETE",
        credentials: "include", // Ensure cookies are sent if authentication is needed
      });

      const response = await res.json();

      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }
      toast.success(response.message);
      return true;
    } catch (error) {
      return false;
    }
  };

  const filteredReceipts =
    receipts.length > 0
      ? receipts.filter((receipt: any) => {
          if (isAdmin) return true; // Admin sees all
          return receipt.email === loggedInUser?.email && receipt.send; // Others see their own
        })
      : [];

  const tableCols =
    role === "Admin"
      ? [
          "Investment ID",
          "Investment Title",
          "Thumbnail",
          "Username",
          "Commitment (AED)",
          "Receipt Pdf",
          "Status",
          "Created At",
          "Action",
        ]
      : [
          "Investment ID",
          "Investment Title",
          "Thumbnail",
          "Commitment (AED)",
          "Receipt Pdf",
          "Status",
          "Created At",
          "Action",
        ];

  return (
    <div>
      <div className="my-10 flex justify-end">
        <div className="flex gap-3">
          <Input
            type="text"
            placeholder="Search here"
            onChange={(e) => setSearchField(e.target.value)}
          />
        </div>
      </div>
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : receipts.length === 0 ? (
        <p className="text-center text-gray-500">No Receipts available</p>
      ) : (
        <DataTable
          tableCols={tableCols}
          tableRows={filteredReceipts || []}
          handleDelete={handleDelete}
          uploadReceipt={uploadReceipt}
          uploadReceiptLoadingIndex={uploadReceiptLoadingIndex}
          searchValue={searchField}
        />
      )}
    </div>
  );
};

export default ReceiptsPage;
