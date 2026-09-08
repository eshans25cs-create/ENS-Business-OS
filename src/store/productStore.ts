import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
  id: string;
  businessId: string;
  name: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  unit: string;
  stock: number;
  isActive: boolean;
}

interface ProductStore {
  products: Product[];
  
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, data: Partial<Omit<Product, 'id' | 'businessId'>>) => void;
  deleteProduct: (id: string) => void;
  searchProducts: (businessId: string, query: string) => Product[];
  getBusinessProducts: (businessId: string) => Product[];
}

const SAMPLE_PRODUCTS: Product[] = [
  { id: 'p1', businessId: 'demo_biz', name: 'Rice', category: 'Groceries', costPrice: 40, sellingPrice: 50, unit: 'kg', stock: 100, isActive: true },
  { id: 'p2', businessId: 'demo_biz', name: 'Milk', category: 'Dairy', costPrice: 25, sellingPrice: 30, unit: 'L', stock: 50, isActive: true },
  { id: 'p3', businessId: 'demo_biz', name: 'Bread', category: 'Bakery', costPrice: 30, sellingPrice: 40, unit: 'pack', stock: 30, isActive: true },
  { id: 'p4', businessId: 'demo_biz', name: 'Sugar', category: 'Groceries', costPrice: 35, sellingPrice: 42, unit: 'kg', stock: 80, isActive: true },
  { id: 'p5', businessId: 'demo_biz', name: 'Oil', category: 'Groceries', costPrice: 120, sellingPrice: 140, unit: 'L', stock: 60, isActive: true },
  { id: 'p6', businessId: 'demo_biz', name: 'Detergent', category: 'Household', costPrice: 150, sellingPrice: 180, unit: 'kg', stock: 40, isActive: true },
  { id: 'p7', businessId: 'demo_biz', name: 'Salt', category: 'Groceries', costPrice: 15, sellingPrice: 20, unit: 'kg', stock: 200, isActive: true },
  { id: 'p8', businessId: 'demo_biz', name: 'Tea', category: 'Beverages', costPrice: 200, sellingPrice: 250, unit: 'kg', stock: 25, isActive: true },
  { id: 'p9', businessId: 'demo_biz', name: 'Coffee', category: 'Beverages', costPrice: 400, sellingPrice: 500, unit: 'kg', stock: 15, isActive: true },
  { id: 'p10', businessId: 'demo_biz', name: 'Biscuits', category: 'Snacks', costPrice: 20, sellingPrice: 30, unit: 'pack', stock: 150, isActive: true },
];

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      products: SAMPLE_PRODUCTS,
      
      addProduct: (data) => {
        const newProduct: Product = {
          ...data,
          id: `prod_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
        };
        set((state) => ({ products: [...state.products, newProduct] }));
        return newProduct;
      },
      
      updateProduct: (id, data) => set((state) => ({
        products: state.products.map(p => p.id === id ? { ...p, ...data } : p)
      })),
      
      deleteProduct: (id) => set((state) => ({
        products: state.products.filter(p => p.id !== id)
      })),
      
      searchProducts: (businessId, query) => {
        const { products } = get();
        const lowerQuery = query.toLowerCase();
        return products.filter(p => 
          p.businessId === businessId && 
          p.isActive &&
          (p.name.toLowerCase().includes(lowerQuery) || p.category.toLowerCase().includes(lowerQuery))
        );
      },
      
      getBusinessProducts: (businessId) => {
        return get().products.filter(p => p.businessId === businessId && p.isActive);
      }
    }),
    {
      name: 'ens-products',
      version: 1,
    }
  )
);
