import { Stack } from "expo-router";

export default function LectureLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "Assignment",
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: "bold",
            color: "#333",
          },
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="AssignmentDetails"
        options={{
          headerTitle: "Assignment Details",
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: "bold",
            color: "#333",
          },
          headerBackTitleVisible: false,
        }}
      />
    </Stack>
  );
}
