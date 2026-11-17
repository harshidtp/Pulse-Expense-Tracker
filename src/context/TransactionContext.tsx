import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { Transaction } from "@/types/transaction";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@pulse_finance_transactions";

type TransactionContextType = {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
};

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined,
);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved transactions when the app starts
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const savedTransactions = await AsyncStorage.getItem(STORAGE_KEY);

        if (savedTransactions) {
          setTransactions(JSON.parse(savedTransactions));
        }
      } catch (error) {
        console.error("Failed to load transactions:", error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadTransactions();
  }, []);

  // Save transactions whenever they change after initial loading
  useEffect(() => {
    if (!isLoaded) return;

    const saveTransactions = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
      } catch (error) {
        console.error("Failed to save transactions:", error);
      }
    };

    saveTransactions();
  }, [transactions, isLoaded]);

  const addTransaction = (transaction: Transaction) => {
    setTransactions((previous) => [transaction, ...previous]);
  };

  return (
    <TransactionContext.Provider value={{ transactions, addTransaction }}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);

  if (!context) {
    throw new Error("useTransactions must be used inside TransactionProvider");
  }

  return context;
}
