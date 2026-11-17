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

// Temporary demonstration values.
const OPENING_BALANCE = 12450.8;
const MONTHLY_BUDGET = 2800;

const categoryColors: Record<string, string> = {
  "Food & Drinks": "#D9A76C",
  Shopping: "#E66B78",
  Transport: "#8C91FF",
  Entertainment: "#E66B78",
  Bills: "#F0A35B",
  Health: "#49C99A",
  Education: "#63B3ED",
  Travel: "#8C91FF",
  Salary: "#49C99A",
  Freelance: "#49C99A",
  Other: "#A58BFF",
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);

export default function HomeScreen() {
  const router = useRouter();
  const { transactions } = useTransactions();

  // Transactions recorded during the current month.
  const monthlyTransactions = useMemo(() => {
    const now = new Date();

    return transactions.filter((item) => {
      const transactionDate = new Date(item.date);

      return (
        transactionDate.getMonth() === now.getMonth() &&
        transactionDate.getFullYear() === now.getFullYear()
      );
    });
  }, [transactions]);

  const totalIncome = monthlyTransactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpenses = monthlyTransactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalBalance =
    OPENING_BALANCE +
    transactions.reduce(
      (sum, item) =>
        sum + (item.type === "income" ? item.amount : -item.amount),
      0,
    );

  const remainingBudget = MONTHLY_BUDGET - totalExpenses;

  const budgetPercentage =
    MONTHLY_BUDGET > 0 ? (totalExpenses / MONTHLY_BUDGET) * 100 : 0;

  const progressWidth = `${Math.min(budgetPercentage, 100)}%` as `${number}%`;

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>H</Text>
            </View>

            <View>
              <Text style={styles.greeting}>WELCOME BACK</Text>
              <Text style={styles.userName}>Harshid 👋</Text>
            </View>
          </View>

          <Pressable style={styles.notificationButton}>
            <Text style={styles.notificationIcon}>♧</Text>
            <View style={styles.notificationDot} />
          </Pressable>
        </View>

        {/* ADD TRANSACTION */}
        <Pressable
          onPress={() => router.push("/add-transaction")}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>+ Add Transaction</Text>
        </Pressable>

        {/* BALANCE CARD */}
        <View style={styles.balanceCard}>
          <View style={styles.cardTop}>
            <Text style={styles.cardLabel}>TOTAL BALANCE</Text>

            <View style={styles.accountBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.accountText}>All accounts</Text>
            </View>
          </View>

          <Text style={styles.balanceAmount}>
            {formatCurrency(totalBalance)}
          </Text>

          <View style={styles.balanceChange}>
            <Text style={styles.changeDescription}>
              Based on your opening balance and recorded transactions
            </Text>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.balanceFooter}>
            <View>
              <Text style={styles.footerLabel}>ACCOUNT BALANCE</Text>
              <Text style={styles.footerValue}>Personal Account</Text>
            </View>

            <Text style={styles.cardLogo}>PULSE.</Text>
          </View>

          <View style={styles.glowCircle} />
        </View>

        {/* OVERVIEW */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.periodText}>This month</Text>
        </View>

        <View style={styles.overviewRow}>
          <View style={styles.overviewCard}>
            <View style={styles.overviewIconGreen}>
              <Text style={styles.overviewIconText}>↙</Text>
            </View>

            <Text style={styles.overviewLabel}>Total Income</Text>

            <Text style={styles.overviewAmount}>
              {formatCurrency(totalIncome)}
            </Text>

            <Text style={styles.positiveChange}>Recorded this month</Text>
          </View>

          <View style={styles.overviewCard}>
            <View style={styles.overviewIconRed}>
              <Text style={styles.overviewIconText}>↗</Text>
            </View>

            <Text style={styles.overviewLabel}>Total Expenses</Text>

            <Text style={styles.overviewAmount}>
              {formatCurrency(totalExpenses)}
            </Text>

            <Text style={styles.negativeChange}>Recorded this month</Text>
          </View>
        </View>

        {/* MONTHLY BUDGET */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Monthly Budget</Text>
          <Text style={styles.viewAll}>Monthly limit</Text>
        </View>

        <View style={styles.budgetCard}>
          <View style={styles.budgetTop}>
            <View>
              <Text style={styles.budgetLabel}>You've spent</Text>

              <Text style={styles.budgetAmount}>
                {formatCurrency(totalExpenses)}
              </Text>
            </View>

            <View style={styles.budgetPercentage}>
              <Text style={styles.percentageText}>
                {Math.round(budgetPercentage)}%
              </Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: progressWidth,
                  backgroundColor:
                    budgetPercentage >= 100 ? "#F16E79" : "#9275F5",
                },
              ]}
            />
          </View>

          <View style={styles.budgetBottom}>
            <Text
              style={[
                styles.budgetHint,
                remainingBudget < 0 && { color: "#F16E79" },
              ]}
            >
              {remainingBudget >= 0
                ? `${formatCurrency(remainingBudget)} remaining`
                : `${formatCurrency(Math.abs(remainingBudget))} over budget`}
            </Text>

            <Text style={styles.budgetLimit}>
              of {formatCurrency(MONTHLY_BUDGET)}
            </Text>
          </View>
        </View>

        {/* AI FINANCIAL INSIGHT */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>AI Financial Insight</Text>

          <View style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>✧ AI POWERED</Text>
          </View>
        </View>

        <View style={styles.aiCard}>
          <View style={styles.aiIcon}>
            <Text style={styles.aiIconText}>✧</Text>
          </View>

          <View style={styles.aiContent}>
            <Text style={styles.aiTitle}>Your financial overview</Text>

            <Text style={styles.aiDescription}>
              You've recorded {formatCurrency(totalExpenses)} in expenses this
              month. Your budget has{" "}
              {formatCurrency(Math.max(remainingBudget, 0))} remaining.
              {remainingBudget < 0
                ? " You have exceeded your monthly budget."
                : " Keep tracking your spending to understand your financial habits."}
            </Text>

            <Text style={styles.aiDisclaimer}>
              Basic spending summary · AI integration coming later
            </Text>
          </View>
        </View>

        {/* RECENT TRANSACTIONS */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>

          <Pressable onPress={() => router.push("/activity")}>
            <Text style={styles.viewAll}>See all →</Text>
          </Pressable>
        </View>

        <View style={styles.transactionCard}>
          {recentTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>↕</Text>

              <Text style={styles.emptyTitle}>No transactions yet</Text>

              <Text style={styles.emptyDescription}>
                Start tracking your money by adding your first transaction.
              </Text>

              <Pressable onPress={() => router.push("/add-transaction")}>
                <Text style={styles.emptyLink}>
                  Add your first transaction →
                </Text>
              </Pressable>
            </View>
          ) : (
            recentTransactions.map((item, index) => (
              <View key={item.id}>
                <View style={styles.transactionRow}>
                  <View
                    style={[
                      styles.transactionIcon,
                      {
                        backgroundColor:
                          (categoryColors[item.category] || "#A58BFF") + "25",
                      },
                    ]}
                  >
                    <Text style={styles.transactionEmoji}>
                      {item.type === "income" ? "↙" : "↗"}
                    </Text>
                  </View>

                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionName}>{item.title}</Text>

                    <Text style={styles.transactionCategory}>
                      {item.category} ·{" "}
                      {new Date(item.date).toLocaleDateString()}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.transactionAmount,
                      item.type === "income"
                        ? styles.incomeAmount
                        : styles.expenseAmount,
                    ]}
                  >
                    {item.type === "income" ? "+" : "-"}
                    {formatCurrency(item.amount)}
                  </Text>
                </View>

                {index !== recentTransactions.length - 1 && (
                  <View style={styles.transactionDivider} />
                )}
              </View>
            ))
          )}
        </View>

        {/* FOOTER */}
        <Text style={styles.footerNote}>
          PULSE FINANCE · YOUR MONEY, UNDER CONTROL.
        </Text>
      </ScrollView>

      {/* SHARED BOTTOM NAVIGATION */}
      <BottomNavigation activeTab="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090D1B",
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingBottom: 25,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 15,
    marginBottom: 20,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#7658E8",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  greeting: {
    color: "#858CA5",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  userName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 3,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "#171D30",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationIcon: {
    color: "#FFFFFF",
    fontSize: 22,
  },
  notificationDot: {
    position: "absolute",
    top: 10,
    right: 11,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#A78BFA",
  },
  addButton: {
    backgroundColor: "#7658E8",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 22,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
  balanceCard: {
    backgroundColor: "#282052",
    borderRadius: 25,
    padding: 23,
    overflow: "hidden",
    marginBottom: 30,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLabel: {
    color: "#B9AEDF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  accountBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF18",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#59D9AA",
    marginRight: 6,
  },
  accountText: {
    color: "#E3DCF8",
    fontSize: 10,
  },
  balanceAmount: {
    color: "#FFFFFF",
    fontSize: 35,
    fontWeight: "800",
    marginTop: 20,
    letterSpacing: -1,
  },
  balanceChange: {
    marginTop: 8,
  },
  changeDescription: {
    color: "#B9AEDF",
    fontSize: 11,
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#FFFFFF20",
    marginVertical: 23,
  },
  balanceFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLabel: {
    color: "#B9AEDF",
    fontSize: 9,
    letterSpacing: 1.2,
  },
  footerValue: {
    color: "#FFFFFF",
    fontSize: 13,
    marginTop: 5,
  },
  cardLogo: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 2,
  },
  glowCircle: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 100,
    backgroundColor: "#8867E8",
    opacity: 0.12,
    top: -95,
    right: -65,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  periodText: {
    color: "#A8AEC4",
    fontSize: 12,
  },
  overviewRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 30,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: "#151B2D",
    borderRadius: 19,
    padding: 16,
  },
  overviewIconGreen: {
    width: 35,
    height: 35,
    borderRadius: 12,
    backgroundColor: "#49C99A20",
    alignItems: "center",
    justifyContent: "center",
  },
  overviewIconRed: {
    width: 35,
    height: 35,
    borderRadius: 12,
    backgroundColor: "#F16E7920",
    alignItems: "center",
    justifyContent: "center",
  },
  overviewIconText: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "700",
  },
  overviewLabel: {
    color: "#9BA3BA",
    fontSize: 11,
    marginTop: 14,
  },
  overviewAmount: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
    marginTop: 7,
  },
  positiveChange: {
    color: "#59D9AA",
    fontSize: 10,
    marginTop: 8,
  },
  negativeChange: {
    color: "#F08A91",
    fontSize: 10,
    marginTop: 8,
  },
  viewAll: {
    color: "#A58BFF",
    fontSize: 11,
    fontWeight: "600",
  },
  budgetCard: {
    backgroundColor: "#151B2D",
    borderRadius: 19,
    padding: 19,
    marginBottom: 29,
  },
  budgetTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  budgetLabel: {
    color: "#9BA3BA",
    fontSize: 12,
  },
  budgetAmount: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "800",
    marginTop: 5,
  },
  budgetPercentage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#7658E830",
    alignItems: "center",
    justifyContent: "center",
  },
  percentageText: {
    color: "#B6A2FF",
    fontWeight: "800",
    fontSize: 13,
  },
  progressTrack: {
    height: 9,
    backgroundColor: "#30374D",
    borderRadius: 10,
    marginTop: 20,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 10,
  },
  budgetBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  budgetHint: {
    color: "#59D9AA",
    fontSize: 11,
    fontWeight: "600",
  },
  budgetLimit: {
    color: "#929AB0",
    fontSize: 11,
  },
  aiBadge: {
    backgroundColor: "#7658E825",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
  },
  aiBadgeText: {
    color: "#B6A2FF",
    fontSize: 9,
    fontWeight: "800",
  },
  aiCard: {
    backgroundColor: "#201C3D",
    borderWidth: 1,
    borderColor: "#7658E850",
    borderRadius: 19,
    padding: 17,
    flexDirection: "row",
    gap: 13,
    marginBottom: 29,
  },
  aiIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    backgroundColor: "#7658E8",
    alignItems: "center",
    justifyContent: "center",
  },
  aiIconText: {
    color: "#FFFFFF",
    fontSize: 24,
  },
  aiContent: {
    flex: 1,
  },
  aiTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 7,
  },
  aiDescription: {
    color: "#B8B3D1",
    fontSize: 12,
    lineHeight: 19,
  },
  aiDisclaimer: {
    color: "#858CA5",
    fontSize: 10,
    marginTop: 10,
  },
  transactionCard: {
    backgroundColor: "#151B2D",
    borderRadius: 19,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    gap: 11,
  },
  transactionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7658E820",
  },
  transactionEmoji: {
    fontSize: 18,
    color: "#FFFFFF",
  },
  transactionDetails: {
    flex: 1,
  },
  transactionName: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  transactionCategory: {
    color: "#929AB0",
    fontSize: 10,
    marginTop: 5,
  },
  transactionAmount: {
    fontSize: 12,
    fontWeight: "700",
  },
  incomeAmount: {
    color: "#59D9AA",
  },
  expenseAmount: {
    color: "#FFFFFF",
  },
  transactionDivider: {
    height: 1,
    backgroundColor: "#FFFFFF0D",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 28,
  },
  emptyIcon: {
    color: "#A58BFF",
    fontSize: 32,
    marginBottom: 10,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  emptyDescription: {
    color: "#929AB0",
    fontSize: 11,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 18,
  },
  emptyLink: {
    color: "#A58BFF",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 16,
  },
  footerNote: {
    color: "#555D75",
    textAlign: "center",
    fontSize: 9,
    letterSpacing: 1.4,
    marginTop: 28,
    marginBottom: 10,
  },
});
