import { deleteDeviceApi, setAutomationModeApi, setPresenceModeApi, setSensorOffDelayApi } from "@/api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from '@react-native-community/slider';
import { Stack, useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router/build/hooks";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Path, Svg } from 'react-native-svg';
import Toast from 'react-native-toast-message';

type AutomationMode = "off" | "presence" | "sound" | "timer" | "ml";
type PresenceMode = "pir_only" | "radar_only" | "fusion_or" | "fusion_and";

export default function DeviceSettingPage() {
    const router = useRouter();
    const {id, state, alias} = useLocalSearchParams();
    const uniqueHardwareId = typeof id === 'string' ? id : null;
    const deviceState = typeof state === 'string' ? state as "on" | "off" | "error" | "unknown" : "unknown";

    const [automationMode, setAutomationMode] = useState<AutomationMode>("off");
    const [presenceMode, setPresenceMode] = useState<PresenceMode>("pir_only");
    const [sensorOffDelay, setSensorOffDelay] = useState<number>(30);
    
    const [loadingAutomation, setLoadingAutomation] = useState(false);
    const [loadingPresence, setLoadingPresence] = useState(false);
    const [loadingSensorDelay, setLoadingSensorDelay] = useState(false);
    const [isLoadingConfig, setIsLoadingConfig] = useState(true);
    
    const isDeviceUnavailable = deviceState === "error" || deviceState === "unknown";

    useEffect(() => {
        loadSavedConfig();
    }, [uniqueHardwareId]);

    const getStorageKey = (configType: string) => {
        return `device_config_${uniqueHardwareId}_${configType}`;
    };

    const loadSavedConfig = async () => {
        if (!uniqueHardwareId) return;
        
        try {
            const [savedAutomation, savedPresence, savedSensorDelay] = await Promise.all([
                AsyncStorage.getItem(getStorageKey('automation')),
                AsyncStorage.getItem(getStorageKey('presence')),
                AsyncStorage.getItem(getStorageKey('sensor_delay')),
            ]);

            if (savedAutomation) setAutomationMode(savedAutomation as AutomationMode);
            if (savedPresence) setPresenceMode(savedPresence as PresenceMode);
            if (savedSensorDelay) setSensorOffDelay(parseInt(savedSensorDelay));
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

    const handleSensorOffDelayChange = async (newDelay: number) => {
        if (!uniqueHardwareId || loadingSensorDelay) return;
        
        const previousDelay = sensorOffDelay;
        setSensorOffDelay(newDelay);
        setLoadingSensorDelay(true);
        
        try {
            await setSensorOffDelayApi(uniqueHardwareId, newDelay);
            await saveConfig('sensor_delay', newDelay.toString());
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: `Sensor off delay set to ${newDelay}s`,
                position: 'bottom',
            });
        } catch (error) {
            console.error("Error setting sensor off delay:", error);
            setSensorOffDelay(previousDelay);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to set sensor off delay',
                position: 'bottom',
            });
        } finally {
            setLoadingSensorDelay(false);
        }
    };

    const clearDeviceConfig = async () => {
        if (!uniqueHardwareId) return;
        
        try {
            await Promise.all([
                AsyncStorage.removeItem(getStorageKey('automation')),
                AsyncStorage.removeItem(getStorageKey('presence')),
                AsyncStorage.removeItem(getStorageKey('sensor_delay')),
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

        Alert.alert(
            "Unbind Device",
            "Are you sure you want to unbind this device? This action cannot be undone.",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Confirm",
                    style: "destructive",
                    onPress: async () => {
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
                    }
                }
            ]
        );
    };

    const handleConnectToHomeAssistant = () => {
        router.push(`/(home)/(device)/device/${uniqueHardwareId}/mqtt?state=${deviceState}&alias=${alias}`);
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
                    {isDeviceUnavailable && (
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
                                    loadingAutomation || isDeviceUnavailable
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
                                    loadingPresence || isDeviceUnavailable
                                )
                            )}
                        </View>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Sensor Off Delay</Text>
                            {loadingSensorDelay && <ActivityIndicator size="small" color="#2196F3" />}
                        </View>
                        <View style={styles.sliderContainer}>
                            <View style={styles.sliderHeader}>
                                <Text style={styles.sliderLabel}>Delay Time</Text>
                                <Text style={styles.sliderValue}>{sensorOffDelay}s</Text>
                            </View>
                            <Slider
                                style={styles.slider}
                                minimumValue={15}
                                maximumValue={300}
                                step={5}
                                value={sensorOffDelay}
                                onSlidingComplete={handleSensorOffDelayChange}
                                minimumTrackTintColor="#2196F3"
                                maximumTrackTintColor="#e0e0e0"
                                thumbTintColor="#2196F3"
                                disabled={loadingSensorDelay || isDeviceUnavailable}
                            />
                            <View style={styles.sliderRange}>
                                <Text style={styles.sliderRangeText}>15s</Text>
                                <Text style={styles.sliderRangeText}>300s</Text>
                            </View>
                            <Text style={styles.sliderDescription}>
                                Time to wait before turning off after no presence detected
                            </Text>
                        </View>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Device Management</Text>
                        <Pressable 
                            style={({pressed}) => [
                                styles.connectButton, 
                                pressed && {opacity: 0.5},
                                isDeviceUnavailable && styles.connectButtonDisabled
                            ]} 
                            onPress={handleConnectToHomeAssistant}
                            disabled={isDeviceUnavailable}
                        >
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Svg width={20} height={20} viewBox="0 0 24 24" style={{marginRight: 8}}>
                                    <Path fill="white" d="M22.939 10.627L13.061.749a1.505 1.505 0 0 0-2.121 0l-9.879 9.878C.478 11.21 0 12.363 0 13.187v9c0 .826.675 1.5 1.5 1.5h9.227l-4.063-4.062a2 2 0 0 1-.664.113c-1.13 0-2.05-.92-2.05-2.05s.92-2.05 2.05-2.05s2.05.92 2.05 2.05c0 .233-.041.456-.113.665l3.163 3.163V9.928a2.05 2.05 0 0 1-1.15-1.84c0-1.13.92-2.05 2.05-2.05s2.05.92 2.05 2.05a2.05 2.05 0 0 1-1.15 1.84v8.127l3.146-3.146A2.05 2.05 0 0 1 18 12.239c1.13 0 2.05.92 2.05 2.05s-.92 2.05-2.05 2.05a2 2 0 0 1-.709-.13L12.9 20.602v3.088h9.6c.825 0 1.5-.675 1.5-1.5v-9c0-.825-.477-1.977-1.061-2.561z" />
                                </Svg>
                                <Text style={styles.connectButtonText}>Connect to Home Assistant</Text>
                            </View>
                        </Pressable>
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
        marginTop: 10,
    },
    deleteButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    connectButton: {
        backgroundColor: '#4CAF50',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    connectButtonDisabled: {
        backgroundColor: '#9E9E9E',
        opacity: 0.6,
    },
    connectButtonText: {
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
    sliderContainer: {
        paddingVertical: 10,
    },
    sliderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    sliderLabel: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    sliderValue: {
        fontSize: 18,
        color: '#2196F3',
        fontWeight: 'bold',
    },
    slider: {
        width: '100%',
        height: 40,
    },
    sliderRange: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: -5,
    },
    sliderRangeText: {
        fontSize: 12,
        color: '#999',
    },
    sliderDescription: {
        fontSize: 13,
        color: '#999',
        marginTop: 10,
        lineHeight: 18,
    },
});
