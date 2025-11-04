import {Tabs} from "expo-router";
import {WebSocketProvider} from "@/hook/useApiSocket";

export default function HomePageLayout() {
    return (
        <WebSocketProvider>
            <Tabs>
                <Tabs.Screen name="(device)" options={{headerTitle: "Home", headerShown: false, title: "Home"}}/>
            </Tabs>
        </WebSocketProvider>
    );
}
