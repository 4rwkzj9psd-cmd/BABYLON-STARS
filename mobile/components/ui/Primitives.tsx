import { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { colors } from "@/lib/theme";

export function Badge({ children, color, bg }: { children: ReactNode; color: string; bg: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color }]}>{children}</Text>
    </View>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

export function Input(props: TextInputProps) {
  return <TextInput placeholderTextColor={colors.placeholder} {...props} style={[styles.input, props.style]} />;
}

export function GoldButton({
  title,
  onPress,
  disabled,
  loading,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.goldBtn,
        (disabled || loading) && { opacity: 0.5 },
        pressed && !disabled && !loading && { opacity: 0.85 },
      ]}
    >
      {loading ? <ActivityIndicator color="#14131a" /> : <Text style={styles.goldBtnText}>{title}</Text>}
    </Pressable>
  );
}

export function GhostButton({ title, onPress, disabled }: { title: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.ghostBtn, disabled && { opacity: 0.5 }, pressed && !disabled && { opacity: 0.7 }]}
    >
      <Text style={styles.ghostBtnText}>{title}</Text>
    </Pressable>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function ScreenTitle({ children }: { children: ReactNode }) {
  return <Text style={styles.screenTitle}>{children}</Text>;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <Text style={styles.emptyState}>{children}</Text>;
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  badgeText: { fontSize: 12, fontWeight: "500" },
  label: { fontSize: 12, color: colors.textDim, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.bgCard,
    color: colors.text,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  goldBtn: {
    backgroundColor: colors.gold,
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  goldBtnText: { color: "#14131a", fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  ghostBtn: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  ghostBtnText: { color: colors.text, fontSize: 12.5, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 10,
    padding: 14,
  },
  screenTitle: { fontSize: 22, fontWeight: "600", color: colors.text, marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: colors.text, marginBottom: 10 },
  emptyState: { color: colors.textDim, fontSize: 13.5 },
});
