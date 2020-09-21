import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE

      const productsStorage = await AsyncStorage.getAllKeys();

      console.log('log do load', productsStorage);
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const doesProductExists = products.find(prod => prod.id === product.id);

      if (!doesProductExists) {
        setProducts([
          ...products,
          {
            ...product,
            quantity: 1,
          },
        ]);
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productFinded = products.find(prod => prod.id === id);

      if (productFinded) {
        const newProducts = products.map(prod => {
          if (prod.id === id) {
            return {
              ...prod,
              quantity: prod.quantity + 1,
            };
          }
          return prod;
        });

        setProducts(newProducts);

        await AsyncStorage.setItem(
          String(productFinded?.id),
          JSON.stringify(productFinded),
        );
      }
    },
    [products],
  );

  const decrement = useCallback(async id => {
    // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
    const productFinded = products.find(prod => prod.id === id);

    if (productFinded) {
      if (productFinded.quantity > 0) {
        setProducts([
          ...products,
          {
            ...productFinded,
            quantity: productFinded?.quantity - 1,
          },
        ]);
        await AsyncStorage.setItem(
          String(productFinded?.id),
          JSON.stringify(productFinded),
        );
      } else {
        const newProducts = products.filter(prod => prod.id !== id);

        setProducts(newProducts);
      }
    }
  }, []);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
