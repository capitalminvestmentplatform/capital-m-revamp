import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import Footer from "./Footer";

export default function Welcome({
  name,
  verificationUrl,
  password,
}: {
  name: string;
  verificationUrl: string;
  password: string;
}) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>Welcome to Capital M!</Preview>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src={`https://res.cloudinary.com/dvm9wuu3f/image/upload/v1741172718/logo_gqnslm.png`}
              width="70"
              height="70"
              alt="Capital M"
            />
          </Section>

          <Text style={nameText}>Dear {name}</Text>

          <Text style={heroText}>
            Welcome to Capital M! to activate your account, please verify your
            email below.
          </Text>

          <Button style={button} href={verificationUrl}>
            Verify Email
          </Button>
          <Text style={heroText}>
            Once the email is verified, you will be requested to change your
            PIN. The default PIN is <span style={bold}>{password}</span>
          </Text>

          <Text style={heroText}>
            If you didn't request this email, there's nothing to worry about,
            you can safely ignore it.
          </Text>

          <Text style={text}>
            If you have any questions, please feel free to reach out.
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

const heroText = {
  fontSize: "15px",
  lineHeight: "28px",
  marginBottom: "30px",
};
const text = {
  color: "#000",
  fontSize: "14px",
  lineHeight: "24px",
};

const nameText = {
  fontSize: "15px",
  lineHeight: "28px",
  marginBottom: "30px",
  fontWeight: "bold",
};

const bold = {
  fontWeight: "bold",
};
