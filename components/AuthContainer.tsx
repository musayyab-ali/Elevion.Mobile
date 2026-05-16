import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  Dimensions,
  View,
  TextStyle,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../constants/Theme";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ErrorMessage } from "@/components/ErrorMessage";
import { MotiView } from "moti";
import { ScrollViewComponent } from "./ScrollViewComponent";
import { CelebrationOverlay } from "./CelebrationOverlay";
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");
const isTablet = SCREEN_WIDTH > 600;
export const AuthContainer = ({
  apiMessage,
  title,
  style,
  children,
  celebration,
}) => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />
      {celebration && <CelebrationOverlay visible={celebration} />}
      <LinearGradient
        colors={[Colors.headerOne[0], Colors.headerOne[1]]}
        style={styles.blueHeader}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitleInline}>{title}</Text>
        </View>
      </LinearGradient>
      {apiMessage && <ErrorMessage>{apiMessage}</ErrorMessage>}
      <MotiView
        from={{ translateY: 50, opacity: 0 }}
        animate={{ translateY: 0, opacity: 1 }}
        style={styles.formCard}
      >
        <ScrollViewComponent
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {children}
        </ScrollViewComponent>
      </MotiView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.headerOne[1] },
  blueHeader: {
    height: SCREEN_HEIGHT * 0.17,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerContent: { flexDirection: "row", alignItems: "center", marginTop: 20 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  headerTitleInline: {
    fontSize: isTablet ? 28 : 24,
    fontWeight: "800",
    color: Colors.white,
  },
  formCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: isTablet ? 50 : 40,
    borderTopRightRadius: isTablet ? 50 : 40,
  },
  scrollContent: {
    paddingBottom: 40,
    alignItems: "center",
  },
});
