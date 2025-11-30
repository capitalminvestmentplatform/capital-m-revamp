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

interface InvestmentEmailProps {
  name: string;
  title: string;
  projectedReturn: string;
  investmentDuration: number;
  investmentUrl: string;
}

const Investment: React.FC<InvestmentEmailProps> = ({
  name,
  title,
  projectedReturn,
  investmentDuration,
  investmentUrl,
}) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>New Investment Opportunity</Preview>
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
            We are excited to announce a new investment opportunity. Log in to
            your account to view and subscribe.
          </Text>

          <Text style={text}>
            Investment Title:{" "}
            <span style={{ fontWeight: "bold" }}>{title}</span>
          </Text>

          <Text style={text}>
            Investment Duration:{" "}
            <span style={{ fontWeight: "bold" }}>
              {investmentDuration} years
            </span>
          </Text>

          <Text style={text}>
            Expected Profit:{" "}
            <span style={{ fontWeight: "bold" }}>
              {projectedReturn.toLocaleString()}
            </span>
          </Text>

          <Button style={button} href={investmentUrl}>
            View Investment
          </Button>

          <Text style={text}>
            If you have any questions, please feel free to reach out.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default Investment;

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
