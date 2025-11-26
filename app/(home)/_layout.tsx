import { WebSocketProvider } from "@/hook/useApiSocket";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from "expo-router";

export default function HomePageLayout() {
    return (
        <WebSocketProvider>
            <Tabs>
                <Tabs.Screen 
                    name="(device)" 
                    options={{
                        headerTitle: "Home", 
                        headerShown: false, 
                        title: "Home",
                        tabBarIcon: ({ color, size }) => (
                            <FontAwesome name="home" size={size} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen 
                    name="(settings)" 
                    options={{
                        headerTitle: "Settings", 
                        headerShown: false, 
                        title: "Settings",
                        tabBarIcon: ({ color, size }) => (
                            <FontAwesome name="cog" size={size} color={color} />
                        ),
                    }}
                />
            </Tabs>
        </WebSocketProvider>
    );
}
