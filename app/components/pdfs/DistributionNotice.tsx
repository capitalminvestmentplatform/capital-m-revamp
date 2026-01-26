"use client";
import React from "react";

interface DistributionNotice {
  username: string;
  phone: string;
  email: string;
  clientCode?: string;
  distributionAmount: number;
  distributionDate: number;
  description: number;
  logoB64: string;
}

interface Props {
  distributionNotice: DistributionNotice;
}

const DistributionNoticePDF: React.FC<Props> = ({ distributionNotice }) => {
  const {
    username,
    phone,
    email,
    clientCode,
    distributionAmount,
    distributionDate,
    description,
    logoB64,
  } = distributionNotice;

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
        DISTRIBUTION NOTICE
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
        </div>
      </div>

      <h3 style={{ marginTop: 30, color: "gray" }}>
        Distribution Notice Details:
      </h3>
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
              <p style={{ fontWeight: "bold" }}>Distribution Date:</p>
              <p>
                {new Date(distributionDate).toLocaleString("en-US", {
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
              <p style={{ fontWeight: "bold" }}>Distribution Amount:</p>
              <p>AED {distributionAmount.toLocaleString()} </p>
            </td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #ccc", padding: 8 }}>
              <p style={{ fontWeight: "bold" }}>Description:</p>
              <p>{description} </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default DistributionNoticePDF;
