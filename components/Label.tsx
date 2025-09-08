import { Text, View } from "react-native";

export function Labeled({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-[6px]">
      <Text className="font-medium">{label}</Text>
      {children}
    </View>
  );
}
