import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  subcategory: string;
  stock: number;
  sku: string;
  rating: number;
  isNew?: boolean;
  isSale?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export const categories = [
  {
    name: "Mujer",
    subcategories: ["Abrigos", "Chaquetas", "Vestidos", "Camisas", "Camisetas", "Jeans"],
  },
  {
    name: "Hombre",
    subcategories: ["Camisas", "Camisetas", "Pantalones", "Chaquetas", "Trajes"],
  },
  {
    name: "Niños",
    subcategories: ["Camisetas", "Pantalones", "Vestidos", "Zapatos"],
  },
  {
    name: "Accesorios",
    subcategories: ["Bolsos", "Gafas", "Relojes", "Joyería"],
  },
  {
    name: "Cosméticos",
    subcategories: ["Maquillaje", "Skincare", "Perfumes"],
  },
];

export const products: Product[] = [
  {
    id: 1,
    name: "Blazer de Tweed con Botones",
    description: "Elegante blazer de tweed con botones dorados, perfecto para ocasiones formales e informales.",
    price: 69.99,
    originalPrice: 89.99,
    image: product1,
    category: "Mujer",
    subcategory: "Chaquetas",
    stock: 15,
    sku: "BLZ-001",
    rating: 4.5,
    isSale: true,
  },
  {
    id: 2,
    name: "Bolso de Cuero Premium",
    description: "Bolso de cuero genuino con asa de madera, diseño minimalista y elegante.",
    price: 49.99,
    image: product2,
    category: "Accesorios",
    subcategory: "Bolsos",
    stock: 23,
    sku: "BLS-002",
    rating: 4.8,
    isNew: true,
  },
  {
    id: 3,
    name: "Vestido de Verano Arcoíris",
    description: "Vestido colorido de tirantes, ideal para días cálidos de verano.",
    price: 29.99,
    image: product3,
    category: "Mujer",
    subcategory: "Vestidos",
    stock: 30,
    sku: "VST-003",
    rating: 4.2,
    isNew: true,
  },
  {
    id: 4,
    name: "Polo Clásico Rojo",
    description: "Polo de algodón premium en rojo vibrante, corte regular fit.",
    price: 35.00,
    originalPrice: 45.00,
    image: product4,
    category: "Hombre",
    subcategory: "Camisetas",
    stock: 42,
    sku: "PLO-004",
    rating: 4.0,
    isSale: true,
  },
  {
    id: 5,
    name: "Gafas Aviador Doradas",
    description: "Gafas de sol estilo aviador con marco dorado y lentes degradados.",
    price: 59.99,
    image: product5,
    category: "Accesorios",
    subcategory: "Gafas",
    stock: 18,
    sku: "GFS-005",
    rating: 4.7,
  },
  {
    id: 6,
    name: "Blazer Azul Marino",
    description: "Blazer elegante azul marino con bolsillo pañuelo, ideal para eventos.",
    price: 89.99,
    originalPrice: 120.00,
    image: product6,
    category: "Hombre",
    subcategory: "Trajes",
    stock: 10,
    sku: "BLZ-006",
    rating: 4.9,
    isSale: true,
  },
];
