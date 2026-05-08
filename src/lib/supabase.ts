// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variables de entorno de Supabase no configuradas. Añade VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu .env'
  );
} else {
  console.log('Supabase env: URL present, anon key present (hidden)');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Tipos base ────────────────────────────────────────────────

export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  role: UserRole;
  instagram: string;
  dob: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_price: number | null;
  cost_price: number | null;
  stock: number;
  low_stock_threshold: number;
  sku: string | null;
  barcode: string | null;
  image_url: string;
  is_active: boolean;
  is_featured: boolean;
  weight: number | null;
  tags: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  // joins opcionales
  categories?: Category | null;
  product_images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  address_line1: string;
  address_line2: string;
  zip_code: string;
  divipola_code: string;  // código DIVIPOLA del municipio (requerido por MiPaquete)
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  created_at: string;
  // join
  product?: Product;
}

export type OrderStatus =
  | 'pending' | 'confirmed' | 'processing'
  | 'shipped'  | 'delivered' | 'cancelled' | 'refunded';

export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'refunded' | 'cancelled';

export interface Order {
  id: string;
  user_id: string;
  address_id: string | null;
  status: OrderStatus;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  tax: number;
  total: number;
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_address: Record<string, any>;
  shipping_method: string;
  tracking_number: string | null;
  carrier: string | null;
  tracking_url: string | null;
  estimated_delivery: string | null;
  cancellation_reason: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
  // joins
  order_items?: OrderItem[];
  profiles?: Pick<Profile, 'full_name' | 'email'>;
  status_history?: OrderStatusHistory[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_sku: string;
  product_image: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  created_at: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  previous_status: string | null;
  new_status: string;
  changed_by: string | null;
  changed_at: string;
  notes: string | null;
  profiles?: Pick<Profile, 'full_name' | 'email'>;
}

export type PaymentProvider = 'stripe' | 'mercadopago' | 'paypal' | 'transferencia' | 'efectivo' | 'bold' | 'otro';

export interface Payment {
  id: string;
  order_id: string;
  user_id: string;
  provider: PaymentProvider;
  provider_ref: string | null;
  provider_data: Record<string, any>;
  status: PaymentStatus;
  amount: number;
  currency: string;
  refunded_amount: number;
  paid_at: string | null;
  refunded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

// ── Tipos Bold ────────────────────────────────────────────────

export type BoldStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR' | 'REFUNDED';

export interface PagoBold {
  id: string;
  order_id: string;
  payment_id: string | null;
  bold_order_id: string;       // referencia única enviada a Bold
  bold_transaction_id: string | null;
  bold_status: BoldStatus;
  amount: number;
  currency: string;
  integrity_hash: string;
  webhook_payload: Record<string, any>;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

// ── Tipos Logística MiPaquete ────────────────────────────────

export type LogisticaStatus =
  | 'cotizada' | 'generada' | 'en_transito'
  | 'entregada' | 'novedad' | 'devuelta';

export interface LogisticaEnvio {
  id: string;
  order_id: string;
  mipaquete_id: string | null;
  tracking_id: string | null;
  carrier: string;
  service_type: string;
  guia_pdf_url: string;
  shipping_cost: number;
  currency: string;
  destination: Record<string, any>;
  status: LogisticaStatus;
  api_response: Record<string, any>;
  dispatched_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

// ── Cotización de envío ──────────────────────────────────────

export interface ShippingRate {
  carrier: string;             // Ej: 'Servientrega'
  service_type: string;        // Ej: 'Estándar'
  price: number;               // en COP
  estimated_days: number;
  carrier_code: string;        // código interno MiPaquete
}

export interface ShippingQuoteResponse {
  rates: ShippingRate[];
  cheapest: ShippingRate | null;
}

// ── Datos de checkout ────────────────────────────────────────

export interface CheckoutFormData {
  full_name: string;
  document_number: string;
  phone: string;
  email: string;
  department: string;          // nombre del departamento
  city: string;                // nombre del municipio
  divipola_code: string;       // código DIVIPOLA del municipio
  address_line1: string;
  address_line2: string;       // piso, apto, bloque, etc.
  property_type: 'Casa' | 'Apartamento' | 'Oficina' | 'Bodega' | 'Otro';
  notes: string;
}