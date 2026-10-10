import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ScrollViewProps,
  StyleProp,
  ViewStyle,
} from "react-native";

type Props = ScrollViewProps & { style?: StyleProp<ViewStyle> };

/** Scrolling form container. Every ScrollView prop is forwarded (e.g. keyboardShouldPersistTaps), which the old version silently dropped. */
export const ScrollViewComponent = ({ children, style, contentContainerStyle, ...rest }: Props) => (
  <KeyboardAvoidingView style={style} behavior={Platform.OS === "ios" ? "padding" : "height"}>
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      {...rest}
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
    >
      {children}
    </ScrollView>
  </KeyboardAvoidingView>
);

const styles = StyleSheet.create({
  scrollContent: { paddingTop: 30, paddingBottom: 100 },
});
