import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Toast from "react-native-toast-message";

export default function SettingsPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [tempUsername, setTempUsername] = useState("");

    useEffect(() => {
        loadUsername();
    }, []);

    const loadUsername = async () => {
        try {
            const storedUsername = await AsyncStorage.getItem("user-username");
            if (storedUsername) {
                setUsername(storedUsername);
                setTempUsername(storedUsername);
            } else {
                setUsername("Not set");
                setTempUsername("");
            }
        } catch (error) {
            console.error("Failed to load username:", error);
        }
    };

    const handleSaveUsername = async () => {
        if (!tempUsername.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Username cannot be empty',
            });
            return;
        }

        try {
            await AsyncStorage.setItem("user-username", tempUsername.trim());
            setUsername(tempUsername.trim());
            setIsEditing(false);
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Username has been updated',
                position: 'bottom',
            });
        } catch (error) {
            console.error("Failed to save username:", error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to save username',
                position: 'bottom',
            });
        }
    };

    const handleCancelEdit = () => {
        setTempUsername(username === "Not set" ? "" : username);
        setIsEditing(false);
    };

    const handleLogout = () => {
        Alert.alert(
            "Confirm Logout",
            "Are you sure you want to logout?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem("user-token");
                            await AsyncStorage.removeItem("user-username");
                            router.replace("/(login)");
                        } catch (error) {
                            console.error("Logout error:", error);
                            Toast.show({
                                type: 'error',
                                text1: 'Error',
                                text2: 'Logout failed',
                            });
                        }
                    }
                }
            ]
        );
    };

    return (
        <>
            <Stack.Screen options={{ headerTitle: "Settings", headerShown: true }} />
            <View style={styles.container}>
                {/* User Information Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>User Information</Text>
                    
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Username</Text>
                        {isEditing ? (
                            <TextInput
                                style={styles.input}
                                value={tempUsername}
                                onChangeText={setTempUsername}
                                placeholder="Enter username"
                                autoFocus
                            />
                        ) : (
                            <Text style={styles.value}>{username}</Text>
                        )}
                    </View>

                    {isEditing ? (
                        <View style={styles.buttonRow}>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.button,
                                    styles.cancelButton,
                                    pressed && { opacity: 0.5 }
                                ]}
                                onPress={handleCancelEdit}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.button,
                                    styles.saveButton,
                                    pressed && { opacity: 0.5 }
                                ]}
                                onPress={handleSaveUsername}
                            >
                                <Text style={styles.saveButtonText}>Save</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <Pressable
                            style={({ pressed }) => [
                                styles.editButton,
                                pressed && { opacity: 0.5 }
                            ]}
                            onPress={() => setIsEditing(true)}
                        >
                            <Text style={styles.editButtonText}>Edit Username</Text>
                        </Pressable>
                    )}
                </View>

                {/* Logout Button */}
                <Pressable
                    style={({ pressed }) => [
                        styles.logoutButton,
                        pressed && { opacity: 0.5 }
                    ]}
                    onPress={handleLogout}
                >
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </Pressable>
            </View>
            <Toast />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    infoRow: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    value: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    input: {
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#2196F3',
        borderRadius: 8,
        padding: 10,
        backgroundColor: '#f9f9f9',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    button: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#e0e0e0',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 14,
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: '#2196F3',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    editButton: {
        backgroundColor: '#2196F3',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    editButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    logoutButton: {
        backgroundColor: '#F44336',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    logoutButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});