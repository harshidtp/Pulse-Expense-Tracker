import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BottomNavigation from "@/components/bottom-navigation";
import { useTransactions } from "@/context/TransactionContext";

const MONTHLY_BUDGET = 2800;
const CURRENCY = "EUR";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: CURRENCY,
  }).format(amount);

const budgetCategories = [
  { name: "Food & Drinks", limit: 450, icon: "🍔" },
  { name: "Shopping", limit: 350, icon: "🛍️" },
  { name: "Transport", limit: 200, icon: "🚗" },
  { name: "Entertainment", limit: 180, icon: "🎬" },
  { name: "Bills", limit: 650, icon: "📄" },
  { name: "Health", limit: 150, icon: "💊" },
  { name: "Education", limit: 250, icon: "📚" },
  { name: "Travel", limit: 300, icon: "✈️" },
  { name: "Other", limit: 270, icon: "📦" },
];

export default function BudgetsScreen() {
  const router = useRouter();
  const { transactions } = useTransactions();

  const now = new Date();

  const monthlyExpenses = useMemo(() => {
    return transactions.filter((transaction) => {
      const date = new Date(transaction.date);

      return (
        transaction.type === "expense" &&
        !Number.isNaN(date.getTime()) &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    });
  }, [transactions]);

  const totalSpent = monthlyExpenses.reduce(
    (total, item) => total + item.amount,
    0,
  );

  const remaining = MONTHLY_BUDGET - totalSpent;
  const percentage = (totalSpent / MONTHLY_BUDGET) * 100;

  const categories = budgetCategories.map((category) => {
    const spent = monthlyExpenses
      .filter((item) => item.category === category.name)
      .reduce((total, item) => total + item.amount, 0);

    const progress = (spent / category.limit) * 100;

    return {
      ...category,
      spent,
      progress,
    };
  });

  const monthName = now.toLocaleDateString("en-IE", {
    month: "long",
    year: "numeric",
  });

  const getStatus = (progress: number) => {
    if (progress >= 100) return "Limit exceeded";
    if (progress >= 80) return "Almost at limit";
    return "On track";
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "#FF718B";
    if (progress >= 80) return "#FFB454";
    return "#36D6A0";
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.push("/")}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Budgets</Text>
            <Text style={styles.subtitle}>Manage your monthly spending</Text>
          </View>

          <View style={styles.monthBadge}>
            <Text style={styles.monthBadgeText}>
              {now.toLocaleDateString("en-IE", { month: "short" })}
            </Text>
          </View>
        </View>

        {/* Main Budget Card */}
        <View style={styles.mainCard}>
          <Text style={styles.cardLabel}>MONTHLY SPENDING LIMIT</Text>

          <Text style={styles.mainAmount}>
            {formatCurrency(MONTHLY_BUDGET)}
          </Text>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(percentage, 100)}%`,
                  backgroundColor: getProgressColor(percentage),
                },
              ]}
            />
          </View>

          <View style={styles.mainStats}>
            <View>
              <Text style={styles.statLabel}>Spent</Text>
              <Text style={styles.spentAmount}>
                {formatCurrency(totalSpent)}
              </Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.statLabel}>Remaining</Text>
              <Text
                style={[
                  styles.remainingAmount,
                  remaining < 0 && { color: "#FF718B" },
                ]}
              >
                {formatCurrency(remaining)}
              </Text>
            </View>
          </View>

          <Text style={styles.monthText}>{monthName}</Text>
        </View>

        {/* Budget Overview */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Category budgets</Text>
          <Text style={styles.sectionSubtitle}>
            {categories.length} categories
          </Text>
        </View>

        {categories.map((category) => {
          const color = getProgressColor(category.progress);

          return (
            <View key={category.name} style={styles.categoryCard}>
              <View style={styles.categoryTop}>
                <View style={styles.categoryLeft}>
                  <View style={styles.iconBox}>
                    <Text style={styles.iconText}>{category.icon}</Text>
                  </View>

                  <View>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryStatus}>
                      {getStatus(category.progress)}
                    </Text>
                  </View>
                </View>

                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.categorySpent}>
                    {formatCurrency(category.spent)}
                  </Text>
                  <Text style={styles.categoryLimit}>
                    of {formatCurrency(category.limit)}
                  </Text>
                </View>
              </View>

              <View style={styles.categoryProgressBackground}>
                <View
                  style={[
                    styles.categoryProgressFill,
                    {
                      width: `${Math.min(category.progress, 100)}%`,
                      backgroundColor: color,
                    },
                  ]}
                />
              </View>

              <View style={styles.categoryBottom}>
                <Text style={styles.categoryPercent}>
                  {Math.round(category.progress)}% used
                </Text>

                <Text style={styles.categoryRemaining}>
                  {formatCurrency(category.limit - category.spent)} left
                </Text>
              </View>
            </View>
          );
        })}

        {/* Budget Insight */}
        <View style={styles.insightCard}>
          <Text style={styles.insightIcon}>✨</Text>

          <View style={{ flex: 1 }}>
            <Text style={styles.insightTitle}>Budget insight</Text>

            <Text style={styles.insightDescription}>
              {percentage >= 100
                ? "You have exceeded your monthly spending budget. Review your expenses to find opportunities to reduce spending."
                : percentage >= 80
                  ? "You are approaching your monthly spending limit. Keep an eye on your remaining budget."
                  : "You are within your monthly spending budget. Keep tracking your expenses to stay on course."}
            </Text>
          </View>
        </View>

        <View style={{ height: 25 }} />
      </ScrollView>

      {/* Shared Bottom Navigation */}
      <BottomNavigation activeTab="budgets" />
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
    marginBottom: 25,
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
  backText: {
    color: "#FFFFFF",
    fontSize: 32,
    marginTop: -4,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "800",
  },
  subtitle: {
    color: "#8993AA",
    fontSize: 12,
    marginTop: 4,
  },
  monthBadge: {
    backgroundColor: "#29234E",
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  monthBadgeText: {
    color: "#B8ADFF",
    fontSize: 12,
    fontWeight: "700",
  },
  mainCard: {
    backgroundColor: "#171E35",
    borderRadius: 23,
    padding: 22,
    borderWidth: 1,
    borderColor: "#303456",
    marginBottom: 29,
  },
  cardLabel: {
    color: "#9AA5BE",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.3,
  },
  mainAmount: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
    marginTop: 12,
    marginBottom: 23,
  },
  progressBackground: {
    height: 10,
    backgroundColor: "#303950",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 10,
  },
  mainStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
  },
  statLabel: {
    color: "#929DB4",
    fontSize: 12,
    marginBottom: 7,
  },
  spentAmount: {
    color: "#FF718B",
    fontSize: 18,
    fontWeight: "800",
  },
  remainingAmount: {
    color: "#36D6A0",
    fontSize: 18,
    fontWeight: "800",
  },
  monthText: {
    color: "#8993AA",
    fontSize: 11,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
  },
  sectionSubtitle: {
    color: "#8993AA",
    fontSize: 12,
  },
  categoryCard: {
    backgroundColor: "#151C30",
    borderRadius: 18,
    padding: 17,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#252E46",
  },
  categoryTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 17,
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconBox: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#242C42",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  categoryName: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  categoryStatus: {
    color: "#929DB4",
    fontSize: 10,
    marginTop: 5,
  },
  categorySpent: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  categoryLimit: {
    color: "#8993AA",
    fontSize: 10,
    marginTop: 4,
  },
  categoryProgressBackground: {
    height: 7,
    backgroundColor: "#303950",
    borderRadius: 10,
    overflow: "hidden",
  },
  categoryProgressFill: {
    height: "100%",
    borderRadius: 10,
  },
  categoryBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 11,
  },
  categoryPercent: {
    color: "#929DB4",
    fontSize: 10,
  },
  categoryRemaining: {
    color: "#AAB4C9",
    fontSize: 10,
    fontWeight: "600",
  },
  insightCard: {
    backgroundColor: "#211E43",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#40366E",
    padding: 17,
    flexDirection: "row",
    marginTop: 12,
    gap: 12,
  },
  insightIcon: {
    fontSize: 23,
  },
  insightTitle: {
    color: "#C4B8FF",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 7,
  },
  insightDescription: {
    color: "#B4B0CE",
    fontSize: 12,
    lineHeight: 19,
  },
});
