"use client";
import {
  convertImageUrlToBase64,
  getLoggedInUser,
  uploadFileToCloudinary,
} from "@/utils/client";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import DataTable from "./DataTable";
import { AddDistributionNoticeModal } from "@/app/components/modals/AddDistributionNoticeModal";
import { Input } from "@/components/ui/input";
import DistributionNoticePDF from "@/app/components/pdfs/DistributionNotice";
import html2pdf from "html2pdf.js";
import ReactDOMServer from "react-dom/server";

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

  type NoticeInput = {
    userId: string;
    commitmentName?: string | null;
    distributionDate: string;
    distributionAmount: number;
    description?: string;
    pdf?: string | null;
  };
  type Row = {
    userId: string;
    username: string;
    clientCode: string;
    distributionAmount: string; // from form
    distributionDate: string;
    description?: string;
    commitmentName?: string; // if you add it in UI later
  };

  const generateAndUploadDistributionPDF = async (row: any) => {
    try {
      const logoUrl =
        "https://res.cloudinary.com/dvm9wuu3f/image/upload/v1741172718/logo_gqnslm.png";
      const logoB64 = (await convertImageUrlToBase64(logoUrl)) ?? "";

      const htmlString = ReactDOMServer.renderToStaticMarkup(
        <DistributionNoticePDF
          distributionNotice={{
            ...row,
            logoB64,
          }}
        />
      );

      const pdfElement = document.createElement("div");
      pdfElement.innerHTML = htmlString;

      const opt = {
        margin: 0.5,
        filename: `distribution-${row.clientCode}-${row.username}-${row.distributionDate}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" as const },
      };

      const pdfBlob = await html2pdf()
        .from(pdfElement)
        .set(opt)
        .outputPdf("blob");

      const file = new File([pdfBlob], opt.filename, {
        type: "application/pdf",
      });

      // use clientCode-based folder (you don't have email here)
      const folder = `distribution-notices/${row.clientCode}`;
      const pdfUrl = (await uploadFileToCloudinary(file, folder)) ?? "";

      if (!pdfUrl) throw new Error("PDF upload returned empty URL");

      return pdfUrl;
    } catch (e) {
      console.error(e);
      toast.error(`PDF generation/upload failed for ${row.clientCode}`);
      return "";
    }
  };

  const handleAddDistributionNotice = async (rows: Row[]) => {
    console.log("rows", rows);
    // Generate + upload PDFs
    const pdfUrls = await Promise.all(
      rows.map((r) => generateAndUploadDistributionPDF(r))
    );

    // Attach PDF + convert amount to number + rename key to "pdf"
    const distributionNotices: NoticeInput[] = rows.map((r, idx) => ({
      userId: r.userId,
      commitmentName: r.commitmentName ?? null,
      distributionDate: r.distributionDate,
      distributionAmount: Number(r.distributionAmount), // backend expects number
      description: r.description ?? "",
      pdf: pdfUrls[idx] ? pdfUrls[idx] : null,
    }));

    // If you want to fail hard when any PDF failed:
    const pdfFailed = distributionNotices.some((n) => !n.pdf);
    if (pdfFailed) {
      toast.error("Some PDFs failed to upload. Please try again.");
      return { ok: false };
    }

    const res = await fetch("/api/distribution-notices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ distributionNotices }),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      toast.error(json?.message || "Failed to create distribution notices");
      return { ok: false, error: json };
    }

    toast.success("Distribution Notices added successfully!");
    return { ok: true, data: json };
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
          "Username",
          "Distribution Amount (AED)",
          "Distribution Date",
          "Description",
          "PDF",
          "Action",
        ]
      : [
          "Distribution Amount (AED)",
          "Distribution Date",
          "Description",
          "PDF",
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
              // commitments={commitments}
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
