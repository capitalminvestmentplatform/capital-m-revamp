"use client";
import { getLoggedInUser, uploadFileToCloudinary } from "@/utils/client";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import DataTable from "./DataTable";
import { AddDistributionNoticeModal } from "@/app/components/modals/AddDistributionNoticeModal";
import { Input } from "@/components/ui/input";

const DistributionNoticesPage = () => {
  const loggedInUser = getLoggedInUser();
  const role = loggedInUser ? loggedInUser.role : null;
  const isAdmin = loggedInUser?.role === "Admin";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [distributionNotices, setDistributionNotices] = useState([]);
  const [users, setUsers] = useState([]);
  const [commitments, setCommitments] = useState([]);
  const [searchField, setSearchField] = useState("");

  useEffect(() => {
    fetchDistributionNotices();
    fetchUsers();
    fetchCommitments();
  }, []);

  const fetchDistributionNotices = async () => {
    try {
      const res = await fetch("/api/distribution-notices");

      const response = await res.json();
      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }

      const distributionNotices = response.data;
      setDistributionNotices(distributionNotices);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users?all=true");

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
  const fetchCommitments = async () => {
    try {
      const res = await fetch("/api/user-subscriptions/commitments");

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

  const handleAddDistributionNotice = async (data: any) => {
    try {
      const file = new File([data.pdf?.[0]], "distribution-notice.pdf", {
        type: "application/pdf",
      });
      let pdfUrl = "";

      if (file) {
        pdfUrl =
          (await uploadFileToCloudinary(file, "distribution-notices")) ?? "";
      }

      const payload = {
        userId: data.userId,
        commitmentName: data.commitmentName,
        distributionAmount: +data.distributionAmount,
        distributionDate: data.distributionDate,
        description: data.description || "",
        pdf: pdfUrl,
      };

      const res = await fetch(`/api/distribution-notices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const response = await res.json();
      if (response.statusCode !== 201) {
        toast.error(response.message);
        return false;
      }

      toast.success(response.message);
      fetchDistributionNotices();
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleEditDistributionNotice = async (id: string, data: any) => {
    try {
      let pdfUrl = undefined;

      if (typeof data.pdf !== "string") {
        const file = new File([data.pdf?.[0]], "distribution-notice.pdf", {
          type: "application/pdf",
        });
        const uploaded = await uploadFileToCloudinary(
          file,
          "distribution-notices"
        );
        pdfUrl = uploaded ?? "";
      }

      const res = await fetch(`/api/distribution-notices/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          distributionAmount: data.distributionAmount,
          distributionDate: data.distributionDate,
          description: data.description || "",
          ...(pdfUrl ? { pdf: pdfUrl } : {}),
        }),
      });

      const response = await res.json();
      if (response.statusCode !== 200) {
        toast.error(response.message);
        return false;
      }

      toast.success(response.message);
      fetchDistributionNotices(); // refresh table
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleDeleteDistributionNotice = async (id: string) => {
    try {
      const res = await fetch(`/api/distribution-notices/${id}`, {
        method: "DELETE",
        credentials: "include", // Ensure cookies are sent if authentication is needed
      });

      const response = await res.json();

      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }
      toast.success(response.message);
      fetchDistributionNotices();
      return true;
    } catch (error) {
      return false;
    }
  };

  const filteredDistributionNotices =
    distributionNotices.length > 0
      ? distributionNotices.filter((receipt: any) => {
          if (isAdmin) return true; // Admin sees all
          return receipt.email === loggedInUser?.email; // Others see their own
        })
      : [];

  const tableCols =
    role === "Admin"
      ? [
          "Completed Commitment",
          "Username",
          "Distribution Amount (AED)",
          "Distribution Date",
          "Description",
          "Action",
        ]
      : [
          "Completed Commitment",
          "Distribution Amount (AED)",
          "Distribution Date",
          "Description",
        ];

  return (
    <div>
      <div className="my-10 flex justify-end">
        {" "}
        <div className="flex gap-3">
          <Input
            type="text"
            placeholder="Search here"
            onChange={(e) => setSearchField(e.target.value)}
          />
          {isAdmin && (
            <AddDistributionNoticeModal
              users={users}
              commitments={commitments}
              onSubmit={handleAddDistributionNotice}
            />
          )}
        </div>
      </div>
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : distributionNotices.length === 0 ? (
        <p className="text-center text-gray-500">
          No Distribution Notice available
        </p>
      ) : (
        <DataTable
          tableCols={tableCols}
          tableRows={filteredDistributionNotices || []}
          handleDelete={handleDeleteDistributionNotice}
          handleEdit={handleEditDistributionNotice}
          searchValue={searchField}
        />
      )}
    </div>
  );
};

export default DistributionNoticesPage;
