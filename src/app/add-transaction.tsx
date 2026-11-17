import { categories } from "@/constants/categories";
import { useTransactions } from "@/context/TransactionContext";
import { TransactionType } from "@/types/transaction";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

export default function AddTransactionScreen() {
  const router = useRouter();
  const { addTransaction } = useTransactions();

  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Food & Drinks");

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  const filteredCategories =
    type === "income"
      ? categories.filter((item) =>
          ["Salary", "Freelance", "Other"].includes(item),
        )
      : categories.filter((item) => !["Salary", "Freelance"].includes(item));

  // Detect transaction details from spoken words
  const parseVoiceTransaction = (spokenText: string) => {
    const text = spokenText.toLowerCase();

    const amountMatch = text.match(
      /(?:€\s*)?(\d+(?:[.,]\d{1,2})?)(?:\s*(?:euros?|eur|€))?/i,
    );

    if (!amountMatch) {
      Alert.alert(
        "Amount not detected",
        "Please say the amount clearly, for example: I spent 8 euros on coffee.",
      );
      return;
    }

    const parsedAmount = Number(amountMatch[1].replace(",", "."));

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Invalid amount", "Please speak a valid amount.");
      return;
    }

    // Detect income or expense
    const isIncome =
      /\b(received|earned|salary|income|freelance|got paid|payment received)\b/i.test(
        text,
      );

    const detectedType: TransactionType = isIncome ? "income" : "expense";

    // Detect category
    let detectedCategory = "Other";

    if (detectedType === "income") {
      if (/\b(salary|paycheck|wage)\b/i.test(text)) {
        detectedCategory = "Salary";
      } else if (/\b(freelance|client|project)\b/i.test(text)) {
        detectedCategory = "Freelance";
      }
    } else {
      if (
        /\b(coffee|lunch|dinner|breakfast|food|restaurant|drink|cafe)\b/i.test(
          text,
        )
      ) {
        detectedCategory = "Food & Drinks";
      } else if (
        /\b(shopping|clothes|clothing|shoes|amazon|purchase)\b/i.test(text)
      ) {
        detectedCategory = "Shopping";
      } else if (
        /\b(taxi|uber|grab|bus|train|transport|fuel|petrol)\b/i.test(text)
      ) {
        detectedCategory = "Transport";
      } else if (/\b(movie|cinema|game|concert|entertainment)\b/i.test(text)) {
        detectedCategory = "Entertainment";
      } else if (
        /\b(electricity|water bill|internet|phone bill|rent|utility)\b/i.test(
          text,
        )
      ) {
        detectedCategory = "Bills";
      } else if (/\b(doctor|medicine|hospital|pharmacy|health)\b/i.test(text)) {
        detectedCategory = "Health";
      } else if (/\b(course|school|university|education|book)\b/i.test(text)) {
        detectedCategory = "Education";
      } else if (/\b(travel|hotel|flight|holiday|vacation)\b/i.test(text)) {
        detectedCategory = "Travel";
      }
    }

    // Remove the amount and common transaction phrases
    let detectedTitle = text
      .replace(amountMatch[0], "")
      .replace(
        /\b(i|just|spent|paid|bought|purchased|received|earned|got|for|on|my|a|an|the|euros?|eur)\b/gi,
        " ",
      )
      .replace(/[€.,!?]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!detectedTitle) {
      detectedTitle = detectedCategory;
    }

    setType(detectedType);
    setAmount(parsedAmount.toString());
    setTitle(detectedTitle.charAt(0).toUpperCase() + detectedTitle.slice(1));
    setCategory(detectedCategory);

    Alert.alert(
      "Transaction detected!",
      `Type: ${detectedType}\nAmount: €${parsedAmount.toFixed(2)}\nDescription: ${detectedTitle}\nCategory: ${detectedCategory}\n\nPlease review the details before saving.`,
    );
  };

  // Speech recognition events
  useSpeechRecognitionEvent("start", () => {
    setIsListening(true);
  });

  useSpeechRecognitionEvent("end", () => {
    setIsListening(false);
  });

  useSpeechRecognitionEvent("result", (event) => {
    const spokenText = event.results[0]?.transcript ?? "";

    setTranscript(spokenText);

    if (event.isFinal && spokenText.trim()) {
      parseVoiceTransaction(spokenText);
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    setIsListening(false);

    if (event.error !== "aborted") {
      Alert.alert(
        "Voice recognition error",
        event.message || event.error || "Please try again.",
      );
    }
  });

  const handleVoiceInput = async () => {
    try {
      setTranscript("");

      const permission =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Please allow microphone and speech recognition access in your iPhone Settings.",
        );
        return;
      }

      ExpoSpeechRecognitionModule.start({
        lang: "en-US",
        interimResults: true,
        continuous: false,
        maxAlternatives: 1,
      });
    } catch (error) {
      console.error("Voice recognition error:", error);

      Alert.alert(
        "Unable to start recording",
        "Please check your microphone permissions and try again.",
      );
    }
  };

  const handleStopRecording = () => {
    ExpoSpeechRecognitionModule.stop();
  };

  const handleSave = () => {
    const parsedAmount = Number(amount.replace(",", "."));

    if (!title.trim()) {
      Alert.alert("Missing description", "Please enter a description.");
      return;
    }

    if (!amount.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      Alert.alert(
        "Invalid amount",
        "Please enter an amount greater than zero.",
      );
      return;
    }

    addTransaction({
      id: `${Date.now()}`,
      title: title.trim(),
      amount: parsedAmount,
      category,
      type,
      date: new Date().toISOString(),
    });

    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.back}>← Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>New Transaction</Text>
          <View style={{ width: 45 }} />
        </View>

        {/* VOICE TRANSACTION */}
        <View style={styles.voiceCard}>
          <Text style={styles.voiceTitle}>QUICK ADD WITH VOICE</Text>

          <Text style={styles.voiceDescription}>
            Speak naturally. Pulse will identify your transaction details.
          </Text>

          <Pressable
            style={[styles.micButton, isListening && styles.micButtonActive]}
            onPress={isListening ? handleStopRecording : handleVoiceInput}
          >
            <Text style={styles.micIcon}>{isListening ? "■" : "🎙️"}</Text>
          </Pressable>

          <Text style={styles.micStatus}>
            {isListening
              ? "Listening... Tap to finish"
              : "Tap to speak your transaction"}
          </Text>

          {transcript.length > 0 && (
            <View style={styles.transcriptBox}>
              <Text style={styles.transcriptLabel}>RECOGNIZED SPEECH</Text>
              <Text style={styles.transcriptText}>{transcript}</Text>
            </View>
          )}

          <Text style={styles.voiceExample}>
            Example: "I spent 8 euros on coffee"
          </Text>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR ENTER MANUALLY</Text>
          <View style={styles.dividerLine} />
        </View>

        <Text style={styles.label}>TRANSACTION TYPE</Text>

        <View style={styles.typeContainer}>
          <Pressable
            style={[
              styles.typeButton,
              type === "expense" && styles.expenseSelected,
            ]}
            onPress={() => {
              setType("expense");
              setCategory("Food & Drinks");
            }}
          >
            <Text style={styles.typeIcon}>↗</Text>
            <Text style={styles.typeText}>Expense</Text>
          </Pressable>

          <Pressable
            style={[
              styles.typeButton,
              type === "income" && styles.incomeSelected,
            ]}
            onPress={() => {
              setType("income");
              setCategory("Salary");
            }}
          >
            <Text style={styles.typeIcon}>↙</Text>
            <Text style={styles.typeText}>Income</Text>
          </Pressable>
        </View>

        <Text style={styles.label}>AMOUNT</Text>

        <View style={styles.amountContainer}>
          <Text style={styles.currency}>€</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            placeholderTextColor="#667085"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        <Text style={styles.label}>DESCRIPTION</Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. Grocery shopping"
          placeholderTextColor="#667085"
          value={title}
          onChangeText={setTitle}
          maxLength={80}
        />

        <Text style={styles.label}>CATEGORY</Text>

        <View style={styles.categoryContainer}>
          {filteredCategories.map((item) => {
            const selected = category === item;

            return (
              <Pressable
                key={item}
                onPress={() => setCategory(item)}
                style={[
                  styles.categoryButton,
                  selected && styles.categorySelected,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selected && styles.categoryTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>
            Confirm & Save Transaction →
          </Text>
        </Pressable>

        <Text style={styles.note}>Review your transaction before saving.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090D1B",
  },
  content: {
    padding: 22,
    paddingBottom: 45,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 15,
    marginBottom: 25,
  },
  back: {
    color: "#A58BFF",
    fontSize: 14,
    fontWeight: "600",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  voiceCard: {
    backgroundColor: "#151E35",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#34446A",
  },
  voiceTitle: {
    color: "#A9B6FF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  voiceDescription: {
    color: "#929DB8",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 19,
    marginTop: 9,
  },
  micButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#7658E8",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
    shadowColor: "#7658E8",
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 7,
  },
  micButtonActive: {
    backgroundColor: "#E45D75",
  },
  micIcon: {
    color: "#FFFFFF",
    fontSize: 29,
  },
  micStatus: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 13,
  },
  transcriptBox: {
    width: "100%",
    backgroundColor: "#0D1426",
    padding: 13,
    borderRadius: 12,
    marginTop: 17,
  },
  transcriptLabel: {
    color: "#A9B6FF",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 7,
  },
  transcriptText: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 20,
  },
  voiceExample: {
    color: "#77839D",
    fontSize: 10,
    marginTop: 15,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 28,
    marginBottom: 4,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#252C40",
  },
  dividerText: {
    color: "#77839D",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },
  label: {
    color: "#929AB0",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.3,
    marginBottom: 13,
    marginTop: 25,
  },
  typeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  typeButton: {
    flex: 1,
    backgroundColor: "#151B2D",
    borderRadius: 16,
    padding: 17,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#252C40",
  },
  expenseSelected: {
    borderColor: "#F16E79",
    backgroundColor: "#F16E7918",
  },
  incomeSelected: {
    borderColor: "#49C99A",
    backgroundColor: "#49C99A18",
  },
  typeIcon: {
    color: "#FFFFFF",
    fontSize: 24,
  },
  typeText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#151B2D",
    borderRadius: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "#252C40",
  },
  currency: {
    color: "#A58BFF",
    fontSize: 28,
    fontWeight: "700",
  },
  amountInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "700",
    padding: 17,
  },
  input: {
    backgroundColor: "#151B2D",
    borderRadius: 14,
    padding: 17,
    color: "#FFFFFF",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#252C40",
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },
  categoryButton: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: "#151B2D",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#252C40",
  },
  categorySelected: {
    backgroundColor: "#7658E830",
    borderColor: "#9275F5",
  },
  categoryText: {
    color: "#A8AEC4",
    fontSize: 12,
  },
  categoryTextSelected: {
    color: "#C3B3FF",
    fontWeight: "700",
  },
  saveButton: {
    backgroundColor: "#7658E8",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 38,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  note: {
    color: "#667085",
    textAlign: "center",
    fontSize: 11,
    marginTop: 15,
  },
});
