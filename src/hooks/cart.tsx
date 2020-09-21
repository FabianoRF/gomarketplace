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
      const storageProducts = await AsyncStorage.getItem(
        '@GoMarketPlace:products',
      );

      if (storageProducts) {
        setProducts([...JSON.parse(storageProducts)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const doesProductExists = products.find(prod => prod.id === product.id);

      if (doesProductExists) {
        setProducts(
          products.map(p =>
            p.id === product.id ? { ...product, quantity: p.quantity + 1 } : p,
          ),
        );
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }

      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(products),
      );
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
          '@GoMarketPlace:products',
          JSON.stringify(newProducts),
        );
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const productFinded = products.find(prod => prod.id === id);

      if (productFinded) {
        const newProducts: Product[] = [];

        products.forEach(async prod => {
          let storageProduct: Product = {} as Product;
          if (prod.id === id) {
            if (prod.quantity > 1) {
              newProducts.push({
                ...prod,
                quantity: prod.quantity - 1,
              });
              storageProduct = prod;
            }
          } else {
            storageProduct = prod;

            newProducts.push(prod);
          }
        });
        setProducts(newProducts);
        await AsyncStorage.clear();
        await AsyncStorage.setItem(
          '@GoMarketPlace:products',
          JSON.stringify(newProducts),
        );
      }
    },
    [products],
  );

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
