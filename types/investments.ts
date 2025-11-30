export interface InvestmentProps {
  _id: string;
  status: string;
  investmentDuration: number;
  productId: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  currentValue: number;
  expectedValue: number;
  projectedReturn: string; // Added this property
  minInvestment: number;
  subscriptionFee: number;
  managementFee: number;
  performanceFee: number;
  activationDate: string;
  expirationDate: string;
  commitmentDeadline: string;
  state: string;
  area: string;
  terms: string;
  galleryImages: string[];
  featuredImage: string;
  faqs: string[];
  docs: string[];
  video: string;
}
