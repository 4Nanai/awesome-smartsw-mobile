import { setMQTTConfigApi } from "@/api/api";
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { MQTTConfigDTO } from "@/lib/definition";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router/build/hooks";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Toast from 'react-native-toast-message';

export default function MQTTConfigPage() {
    const router = useRouter();
    const { id, state, alias }: { id?: string; state?: string; alias?: string } = useLocalSearchParams();
    const uniqueHardwareId = typeof id === 'string' ? id : null;
    const deviceState = typeof state === 'string' ? state as "on" | "off" | "error" : "error";

    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];

    const [mqttConfig, setMqttConfig] = useState<MQTTConfigDTO>({
        broker_url: '',
        port: 1883,
        username: '',
        password: '',
        client_id: '',
        topic_prefix: '',
        device_name: '',
        ha_discovery_enabled: false,
        ha_discovery_prefix: 'homeassistant',
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
            const [savedBrokerUrl, savedPort, savedUsername, savedPassword, savedClientId, savedTopicPrefix, savedDeviceName, savedHaDiscoveryEnabled, savedHaDiscoveryPrefix] = await Promise.all([
                AsyncStorage.getItem(getStorageKey('broker_url')),
                AsyncStorage.getItem(getStorageKey('port')),
                AsyncStorage.getItem(getStorageKey('username')),
                AsyncStorage.getItem(getStorageKey('password')),
                AsyncStorage.getItem(getStorageKey('client_id')),
                AsyncStorage.getItem(getStorageKey('topic_prefix')),
                AsyncStorage.getItem(getStorageKey('device_name')),
                AsyncStorage.getItem(getStorageKey('ha_discovery_enabled')),
                AsyncStorage.getItem(getStorageKey('ha_discovery_prefix')),
            ]);

            setMqttConfig({
                device_name: savedDeviceName || alias || '',
                broker_url: savedBrokerUrl || '',
                port: savedPort ? parseInt(savedPort) : 1883,
                username: savedUsername || '',
                password: savedPassword || '',
                client_id: savedClientId || '',
                topic_prefix: savedTopicPrefix || 'esp32switch',
                ha_discovery_enabled: savedHaDiscoveryEnabled === 'true',
                ha_discovery_prefix: savedHaDiscoveryPrefix || 'homeassistant',
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
                AsyncStorage.setItem(getStorageKey('device_name'), config.device_name || alias || ''),
                AsyncStorage.setItem(getStorageKey('broker_url'), config.broker_url),
                AsyncStorage.setItem(getStorageKey('port'), config.port.toString()),
                AsyncStorage.setItem(getStorageKey('username'), config.username || ''),
                AsyncStorage.setItem(getStorageKey('password'), config.password || ''),
                AsyncStorage.setItem(getStorageKey('client_id'), config.client_id || ''),
                AsyncStorage.setItem(getStorageKey('topic_prefix'), config.topic_prefix || ''),
                AsyncStorage.setItem(getStorageKey('ha_discovery_enabled'), config.ha_discovery_enabled.toString()),
                AsyncStorage.setItem(getStorageKey('ha_discovery_prefix'), config.ha_discovery_prefix || 'homeassistant'),
            ]);
        } catch (error) {
            console.error("Error saving MQTT config:", error);
        }
    };

    const handleContinue = async () => {
        if (!uniqueHardwareId || loading) return;

        // Verification
        if (!mqttConfig.device_name.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Device Name is required',
                position: 'top',
            });
            return;
        }

        if (!mqttConfig.broker_url.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Broker URL is required',
                position: 'top',
            });
            return;
        }

        if (mqttConfig.port < 1 || mqttConfig.port > 65535) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Port must be between 1 and 65535',
                position: 'top',
            });
            return;
        }

        if (!mqttConfig.topic_prefix.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Topic Prefix is required',
                position: 'top',
            });
            return;
        }

        if (mqttConfig.topic_prefix.length > 30) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Topic Prefix must not exceed 30 characters',
                position: 'top',
            });
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
                position: 'top',
            });
            router.back();
        } catch (error) {
            console.error("Error saving MQTT config:", error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to save MQTT configuration',
                position: 'top',
            });
        } finally {
            setLoading(false);
        }
    };

    const updateConfig = (field: keyof MQTTConfigDTO, value: string | number | boolean) => {
        setMqttConfig(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const styles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: themeColors.background,
        },
        scrollView: {
            flex: 1,
        },
        content: {
            flexGrow: 1,
            padding: 20,
        },
        card: {
            backgroundColor: themeColors.cardBackground,
            padding: 20,
            marginBottom: 15,
            borderRadius: 10,
            shadowColor: themeColors.shadowColor,
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
            color: themeColors.text,
            marginBottom: 20,
        },
        inputGroup: {
            marginBottom: 15,
        },
        inputLabel: {
            fontSize: 16,
            fontWeight: '600',
            color: themeColors.text,
            marginBottom: 5,
        },
        textInput: {
            borderWidth: 1,
            borderColor: themeColors.inputBorder,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 16,
            backgroundColor: themeColors.inputBackground,
            color: themeColors.text,
        },
        continueButton: {
            backgroundColor: themeColors.buttonBackground,
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 20,
        },
        continueButtonDisabled: {
            opacity: 0.5,
        },
        continueButtonText: {
            color: themeColors.buttonText,
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
            color: themeColors.text,
        },
        warningCard: {
            backgroundColor: themeColors.warningBackground,
            padding: 16,
            marginBottom: 15,
            borderRadius: 10,
            borderLeftWidth: 4,
            borderLeftColor: themeColors.warningBorder,
        },
        warningTitle: {
            fontSize: 16,
            fontWeight: 'bold',
            color: themeColors.warningText,
            marginBottom: 8,
        },
        warningMessage: {
            fontSize: 14,
            color: themeColors.warningText,
            lineHeight: 20,
        },
        switchRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        switch: {
            width: 50,
            height: 28,
            borderRadius: 14,
            backgroundColor: themeColors.switchInactive,
            padding: 2,
            justifyContent: 'center',
        },
        switchActive: {
            backgroundColor: themeColors.switchActive,
        },
        switchThumb: {
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: themeColors.switchThumb,
            shadowColor: themeColors.shadowColor,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 2,
        },
        switchThumbActive: {
            alignSelf: 'flex-end',
        },
        textInputDisabled: {
            backgroundColor: themeColors.disabledBackground,
            color: themeColors.disabledText,
        },
        inputLabelDisabled: {
            color: themeColors.disabledText,
        },
    }), [themeColors]);

    if (isLoadingConfig) {
        return (
            <>
                <Stack.Screen options={{ headerBackTitle: "Device", headerTitle: "MQTT Configuration" }} />
                <View style={[styles.container, styles.loadingContainer]}>
                    <ActivityIndicator size="large" color={themeColors.buttonBackground} />
                    <Text style={styles.loadingText}>Loading MQTT configuration...</Text>
                </View>
            </>
        );
    }

    return (
        <>
            <Stack.Screen options={{ headerBackTitle: "Settings", headerTitle: "MQTT Configuration" }} />
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
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
                            <Text style={styles.inputLabel}>Device Name *</Text>
                            <TextInput
                                style={styles.textInput}
                                value={mqttConfig.device_name}
                                onChangeText={(value) => updateConfig('device_name', value)}
                                placeholder="e.g., Living Room Switch"
                                autoCapitalize="words"
                                autoCorrect={false}
                                editable={!isDeviceError}
                            />
                        </View>

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
                            <Text style={styles.inputLabel}>Topic Prefix *</Text>
                            <TextInput
                                style={styles.textInput}
                                value={mqttConfig.topic_prefix}
                                onChangeText={(value) => updateConfig('topic_prefix', value)}
                                placeholder="e.g., homeassistant/switch"
                                autoCapitalize="none"
                                autoCorrect={false}
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

                        <View style={styles.inputGroup}>
                            <View style={styles.switchRow}>
                                <Text style={styles.inputLabel}>Home Assistant Discovery</Text>
                                <Pressable
                                    style={[styles.switch, mqttConfig.ha_discovery_enabled && styles.switchActive]}
                                    onPress={() => updateConfig('ha_discovery_enabled', !mqttConfig.ha_discovery_enabled)}
                                    disabled={isDeviceError}
                                >
                                    <View style={[styles.switchThumb, mqttConfig.ha_discovery_enabled && styles.switchThumbActive]} />
                                </Pressable>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, !mqttConfig.ha_discovery_enabled && styles.inputLabelDisabled]}>HA Discovery Prefix</Text>
                            <TextInput
                                style={[styles.textInput, !mqttConfig.ha_discovery_enabled && styles.textInputDisabled]}
                                value={mqttConfig.ha_discovery_prefix}
                                onChangeText={(value) => updateConfig('ha_discovery_prefix', value)}
                                placeholder="homeassistant"
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={!isDeviceError && mqttConfig.ha_discovery_enabled}
                            />
                        </View>

                        <Pressable
                            style={({ pressed }) => [
                                styles.continueButton,
                                pressed && { opacity: 0.5 },
                                (loading || isDeviceError) && styles.continueButtonDisabled,
                            ]}
                            onPress={handleContinue}
                            disabled={loading || isDeviceError}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Text style={styles.continueButtonText}>Continue</Text>
                            )}
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
            <Toast />
        </>
    );
}
