"use client";
import { Input } from "@/components/ui/input";
import DataTable from "./DataTable";
import { AddCommitmentModal } from "@/app/components/modals/AddCommitmentModal";
import { getLoggedInUser } from "@/utils/client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const CommitmentsPage = () => {
  const router = useRouter();

  const loggedInUser = getLoggedInUser();
  const role = loggedInUser ? loggedInUser.role : null;
  const isAdmin = loggedInUser?.role === "Admin";

  const [users, setUsers] = useState([]);
  const [commitments, setCommitments] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initiateLoadingIndex, setInitiateLoadingIndex] = useState<number>(-1);
  const [error, setError] = useState<string | null>(null);
  const [searchField, setSearchField] = useState("");

  useEffect(() => {
    fetchInvestments();
    fetchUsers();
    fetchCommitments();
  }, []);

  const fetchCommitments = async () => {
    try {
      const res = await fetch("/api/user-subscriptions/commitments", {
        method: "GET",
        credentials: "include", // Ensure cookies are sent if authentication is needed
      });

      const response = await res.json();

      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }

      const commitments = response.data;
      setCommitments(commitments);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };
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

      fetchCommitments();
      toast.success(response.message);

      return true;
    } catch (error) {
      toast.error("An unexpected error occurred.");
      return false;
    }
  };

  const handleEdit = async (updatedData: any) => {
    try {
      const res = await fetch(
        `/api/user-subscriptions/commitments/${updatedData._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        }
      );

      const response = await res.json();
      if (response.statusCode !== 200) {
        toast.error(response.message);
        return false;
      }
      fetchCommitments();
      toast.success(response.message);
      return true;
    } catch (err) {
      toast.error("Something went wrong");
      return false;
    }
  };
  const handleInitiate = async (id: string, index: number) => {
    try {
      const res = await fetch(
        `/api/user-subscriptions/commitments/${id}/initiate`,
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
        toast.error(response.message);
        return false;
      }

      setTimeout(() => {
        router.push("/dashboard/user-subscriptions/subscriptions");
      }, 1000);

      return true;
    } catch (err) {
      toast.error("Something went wrong");
      return false;
    }
  };

  const createSubscription = async (id: string, index: number) => {
    setInitiateLoadingIndex(index);

    try {
      const res = await fetch(`/api/user-subscriptions/subscriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commitmentId: id }),
      });

      const response = await res.json();
      if (response.statusCode !== 201) {
        toast.error(response.message);
        return false;
      }
      handleInitiate(id, index);
      toast.success(response.message);

      return true;
    } catch (err) {
      toast.error("Something went wrong");
      return false;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/user-subscriptions/commitments/${id}`, {
        method: "DELETE",
      });

      const response = await res.json();
      if (response.statusCode !== 200) {
        toast.error(response.message);
        return false;
      }

      toast.success(response.message);
      fetchCommitments(); // Refresh the investments list
      return true;
    } catch (error) {
      return false;
    }
  };

  const filteredCommitments =
    commitments.length > 0
      ? commitments.filter((commitment: any) => {
          if (isAdmin) return true; // Admin sees all
          return commitment.email === loggedInUser?.email; // Others see their own
        })
      : [];

  const tableCols =
    role === "Admin"
      ? [
          "Investment ID",
          "Investment Title",
          "Thumbnail",
          "Username",
          "Commitment Amount",
          "Message",
          "Subscription",
          "Created At",
          "Actions", // Only include Actions column for Admin
        ]
      : [
          "Investment ID",
          "Investment Title",
          "Thumbnail",
          "Commitment Amount",
          "Message",
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
          {isAdmin && (
            <AddCommitmentModal
              users={users}
              investments={investments}
              onSubmit={handleAddCommitment}
              context="commitments"
            />
          )}
        </div>
      </div>
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : commitments.length === 0 ? (
        <p className="text-center text-gray-500">No commitments available</p>
      ) : (
        <DataTable
          tableCols={tableCols}
          tableRows={filteredCommitments || []}
          handleDelete={handleDelete}
          handleEdit={handleEdit}
          createSubscription={createSubscription}
          initiateLoadingIndex={initiateLoadingIndex}
          searchValue={searchField}
        />
      )}
    </div>
  );
};

export default CommitmentsPage;
