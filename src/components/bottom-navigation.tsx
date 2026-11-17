import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

type TabName = "home" | "activity" | "budgets" | "ai-coach";

type BottomNavigationProps = {
  activeTab: TabName;
};

const tabs: {
  name: TabName;
  label: string;
  icon: string;
  route: "/" | "/activity" | "/budgets" | "/ai-coach";
}[] = [
  {
    name: "home",
    label: "Home",
    icon: "⌂",
    route: "/",
  },
  {
    name: "activity",
    label: "Activity",
    icon: "↕",
    route: "/activity",
  },
  {
    name: "budgets",
    label: "Budgets",
    icon: "◫",
    route: "/budgets",
  },
  {
    name: "ai-coach",
    label: "AI Coach",
    icon: "✦",
    route: "/ai-coach",
  },
];

export default function BottomNavigation({ activeTab }: BottomNavigationProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.name;

        return (
          <Pressable
            key={tab.name}
            style={styles.tab}
            onPress={() => router.replace(tab.route)}
          >
            <Text style={[styles.icon, isActive && styles.activeText]}>
              {tab.icon}
            </Text>

            <Text style={[styles.label, isActive && styles.activeText]}>
              {tab.label}
            </Text>

            {isActive && <View style={styles.indicator} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#11182B",
    borderTopWidth: 1,
    borderTopColor: "#202A40",
    paddingTop: 12,
    paddingBottom: 10,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  icon: {
    fontSize: 22,
    color: "#77839D",
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#77839D",
  },
  activeText: {
    color: "#8B9EFF",
  },
  indicator: {
    position: "absolute",
    top: -12,
    width: 24,
    height: 3,
    borderRadius: 5,
    backgroundColor: "#8B9EFF",
  },
});
