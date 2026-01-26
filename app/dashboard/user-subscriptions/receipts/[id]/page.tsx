"use client";
import { Button } from "@/components/ui/button";
import {
  convertImageUrlToBase64,
  getLoggedInUser,
  uploadFileToCloudinary,
} from "@/utils/client";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
// import html2pdf from "html2pdf.js"; // npm install html2pdf.js
import ReactDOMServer from "react-dom/server";
import { CapitalCallProps } from "@/types/capitalCalls";
import CapitalCallPDF from "@/app/components/pdfs/CapitalCall";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { ReceiptProps } from "@/types/receipts";
import ReceiptPDF from "@/app/components/pdfs/Receipt";

const ReceiptPage = () => {
  const { id } = useParams();
  const router = useRouter();

  const loggedInUser = getLoggedInUser();
  const role = loggedInUser ? loggedInUser.role : null;
  const isAdmin = loggedInUser?.role === "Admin";

  const [receipt, setReceipt] = useState<ReceiptProps>({} as ReceiptProps);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendLoading, setSendLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    fetchReceipt();
  }, [id]);

  const fetchReceipt = async () => {
    try {
      const response = await fetch(`/api/user-subscriptions/receipts/${id}`);

      const result = await response.json();

      if (result.statusCode !== 200) {
        toast.error(result.message);
        throw new Error(result.message);
      }
      const receipt = result.data;
      setReceipt(receipt);
    } catch (err: any) {
    } finally {
      setLoading(false);
    }
  };

  const sendToClient = async () => {
    const { email, username, title, commitmentAmount, createdAt, receiptId } =
      receipt;

    setSendLoading(true);
    let pdfUrl = await generateAndUploadPDF();

    try {
      const res = await fetch(`/api/user-subscriptions/receipts/${id}/send`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          username,
          title,
          pdf: pdfUrl,
          commitmentAmount,
          createdAt,
          receiptId,
        }),
      });

      const response = await res.json();
      if (response.statusCode !== 200) {
        toast.error(response.message);
      }
      setTimeout(() => {
        router.push("/dashboard/user-subscriptions/receipts");
      }, 1000);
      toast.success(response.message);
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setSendLoading(false);
    }
  };

  const downloadPdf = async (url: string, filename = "document.pdf") => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch the file");

      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(blobUrl); // cleanup
    } catch (err) {
      console.error("Error downloading PDF:", err);
    }
  };

  const generateAndUploadPDF = async () => {
    try {
      const logoUrl =
        "https://res.cloudinary.com/dvm9wuu3f/image/upload/v1741172718/logo_gqnslm.png";
      let logoB64 = "";
      logoB64 = (await convertImageUrlToBase64(logoUrl)) ?? "";

      const htmlString = ReactDOMServer.renderToStaticMarkup(
        <ReceiptPDF receipt={{ ...receipt, logoB64 }} />,
      );
      const pdfElement = document.createElement("div");
      pdfElement.innerHTML = htmlString;

      const opt = {
        margin: 0.5,
        filename: `receipt-${receipt.username}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      };
      const mod: any = await import("html2pdf.js");
      const html2pdf = mod?.default ?? mod;
      const pdfBlob = await html2pdf()
        .from(pdfElement)
        .set(opt)
        .outputPdf("blob");

      const file = new File([pdfBlob], "receipt.pdf", {
        type: "application/pdf",
      });

      const receiptPdf =
        (await uploadFileToCloudinary(file, `receipts/${receipt.email}`)) ?? "";

      return receiptPdf;
      // Use the uploaded URL
    } catch (error) {
      toast.error("Error generating or uploading PDF");
    }
  };

  const {
    send,
    username,
    email,
    phone,
    productId,
    receiptId,
    commitmentDeadline,
    createdAt,
    commitmentAmount,
    title,
    pdf,
    clientCode,
  } = receipt;

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;

  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="mt-10">
      <div className="flex flex-wrap gap-10 items-center justify-between">
        <p className="text-2xl">Receipt</p>

        <div className="flex items-center gap-3">
          <Button
            className={`text-white ${
              !send
                ? "bg-gray-500 text-gray-200"
                : "bg-primaryBG hover:bg-primaryBG"
            } font-normal text-xs px-5 py-3 rounded-md`}
            type="button"
            disabled={!send}
            onClick={() => downloadPdf(pdf, "capital-call.pdf")}
          >
            {pdfLoading ? "Loading..." : "Download PDF"}
          </Button>
          {isAdmin && send ? (
            <Button
              className={`bg-green-200 text-green-600 font-normal text-xs px-5 py-3 rounded-md`}
              type="button"
              disabled
            >
              Sent
            </Button>
          ) : isAdmin && !send ? (
            <Button
              className={`text-white ${
                sendLoading
                  ? "bg-gray-500 text-gray-200"
                  : "bg-primaryBG hover:bg-primaryBG"
              } font-normal text-xs px-5 py-3 rounded-md`}
              type="button"
              disabled={sendLoading}
              onClick={sendToClient}
            >
              {sendLoading ? "Sending..." : "Send"}
            </Button>
          ) : null}
        </div>
      </div>
      <hr className="mt-5 mb-10" />

      <Image
        src="/images/logo.png"
        alt="brand"
        width={150}
        height={70}
        className="mt-10 mb-5"
      />

      <div className="grid lg:grid-cols-2 mb-10">
        <div>
          <p className="text-xl font-semibold mb-5">{username}</p>
          <p className="text-sm mb-2">
            Investment Title: <span className="font-semibold">{title}</span>{" "}
          </p>
          <p className="text-sm mb-2">
            Phone: <span className="font-semibold">{phone}</span>{" "}
          </p>
          <p className="text-sm mb-2">
            Email: <span className="font-semibold">{email}</span>{" "}
          </p>
          <p className="text-sm mb-2">
            Client Code: <span className="font-semibold">{clientCode}</span>{" "}
          </p>
          <p className="text-sm mb-2">
            Commitment Amount:{" "}
            <span className="font-semibold">
              AED {commitmentAmount && commitmentAmount.toLocaleString()}
            </span>{" "}
          </p>
        </div>
        <div>
          <p className="text-sm mb-2">
            Investment ID: <span className="font-semibold">{productId}</span>{" "}
          </p>
          <p className="text-sm mb-2">
            Receipt ID: <span className="font-semibold">{receiptId}</span>{" "}
          </p>
          <p className="text-sm mb-2">
            Commitment Deadline:{" "}
            <span className="font-semibold">
              {new Date(commitmentDeadline).toLocaleString("en-US", {
                hour12: true,
                hour: "numeric",
                minute: "2-digit",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>{" "}
          </p>
          <p className="text-sm mb-2">
            Submission Date:{" "}
            <span className="font-semibold">
              {new Date(createdAt).toLocaleString("en-US", {
                hour12: true,
                hour: "numeric",
                minute: "2-digit",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>{" "}
          </p>
        </div>
      </div>
      <hr className="mb-10" />
      <div className="grid lg:grid-cols-3 mb-10">
        <div className="">
          <div className="bg-primaryBG px-5 py-2 text-white">
            <p className="text-xl">Customer Detail</p>
          </div>
          <div className="grid border">
            <div className="flex items-center gap-2 px-5 py-10 border-b">
              <p className="">Name:</p>
              <p className="font-semibold">{username}</p>
            </div>
            <div className="flex items-center gap-2 px-5 py-10 border-r border-b">
              <p className="">Contact Number:</p>
              <p className="font-semibold">{phone}</p>
            </div>
          </div>
        </div>
        <div className="">
          <div className="bg-primaryBG px-5 py-2 text-white">
            <p className="text-xl">Payment Detail</p>
          </div>
          <div className="grid border">
            <div className="flex items-center gap-2 px-5 py-10 border-b">
              <p className="">Payment Date:</p>
              <p className="font-semibold">
                {" "}
                {new Date(createdAt).toLocaleString("en-US", {
                  hour12: true,
                  hour: "numeric",
                  minute: "2-digit",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center gap-2 px-5 py-10 border-r border-b">
              <p className="">Payment Method:</p>
              <p className="font-semibold">{"Bank Transfer"}</p>
            </div>
          </div>
        </div>
        <div className="">
          <div className="bg-primaryBG px-5 py-2 text-white">
            <p className="text-xl">Amount Received</p>
          </div>
          <div className="grid border">
            <div className="flex items-center gap-2 px-5 py-10 border-b">
              <p className="">Total Amount:</p>
              <p className="font-semibold">
                AED {commitmentAmount && commitmentAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPage;
