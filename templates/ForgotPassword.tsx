import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import Footer from "./Footer";

export default function ForgotPasswordEmail({
  name,
  resetUrl,
}: {
  name: string;
  resetUrl: string;
}) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>Reset your password</Preview>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src="https://res.cloudinary.com/dvm9wuu3f/image/upload/v1741172718/logo_gqnslm.png"
              width="70"
              height="70"
              alt="Company Logo"
            />
          </Section>

          <Heading style={h1}>Reset Your Password</Heading>

          <Text style={nameText}>Hello {name},</Text>

          <Text style={heroText}>
            You recently requested to reset your password. Click the button
            below to reset it.
          </Text>

          <Button style={button} href={resetUrl}>
            Reset Password
          </Button>

          <Text style={text}>
            If you did not request a password reset, please ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const button = {
  backgroundColor: "#386264",
  color: "#ffffff",
  padding: "12px 20px",
  textDecoration: "none",
  borderRadius: "5px",
  display: "inline-block",
};

const main = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "0px 20px",
};

const logoContainer = {
  marginTop: "32px",
};

const h1 = {
  color: "#1d1c1d",
  fontSize: "25px",
  fontWeight: "700",
  margin: "30px 0",
  padding: "0",
  lineHeight: "42px",
};

const heroText = {
  fontSize: "15px",
  lineHeight: "28px",
  marginBottom: "30px",
};

const nameText = {
  fontSize: "15px",
  lineHeight: "28px",
  marginBottom: "30px",
  fontWeight: "bold",
};

const text = {
  color: "#000",
  fontSize: "14px",
  lineHeight: "24px",
};
