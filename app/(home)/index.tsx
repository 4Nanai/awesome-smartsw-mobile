import { Pressable, Text, View, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useApiSocket } from "@/hook/useApiSocket";
import { ReadyState } from 'react-use-websocket';
import { useRouter } from "expo-router";

export default function HomePage() {
    const router = useRouter();

    const {
        sendMessage,
        lastMessage,
        readyState,
        isAuthenticated
    } = useApiSocket();

    const handleLogout = async () => {
        await AsyncStorage.removeItem("user-token");
        router.replace("/(login)");
    };

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Home Page</Text>

            <Text>WebSocket Status: {connectionStatus}</Text>
            <Text>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</Text>

            {lastMessage && <Text style={styles.message}>Last Message: {lastMessage.data}</Text>}

            <Pressable onPress={handleLogout} style={styles.button}>
                <Text style={styles.buttonText}>Logout</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    message: {
        marginVertical: 10,
        textAlign: 'center',
    },
    button: {
        marginTop: 20,
        backgroundColor: '#f44336',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    }
});
