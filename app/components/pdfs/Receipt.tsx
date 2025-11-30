"use client";
import React from "react";

interface Receipt {
  username: string;
  title: string;
  phone: string;
  email: string;
  clientCode?: string;
  commitmentAmount: number;
  logoB64: string;
  receiptId: string;
  productId: string;
  createdAt: Date;
}

interface Props {
  receipt: Receipt;
}

const ReceiptPDF: React.FC<Props> = ({ receipt }) => {
  const {
    username,
    title,
    phone,
    email,
    clientCode,
    commitmentAmount,
    logoB64,
    receiptId,
    productId,
    createdAt,
  } = receipt;

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        padding: 30,
        color: "#333",
        maxWidth: 800,
        margin: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <img src={logoB64} alt="Logo" style={{ height: 60 }} />
      </div>

      <p
        style={{
          fontSize: 25,
          textAlign: "center",
          marginBottom: 30,
          fontWeight: 600,
        }}
      >
        RECEIPT
      </p>

      <p style={{ fontSize: 30, fontWeight: "bold" }}>{username}</p>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 10,
        }}
      >
        <div>
          <p style={{ marginBottom: 0 }}>
            <strong>Phone:</strong> {phone}
          </p>
          <p style={{ marginBottom: 0 }}>
            <strong>Email:</strong> {email}
          </p>
          <p style={{ marginBottom: 0 }}>
            <strong>Client Code:</strong> {clientCode || "N/A"}
          </p>
          <p style={{ marginBottom: 0 }}>
            <strong>Investment Title:</strong> {title}
          </p>
          <p style={{ marginBottom: 0 }}>
            <strong>Commitment Amount:</strong> AED{" "}
            {commitmentAmount && commitmentAmount.toLocaleString()}
          </p>
        </div>
        <div>
          <p style={{ marginBottom: 0 }}>
            <strong>Investment ID:</strong> {productId}
          </p>
          <p style={{ marginBottom: 0 }}>
            <strong>Receipt ID:</strong> {receiptId}
          </p>
        </div>
      </div>

      <h3 style={{ marginTop: 30, color: "gray" }}>Receipt Details:</h3>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: 20,
          fontSize: 10,
        }}
      >
        <tbody>
          <tr>
            <td style={{ border: "1px solid #ccc", padding: 8 }}>
              <p style={{ fontWeight: "bold" }}>Name:</p>
              <p>{username}</p>
            </td>
            <td style={{ border: "1px solid #ccc", padding: 8 }}>
              <p style={{ fontWeight: "bold" }}>Contact Number:</p>
              <p>{phone} </p>
            </td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #ccc", padding: 8 }}>
              <p style={{ fontWeight: "bold" }}>Payment Date:</p>
              <p>
                {" "}
                {new Date(createdAt).toLocaleString("en-US", {
                  hour12: true,
                  hour: "numeric",
                  minute: "2-digit",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}{" "}
              </p>
            </td>
            <td style={{ border: "1px solid #ccc", padding: 8 }}>
              <p style={{ fontWeight: "bold" }}>Payment Method:</p>
              <p>{"Bank Transfer"} </p>
            </td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #ccc", padding: 8 }}>
              <p style={{ fontWeight: "bold" }}>Total Amount:</p>
              <p>AED {commitmentAmount.toLocaleString()} </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ReceiptPDF;
