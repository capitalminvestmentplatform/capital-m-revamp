"use client";
import { Input } from "@/components/ui/input";
import DataTable from "./DataTable";
import { AddCallRequestModal } from "@/app/components/modals/AddCallRequestModal";
import { getLoggedInUser } from "@/utils/client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const CallRequestsPage = () => {
  const router = useRouter();

  const loggedInUser = getLoggedInUser();
  const role = loggedInUser ? loggedInUser.role : null;
  const isAdmin = loggedInUser?.role === "Admin";

  const [callRequests, setCallRequests] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchField, setSearchField] = useState("");

  useEffect(() => {
    fetchInvestments();
    fetchCallRequests();
  }, []);

  const fetchCallRequests = async () => {
    try {
      const res = await fetch("/api/user-subscriptions/call-requests", {
        method: "GET",
        credentials: "include", // Ensure cookies are sent if authentication is needed
      });

      const response = await res.json();

      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }

      const callRequests = response.data;
      setCallRequests(callRequests);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvestments = async () => {
    try {
      const res = await fetch("/api/products");

      const response = await res.json();
      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }

      const investments = response.data;
      setInvestments(investments);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
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

      fetchCallRequests();
      toast.success(response.message);

      return true;
    } catch (error) {
      toast.error("An unexpected error occurred.");
      return false;
    }
  };

  const filteredCallRequests =
    callRequests.length > 0
      ? callRequests.filter((request: any) => {
          if (isAdmin) return true; // Admin sees all
          return request.email === loggedInUser?.email; // Others see their own
        })
      : [];

  const tableCols =
    role === "Admin"
      ? [
          "Investment ID",
          "Investment Title",
          "Thumbnail",
          "Username",
          "Message",
          "Status",
          "Created At",
        ]
      : [
          "Investment ID",
          "Investment Title",
          "Thumbnail",
          "Message",
          "Status",
          "Created At",
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
          {!isAdmin && (
            <AddCallRequestModal
              investments={investments}
              onSubmit={handleAddCallRequest}
              context="call-requests"
            />
          )}
        </div>
      </div>
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : callRequests.length === 0 ? (
        <p className="text-center text-gray-500">No call requests available</p>
      ) : (
        <DataTable
          tableCols={tableCols}
          tableRows={filteredCallRequests || []}
          searchValue={searchField}
        />
      )}
    </div>
  );
};

export default CallRequestsPage;
