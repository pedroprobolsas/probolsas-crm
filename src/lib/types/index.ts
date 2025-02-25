// Add these types to your existing types file

export interface Quote {
  id: string;
  client_id: string;
  quote_number: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  total_amount: number;
  valid_until: Date;
  terms: string;
  notes: string;
  items: QuoteItem[];
  created_at: string;
}

export interface QuoteItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes: string;
}