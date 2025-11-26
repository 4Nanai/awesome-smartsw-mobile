import { deleteDeviceApi, setAutomationModeApi, setPresenceModeApi, setSoundModeApi } from "@/api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router/build/hooks";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Toast from 'react-native-toast-message';

type AutomationMode = "off" | "presence" | "sound" | "timer" | "ml";
type PresenceMode = "pir_only" | "radar_only" | "fusion_or" | "fusion_and";
type SoundMode = "noise" | "clap";

export default function DeviceSettingPage() {
    const router = useRouter();
    const {id, state} = useLocalSearchParams();
    const uniqueHardwareId = typeof id === 'string' ? id : null;
    const deviceState = typeof state === 'string' ? state as "on" | "off" | "error" : "error";

    const [automationMode, setAutomationMode] = useState<AutomationMode>("off");
    const [presenceMode, setPresenceMode] = useState<PresenceMode>("pir_only");
    const [soundMode, setSoundMode] = useState<SoundMode>("noise");
    
    const [loadingAutomation, setLoadingAutomation] = useState(false);
    const [loadingPresence, setLoadingPresence] = useState(false);
    const [loadingSound, setLoadingSound] = useState(false);
    const [isLoadingConfig, setIsLoadingConfig] = useState(true);
    
    const isDeviceError = deviceState === "error";

    useEffect(() => {
        loadSavedConfig();
    }, [uniqueHardwareId]);

    const getStorageKey = (configType: string) => {
        return `device_config_${uniqueHardwareId}_${configType}`;
    };

    const loadSavedConfig = async () => {
        if (!uniqueHardwareId) return;
        
        try {
            const [savedAutomation, savedPresence, savedSound] = await Promise.all([
                AsyncStorage.getItem(getStorageKey('automation')),
                AsyncStorage.getItem(getStorageKey('presence')),
                AsyncStorage.getItem(getStorageKey('sound')),
            ]);

            if (savedAutomation) setAutomationMode(savedAutomation as AutomationMode);
            if (savedPresence) setPresenceMode(savedPresence as PresenceMode);
            if (savedSound) setSoundMode(savedSound as SoundMode);
        } catch (error) {
            console.error("Error loading saved config:", error);
        } finally {
            setIsLoadingConfig(false);
        }
    };

    const saveConfig = async (configType: string, value: string) => {
        if (!uniqueHardwareId) return;
        
        try {
            await AsyncStorage.setItem(getStorageKey(configType), value);
        } catch (error) {
            console.error("Error saving config:", error);
        }
    };

    const handleAutomationModeChange = async (newMode: AutomationMode) => {
        if (!uniqueHardwareId || loadingAutomation) return;
        
        const previousMode = automationMode;
        setAutomationMode(newMode);
        setLoadingAutomation(true);
        
        try {
            await setAutomationModeApi(uniqueHardwareId, newMode);
            await saveConfig('automation', newMode);
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: `Automation mode set to ${newMode === "ml" ? "Machine Learning" : newMode.charAt(0).toUpperCase() + newMode.slice(1)}`,
                position: 'bottom',
            });
        } catch (error) {
            console.error("Error setting automation mode:", error);
            setAutomationMode(previousMode);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to set automation mode',
                position: 'bottom',
            });
        } finally {
            setLoadingAutomation(false);
        }
    };

    const handlePresenceModeChange = async (newMode: PresenceMode) => {
        if (!uniqueHardwareId || loadingPresence) return;
        
        const previousMode = presenceMode;
        setPresenceMode(newMode);
        setLoadingPresence(true);
        
        try {
            await setPresenceModeApi(uniqueHardwareId, newMode);
            await saveConfig('presence', newMode);
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: `Presence mode set to ${newMode}`,
                position: 'bottom',
            });
        } catch (error) {
            console.error("Error setting presence mode:", error);
            setPresenceMode(previousMode);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to set presence mode',
                position: 'bottom',
            });
        } finally {
            setLoadingPresence(false);
        }
    };

    const handleSoundModeChange = async (newMode: SoundMode) => {
        if (!uniqueHardwareId || loadingSound) return;
        
        const previousMode = soundMode;
        setSoundMode(newMode);
        setLoadingSound(true);
        
        try {
            await setSoundModeApi(uniqueHardwareId, newMode);
            await saveConfig('sound', newMode);
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: `Sound mode set to ${newMode}`,
                position: 'bottom',
            });
        } catch (error) {
            console.error("Error setting sound mode:", error);
            setSoundMode(previousMode);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to set sound mode',
                position: 'bottom',
            });
        } finally {
            setLoadingSound(false);
        }
    };

    const clearDeviceConfig = async () => {
        if (!uniqueHardwareId) return;
        
        try {
            await Promise.all([
                AsyncStorage.removeItem(getStorageKey('automation')),
                AsyncStorage.removeItem(getStorageKey('presence')),
                AsyncStorage.removeItem(getStorageKey('sound')),
            ]);
            console.log("Device config cleared from AsyncStorage");
        } catch (error) {
            console.error("Error clearing device config:", error);
        }
    };

    const handleDeleteDevice = async () => {
        if (!uniqueHardwareId) {
            console.error("Invalid uniqueHardwareId");
            return;
        }
        console.log("Attempting to delete device with ID:", uniqueHardwareId);
        try {
            const res = await deleteDeviceApi(uniqueHardwareId);
            console.log("Delete Device Response:", res);
            await clearDeviceConfig();
            Alert.alert("Success", "Device unbound successfully", [
                {
                    text: "OK",
                    onPress: () => {
                        router.dismissTo("/(home)/(device)");
                    }
                }
            ]);
        } catch (error) {
            console.error("Error deleting device:", error);
            Alert.alert("Error", "Failed to unbind device");
        }
    };

    const renderModeButton = (
        key: string,
        label: string,
        isSelected: boolean,
        onPress: () => void,
        disabled: boolean
    ) => (
        <Pressable
            key={key}
            style={({pressed}) => [
                styles.modeButton,
                isSelected && styles.modeButtonSelected,
                pressed && {opacity: 0.5},
                disabled && styles.modeButtonDisabled,
            ]}
            onPress={onPress}
            disabled={disabled}
        >
            <Text style={[
                styles.modeButtonText,
                isSelected && styles.modeButtonTextSelected
            ]}>
                {label}
            </Text>
        </Pressable>
    );

    if (isLoadingConfig) {
        return (
            <>
                <Stack.Screen options={{headerBackTitle: "Device"}}/>
                <View style={[styles.container, styles.loadingContainer]}>
                    <ActivityIndicator size="large" color="#2196F3" />
                    <Text style={styles.loadingText}>Loading settings...</Text>
                </View>
            </>
        );
    }

    return (
        <>
            <Stack.Screen options={{headerBackTitle: "Device"}}/>
            <ScrollView style={styles.container}>
                <View style={styles.content}>
                    {isDeviceError && (
                        <View style={styles.warningCard}>
                            <Text style={styles.warningTitle}>⚠️ Device Error</Text>
                            <Text style={styles.warningMessage}>
                                The device is currently in an error state. Settings cannot be modified. Please check the device connection and refresh the status on the device details page.
                            </Text>
                        </View>
                    )}
                    <View style={styles.card}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Automation Mode</Text>
                            {loadingAutomation && <ActivityIndicator size="small" color="#2196F3" />}
                        </View>
                        <View style={styles.modeGrid}>
                            {(["off", "presence", "sound", "timer", "ml"] as AutomationMode[]).map((mode) =>
                                renderModeButton(
                                    `automation-${mode}`,
                                    mode === "ml" ? "Machine Learning" : mode.charAt(0).toUpperCase() + mode.slice(1),
                                    automationMode === mode,
                                    () => handleAutomationModeChange(mode),
                                    loadingAutomation || isDeviceError
                                )
                            )}
                        </View>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Presence Mode</Text>
                            {loadingPresence && <ActivityIndicator size="small" color="#2196F3" />}
                        </View>
                        <View style={styles.modeGrid}>
                            {(["pir_only", "radar_only", "fusion_or", "fusion_and"] as PresenceMode[]).map((mode) =>
                                renderModeButton(
                                    `presence-${mode}`,
                                    mode.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                                    presenceMode === mode,
                                    () => handlePresenceModeChange(mode),
                                    loadingPresence || isDeviceError
                                )
                            )}
                        </View>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Sound Mode</Text>
                            {loadingSound && <ActivityIndicator size="small" color="#2196F3" />}
                        </View>
                        <View style={styles.modeGrid}>
                            {(["noise", "clap"] as SoundMode[]).map((mode) =>
                                renderModeButton(
                                    `sound-${mode}`,
                                    mode.charAt(0).toUpperCase() + mode.slice(1),
                                    soundMode === mode,
                                    () => handleSoundModeChange(mode),
                                    loadingSound || isDeviceError
                                )
                            )}
                        </View>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Device Management</Text>
                        <Pressable 
                            style={({pressed}) => [styles.deleteButton, pressed && {opacity: 0.5}]} 
                            onPress={handleDeleteDevice}
                        >
                            <Text style={styles.deleteButtonText}>Unbind Device</Text>
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
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    modeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    modeButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        backgroundColor: 'white',
        minWidth: 80,
        alignItems: 'center',
    },
    modeButtonSelected: {
        backgroundColor: '#2196F3',
        borderColor: '#2196F3',
    },
    modeButtonDisabled: {
        opacity: 0.5,
    },
    modeButtonText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    modeButtonTextSelected: {
        color: 'white',
    },
    deleteButton: {
        backgroundColor: '#F44336',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    deleteButtonText: {
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
