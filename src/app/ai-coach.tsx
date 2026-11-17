import BottomNavigation from "@/components/bottom-navigation";
import { useTransactions } from "@/context/TransactionContext";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Message = {
  id: string;
  text: string;
  sender: "ai" | "user";
};

export default function AICoachScreen() {
  const { transactions } = useTransactions();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hello! I'm your Pulse AI Coach. ✨\n\nI can help you understand your spending, track expenses and find opportunities to save money.\n\nWhat would you like to know today?",
    },
  ]);

  const totalExpenses = transactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalIncome = transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(amount);

  const getAIResponse = (question: string) => {
    const q = question.toLowerCase();

    if (q.includes("spend") || q.includes("expense")) {
      return `You've recorded ${formatAmount(totalExpenses)} in expenses across ${transactions.filter((t) => t.type === "expense").length} transactions.\n\nReview your Activity screen to see which categories account for most of your spending.`;
    }

    if (q.includes("income") || q.includes("earn")) {
      return `Your recorded income is ${formatAmount(totalIncome)}.\n\nYou've recorded ${transactions.filter((t) => t.type === "income").length} income transactions. Keep tracking your income to build a clearer financial picture!`;
    }

    if (q.includes("save") || q.includes("saving")) {
      return `A good first step is to review your recent expenses and identify non-essential spending.\n\nYour recorded expenses are ${formatAmount(totalExpenses)}. Try setting a realistic weekly savings target and tracking your progress.`;
    }

    if (q.includes("balance") || q.includes("left")) {
      const balance = totalIncome - totalExpenses;

      return `Based on the transactions you've recorded, your net cash flow is ${formatAmount(balance)}.\n\nThis is income minus expenses recorded in the app, not your actual bank balance.`;
    }

    if (q.includes("budget")) {
      return `Your Budgets screen helps you monitor spending by category.\n\nCheck your category progress regularly. If you're approaching a limit, consider adjusting your spending for the rest of the month.`;
    }

    return `Here's a useful starting point: you've recorded ${transactions.length} transactions so far.\n\nI can help you review your spending, understand your income, explore savings ideas and check your budgets.\n\nTry asking me: "How much have I spent?"`;
  };

  const sendMessage = (text?: string) => {
    const messageText = (text ?? input).trim();

    if (!messageText) return;

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      text: messageText,
      sender: "user",
    };

    const aiMessage: Message = {
      id: `${Date.now()}-ai`,
      text: getAIResponse(messageText),
      sender: "ai",
    };

    setMessages((previous) => [...previous, userMessage, aiMessage]);

    setInput("");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>PULSE FINANCE</Text>
          <Text style={styles.heading}>AI Coach</Text>
          <View style={styles.statusRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.status}>Your financial assistant</Text>
          </View>
        </View>

        <View style={styles.aiIcon}>
          <Text style={styles.aiIconText}>✦</Text>
        </View>
      </View>

      <ScrollView
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.insightCard}>
          <Text style={styles.insightLabel}>YOUR FINANCIAL SNAPSHOT</Text>
          <View style={styles.snapshotRow}>
            <View>
              <Text style={styles.snapshotTitle}>Income</Text>
              <Text style={styles.incomeAmount}>
                {formatAmount(totalIncome)}
              </Text>
            </View>
            <View>
              <Text style={styles.snapshotTitle}>Expenses</Text>
              <Text style={styles.expenseAmount}>
                {formatAmount(totalExpenses)}
              </Text>
            </View>
          </View>
          <Text style={styles.transactionCount}>
            Based on {transactions.length} recorded transactions
          </Text>
        </View>

        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageRow,
              message.sender === "user" && styles.userMessageRow,
            ]}
          >
            {message.sender === "ai" && (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>✦</Text>
              </View>
            )}

            <View
              style={[
                styles.messageBubble,
                message.sender === "user" ? styles.userBubble : styles.aiBubble,
              ]}
            >
              <Text style={styles.messageText}>{message.text}</Text>
            </View>
          </View>
        ))}

        {messages.length === 1 && (
          <View style={styles.suggestions}>
            <Text style={styles.suggestionsTitle}>SUGGESTED QUESTIONS</Text>

            {[
              "How much have I spent?",
              "How can I save money?",
              "What is my balance?",
              "Help me with my budget",
            ].map((question) => (
              <TouchableOpacity
                key={question}
                style={styles.suggestionButton}
                onPress={() => sendMessage(question)}
              >
                <Text style={styles.suggestionText}>{question}</Text>
                <Text style={styles.arrow}>↗</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask your AI Coach..."
          placeholderTextColor="#77839D"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => sendMessage()}
          returnKeyType="send"
        />

        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => sendMessage()}
        >
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.disclaimer}>
        Demo assistant · Not professional financial advice
      </Text>

      <BottomNavigation activeTab="ai-coach" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090D1B",
  },
  header: {
    paddingTop: 58,
    paddingHorizontal: 22,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#202A40",
  },
  brand: {
    color: "#8B9EFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
  },
  heading: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 7,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 5,
    backgroundColor: "#35D49A",
    marginRight: 7,
  },
  status: {
    color: "#8793AD",
    fontSize: 12,
  },
  aiIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#202A4A",
    alignItems: "center",
    justifyContent: "center",
  },
  aiIconText: {
    color: "#A7B4FF",
    fontSize: 27,
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 18,
    paddingBottom: 25,
  },
  insightCard: {
    backgroundColor: "#141E35",
    borderRadius: 18,
    padding: 17,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#293858",
  },
  insightLabel: {
    color: "#8B9EFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginBottom: 17,
  },
  snapshotRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  snapshotTitle: {
    color: "#8793AD",
    fontSize: 12,
    marginBottom: 6,
  },
  incomeAmount: {
    color: "#35D49A",
    fontSize: 20,
    fontWeight: "800",
  },
  expenseAmount: {
    color: "#FF7588",
    fontSize: 20,
    fontWeight: "800",
  },
  transactionCount: {
    color: "#77839D",
    fontSize: 11,
    marginTop: 16,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  userMessageRow: {
    justifyContent: "flex-end",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#27345A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 9,
  },
  avatarText: {
    color: "#A7B4FF",
    fontSize: 17,
  },
  messageBubble: {
    maxWidth: "83%",
    padding: 14,
    borderRadius: 17,
  },
  aiBubble: {
    backgroundColor: "#151F35",
    borderTopLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: "#596FE5",
    borderTopRightRadius: 4,
  },
  messageText: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 21,
  },
  suggestions: {
    marginTop: 8,
    marginLeft: 39,
  },
  suggestionsTitle: {
    color: "#8793AD",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  suggestionButton: {
    backgroundColor: "#111A2D",
    borderWidth: 1,
    borderColor: "#293858",
    borderRadius: 12,
    padding: 14,
    marginBottom: 9,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  suggestionText: {
    color: "#DCE3F5",
    fontSize: 12,
    fontWeight: "600",
  },
  arrow: {
    color: "#8B9EFF",
    fontSize: 17,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#202A40",
  },
  input: {
    flex: 1,
    backgroundColor: "#151F35",
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 13,
    color: "#FFFFFF",
    fontSize: 13,
  },
  sendButton: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#6478ED",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 9,
  },
  sendIcon: {
    color: "#FFFFFF",
    fontSize: 20,
  },
  disclaimer: {
    color: "#69758F",
    fontSize: 9,
    textAlign: "center",
    paddingBottom: 7,
  },
});
