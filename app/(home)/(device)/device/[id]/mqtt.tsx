import { setMQTTConfigApi } from "@/api/api";
import { MQTTConfigDTO } from "@/lib/definition";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router/build/hooks";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Toast from 'react-native-toast-message';

export default function MQTTConfigPage() {
    const router = useRouter();
    const {id, state} = useLocalSearchParams();
    const uniqueHardwareId = typeof id === 'string' ? id : null;
    const deviceState = typeof state === 'string' ? state as "on" | "off" | "error" : "error";

    const [mqttConfig, setMqttConfig] = useState<MQTTConfigDTO>({
        broker_url: '',
        port: 1883,
        username: '',
        password: '',
        client_id: '',
    });

    const [loading, setLoading] = useState(false);
    const [isLoadingConfig, setIsLoadingConfig] = useState(true);

    const isDeviceError = deviceState === "error";

    useEffect(() => {
        loadSavedConfig();
    }, [uniqueHardwareId]);

    const getStorageKey = (configType: string) => {
        return `device_mqtt_config_${uniqueHardwareId}_${configType}`;
    };

    const loadSavedConfig = async () => {
        if (!uniqueHardwareId) return;

        try {
            const [savedBrokerUrl, savedPort, savedUsername, savedPassword, savedClientId] = await Promise.all([
                AsyncStorage.getItem(getStorageKey('broker_url')),
                AsyncStorage.getItem(getStorageKey('port')),
                AsyncStorage.getItem(getStorageKey('username')),
                AsyncStorage.getItem(getStorageKey('password')),
                AsyncStorage.getItem(getStorageKey('client_id')),
            ]);

            setMqttConfig({
                broker_url: savedBrokerUrl || '',
                port: savedPort ? parseInt(savedPort) : 1883,
                username: savedUsername || '',
                password: savedPassword || '',
                client_id: savedClientId || '',
            });
        } catch (error) {
            console.error("Error loading saved MQTT config:", error);
        } finally {
            setIsLoadingConfig(false);
        }
    };

    const saveConfig = async (config: MQTTConfigDTO) => {
        if (!uniqueHardwareId) return;

        try {
            await Promise.all([
                AsyncStorage.setItem(getStorageKey('broker_url'), config.broker_url),
                AsyncStorage.setItem(getStorageKey('port'), config.port.toString()),
                AsyncStorage.setItem(getStorageKey('username'), config.username || ''),
                AsyncStorage.setItem(getStorageKey('password'), config.password || ''),
                AsyncStorage.setItem(getStorageKey('client_id'), config.client_id || ''),
            ]);
        } catch (error) {
            console.error("Error saving MQTT config:", error);
        }
    };

    const handleSaveConfig = async () => {
        if (!uniqueHardwareId || loading) return;

        // Verification
        if (!mqttConfig.broker_url.trim()) {
            Alert.alert("Error", "Broker URL is required");
            return;
        }

        if (mqttConfig.port < 1 || mqttConfig.port > 65535) {
            Alert.alert("Error", "Port must be between 1 and 65535");
            return;
        }

        setLoading(true);

        try {
            await setMQTTConfigApi(uniqueHardwareId, mqttConfig);
            await saveConfig(mqttConfig);
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'MQTT configuration saved successfully',
                position: 'bottom',
            });
        } catch (error) {
            console.error("Error saving MQTT config:", error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to save MQTT configuration',
                position: 'bottom',
            });
        } finally {
            setLoading(false);
        }
    };

    const updateConfig = (field: keyof MQTTConfigDTO, value: string | number) => {
        setMqttConfig(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    if (isLoadingConfig) {
        return (
            <>
                <Stack.Screen options={{headerBackTitle: "Device", headerTitle: "MQTT Configuration"}}/>
                <View style={[styles.container, styles.loadingContainer]}>
                    <ActivityIndicator size="large" color="#2196F3" />
                    <Text style={styles.loadingText}>Loading MQTT configuration...</Text>
                </View>
            </>
        );
    }

    return (
        <>
            <Stack.Screen options={{headerBackTitle: "Device", headerTitle: "MQTT Configuration"}}/>
            <ScrollView style={styles.container}>
                <View style={styles.content}>
                    {isDeviceError && (
                        <View style={styles.warningCard}>
                            <Text style={styles.warningTitle}>⚠️ Device Error</Text>
                            <Text style={styles.warningMessage}>
                                The device is currently in an error state. MQTT configuration cannot be modified. Please check the device connection and refresh the status on the device details page.
                            </Text>
                        </View>
                    )}

                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>MQTT Configuration</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Broker URL *</Text>
                            <TextInput
                                style={styles.textInput}
                                value={mqttConfig.broker_url}
                                onChangeText={(value) => updateConfig('broker_url', value)}
                                placeholder="e.g., mqtt.example.com"
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={!isDeviceError}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Port *</Text>
                            <TextInput
                                style={styles.textInput}
                                value={mqttConfig.port.toString()}
                                onChangeText={(value) => {
                                    const port = parseInt(value) || 1883;
                                    updateConfig('port', port);
                                }}
                                placeholder="1883"
                                keyboardType="numeric"
                                editable={!isDeviceError}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Username</Text>
                            <TextInput
                                style={styles.textInput}
                                value={mqttConfig.username}
                                onChangeText={(value) => updateConfig('username', value)}
                                placeholder="Optional"
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={!isDeviceError}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Password</Text>
                            <TextInput
                                style={styles.textInput}
                                value={mqttConfig.password}
                                onChangeText={(value) => updateConfig('password', value)}
                                placeholder="Optional"
                                secureTextEntry
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={!isDeviceError}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Client ID</Text>
                            <TextInput
                                style={styles.textInput}
                                value={mqttConfig.client_id}
                                onChangeText={(value) => updateConfig('client_id', value)}
                                placeholder="Optional"
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={!isDeviceError}
                            />
                        </View>

                        <Pressable
                            style={({pressed}) => [
                                styles.saveButton,
                                pressed && {opacity: 0.5},
                                (loading || isDeviceError) && styles.saveButtonDisabled,
                            ]}
                            onPress={handleSaveConfig}
                            disabled={loading || isDeviceError}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Text style={styles.saveButtonText}>Save Configuration</Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
            <Toast />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    card: {
        backgroundColor: 'white',
        padding: 20,
        marginBottom: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 15,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        backgroundColor: 'white',
    },
    saveButton: {
        backgroundColor: '#2196F3',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    warningCard: {
        backgroundColor: '#FFF3E0',
        padding: 16,
        marginBottom: 15,
        borderRadius: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#FF9800',
    },
    warningTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#E65100',
        marginBottom: 8,
    },
    warningMessage: {
        fontSize: 14,
        color: '#E65100',
        lineHeight: 20,
    },
});
