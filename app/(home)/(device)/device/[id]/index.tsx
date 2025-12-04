import { updateDeviceAliasApi } from "@/api/api";
import { useApiSocket } from "@/hook/useApiSocket";
import { SensorData, UserMessageDTO } from "@/lib/definition";
import { Stack, useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router/build/hooks";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, useColorScheme, View } from "react-native";
import { ReadyState } from "react-use-websocket";

export default function DevicePage() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const lightColors = {
        background: '#f5f5f5',
        card: 'white',
        text: '#333',
        label: '#666',
        value: '#333',
        inputBg: '#f9f9f9',
        inputBorder: '#ddd',
        buttonBg: '#2196F3',
        buttonText: 'white',
        cancelBg: '#9E9E9E',
        saveBg: '#4CAF50',
        statusBarBg: '#e0e0e0',
        statusText: '#666',
        warning: '#F44336',
        shadow: '#000',
        sensorLabel: '#888',
        sensorValue: '#555',
        cardBorder: '#f0f0f0',
    };

    const darkColors = {
        background: '#121212',
        card: '#1e1e1e',
        text: '#fff',
        label: '#ccc',
        value: '#fff',
        inputBg: '#2c2c2c',
        inputBorder: '#555',
        buttonBg: '#2196F3',
        buttonText: 'white',
        cancelBg: '#666',
        saveBg: '#4CAF50',
        statusBarBg: '#333',
        statusText: '#ccc',
        warning: '#F44336',
        shadow: '#000',
        sensorLabel: '#aaa',
        sensorValue: '#eee',
        cardBorder: '#333',
    };

    const colors = isDark ? darkColors : lightColors;

    const getStyles = (colors: typeof lightColors) => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
            paddingTop: 20,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingBottom: 10,
        },
        backButton: {
            paddingVertical: 6,
        },
        backButtonText: {
            color: '#2196F3',
            fontSize: 16,
            fontWeight: '600',
        },
        title: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
        },
        placeholder: {
            width: 60,
        },
        statusBar: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingVertical: 8,
            backgroundColor: colors.statusBarBg,
            marginHorizontal: 20,
            borderRadius: 5,
            marginBottom: 20,
        },
        statusTextSmall: {
            fontSize: 12,
            color: colors.statusText,
        },
        content: {
            flex: 1,
            paddingHorizontal: 20,
        },
        card: {
            backgroundColor: colors.card,
            padding: 20,
            marginBottom: 15,
            borderRadius: 10,
            shadowColor: colors.shadow,
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
            color: colors.text,
            marginBottom: 15,
        },
        infoRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
        },
        label: {
            fontSize: 14,
            color: colors.label,
            fontWeight: '600',
            flex: 1,
        },
        value: {
            fontSize: 14,
            color: colors.value,
            flex: 2,
            textAlign: 'right',
        },
        editContainer: {
            flex: 2,
        },
        input: {
            borderWidth: 1,
            borderColor: colors.inputBorder,
            borderRadius: 5,
            padding: 8,
            fontSize: 14,
            backgroundColor: colors.inputBg,
            color: colors.text,
        },
        buttonRow: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginTop: 10,
            gap: 10,
        },
        editButton: {
            backgroundColor: colors.buttonBg,
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 10,
        },
        editButtonText: {
            color: colors.buttonText,
            fontSize: 14,
            fontWeight: 'bold',
        },
        cancelButton: {
            backgroundColor: colors.cancelBg,
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 8,
        },
        cancelButtonText: {
            color: colors.buttonText,
            fontSize: 14,
            fontWeight: 'bold',
        },
        saveButton: {
            backgroundColor: colors.saveBg,
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 8,
        },
        saveButtonText: {
            color: colors.buttonText,
            fontSize: 14,
            fontWeight: 'bold',
        },
        statusDisplay: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        },
        statusDotLarge: {
            width: 10,
            height: 10,
            borderRadius: 5,
            marginRight: 5,
        },
        statusTextLarge: {
            fontSize: 20,
            fontWeight: 'bold',
        },
        toggleButton: {
            padding: 20,
            borderRadius: 10,
            alignItems: 'center',
            shadowColor: colors.shadow,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 3,
        },
        warningText: {
            marginTop: 10,
            fontSize: 12,
            color: colors.warning,
            textAlign: 'center',
        },
        messageCard: {
            backgroundColor: isDark ? '#1a237e' : '#e3f2fd',
            padding: 15,
            borderRadius: 8,
            marginBottom: 15,
        },
        messageTitle: {
            fontSize: 12,
            fontWeight: 'bold',
            color: isDark ? '#bbdefb' : '#1976d2',
            marginBottom: 5,
        },
        messageText: {
            fontSize: 11,
            color: isDark ? '#bbdefb' : '#1976d2',
        },
        controlRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        statusRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        settingsButton: {
            paddingVertical: 5,
            paddingHorizontal: 8,
        },
        settingsButtonText: {
            color: colors.text,
            fontSize: 16,
            fontWeight: '600',
        },
        sensorCard: {
            backgroundColor: colors.card,
            padding: 15,
            marginBottom: 15,
            borderRadius: 10,
            shadowColor: colors.shadow,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
        },
        sensorGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 15,
        },
        sensorItem: {
            flex: 1,
            minWidth: '45%',
            backgroundColor: isDark ? '#2c2c2c' : '#f9f9f9',
            padding: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.cardBorder,
        },
        sensorLabel: {
            fontSize: 12,
            color: colors.sensorLabel,
            marginBottom: 4,
            fontWeight: '600',
        },
        sensorValue: {
            fontSize: 18,
            color: colors.sensorValue,
            fontWeight: 'bold',
        },
        sensorUnit: {
            fontSize: 14,
            color: colors.sensorLabel,
            marginLeft: 2,
        },
        sensorState: {
            fontSize: 14,
            fontWeight: '600',
        },
        sensorStateActive: {
            color: '#4CAF50',
        },
        sensorStateIdle: {
            color: '#9E9E9E',
        },
    });

    const styles = useMemo(() => getStyles(colors), [colors]);

    const {id, state, alias} = useLocalSearchParams();
    const router = useRouter();
    const uniqueHardwareId = typeof id === 'string' ? id : null;
    const initialState = typeof state === 'string' ? state as "on" | "off" | "error" : "error";
    const initialAlias = typeof alias === 'string' ? alias : uniqueHardwareId;

    const [currentState, setCurrentState] = useState<"on" | "off" | "error">(initialState);
    const [currentAlias, setCurrentAlias] = useState<string>(initialAlias || '');
    const [sensorData, setSensorData] = useState<SensorData | undefined>(undefined);
    const [enableToggle, setEnableToggle] = useState(false);
    const [toggleState, setToggleState] = useState(false);
    const [isEditingAlias, setIsEditingAlias] = useState(false);
    const [editedAlias, setEditedAlias] = useState(currentAlias);

    const handleEndpointStateUpdate = (message: UserMessageDTO) => {
        if (message.payload && message.payload.uniqueHardwareId === uniqueHardwareId && message.payload.state) {
            setCurrentState(message.payload.state);
            if (message.payload.sensor) {
                setSensorData(message.payload.sensor);
            }
            if (message.payload.state === "on") {
                setToggleState(true);
            } else if (message.payload.state === "off") {
                setToggleState(false);
            }
        }
    };

    useEffect(() => {
        setEnableToggle(currentState === "on" || currentState === "off");
    }, [currentState]);

    const {sendMessage, readyState, isAuthenticated} = useApiSocket({
        onEndpointStateChange: handleEndpointStateUpdate
    });

    useEffect(() => {
        if (isAuthenticated && readyState === ReadyState.OPEN && uniqueHardwareId) {
            const message: UserMessageDTO = {
                type: "query_endpoint_state",
                payload: {
                    uniqueHardwareId: uniqueHardwareId,
                }
            };
            sendMessage(JSON.stringify(message));
        }
    }, [isAuthenticated, readyState, uniqueHardwareId]);

    const sendToggleMessage = (newState: boolean) => {
        if (uniqueHardwareId === null) return;
        const message: UserMessageDTO = {
            type: "set_endpoint_state",
            payload: {
                uniqueHardwareId: uniqueHardwareId,
                command: {
                    state: newState,
                    from: "user",
                }
            }
        };
        console.log("Toggle triggered:", message);
        sendMessage(JSON.stringify(message));
    }

    const handleToggle = () => {
        setToggleState(!toggleState);
        sendToggleMessage(!toggleState);
    }

    const handleUpdateAlias = async () => {
        if (uniqueHardwareId === null || !editedAlias.trim()) {
            Alert.alert('Error', 'Please enter a valid alias');
            return;
        }
        try {
            const response = await updateDeviceAliasApi(uniqueHardwareId, editedAlias.trim());
            console.log(`Alias updated successfully: ${response}`);
            setCurrentAlias(editedAlias.trim());
            setIsEditingAlias(false);
            Alert.alert('Success', 'Device alias updated successfully');
        } catch (error) {
            console.error('Failed to update alias:', error);
            Alert.alert('Error', 'Failed to update device alias');
        }
    }

    const handleCancelEdit = () => {
        setEditedAlias(currentAlias);
        setIsEditingAlias(false);
    }

    const handleSetDevice = () => {
        router.push(`/(home)/(device)/device/${uniqueHardwareId}/settings?state=${currentState}&alias=${currentAlias}`);
    }

    const formatTimestamp = (ts: number) => {
        const now = Date.now();
        const diffMs = now - ts;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffSec < 60) {
            return `${diffSec}s ago`;
        } else if (diffMin < 60) {
            return `${diffMin}m ago`;
        } else if (diffHour < 24) {
            return `${diffHour}h ago`;
        } else {
            return `${diffDay}d ago`;
        }
    };

    const getStatusColor = (status: "on" | "off" | "error") => {
        switch (status) {
            case "on":
                return '#2196F3';
            case "off":
                return '#9E9E9E';
            case "error":
                return '#F44336';
            default:
                return '#757575';
        }
    };

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];

    const isDeviceOn = currentState === "on";

    return (
        <>
            <Stack.Screen options={{
                headerTitle: currentAlias || 'Device Details',
                headerRight: () => {
                    return (
                        <>
                            <Pressable onPress={handleSetDevice} style={styles.settingsButton}>
                                <Text style={[styles.settingsButtonText, isDark && { color: 'white' }]}>Settings</Text>
                            </Pressable>
                        </>
                    )
                }
            }}/>
            <View style={styles.container}>
                <View style={styles.statusBar}>
                    <Text style={styles.statusTextSmall}>WebSocket: {connectionStatus}</Text>
                    <Text style={styles.statusTextSmall}>Auth: {isAuthenticated ? 'Yes' : 'No'}</Text>
                </View>

                <ScrollView 
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{paddingBottom: 20}}
                >
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Device Information</Text>

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Hardware ID:</Text>
                            <Text style={styles.value} numberOfLines={1}>{uniqueHardwareId}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Alias:</Text>
                            {isEditingAlias ? (
                                <View style={styles.editContainer}>
                                    <TextInput
                                        style={styles.input}
                                        value={editedAlias}
                                        onChangeText={setEditedAlias}
                                        placeholder="Enter device alias"
                                        autoFocus
                                    />
                                </View>
                            ) : (
                                <Text style={styles.value}>{currentAlias || 'No alias set'}</Text>
                            )}
                        </View>

                        {isEditingAlias ? (
                            <View style={styles.buttonRow}>
                                <Pressable style={({pressed}) => [styles.cancelButton, pressed && {opacity: 0.5}]}
                                           onPress={handleCancelEdit}>
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </Pressable>
                                <Pressable style={({pressed}) => [styles.saveButton, pressed && {opacity: 0.5}]}
                                           onPress={handleUpdateAlias}>
                                    <Text style={styles.saveButtonText}>Save</Text>
                                </Pressable>
                            </View>
                        ) : (
                            <Pressable style={({pressed}) => [styles.editButton, pressed && {opacity: 0.5}]}
                                       onPress={() => setIsEditingAlias(true)}>
                                <Text style={styles.editButtonText}>Edit Alias</Text>
                            </Pressable>
                        )}
                    </View>

                    <View style={styles.card}>
                        <View style={styles.statusRow}>
                            <Text style={[styles.sectionTitle, {marginBottom: 0}]}>Current Status</Text>
                            <View style={styles.statusDisplay}>
                                <View style={[styles.statusDotLarge, {backgroundColor: getStatusColor(currentState)}]}/>
                                <Text style={[styles.statusTextLarge, {color: getStatusColor(currentState)}]}>
                                    {currentState.toUpperCase()}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {sensorData && (
                        <View style={styles.sensorCard}>
                            <Text style={styles.sectionTitle}>Sensor Data</Text>
                            <View style={styles.sensorGrid}>
                                {sensorData.temp_humi && (
                                    <>
                                        <View style={styles.sensorItem}>
                                            <Text style={styles.sensorLabel}>🌡️ Temperature</Text>
                                            <Text style={styles.sensorValue}>
                                                {sensorData.temp_humi.temperature.toFixed(1)}
                                                <Text style={styles.sensorUnit}>°C</Text>
                                            </Text>
                                        </View>
                                        <View style={styles.sensorItem}>
                                            <Text style={styles.sensorLabel}>💧 Humidity</Text>
                                            <Text style={styles.sensorValue}>
                                                {sensorData.temp_humi.humidity.toFixed(0)}
                                                <Text style={styles.sensorUnit}>%</Text>
                                            </Text>
                                        </View>
                                    </>
                                )}
                                {sensorData.pir && (
                                    <View style={styles.sensorItem}>
                                        <Text style={styles.sensorLabel}>👁️ PIR Sensor</Text>
                                        <Text style={[styles.sensorState, sensorData.pir.state ? styles.sensorStateActive : styles.sensorStateIdle]}>
                                            {sensorData.pir.state ? 'Active' : 'Idle'}
                                        </Text>
                                    </View>
                                )}
                                {sensorData.radar && (
                                    <View style={styles.sensorItem}>
                                        <Text style={styles.sensorLabel}>📡 Radar Sensor</Text>
                                        <Text style={[styles.sensorState, sensorData.radar.state ? styles.sensorStateActive : styles.sensorStateIdle]}>
                                            {sensorData.radar.state ? 'Active' : 'Idle'}
                                        </Text>
                                    </View>
                                )}
                                {sensorData.sound && (
                                    <View style={styles.sensorItem}>
                                        <Text style={styles.sensorLabel}>🔊 Last Motion</Text>
                                        <Text style={styles.sensorValue}>
                                            {formatTimestamp(sensorData.sound.ts)}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}

                    <View style={styles.card}>
                        <View style={styles.controlRow}>
                            <Text style={[styles.sectionTitle, {marginBottom: 0}]}>Control</Text>
                            <Switch disabled={readyState !== ReadyState.OPEN || !isAuthenticated || !enableToggle} value={toggleState} onValueChange={handleToggle} />
                        </View>
                        {(readyState !== ReadyState.OPEN || !isAuthenticated) && (
                            <Text style={styles.warningText}>
                                WebSocket not connected. Please check your connection.
                            </Text>
                        )}
                    </View>
                </ScrollView>
            </View>
        </>
    );
}

