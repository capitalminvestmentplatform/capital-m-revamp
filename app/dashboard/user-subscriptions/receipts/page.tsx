"use client";
import {
  convertImageUrlToBase64,
  getLoggedInUser,
  uploadFileToCloudinary,
} from "@/utils/client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import DataTable from "./DataTable";
import { Input } from "@/components/ui/input";
import { AddReceiptModal } from "@/app/components/modals/AddReceiptModal";
import ReceiptPDF from "@/app/components/pdfs/Receipt";
// import html2pdf from "html2pdf.js";
import ReactDOMServer from "react-dom/server";

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
  const [users, setUsers] = useState([]);
  const [receipts, setReceipts] = useState([]);

  useEffect(() => {
    fetchReceipts();
    fetchUsers();
  }, []);

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
        },
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

  type ReceiptInput = {
    userId: string;
    commitmentAmount: number;
    createdAt: string;
    pdf?: string | null;
  };
  type Row = {
    userId: string;
    username: string;
    clientCode: string;
    commitmentAmount: string; // from form
    createdAt: string;
  };

  const generateAndUploadReceiptPDF = async (row: any) => {
    try {
      const logoUrl =
        "https://res.cloudinary.com/dvm9wuu3f/image/upload/v1741172718/logo_gqnslm.png";
      const logoB64 = (await convertImageUrlToBase64(logoUrl)) ?? "";

      const htmlString = ReactDOMServer.renderToStaticMarkup(
        <ReceiptPDF
          receipt={{
            ...row,
            logoB64,
          }}
        />,
      );

      const pdfElement = document.createElement("div");
      pdfElement.innerHTML = htmlString;

      const opt = {
        margin: 0.5,
        filename: `receipt-${row.clientCode}-${row.username}-${row.createdAt}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" as const },
      };
      const mod: any = await import("html2pdf.js");
      const html2pdf = mod?.default ?? mod;
      const pdfBlob = await html2pdf()
        .from(pdfElement)
        .set(opt)
        .outputPdf("blob");

      const file = new File([pdfBlob], opt.filename, {
        type: "application/pdf",
      });

      // use clientCode-based folder (you don't have email here)
      const folder = `receipts/${row.clientCode}`;
      const pdfUrl = (await uploadFileToCloudinary(file, folder)) ?? "";

      if (!pdfUrl) throw new Error("PDF upload returned empty URL");

      return pdfUrl;
    } catch (e) {
      console.error(e);
      toast.error(`PDF generation/upload failed for ${row.clientCode}`);
      return "";
    }
  };

  const handleAddReceipt = async (rows: Row[]) => {
    const now = new Date();
    const year = String(now.getFullYear()).slice(-2); // "26"
    const month = String(now.getMonth() + 1).padStart(2, "0"); // "01"

    const baseCount = receipts.length; // existing receipts count

    const rowsWithReceiptId = rows.map((row, index) => {
      const rawCount = baseCount + index + 1;

      const paddedCount =
        rawCount < 10
          ? `000${rawCount}`
          : rawCount < 100
            ? `00${rawCount}`
            : rawCount < 1000
              ? `0${rawCount}`
              : `${rawCount}`;

      const receiptId = `REC-${year}${month}${paddedCount}`;

      return {
        ...row,
        receiptId,
      };
    });
    console.log("rows", rows);
    // Generate + upload PDFs
    const pdfUrls = await Promise.all(
      rowsWithReceiptId.map((r) => generateAndUploadReceiptPDF(r)),
    );

    // Attach PDF + convert amount to number + rename key to "pdf"
    const receiptsPayload: ReceiptInput[] = rowsWithReceiptId.map((r, idx) => ({
      userId: r.userId,
      commitmentAmount: Number(r.commitmentAmount), // backend expects number
      pdf: pdfUrls[idx] ? pdfUrls[idx] : null,
      createdAt: r.createdAt,
      receiptId: r.receiptId,
    }));

    // If you want to fail hard when any PDF failed:
    const pdfFailed = receiptsPayload.some((n) => !n.pdf);
    if (pdfFailed) {
      toast.error("Some PDFs failed to upload. Please try again.");
      return { ok: false };
    }

    const res = await fetch("/api/user-subscriptions/receipts/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receipts: receiptsPayload }),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      toast.error(json?.message || "Failed to create receipts");
      return { ok: false, error: json };
    }

    toast.success("Receipts added successfully!");
    return { ok: true, data: json };
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
          {isAdmin && (
            <AddReceiptModal
              users={users}
              // commitments={commitments}
              onSubmit={handleAddReceipt}
            />
          )}
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
