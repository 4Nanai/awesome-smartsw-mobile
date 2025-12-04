import { getDeviceManageStatsApi } from "@/api/api";
import { Feather } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, useColorScheme, View } from "react-native";
import Toast from "react-native-toast-message";

interface DeviceStats {
    total: number;
    online: number;
}

export default function SettingsPage() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const lightColors = {
        background: '#f5f5f5',
        card: 'white',
        text: '#333',
        label: '#666',
        secondaryText: '#999',
        inputBg: '#f9f9f9',
        inputBorder: '#2196F3',
        buttonBg: '#f5f5f5',
        buttonBorder: '#ddd',
        editIconBg: '#f0f0f0',
        avatarBg: '#2196F3',
        avatarText: 'white',
        statDivider: '#e0e0e0',
        errorText: '#F44336',
        shadow: '#000',
    };

    const darkColors = {
        background: '#121212',
        card: '#1e1e1e',
        text: '#fff',
        label: '#ccc',
        secondaryText: '#aaa',
        inputBg: '#2c2c2c',
        inputBorder: '#2196F3',
        buttonBg: '#333',
        buttonBorder: '#555',
        editIconBg: '#333',
        avatarBg: '#2196F3',
        avatarText: 'white',
        statDivider: '#555',
        errorText: '#F44336',
        shadow: '#000',
    };

    const colors = isDark ? darkColors : lightColors;

    const getStyles = (colors: typeof lightColors) => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
            padding: 20,
        },
        card: {
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
            shadowColor: colors.shadow,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        cardHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 15,
        },
        cardTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.text,
        },
        editIconButton: {
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.editIconBg,
            justifyContent: 'center',
            alignItems: 'center',
        },
        userInfoDisplay: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 10,
        },
        avatarContainer: {
            marginRight: 20,
        },
        avatar: {
            width: 70,
            height: 70,
            borderRadius: 35,
            backgroundColor: colors.avatarBg,
            justifyContent: 'center',
            alignItems: 'center',
        },
        avatarText: {
            fontSize: 28,
            fontWeight: 'bold',
            color: colors.avatarText,
        },
        userDetails: {
            flex: 1,
        },
        usernameLabel: {
            fontSize: 13,
            color: colors.secondaryText,
            marginBottom: 4,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },
        usernameValue: {
            fontSize: 20,
            fontWeight: '600',
            color: colors.text,
        },
        editContainer: {
            marginTop: 5,
        },
        inputContainer: {
            marginBottom: 15,
        },
        inputLabel: {
            fontSize: 14,
            color: colors.label,
            marginBottom: 8,
            fontWeight: '500',
        },
        statsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            paddingVertical: 10,
        },
        statBox: {
            flex: 1,
            alignItems: 'center',
            paddingVertical: 15,
        },
        statNumber: {
            fontSize: 36,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 8,
        },
        onlineNumber: {
            color: '#4CAF50',
        },
        statLabel: {
            fontSize: 14,
            color: colors.label,
            textAlign: 'center',
        },
        statDivider: {
            width: 1,
            height: 60,
            backgroundColor: colors.statDivider,
        },
        loadingContainer: {
            alignItems: 'center',
            paddingVertical: 20,
        },
        errorText: {
            fontSize: 14,
            color: colors.errorText,
            textAlign: 'center',
            paddingVertical: 20,
        },
        input: {
            fontSize: 16,
            color: colors.text,
            borderWidth: 1.5,
            borderColor: colors.inputBorder,
            borderRadius: 10,
            padding: 14,
            backgroundColor: colors.inputBg,
        },
        buttonRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 12,
        },
        button: {
            flex: 1,
            padding: 14,
            borderRadius: 10,
            alignItems: 'center',
            shadowColor: colors.shadow,
            shadowOffset: {
                width: 0,
                height: 1,
            },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
        },
        cancelButton: {
            backgroundColor: colors.buttonBg,
            borderWidth: 1,
            borderColor: colors.buttonBorder,
        },
        cancelButtonText: {
            color: colors.label,
            fontSize: 15,
            fontWeight: '600',
        },
        saveButton: {
            backgroundColor: '#2196F3',
        },
        saveButtonText: {
            color: 'white',
            fontSize: 15,
            fontWeight: '600',
        },
        logoutButton: {
            backgroundColor: '#F44336',
            padding: 15,
            borderRadius: 12,
            alignItems: 'center',
            shadowColor: colors.shadow,
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

    const styles = useMemo(() => getStyles(colors), [colors]);

    const [username, setUsername] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [tempUsername, setTempUsername] = useState("");
    const [deviceStats, setDeviceStats] = useState<DeviceStats | null>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(false);

    const loadDeviceStatsFromStorage = async (): Promise<DeviceStats | null> => {
        try {
            const stored = await AsyncStorage.getItem('device-stats');
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('Failed to load device stats from storage:', error);
            return null;
        }
    };

    const saveDeviceStatsToStorage = async (stats: DeviceStats) => {
        try {
            await AsyncStorage.setItem('device-stats', JSON.stringify(stats));
        } catch (error) {
            console.error('Failed to save device stats to storage:', error);
        }
    };

    useEffect(() => {
        loadUsername();
        loadDeviceStatsFromStorage().then(savedStats => {
            if (savedStats) {
                setDeviceStats(savedStats);
            } else {
                setIsLoadingStats(true);
            }
        });
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (!deviceStats) {
                loadDeviceStats();
            }
        }, [deviceStats])
    );

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

    const loadDeviceStats = async () => {
        try {
            const stats = await getDeviceManageStatsApi();
            setDeviceStats(stats);
            setIsLoadingStats(false);
            await saveDeviceStatsToStorage(stats);
        } catch (error) {
            console.error("Failed to load device stats:", error);
            setIsLoadingStats(false);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load device statistics',
                position: 'bottom',
            });
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
                {/* Device Statistics Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Device Statistics</Text>
                    {isLoadingStats ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#2196F3" />
                        </View>
                    ) : deviceStats ? (
                        <View style={styles.statsContainer}>
                            <View style={styles.statBox}>
                                <Text style={styles.statNumber}>{deviceStats.total}</Text>
                                <Text style={styles.statLabel}>Total Devices</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statBox}>
                                <Text style={[styles.statNumber, styles.onlineNumber]}>
                                    {deviceStats.online}
                                </Text>
                                <Text style={styles.statLabel}>Online Now</Text>
                            </View>
                        </View>
                    ) : (
                        <Text style={styles.errorText}>Unable to load statistics</Text>
                    )}
                </View>

                {/* User Information Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>User Information</Text>
                        {!isEditing && (
                            <Pressable
                                style={({ pressed }) => [
                                    styles.editIconButton,
                                    pressed && { opacity: 0.5 }
                                ]}
                                onPress={() => setIsEditing(true)}
                            >
                                <Feather name="edit-2" size={18} color="#666" />
                            </Pressable>
                        )}
                    </View>
                    
                    {isEditing ? (
                        <View style={styles.editContainer}>
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Username</Text>
                                <TextInput
                                    style={styles.input}
                                    value={tempUsername}
                                    onChangeText={setTempUsername}
                                    placeholder="Enter username"
                                    autoFocus
                                    placeholderTextColor="#999"
                                />
                            </View>
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
                        </View>
                    ) : (
                        <View style={styles.userInfoDisplay}>
                            <View style={styles.avatarContainer}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>
                                        {username.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.userDetails}>
                                <Text style={styles.usernameLabel}>Username</Text>
                                <Text style={styles.usernameValue}>{username}</Text>
                            </View>
                        </View>
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