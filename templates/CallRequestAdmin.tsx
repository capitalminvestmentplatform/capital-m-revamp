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

interface CallRequestAdminEmailProps {
  username: string;
  userEmail: string;
  title: string;
  phone: number;
  message: string;
  clientCode: string;
}

const CallRequestAdmin: React.FC<CallRequestAdminEmailProps> = ({
  username,
  userEmail,
  title,
  phone,
  message,
  clientCode,
}) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>Call Request received for ${title} - Capital M</Preview>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src={`https://res.cloudinary.com/dvm9wuu3f/image/upload/v1741172718/logo_gqnslm.png`}
              width="70"
              height="70"
              alt="Capital M"
            />
          </Section>

          <Text style={nameText}>Dear Admin</Text>

          <Text style={heroText}>
            We would like to notify you that a call request has been received on
            our platform. This email serves as a notification to keep you
            informed about the recent activity.
          </Text>

          <Text style={text}>
            <span>{"Call Request Details:"}</span>
          </Text>

          <Text style={text}>
            Username:{" "}
            <span style={{ fontWeight: "bold" }}>
              {clientCode} {username}
            </span>
          </Text>

          <Text style={text}>
            User Email: <span style={{ fontWeight: "bold" }}> {userEmail}</span>
          </Text>

          <Text style={text}>
            User Phone: <span style={{ fontWeight: "bold" }}>{phone}</span>
          </Text>

          <Text style={text}>
            Title: <span style={{ fontWeight: "bold" }}>{title}</span>
          </Text>
          <Text style={text}>
            Message: <span style={{ fontWeight: "bold" }}>{message}</span>
          </Text>

          <Button
            style={button}
            href={`${process.env.NEXT_PUBLIC_BASE_URL}dashboard/user-subscriptions/call-requests`}
          >
            View Call Request
          </Button>

          <Text style={text}>
            If you have any questions, please feel free to reach out.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default CallRequestAdmin;

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
