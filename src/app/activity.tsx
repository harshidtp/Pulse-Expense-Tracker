import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BottomNavigation from "@/components/bottom-navigation";
import { useTransactions } from "@/context/TransactionContext";
import { Transaction } from "@/types/transaction";

type FilterType = "all" | "income" | "expense";

const CURRENCY = "EUR";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: CURRENCY,
  }).format(amount);

const categoryIcons: Record<string, string> = {
  "Food & Drinks": "🍔",
  Shopping: "🛍️",
  Transport: "🚗",
  Entertainment: "🎬",
  Bills: "📄",
  Health: "💊",
  Education: "📚",
  Travel: "✈️",
  Salary: "💼",
  Freelance: "💻",
  Other: "📦",
};

const getDateLabel = (date: string) => {
  const transactionDate = new Date(date);

  if (Number.isNaN(transactionDate.getTime())) {
    return "Date unavailable";
  }

  return transactionDate.toLocaleDateString("en-IE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function ActivityScreen() {
  const router = useRouter();
  const { transactions } = useTransactions();

  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const date = new Date(transaction.date);

      return (
        !Number.isNaN(date.getTime()) &&
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    });
  }, [transactions, currentMonth, currentYear]);

  const monthlyIncome = monthlyTransactions
    .filter((item) => item.type === "income")
    .reduce((total, item) => total + item.amount, 0);

  const monthlyExpenses = monthlyTransactions
    .filter((item) => item.type === "expense")
    .reduce((total, item) => total + item.amount, 0);

  const categories = useMemo(() => {
    return [
      "All",
      ...Array.from(new Set(transactions.map((item) => item.category))).sort(),
    ];
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...transactions]
      .filter((transaction) => {
        const matchesType = filter === "all" || transaction.type === filter;

        const matchesCategory =
          selectedCategory === "All" ||
          transaction.category === selectedCategory;

        const matchesSearch =
          !query ||
          transaction.title.toLowerCase().includes(query) ||
          transaction.category.toLowerCase().includes(query);

        return matchesType && matchesCategory && matchesSearch;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filter, selectedCategory, search]);

  const renderTransaction = (item: Transaction) => {
    const isIncome = item.type === "income";

    return (
      <View key={item.id} style={styles.transactionCard}>
        <View style={styles.transactionLeft}>
          <View style={styles.categoryIcon}>
            <Text style={styles.categoryEmoji}>
              {categoryIcons[item.category] || "📦"}
            </Text>
          </View>

          <View style={styles.transactionDetails}>
            <Text style={styles.transactionTitle} numberOfLines={1}>
              {item.title}
            </Text>

            <Text style={styles.transactionMeta}>
              {item.category} · {getDateLabel(item.date)}
            </Text>
          </View>
        </View>

        <Text
          style={[
            styles.transactionAmount,
            isIncome ? styles.incomeText : styles.expenseText,
          ]}
        >
          {isIncome ? "+" : "-"}
          {formatCurrency(item.amount)}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.push("/")}>
            <Text style={styles.backButtonText}>‹</Text>
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Activity</Text>
            <Text style={styles.headerSubtitle}>
              Your complete transaction history
            </Text>
          </View>

          <Pressable
            style={styles.addButton}
            onPress={() => router.push("/add-transaction")}
          >
            <Text style={styles.addButtonText}>+</Text>
          </Pressable>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.sectionLabel}>THIS MONTH</Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <View style={styles.summaryLabelRow}>
                <View style={styles.incomeDot} />
                <Text style={styles.summaryLabel}>Income</Text>
              </View>

              <Text style={styles.incomeValue}>
                {formatCurrency(monthlyIncome)}
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryItem}>
              <View style={styles.summaryLabelRow}>
                <View style={styles.expenseDot} />
                <Text style={styles.summaryLabel}>Expenses</Text>
              </View>

              <Text style={styles.expenseValue}>
                {formatCurrency(monthlyExpenses)}
              </Text>
            </View>
          </View>

          <View style={styles.netRow}>
            <Text style={styles.netLabel}>Net cash flow</Text>

            <Text
              style={[
                styles.netValue,
                monthlyIncome - monthlyExpenses >= 0
                  ? styles.incomeText
                  : styles.expenseText,
              ]}
            >
              {formatCurrency(monthlyIncome - monthlyExpenses)}
            </Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>⌕</Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            placeholderTextColor="#778097"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />

          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Text style={styles.clearSearch}>×</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.filterRow}>
          {(["all", "income", "expense"] as FilterType[]).map((item) => {
            const active = filter === item;

            return (
              <Pressable
                key={item}
                onPress={() => setFilter(item)}
                style={[
                  styles.filterButton,
                  active && styles.activeFilterButton,
                ]}
              >
                <Text
                  style={[styles.filterText, active && styles.activeFilterText]}
                >
                  {item === "all"
                    ? "All"
                    : item === "income"
                      ? "Income"
                      : "Expenses"}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.categoryHeading}>Categories</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          {categories.map((category) => {
            const active = selectedCategory === category;

            return (
              <Pressable
                key={category}
                onPress={() => setSelectedCategory(category)}
                style={[
                  styles.categoryChip,
                  active && styles.activeCategoryChip,
                ]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    active && styles.activeCategoryChipText,
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Transactions</Text>
          <Text style={styles.transactionCount}>
            {filteredTransactions.length} found
          </Text>
        </View>

        {filteredTransactions.length > 0 ? (
          <View style={styles.transactionList}>
            {filteredTransactions.map(renderTransaction)}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>No transactions found</Text>

            <Text style={styles.emptyDescription}>
              Try changing your filters or add a new transaction.
            </Text>

            <Pressable
              style={styles.emptyButton}
              onPress={() => router.push("/add-transaction")}
            >
              <Text style={styles.emptyButtonText}>+ Add Transaction</Text>
            </Pressable>
          </View>
        )}

        <View style={{ height: 25 }} />
      </ScrollView>

      <BottomNavigation activeTab="activity" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#090D1B",
  },
  container: {
    paddingHorizontal: 22,
    paddingTop: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 26,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#171E32",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 32,
    lineHeight: 36,
    marginTop: -4,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: "#8993AA",
    fontSize: 12,
    marginTop: 4,
  },
  addButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#7765F8",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 29,
    lineHeight: 34,
  },
  summaryCard: {
    backgroundColor: "#151C30",
    borderRadius: 22,
    padding: 20,
    marginBottom: 23,
    borderWidth: 1,
    borderColor: "#252E46",
  },
  sectionLabel: {
    color: "#8E9AB2",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
  },
  incomeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#36D6A0",
    marginRight: 7,
  },
  expenseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#FF718B",
    marginRight: 7,
  },
  summaryLabel: {
    color: "#A0A9BD",
    fontSize: 12,
  },
  incomeValue: {
    color: "#36D6A0",
    fontSize: 18,
    fontWeight: "800",
  },
  expenseValue: {
    color: "#FF718B",
    fontSize: 18,
    fontWeight: "800",
  },
  summaryDivider: {
    width: 1,
    height: 43,
    backgroundColor: "#303950",
    marginHorizontal: 16,
  },
  netRow: {
    borderTopWidth: 1,
    borderTopColor: "#303950",
    marginTop: 20,
    paddingTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  netLabel: {
    color: "#A0A9BD",
    fontSize: 13,
  },
  netValue: {
    fontSize: 16,
    fontWeight: "800",
  },
  incomeText: {
    color: "#36D6A0",
  },
  expenseText: {
    color: "#FF718B",
  },
  searchContainer: {
    height: 52,
    borderRadius: 15,
    backgroundColor: "#151C30",
    borderWidth: 1,
    borderColor: "#252E46",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 19,
  },
  searchIcon: {
    color: "#929DB4",
    fontSize: 26,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
  },
  clearSearch: {
    color: "#A0A9BD",
    fontSize: 24,
    paddingHorizontal: 5,
  },
  filterRow: {
    flexDirection: "row",
    backgroundColor: "#151C30",
    borderRadius: 14,
    padding: 5,
    marginBottom: 23,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 11,
    alignItems: "center",
    borderRadius: 10,
  },
  activeFilterButton: {
    backgroundColor: "#7765F8",
  },
  filterText: {
    color: "#929DB4",
    fontSize: 13,
    fontWeight: "600",
  },
  activeFilterText: {
    color: "#FFFFFF",
  },
  categoryHeading: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 13,
  },
  categoryList: {
    paddingBottom: 24,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    backgroundColor: "#151C30",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#252E46",
  },
  activeCategoryChip: {
    backgroundColor: "#29234E",
    borderColor: "#7765F8",
  },
  categoryChipText: {
    color: "#A0A9BD",
    fontSize: 12,
    fontWeight: "600",
  },
  activeCategoryChipText: {
    color: "#B8ADFF",
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  listTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
  },
  transactionCount: {
    color: "#8993AA",
    fontSize: 12,
  },
  transactionList: {
    gap: 11,
  },
  transactionCard: {
    backgroundColor: "#151C30",
    borderRadius: 17,
    padding: 15,
    borderWidth: 1,
    borderColor: "#222B42",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  categoryIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#222A40",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 5,
  },
  transactionMeta: {
    color: "#8993AA",
    fontSize: 11,
  },
  transactionAmount: {
    fontSize: 13,
    fontWeight: "800",
  },
  emptyState: {
    backgroundColor: "#151C30",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    marginTop: 5,
  },
  emptyIcon: {
    fontSize: 35,
    marginBottom: 13,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  emptyDescription: {
    color: "#8993AA",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 19,
    marginTop: 8,
    marginBottom: 18,
  },
  emptyButton: {
    backgroundColor: "#7765F8",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
});
