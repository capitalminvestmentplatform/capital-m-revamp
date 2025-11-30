"use client";
import React from "react";

interface CapitalCall {
  username: string;
  title: string;
  phone: string;
  email: string;
  clientCode?: string;
  commitmentAmount: number;
  logoB64: string;
  data: any;
}

interface Props {
  capitalCall: CapitalCall;
}

const CapitalCallPDF: React.FC<Props> = ({ capitalCall }) => {
  const {
    username,
    title,
    phone,
    email,
    clientCode,
    commitmentAmount,
    logoB64,
    data,
  } = capitalCall;
  const { bankName, accountName, IBAN, accountNumber, swiftCode, branch } =
    data;
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
        CAPITAL CALL
      </p>

      <p style={{ fontSize: 30, fontWeight: "bold" }}>{username}</p>
      <div style={{ fontSize: 10 }}>
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

      <h3 style={{ marginTop: 30, color: "gray" }}>Bank Details:</h3>
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
              <p style={{ fontWeight: "bold" }}>Bank Name:</p>
              <p>{bankName}</p>
            </td>
            <td style={{ border: "1px solid #ccc", padding: 8 }}>
              <p style={{ fontWeight: "bold" }}>Account Name:</p>
              <p>{accountName} </p>
            </td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #ccc", padding: 8 }}>
              <p style={{ fontWeight: "bold" }}>IBAN:</p>
              <p>{IBAN} </p>
            </td>
            <td style={{ border: "1px solid #ccc", padding: 8 }}>
              <p style={{ fontWeight: "bold" }}>Account No:</p>
              <p>{accountNumber} </p>
            </td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #ccc", padding: 8 }}>
              <p style={{ fontWeight: "bold" }}>Branch:</p>
              <p>{branch} </p>
            </td>
            <td style={{ border: "1px solid #ccc", padding: 8 }}>
              <p style={{ fontWeight: "bold" }}>Swift Code:</p>
              <p>{swiftCode} </p>
            </td>
          </tr>
        </tbody>
      </table>

      <p style={{ marginTop: 60, fontSize: 16 }}>
        {
          "If you have any questions or concerns, please do not hesitate to reach out to us at any time. Thank you."
        }
      </p>
    </div>
  );
};

export default CapitalCallPDF;
