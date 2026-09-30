export interface Offer {
  id: string;
  title: string;
  discount_pct: number;
  original_price: number | null;
  final_price: number | null;
}

export interface PendingCharge {
  id: string;
  offer_title: string | null;
  amount: number;
  payment_method: string;
  expires_at: string;
}

export interface RecentTx {
  id?: string;
  original_amount: number;
  discount_pct: number;
  final_amount: number;
  client_name?: string;
  offer_title?: string;
}
