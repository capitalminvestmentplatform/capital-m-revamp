export interface SubscriptionProps {
  send: boolean;
  username: string;
  email: string;
  phone: string;
  productId: string;
  commitmentDeadline: Date;
  createdAt: Date;
  projectedReturn: number;
  commitmentAmount: number;
  investmentDuration: number;
  title: string;
  statements: string;
  terms: string;
  sign: string;
  clientCode: string;
  signedSubscription: string;
  subscriptionFee: number;
  managementFee: number;
  performanceFee: number;
  // Add other properties of the subscription object here if needed
}
