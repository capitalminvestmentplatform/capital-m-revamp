"use client";
import { getLoggedInUser } from "@/utils/client";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import DataTable from "./DataTable";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

const SubscriptionsPage = () => {
  const router = useRouter();

  const loggedInUser = getLoggedInUser();
  const role = loggedInUser ? loggedInUser.role : null;
  const isAdmin = loggedInUser?.role === "Admin";

  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptLoadingIndex, setAcceptLoadingIndex] = useState<number>(-1);
  const [capitalLoadingIndex, setCapitalLoadingIndex] = useState<number>(-1);
  const [error, setError] = useState<string | null>(null);
  const [searchField, setSearchField] = useState("");

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const res = await fetch("/api/user-subscriptions/subscriptions");

      const response = await res.json();
      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }

      const subscriptions = response.data;
      setSubscriptions(subscriptions);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/user-subscriptions/subscriptions/${id}`, {
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
  const handleAccept = async (id: string, index: number) => {
    try {
      setAcceptLoadingIndex(index);
      const res = await fetch(
        `/api/user-subscriptions/subscriptions/${id}/accept`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      const response = await res.json();
      if (response.statusCode !== 200) {
        toast.error(response.message || "Update failed");
        throw new Error(response.message);
      }

      setTimeout(() => {
        router.push(`/dashboard/user-subscriptions/subscriptions/${id}`);
      }, 1000);
      toast.success(response.message);
    } catch (err) {
      toast.error("Something went wrong");
    }
  };
  const createCapitalCall = async (id: string, index: number) => {
    try {
      setCapitalLoadingIndex(index);
      const res = await fetch(`/api/user-subscriptions/capital-calls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriptionId: id,
        }),
      });

      const response = await res.json();
      if (response.statusCode !== 201) {
        toast.error(response.message);
        throw new Error(response.message);
      }

      setTimeout(() => {
        router.push(`/dashboard/user-subscriptions/capital-calls`);
      }, 1000);
      toast.success(response.message);
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const filteredSubscriptions =
    subscriptions.length > 0
      ? subscriptions.filter((subscription: any) => {
          if (isAdmin) return true; // Admin sees all
          return (
            subscription.email === loggedInUser?.email && subscription.send
          ); // Others see their own
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
          "Signature",
          "Signed Subscription",
          "Status",
          "Created At",
          "Capital Call",
          "Action",
        ]
      : [
          "Investment ID",
          "Investment Title",
          "Thumbnail",
          "Commitment (AED)",
          "Signature",
          "Signed Subscription",
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
      ) : subscriptions.length === 0 ? (
        <p className="text-center text-gray-500">No subscriptions available</p>
      ) : (
        <DataTable
          tableCols={tableCols}
          tableRows={filteredSubscriptions || []}
          handleDelete={handleDelete}
          handleAccept={handleAccept}
          createCapitalCall={createCapitalCall}
          acceptLoadingIndex={acceptLoadingIndex}
          capitalLoadingIndex={capitalLoadingIndex}
          searchValue={searchField}
        />
      )}
    </div>
  );
};

export default SubscriptionsPage;
