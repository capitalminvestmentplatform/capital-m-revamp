"use client";
import React from "react";

interface Subscription {
  username: string;
  title: string;
  phone: string;
  email: string;
  clientCode?: string;
  commitmentAmount: number;
  subscriptionFee: number;
  managementFee: number;
  performanceFee: number;
  signB64: string;
  logoB64: string;
  terms: string;
  statements: string;
}

interface Props {
  subscription: Subscription;
}

const SignedSubscriptionPDF: React.FC<Props> = ({ subscription }) => {
  const {
    username,
    title,
    phone,
    email,
    clientCode,
    commitmentAmount,
    subscriptionFee,
    managementFee,
    performanceFee,
    logoB64,
    signB64,
    terms,
    statements,
  } = subscription;

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
        SUBSCRIPTION FORM
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
      </div>

      <h3 style={{ marginTop: 30, color: "gray" }}>Investment Details:</h3>
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
              <p style={{ fontWeight: "bold" }}>Commitment Amount:</p>
              <p>AED {commitmentAmount.toLocaleString()}</p>
            </td>
            <td style={{ border: "1px solid #ccc", padding: 8 }}>
              <p style={{ fontWeight: "bold" }}>Subscription Fee:</p>
              <p>{subscriptionFee} %</p>
            </td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #ccc", padding: 8 }}>
              <p style={{ fontWeight: "bold" }}>Management Fee:</p>
              <p>{managementFee} %</p>
            </td>
            <td style={{ border: "1px solid #ccc", padding: 8 }}>
              <p style={{ fontWeight: "bold" }}>Performance Fee:</p>
              <p>{performanceFee} %</p>
            </td>
          </tr>
        </tbody>
      </table>

      <div
        style={{ marginTop: 40, fontSize: 14 }}
        dangerouslySetInnerHTML={{ __html: statements }}
      />
      <div
        style={{ fontSize: 14 }}
        dangerouslySetInnerHTML={{ __html: terms }}
      />

      <div style={{ marginBottom: 20 }}>
        <img
          src={signB64}
          alt="Signature"
          style={{ height: 100, width: 100 }}
        />
      </div>

      <p style={{ marginTop: 60, fontSize: 16 }}>{username}</p>
    </div>
  );
};

export default SignedSubscriptionPDF;
