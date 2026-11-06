
import { Stack } from "expo-router";

export default function RootStackLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="property/[id]"
        options={{
          title: "Property Details",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="edit-property/[id]"
        options={{ title: "Edit Property" }}
      />

    </Stack>

    
  );
}
