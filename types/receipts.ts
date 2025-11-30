export interface ReceiptProps {
  send: boolean;
  username: string;
  email: string;
  phone: string;
  productId: string;
  commitmentDeadline: Date;
  createdAt: Date;
  commitmentAmount: number;
  title: string;
  clientCode: string;
  pdf: string;
  receiptId: string;
}
