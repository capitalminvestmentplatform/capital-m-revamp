"use client";
import { getLoggedInUser, uploadFileToCloudinary } from "@/utils/client";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import DataTable from "./DataTable";
import { AddKycDocsModal } from "@/app/components/modals/AddKycDocsModal";

const KYCPage = () => {
  const loggedInUser = getLoggedInUser();
  const role = loggedInUser ? loggedInUser.role : null;
  const userId = loggedInUser ? loggedInUser.id : null;
  const isAdmin = loggedInUser?.role === "Admin";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [kycDocs, setKycDocs] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchKycDocs();
    fetchUsers();
  }, []);

  const fetchKycDocs = async () => {
    try {
      const res = await fetch("/api/kyc");

      const response = await res.json();
      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }

      const kycDocs = response.data;
      setKycDocs(kycDocs);
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

  const handleAddKycDocs = async (data: any) => {
    try {
      let nationalIdUrl;
      let nationalPassportUrl;
      let residenceProofUrl;
      let clientId;

      let payload: Record<string, any> = {
        userId: "",
        nationalId: "",
        nationalPassport: "",
        residenceProof: "",
      };

      if (!isAdmin) {
        payload.userId = userId;
        clientId = userId;
      } else {
        payload.userId = data.userId;
        clientId = data.userId;
      }

      // 1. Upload files conditionally
      const uploadField = async (fileData: any, label: string) => {
        if (fileData?.[0] instanceof File) {
          const file = new File([fileData[0]], `${label}.pdf`, {
            type: "application/pdf",
          });
          return await uploadFileToCloudinary(
            file,
            `kyc-docs/${clientId}/${label}`
          );
        }
        return "";
      };

      nationalIdUrl = await uploadField(data.nationalId, "national-id");
      nationalPassportUrl = await uploadField(
        data.nationalPassport,
        "national-passport"
      );
      residenceProofUrl = await uploadField(
        data.residenceProof,
        "residence-proof"
      );

      // 2. Handle role-specific logic
      if (!isAdmin) {
        // Check if KYC already exists for this client
        const existingKyc: any = kycDocs.find(
          (doc: any) => doc.userId === userId
        );

        const res = await fetch(
          existingKyc ? `/api/kyc/${existingKyc._id}` : `/api/kyc`,
          {
            method: existingKyc ? "PUT" : "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        const response = await res.json();
        if (response.statusCode !== 200 && response.statusCode !== 201) {
          toast.error(response.message);
          return false;
        }

        toast.success(response.message);
        fetchKycDocs();
        return true;
      }

      // 3. Admin path (always create new entry)

      const res = await fetch(`/api/kyc`, {
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
      fetchKycDocs();
      return true;
    } catch (error) {
      toast.error("Something went wrong while submitting.");
      return false;
    }
  };

  const handleDeleteKycDoc = async (id: string, type: string) => {
    try {
      const res = await fetch(`/api/kyc/${id}?field=${type}`, {
        method: "DELETE",
        credentials: "include", // Ensure cookies are sent if authentication is needed
      });

      const response = await res.json();

      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }
      toast.success(response.message);
      fetchKycDocs();

      return true;
    } catch (error) {
      return false;
    }
  };

  const handleEditKycDocs = async (userId: string, id: string, data: any) => {
    try {
      let nationalIdUrl = undefined;
      if (data.nationalId?.[0] instanceof File) {
        const file = data.nationalId[0];
        const uploaded = await uploadFileToCloudinary(
          file,
          `kyc-docs/${userId}/national-id`
        );
        nationalIdUrl = uploaded ?? "";
      }
      let nationalPassportUrl = undefined;

      if (data.nationalPassport?.[0] instanceof File) {
        const file = data.nationalPassport[0];
        const uploaded = await uploadFileToCloudinary(
          file,
          `kyc-docs/${userId}/national-passport`
        );
        nationalPassportUrl = uploaded ?? "";
      }
      let residenceProofUrl = undefined;

      if (data.residenceProof?.[0] instanceof File) {
        const file = data.residenceProof[0];
        const uploaded = await uploadFileToCloudinary(
          file,
          `kyc-docs/${userId}/residence-proof`
        );
        residenceProofUrl = uploaded ?? "";
      }

      const res = await fetch(`/api/kyc/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(nationalIdUrl ? { nationalId: nationalIdUrl } : {}),
          ...(nationalPassportUrl
            ? { nationalPassport: nationalPassportUrl }
            : {}),
          ...(residenceProofUrl ? { residenceProof: residenceProofUrl } : {}),
        }),
      });

      const response = await res.json();
      if (response.statusCode !== 200) {
        toast.error(response.message);
        return false;
      }

      toast.success(response.message);
      fetchKycDocs(); // refresh table
      return true;
    } catch (error) {
      return false;
    }
  };

  const filteredKycDocs =
    kycDocs.length > 0
      ? kycDocs.filter((receipt: any) => {
          if (isAdmin) return true; // Admin sees all
          return receipt.email === loggedInUser?.email; // Others see their own
        })
      : [];

  const tableCols =
    role === "Admin"
      ? [
          "Username",
          "National ID",
          "National Passport",
          "Proof of Residence",
          "Action",
        ]
      : ["National ID", "National Passport", "Proof of Residence"];

  return (
    <div>
      <div className="my-10 flex justify-end">
        <AddKycDocsModal
          users={users.filter(
            (user: { role: string; id: string }) =>
              user.role !== "Admin" &&
              !kycDocs.some((doc: { userId: string }) => doc.userId === user.id)
          )}
          role={isAdmin}
          onSubmit={handleAddKycDocs}
        />
      </div>
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : kycDocs.length === 0 ? (
        <p className="text-center text-gray-500">No Kyc Docs available</p>
      ) : (
        <DataTable
          tableCols={tableCols}
          tableRows={filteredKycDocs || []}
          handleDelete={handleDeleteKycDoc}
          handleEdit={handleEditKycDocs}
        />
      )}
    </div>
  );
};

export default KYCPage;
