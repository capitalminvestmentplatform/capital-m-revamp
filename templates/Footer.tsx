import React from "react";
import { Column, Img, Link, Row, Section, Text } from "@react-email/components";

const Footer = () => {
  return (
    <>
      <Section>
        <Row style={footerLogos}>
          <Column style={{ width: "66%" }}>
            <Img
              src="https://res.cloudinary.com/dvm9wuu3f/image/upload/v1741172718/logo_gqnslm.png"
              width="70"
              height="70"
              alt="Company Logo"
            />
          </Column>
          <Column>
            <Section>
              <Row>
                <Column>
                  <Link href="https://twitter.com">
                    <Img
                      src="https://cdn-icons-png.flaticon.com/512/733/733579.png"
                      width="20"
                      height="20"
                      alt="Twitter"
                      style={socialMediaIcon}
                    />
                  </Link>
                </Column>
                <Column>
                  <Link href="https://facebook.com">
                    <Img
                      src="https://cdn-icons-png.flaticon.com/512/733/733547.png"
                      width="20"
                      height="20"
                      alt="Facebook"
                      style={socialMediaIcon}
                    />
                  </Link>
                </Column>
                <Column>
                  <Link href="https://linkedin.com">
                    <Img
                      src="https://cdn-icons-png.flaticon.com/512/733/733561.png"
                      width="20"
                      height="20"
                      alt="LinkedIn"
                      style={socialMediaIcon}
                    />
                  </Link>
                </Column>
              </Row>
            </Section>
          </Column>
        </Row>
      </Section>{" "}
      <Section>
        <Text style={footerText}>
          ©{new Date().getFullYear()} Versatile Synergy. <br />
          7th Floor, Mostafa Bin Abdullatif, O-14 Chedder Cheese Tower Marasi
          Drive Business Bay Dubai <br />
          <br />
          All rights reserved.
        </Text>
      </Section>
    </>
  );
};

export default Footer;

const footerText = {
  fontSize: "12px",
  color: "#b7b7b7",
  lineHeight: "15px",
  textAlign: "left" as const,
  marginBottom: "50px",
};

const footerLogos = {
  marginBottom: "32px",
  paddingLeft: "8px",
  paddingRight: "8px",
  display: "block",
};

const socialMediaIcon = {
  display: "inline",
  marginLeft: "32px",
};
