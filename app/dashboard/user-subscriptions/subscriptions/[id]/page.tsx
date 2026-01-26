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
import SignaturePad from "signature_pad";
import { SubscriptionProps } from "@/types/subscriptions";
import ReactDOMServer from "react-dom/server";
import SignedSubscriptionPDF from "@/app/components/pdfs/SignedSubscription";

const SubscriptionPage = () => {
  const { id } = useParams();
  const router = useRouter();

  const loggedInUser = getLoggedInUser();
  const role = loggedInUser ? loggedInUser.role : null;
  const isAdmin = role === "Admin";

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);

  const [subscription, setSubscription] = useState<SubscriptionProps>(
    {} as SubscriptionProps,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendLoading, setSendLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [signLoading, setSignLoading] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, [id]);

  useEffect(() => {
    if (loading) return; // wait until loading is done

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    const context = canvas.getContext("2d");
    if (context) context.scale(ratio, ratio);

    signaturePadRef.current = new SignaturePad(canvas, {
      backgroundColor: "rgba(255, 255, 255, 0)",
    });

    return () => {
      signaturePadRef.current?.off();
      signaturePadRef.current = null;
    };
  }, [loading]); // add 'loading' as dependency

  // Clear signature
  const clearSignature = () => {
    signaturePadRef.current?.clear();
  };

  const fetchSubscription = async () => {
    try {
      const response = await fetch(
        `/api/user-subscriptions/subscriptions/${id}`,
      );

      const result = await response.json();

      if (result.statusCode !== 200) {
        setError(result.message);
        toast.error(result.message);
        throw new Error(result.message);
      }
      const subscription = result.data;
      // loadSignatureCanvas();
      setSubscription(subscription);
    } catch (err: any) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const sendToClient = async () => {
    const { email, username, title, productId } = subscription;
    try {
      setSendLoading(true);
      const res = await fetch(
        `/api/user-subscriptions/subscriptions/${id}/send`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            username,
            title,
            productId,
          }),
        },
      );

      const response = await res.json();
      if (response.statusCode !== 200) {
        toast.error(response.message);
      }

      toast.success(response.message);

      setTimeout(() => {
        router.push("/dashboard/user-subscriptions/subscriptions");
      }, 1000);
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

  const dataURLtoBlob = (dataUrl: string) => {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime || "image/png" });
  };

  const signSubscription = async () => {
    const { username, title } = subscription;

    if (signaturePadRef.current?.isEmpty()) {
      toast.error("Please draw a signature");
      return;
    }

    const dataUrl = signaturePadRef.current?.toDataURL("image/png");
    let blob = dataURLtoBlob(dataUrl || "");

    try {
      setSignLoading(true);

      // Convert signature blob to a File
      const file = new File([blob], "signature.png", { type: "image/png" });

      const signatureUrl =
        (await uploadFileToCloudinary(
          file,
          `signatures/${subscription.email}`,
        )) ?? "";

      generateAndUploadPDF(username, signatureUrl, title);
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
    }
  };

  const generateAndUploadPDF = async (
    username: string,
    signatureUrl: string,
    title: string,
  ) => {
    try {
      const logoUrl =
        "https://res.cloudinary.com/dvm9wuu3f/image/upload/v1741172718/logo_gqnslm.png";
      let logoB64 = "";
      logoB64 = (await convertImageUrlToBase64(logoUrl)) ?? "";
      let signB64 = "";
      signB64 = (await convertImageUrlToBase64(signatureUrl)) ?? "";

      const htmlString = ReactDOMServer.renderToStaticMarkup(
        <SignedSubscriptionPDF
          subscription={{ ...subscription, logoB64, signB64 }}
        />,
      );
      const pdfElement = document.createElement("div");
      pdfElement.innerHTML = htmlString;

      const opt = {
        margin: 0.5,
        filename: `subscription-${subscription.username}.pdf`,
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

      const file = new File([pdfBlob], "signed-subscription.pdf", {
        type: "application/pdf",
      });

      const signedSubscription =
        (await uploadFileToCloudinary(
          file,
          `signed-subscriptions/${subscription.email}`,
        )) ?? "";

      const res = await fetch(
        `/api/user-subscriptions/subscriptions/${id}/sign-subscription`,
        {
          method: "PUT",
          body: JSON.stringify({
            sign: signatureUrl,
            signedSubscription,
            username,
            title,
          }),
        },
      );

      const response = await res.json();
      if (response.statusCode !== 200) {
        toast.error(response.message || "Update failed");
        throw new Error(response.message);
      }
      toast.success(response.message);

      setTimeout(() => {
        router.push("/dashboard/user-subscriptions/subscriptions");
      }, 1000);

      // Use the uploaded URL
    } catch (error) {
      toast.error("Error generating or uploading PDF");
    } finally {
    }
  };

  const {
    send,
    username,
    email,
    clientCode,
    phone,
    productId,
    commitmentDeadline,
    createdAt,
    projectedReturn,
    commitmentAmount,
    investmentDuration,
    title,
    subscriptionFee,
    managementFee,
    performanceFee,
    statements,
    terms,
    sign,
    signedSubscription,
  } = subscription;

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;

  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="mt-10">
      <div className="flex flex-wrap gap-10 items-center justify-between">
        <p className="text-2xl">Subscription Agreement</p>

        <div className="flex items-center gap-3">
          <Button
            className={`text-white ${
              !signedSubscription
                ? "bg-gray-500 text-gray-200"
                : "bg-primaryBG hover:bg-primaryBG"
            } font-normal text-xs px-5 py-3 rounded-md`}
            type="button"
            disabled={!signedSubscription}
            onClick={() =>
              downloadPdf(signedSubscription, "signed-subscription.pdf")
            }
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
      <hr className="mt-5" />

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
            Phone: <span className="font-semibold">{phone}</span>{" "}
          </p>
          <p className="text-sm mb-2">
            Email: <span className="font-semibold">{email}</span>{" "}
          </p>
          <p className="text-sm mb-2">
            Client Code: <span className="font-semibold">{clientCode}</span>{" "}
          </p>
        </div>
        <div>
          <p className="text-sm mb-2">
            Investment ID: <span className="font-semibold">{productId}</span>{" "}
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

      <div className="grid lg:grid-cols-3 mb-10">
        <div className="lg:col-span-2">
          <div className="bg-primaryBG px-5 py-2 text-white">
            <p className="text-xl">Investment Details</p>
          </div>
          <div className="grid grid-cols-2 border">
            <div className="flex items-center gap-2 px-5 py-10 border-b col-span-2">
              <p className="">Investment Title:</p>
              <p className="font-semibold">{title}</p>
            </div>
            <div className="flex items-center gap-2 px-5 py-10 border-r border-b">
              <p className="">Expected Return:</p>
              <p className="font-semibold">{projectedReturn} %</p>
            </div>
            <div className="flex items-center gap-2 px-5 py-10 border-b">
              <p className="">Category:</p>
              <p className="font-semibold">{productId}</p>
            </div>
            <div className="flex items-center gap-2 px-5 py-10 border-r">
              <p className="">Commitment Amount:</p>
              <p className="font-semibold">
                AED {commitmentAmount && commitmentAmount.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2 px-5 py-10">
              <p className="">Project Duration:</p>
              <p className="font-semibold">{investmentDuration} years</p>
            </div>
          </div>
        </div>
        <div>
          <div className="bg-primaryBG px-5 py-2 text-white">
            <p className="text-xl">Capital M Fees</p>
          </div>
          <div className="grid border">
            <div className="flex items-center gap-2 px-5 py-10 border-b">
              <p className="">Subscription Fee:</p>
              <p className="font-semibold">{subscriptionFee} %</p>
            </div>
            <div className="flex items-center gap-2 px-5 py-10 border-r border-b">
              <p className="">Management Fee:</p>
              <p className="font-semibold">{managementFee} %</p>
            </div>
            <div className="flex items-center gap-2 px-5 py-10 border-b">
              <p className="">performance Fee:</p>
              <p className="font-semibold">{performanceFee} %</p>
            </div>
          </div>
        </div>
      </div>

      <div
        dangerouslySetInnerHTML={{ __html: statements }}
        className="text-gray-500 mb-10"
      />

      <p className="text-xl">Terms & Conditions: </p>

      <div
        dangerouslySetInnerHTML={{ __html: terms }}
        className="text-gray-500 mb-10 mt-5"
      />

      {sign ? (
        <div className="">
          <img src={sign} alt="Signature" width={200} height={100} />
        </div>
      ) : (
        !isAdmin && (
          <div className="mt-5">
            <p className="text-sm font-medium mb-2">Draw Signature:</p>
            <div className="border rounded-md w-[300px] h-[150px]">
              <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{ minWidth: "300px", minHeight: "150px" }}
              />
            </div>
            <div className="flex gap-3 mt-3">
              <Button
                onClick={clearSignature}
                className="bg-gray-300 hover:bg-gray-300 text-gray-500 text-xs px-3 py-1"
                disabled={signLoading}
              >
                Clear
              </Button>
              <Button
                className={`${signLoading ? "bg-gray-300 text-gray-500" : "bg-primaryBG hover:bg-primaryBG"} px-3 py-2 text-xs font-normal text-white rounded-md`}
                onClick={signSubscription}
                disabled={signLoading}
              >
                {signLoading ? "Uploading..." : "Upload Signature"}
              </Button>{" "}
            </div>
          </div>
        )
      )}

      <p className="mb-10 mt-3 text-lg font-semibold">{username}</p>
    </div>
  );
};

export default SubscriptionPage;
