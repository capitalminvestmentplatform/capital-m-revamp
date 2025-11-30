"use client";
import { getLoggedInUser } from "@/utils/client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import DataTable from "./DataTable";
import { Input } from "@/components/ui/input";

const CapitalCallsPage = () => {
  const router = useRouter();

  const loggedInUser = getLoggedInUser();
  const role = loggedInUser ? loggedInUser.role : null;
  const isAdmin = loggedInUser?.role === "Admin";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchField, setSearchField] = useState("");

  const [capitalCalls, setCapitalCalls] = useState([]);
  const [receiptLoadingIndex, setReceiptLoadingIndex] = useState<number>(-1);

  useEffect(() => {
    fetchCapitalCalls();
  }, []);

  const fetchCapitalCalls = async () => {
    try {
      const res = await fetch("/api/user-subscriptions/capital-calls");

      const response = await res.json();
      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }

      const capitalCalls = response.data;
      setCapitalCalls(capitalCalls);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/user-subscriptions/capital-calls/${id}`, {
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

  const createReceipt = async (id: string, index: number) => {
    try {
      setReceiptLoadingIndex(index);
      const res = await fetch(`/api/user-subscriptions/receipts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          capitalCallId: id,
        }),
      });

      const response = await res.json();
      if (response.statusCode !== 201) {
        toast.error(response.message);
        throw new Error(response.message);
      }

      setTimeout(() => {
        router.push(`/dashboard/user-subscriptions/receipts`);
      }, 1000);
      toast.success(response.message);
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const filteredCapitalCalls =
    capitalCalls.length > 0
      ? capitalCalls.filter((capitalCall: any) => {
          if (isAdmin) return true; // Admin sees all
          return capitalCall.email === loggedInUser?.email && capitalCall.send; // Others see their own
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
          "Capital Call Pdf",
          "Status",
          "Created At",
          "Receipt",
          "Action",
        ]
      : [
          "Investment ID",
          "Investment Title",
          "Thumbnail",
          "Commitment (AED)",
          "Capital Call Pdf",
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
      ) : capitalCalls.length === 0 ? (
        <p className="text-center text-gray-500">No Capital Calls available</p>
      ) : (
        <DataTable
          tableCols={tableCols}
          tableRows={filteredCapitalCalls || []}
          handleDelete={handleDelete}
          receiptLoadingIndex={receiptLoadingIndex}
          createReceipt={createReceipt}
          searchValue={searchField}
        />
      )}
    </div>
  );
};

export default CapitalCallsPage;
