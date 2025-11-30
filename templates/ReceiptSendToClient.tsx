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
import Footer from "./Footer";

interface ReceiptSendToClientEmailProps {
  username: string;
  title: string;
  receiptUrl: string;
  commitmentAmount: number;
  receiptId: string;
  createdAt: Date;
}

const ReceiptSendToClient: React.FC<ReceiptSendToClientEmailProps> = ({
  username,
  title,
  receiptUrl,
  commitmentAmount,
  receiptId,
  createdAt,
}) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>Receipt received for ${title} - Capital M</Preview>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src={`https://res.cloudinary.com/dvm9wuu3f/image/upload/v1741172718/logo_gqnslm.png`}
              width="70"
              height="70"
              alt="Capital M"
            />
          </Section>

          <Text style={nameText}>Dear {username}</Text>

          <Text style={heroText}>
            Congratulations on your successful subscription to the investment
            opportunity through Capital M! We are delighted to have you as a
            valued investor. This email serves as confirmation of your payment.
          </Text>

          <Text style={text}>
            <span>Receipt Details:</span>
          </Text>

          <Text style={text}>
            Investment Title:{" "}
            <span style={{ fontWeight: "bold" }}>{title}</span>
          </Text>
          <Text style={text}>
            Amount Received:{" "}
            <span style={{ fontWeight: "bold" }}>
              AED {commitmentAmount && commitmentAmount.toLocaleString()}
            </span>
          </Text>
          <Text style={text}>
            Payment Method:{" "}
            <span style={{ fontWeight: "bold" }}>{"Bank Transfer"}</span>
          </Text>
          <Text style={text}>
            Receipt ID: <span style={{ fontWeight: "bold" }}>{receiptId}</span>
          </Text>
          <Text style={text}>
            Payment Date:{" "}
            <span style={{ fontWeight: "bold" }}>
              {" "}
              {new Date(createdAt).toLocaleString("en-US", {
                hour12: true,
                hour: "numeric",
                minute: "2-digit",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </Text>
          <Text style={text}>
            Please check the attached file below. If you have any questions,
            please feel free to reach out.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default ReceiptSendToClient;

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

const span = {
  fontWeight: "bold",
};

const nameText = {
  fontSize: "15px",
  lineHeight: "28px",
  marginBottom: "30px",
  fontWeight: "bold",
};
