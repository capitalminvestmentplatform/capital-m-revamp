export interface AggregatedClosingBalanceProps {
  email: string;
  clientCode: string;
  cash: number;
  equity: number;
  fixedIncome: number;
  realEstate: number;
  others?: number;
}

export interface PortfolioItemProps {
  email: string;
  clientCode: string;
  category: string;
  subCategory: string;
  userAsset: string;
  costPrice: number;
  marketValue: number;
  initialCost: number;
}

export interface ClosingBalanceItemProps {
  id: string;
  email: string;
  clientCode: string;
  cash: number;
  equity: number;
  fixedIncome: number;
  realEstate: number;
  others?: number;
}
