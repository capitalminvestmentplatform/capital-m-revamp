import { render } from "@react-email/render";
import React from "react";

import VerifyUser from "@/templates/VerifyUser"; // Import email template
import Welcome from "@/templates/Welcome";
import Investment from "@/templates/Investment";
import CommitmentUser from "./CommitmentUser";
import CommitmentAdmin from "./CommitmentAdmin";
import SubscriptionSendToClient from "./SubscriptionSendToClient";
import CapitalCallSendToClient from "./CapitalCallSendToClient";
import ReceiptSendToClient from "./ReceiptSendToClient";
import CallRequestAdmin from "./CallRequestAdmin";
import SignedSubscriptionSendToClient from "./SignedSubscriptionSendToClient";
import DistributionNotice from "./DistributionNotice";
import Statement from "./Statement";
import KYC from "./KYC";
import NewsLetter from "./NewsLetter";
import WelcomeTemp from "./WelcomeTemp";

export async function newsletterEmail(
  payload: {
    name: string;
    email: string;
    category: string;
    investmentTitle: string;
    subject: string;
    description: string;
  },
  subject: string,
) {
  const {
    name,
    email,
    category,
    description,
    investmentTitle,
    subject: newsletterTitle,
  } = payload;

  const emailHtml = await render(
    React.createElement(NewsLetter, {
      name,
      category,
      investmentTitle,
      description,
      newsletterTitle,
    }),
  );

  return sendEmail(email, subject, emailHtml);
}
export async function kycEmail(
  payload: {
    name: string;
    email: string;
    isAdmin?: boolean;
  },
  subject: string,
) {
  const { name, email, isAdmin } = payload;

  const emailHtml = await render(
    React.createElement(KYC, {
      name,
      isAdmin,
    }),
  );

  return sendEmail(email, subject, emailHtml);
}
export async function statementEmail(
  payload: {
    firstName: string;
    lastName: string;
    email: string;
    clientCode: string;
    month: string;
    year: number;
    id: string;
    attachment: {
      file: string;
      name: string;
    };
  },
  subject: string,
) {
  const {
    firstName,
    lastName,
    email,
    clientCode,
    month,
    year,
    attachment,
    id,
  } = payload;

  const name = `${firstName} ${lastName}`;

  const statementUrl = `${process.env.NEXT_PUBLIC_BASE_URL}dashboard/statements`;

  const emailHtml = await render(
    React.createElement(Statement, {
      name,
      clientCode,
      month,
      year,
      statementUrl,
    }),
  );

  return sendEmail(email, subject, emailHtml, attachment);
}

export async function distributionNoticeEmail(
  payload: {
    firstName: string;
    lastName: string;
    email: string;
    clientCode: string;
    description: string;
    distributionAmount: number;
    attachment: {
      file: string;
      name: string;
    };
  },
  subject: string,
) {
  const {
    firstName,
    lastName,
    email,
    clientCode,
    description,
    distributionAmount,
    attachment,
  } = payload;

  const name = `${firstName} ${lastName}`;
  const emailHtml = await render(
    React.createElement(DistributionNotice, {
      name,
      clientCode,
      distributionAmount,
      description,
    }),
  );

  return sendEmail(email, subject, emailHtml, attachment);
}

export async function receiptSendToClientEmail(
  payload: {
    username: string;
    email: string;
    title?: string;
    receiptId: string;
    commitmentAmount: number;
    createdAt: Date;
    id: string;
    attachment: {
      file: string;
      name: string;
    };
  },
  subject: string,
) {
  const {
    username,
    email,
    title,
    receiptId,
    commitmentAmount,
    createdAt,
    id,
    attachment,
  } = payload;
  const receiptUrl = `${process.env.NEXT_PUBLIC_BASE_URL}dashboard/user-subscriptions/receipts/${id}`;

  const emailHtml = await render(
    React.createElement(ReceiptSendToClient, {
      username,
      title,
      receiptUrl,
      commitmentAmount,
      receiptId,
      createdAt,
    }),
  );

  return sendEmail(email, subject, emailHtml, attachment);
}

export async function capitalCallSendToClientEmail(
  payload: {
    username: string;
    email: string;
    title: string;
    capitalCallId: string;
    commitmentAmount: number;
    bankName: string;
    accountName: string;
    IBAN: string;
    accountNumber: string;
    swiftCode: string;
    branch: string;
    attachment: {
      file: string;
      name: string;
    };
  },
  subject: string,
) {
  const {
    username,
    email,
    title,
    capitalCallId,
    commitmentAmount,
    bankName,
    accountName,
    IBAN,
    accountNumber,
    swiftCode,
    branch,
    attachment,
  } = payload;
  const capitalCallUrl = `${process.env.NEXT_PUBLIC_BASE_URL}dashboard/user-subscriptions/capital-calls/${capitalCallId}`;

  const emailHtml = await render(
    React.createElement(CapitalCallSendToClient, {
      username,
      title,
      capitalCallUrl,
      commitmentAmount,
      bankName,
      accountName,
      IBAN,
      accountNumber,
      swiftCode,
      branch,
    }),
  );

  return sendEmail(email, subject, emailHtml, attachment);
}

export async function subscriptionSendToClientEmail(
  payload: {
    username: string;
    email: string;
    title: string;
    productId: string;
    subscriptionId: string;
  },
  subject: string,
) {
  const { username, email, title, productId, subscriptionId } = payload;
  const subscriptionUrl = `${process.env.NEXT_PUBLIC_BASE_URL}dashboard/user-subscriptions/subscriptions/${subscriptionId}`;

  const emailHtml = await render(
    React.createElement(SubscriptionSendToClient, {
      username,
      title,
      productId,
      subscriptionUrl,
    }),
  );

  return sendEmail(email, subject, emailHtml);
}

export async function signedSubscriptionSendToClientEmail(
  payload: {
    username: string;
    email: string;
    title: string;
    subscriptionId: string;
    attachment: {
      file: string;
      name: string;
    };
  },
  subject: string,
) {
  const { username, email, title, attachment, subscriptionId } = payload;
  const subscriptionUrl = `${process.env.NEXT_PUBLIC_BASE_URL}dashboard/user-subscriptions/subscriptions/${subscriptionId}`;

  const emailHtml = await render(
    React.createElement(SignedSubscriptionSendToClient, {
      username,
      title,
      subscriptionUrl,
    }),
  );

  return sendEmail(email, subject, emailHtml, attachment);
}

export async function commitmentUserEmail(
  payload: {
    firstName: string;
    lastName: string;
    email: string;
    title: string;
    phone: number;
    commitmentAmount: number;
    productId: string;
  },
  subject: string,
) {
  const {
    firstName,
    lastName,
    email,
    title,
    phone,
    commitmentAmount,
    productId,
  } = payload;
  const emailHtml = await render(
    React.createElement(CommitmentUser, {
      name: `${firstName} ${lastName}`,
      title,
      phone,
      commitmentAmount,
      productId,
    }),
  );

  return sendEmail(email, subject, emailHtml);
}

export async function callRequestAdminEmail(
  payload: {
    username: string;
    userEmail: string;
    adminEmail: string;
    title: string;
    phone: number;
    message: string;
    clientCode: string;
  },
  subject: string,
) {
  const { username, userEmail, adminEmail, title, phone, message, clientCode } =
    payload;
  const emailHtml = await render(
    React.createElement(CallRequestAdmin, {
      username,
      userEmail,
      title,
      phone,
      message,
      clientCode,
    }),
  );

  return sendEmail(adminEmail, subject, emailHtml);
}

export async function commitmentAdminEmail(
  payload: {
    username: string;
    userEmail: string;
    adminEmail: string;
    clientCode: string;
    title: string;
    phone: number;
    commitmentAmount: number;
    message: string;
  },
  subject: string,
) {
  const {
    username,
    userEmail,
    adminEmail,
    title,
    phone,
    commitmentAmount,
    clientCode,
    message,
  } = payload;
  const emailHtml = await render(
    React.createElement(CommitmentAdmin, {
      username,
      userEmail,
      title,
      phone,
      commitmentAmount,
      message,
      clientCode,
    }),
  );

  return sendEmail(adminEmail, subject, emailHtml);
}

export async function accountVerificationEmail(
  payload: {
    firstName: string;
    lastName: string;
    email: string;
    verificationToken: string;
  },
  subject: string,
) {
  const { firstName, lastName, email, verificationToken } = payload;
  const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}auth/verify-user?token=${verificationToken}`;
  const emailHtml = await render(
    React.createElement(VerifyUser, {
      name: `${firstName} ${lastName}`,
      verifyUrl: verificationUrl,
    }),
  );

  return sendEmail(email, subject, emailHtml);
}

export async function newInvestmentEmail(
  payload: {
    firstName: string;
    lastName: string;
    email: string;
    title: string;
    projectedReturn: string;
    investmentDuration: string;
    investmentId: string;
  },
  subject: string,
) {
  const {
    firstName,
    lastName,
    email,
    title,
    projectedReturn,
    investmentDuration,
    investmentId,
  } = payload;

  const investmentUrl = `${process.env.NEXT_PUBLIC_BASE_URL}dashboard/investments/${investmentId}`;
  const emailHtml = await render(
    React.createElement(Investment, {
      name: `${firstName} ${lastName}`,
      title,
      projectedReturn: projectedReturn,
      investmentDuration: +investmentDuration,
      investmentUrl,
    }),
  );

  return sendEmail(email, subject, emailHtml);
}

export async function forgotPasswordEmail(
  payload: {
    firstName: string;
    lastName: string;
    email: string;
    resetToken: string;
  },
  subject: string,
) {
  const { firstName, lastName, email, resetToken } = payload;
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}auth/verify-reset-pin?token=${resetToken}`;
  const emailHtml = await render(
    React.createElement(VerifyUser, {
      name: `${firstName} ${lastName}`,
      verifyUrl: resetUrl,
    }),
  );

  return sendEmail(email, subject, emailHtml);
}

export async function welcomeEmailTemp(
  payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  },
  subject: string,
) {
  const { firstName, lastName, email, password } = payload;

  const emailHtml = await render(
    React.createElement(WelcomeTemp, {
      name: `${firstName} ${lastName}`,
      password,
    }),
  );

  return sendEmail(email, subject, emailHtml);
}
export async function welcomeEmail(
  payload: {
    firstName: string;
    lastName: string;
    email: string;
    verificationToken: string;
    password: string;
  },
  subject: string,
) {
  const { firstName, lastName, email, verificationToken, password } = payload;
  const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}auth/verify-user?token=${verificationToken}`;

  const emailHtml = await render(
    React.createElement(Welcome, {
      name: `${firstName} ${lastName}`,
      verificationUrl,
      password,
    }),
  );

  return sendEmail(email, subject, emailHtml);
}

async function sendEmail(
  to: string,
  subject: string,
  content: string,
  attachment?: {
    file: string;
    name: string;
  },
) {
  try {
    const directUrl = `${attachment?.file}${attachment?.file.includes("?") ? "&" : "?"}alt=media`;

    const pdf = directUrl;
    const pdfName = attachment?.name;
    let payload = "";
    if (attachment?.file) {
      payload = JSON.stringify({ to, subject, content, pdf, pdfName });
    } else {
      payload = JSON.stringify({ to, subject, content });
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}api/brevo/email`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      },
    );

    if (!response.ok) {
      console.error("Failed to send email", response);
    }
  } catch (error) {
    console.error("Email API Error:", error);
  }
}
