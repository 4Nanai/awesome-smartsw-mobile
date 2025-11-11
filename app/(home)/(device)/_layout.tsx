import {Stack} from "expo-router";

export default function DeviceLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{headerTitle: "Home", headerShown: true}}/>
            <Stack.Screen name="binding" options={{headerTitle: "Binding", headerShown: true}}/>
            <Stack.Screen name="device/[id]/index" options={{headerTitle: "Device", headerShown: true}}/>
            <Stack.Screen name="device/[id]/settings" options={{headerTitle: "Device Settings", headerShown: true}}/>
        </Stack>
    );
}
