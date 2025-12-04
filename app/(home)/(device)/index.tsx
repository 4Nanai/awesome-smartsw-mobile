import { getAllDevicesApi } from "@/api/api";
import { useApiSocket } from "@/hook/useApiSocket";
import { DeviceDTO, UserMessageDTO } from "@/lib/definition";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View, useColorScheme } from "react-native";
import { ReadyState } from 'react-use-websocket';

export default function HomePage() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const lightColors = {
        background: '#f5f5f5',
        card: 'white',
        text: '#333',
        label: '#666',
        buttonBg: '#2196F3',
        buttonText: 'white',
        statusBarBg: '#e0e0e0',
        statusText: '#666',
        shadow: '#000',
        refreshingText: '#2196F3',
        arrow: '#666',
        emptyTitle: '#333',
        emptySubtitle: '#666',
        primaryButtonBg: '#4CAF50',
        sensorText: '#888',
        sensorValue: '#555',
    };

    const darkColors = {
        background: '#121212',
        card: '#1e1e1e',
        text: '#fff',
        label: '#ccc',
        buttonBg: '#2196F3',
        buttonText: 'white',
        statusBarBg: '#333',
        statusText: '#ccc',
        shadow: '#000',
        refreshingText: '#2196F3',
        arrow: '#ccc',
        emptyTitle: '#fff',
        emptySubtitle: '#ccc',
        primaryButtonBg: '#4CAF50',
        sensorText: '#aaa',
        sensorValue: '#ccc',
    };

    const colors = isDark ? darkColors : lightColors;

    const getStyles = (colors: typeof lightColors) => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
            paddingTop: 50,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingBottom: 10,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text,
        },
        refreshButton: {
            backgroundColor: colors.buttonBg,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 5,
            marginLeft: 40,
        },
        refreshText: {
            color: colors.buttonText,
            fontSize: 12,
            fontWeight: 'bold',
        },
        statusBar: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingVertical: 8,
            backgroundColor: colors.statusBarBg,
            marginHorizontal: 20,
            borderRadius: 5,
            marginBottom: 10,
        },
        statusTextSmall: {
            fontSize: 12,
            color: colors.statusText,
        },
        content: {
            flex: 1,
            paddingHorizontal: 20,
        },
        loadingText: {
            textAlign: 'center',
            marginTop: 50,
            fontSize: 16,
            color: colors.label,
        },
        sectionHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 15,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.text,
        },
        refreshingText: {
            fontSize: 12,
            color: colors.refreshingText,
            fontStyle: 'italic',
        },
        devicesList: {
            flex: 1,
        },
        deviceItem: {
            backgroundColor: colors.card,
            padding: 15,
            marginBottom: 10,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            shadowColor: colors.shadow,
            shadowOffset: {
                width: 0,
                height: 1,
            },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
        },
        deviceInfo: {
            flex: 1,
        },
        deviceName: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 5,
        },
        statusContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        statusDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
            marginRight: 6,
        },
        statusText: {
            fontSize: 12,
            fontWeight: '500',
            textTransform: 'capitalize',
        },
        arrow: {
            fontSize: 18,
            color: colors.arrow,
            marginLeft: 10,
        },
        sensorInfo: {
            marginTop: 8,
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: isDark ? '#333' : '#f0f0f0',
        },
        sensorRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
            marginTop: 4,
        },
        sensorItem: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        sensorLabel: {
            fontSize: 11,
            color: colors.sensorText,
            marginRight: 4,
        },
        sensorValue: {
            fontSize: 11,
            color: colors.sensorValue,
            fontWeight: '600',
        },
        addButton: {
            backgroundColor: colors.buttonBg,
            padding: 15,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 10,
            marginBottom: 10,
        },
        addButtonText: {
            color: colors.buttonText,
            fontSize: 16,
            fontWeight: 'bold',
        },
        emptyState: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 40,
        },
        emptyTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.emptyTitle,
            marginBottom: 10,
        },
        emptySubtitle: {
            fontSize: 14,
            color: colors.emptySubtitle,
            textAlign: 'center',
            marginBottom: 30,
        },
        primaryButton: {
            backgroundColor: colors.primaryButtonBg,
            paddingHorizontal: 30,
            paddingVertical: 15,
            borderRadius: 8,
        },
        primaryButtonText: {
            color: colors.buttonText,
            fontSize: 16,
            fontWeight: 'bold',
        },
    });

    const styles = useMemo(() => getStyles(colors), [colors]);

    const [devices, setDevices] = useState<DeviceDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadDeviceStatuses = async (): Promise<Record<string, string>> => {
        try {
            const stored = await AsyncStorage.getItem('device-statuses');
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Failed to load device statuses:', error);
            return {};
        }
    };

    const saveDeviceStatuses = async (statuses: Record<string, string>) => {
        try {
            await AsyncStorage.setItem('device-statuses', JSON.stringify(statuses));
        } catch (error) {
            console.error('Failed to save device statuses:', error);
        }
    };

    const handleEndpointStateUpdate = (message: UserMessageDTO) => {
        if (message.payload && message.payload.uniqueHardwareId && message.payload.state) {
            setDevices(prevDevices => {
                const updatedDevices = prevDevices.map(device => {
                    if (device.unique_hardware_id === message.payload!.uniqueHardwareId) {
                        return {
                            ...device,
                            status: message.payload!.state!,
                            sensor: message.payload!.sensor
                        };
                    }
                    return device;
                });
                
                // Save updated statuses to AsyncStorage
                const statusMap: Record<string, string> = {};
                updatedDevices.forEach(device => {
                    statusMap[device.unique_hardware_id] = device.status;
                });
                saveDeviceStatuses(statusMap);
                
                return updatedDevices;
            });
        }
    };

    const handleAuthFailure = (message: UserMessageDTO) => {
        if (message.message) {
            Alert.alert("Authentication Failed", message.message, [
                {
                    text: "OK",
                    onPress: async () => {
                        await AsyncStorage.removeItem("user-token");
                        router.replace("/(login)");
                    }
                }
            ]);
        } else {
            router.replace("/(login)");
        }
    }

    const {
        sendMessage,
        lastMessage,
        readyState,
        isAuthenticated
    } = useApiSocket({
        onEndpointStateChange: handleEndpointStateUpdate,
        onAuthFailure: handleAuthFailure
    });

    const fetchDevices = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            const devices = await getAllDevicesApi();
            console.log('Fetched devices:', devices);
            
            // Load saved statuses
            const savedStatuses = await loadDeviceStatuses();
            
            // Merge saved statuses with fetched devices
            const devicesWithStatus = devices.map(device => ({
                ...device,
                status: (savedStatuses[device.unique_hardware_id] as "on" | "off" | "error" | "unknown") || device.status
            }));
            
            if (devicesWithStatus.length !== 0) {
                setDevices(devicesWithStatus);
                if (readyState === ReadyState.OPEN && isAuthenticated) {
                    const message: UserMessageDTO = {
                        type: "query_endpoint_state"
                    }
                    sendMessage(JSON.stringify(message));
                }
            } else {
                setDevices([]);
            }
            setLoading(false);
            setRefreshing(false);
        } catch (error) {
            console.error('Failed to fetch devices:', error);
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchDevices();
        }
    }, [isAuthenticated]);

    useFocusEffect(
        useCallback(() => {
            if (isAuthenticated) {
                // Only show loading state when there's no device data
                fetchDevices(devices.length > 0);
            }
        }, [isAuthenticated])
    );
    const handleRefresh = async () => {
        fetchDevices(true);
    }

    const handleDevicePress = (device: DeviceDTO) => {
        console.log('Navigate to device:', device.unique_hardware_id);
        router.navigate(`/(home)/(device)/device/${device.unique_hardware_id}?state=${device.status}&alias=${device.alias}`);
    };

    const handleBindNewDevice = () => {
        console.log('Navigate to bind new device');
        router.navigate('/(home)/(device)/binding');
    };

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];

    const formatTimestamp = (ts: number) => {
        const now = Date.now();
        const diffMs = now - ts * 1000.0;
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

    const getStatusColor = (status: "on" | "off" | "unknown" | "error") => {
        switch (status) {
            case "on":
                return '#2196F3';
            case "off":
                return '#9E9E9E';
            case "unknown":
                return '#FFC107';
            case "error":
                return '#F44336';
            default:
                return '#757575';
        }
    };

    const renderDeviceItem = ({item}: { item: DeviceDTO }) => (
        <Pressable style={({pressed}) => [styles.deviceItem, pressed && {opacity: 0.5}]}
                   onPress={() => handleDevicePress(item)}>
            <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>{item.alias}</Text>
                <View style={styles.statusContainer}>
                    <View style={[styles.statusDot, {backgroundColor: getStatusColor(item.status)}]}/>
                    <Text style={[styles.statusText, {color: getStatusColor(item.status)}]}>
                        {item.status}
                    </Text>
                </View>
                {item.sensor && (
                    <View style={styles.sensorInfo}>
                        <View style={styles.sensorRow}>
                            {item.sensor.temp_humi && (
                                <>
                                    <View style={styles.sensorItem}>
                                        <Text style={styles.sensorLabel}>🌡️</Text>
                                        <Text style={styles.sensorValue}>{item.sensor.temp_humi.temperature.toFixed(1)}°C</Text>
                                    </View>
                                    <View style={styles.sensorItem}>
                                        <Text style={styles.sensorLabel}>💧</Text>
                                        <Text style={styles.sensorValue}>{item.sensor.temp_humi.humidity.toFixed(0)}%</Text>
                                    </View>
                                </>
                            )}
                            {item.sensor.pir && (
                                <View style={styles.sensorItem}>
                                    <Text style={styles.sensorLabel}>PIR:</Text>
                                    <Text style={styles.sensorValue}>{item.sensor.pir.state ? 'Active' : 'Idle'}</Text>
                                </View>
                            )}
                            {item.sensor.radar && (
                                <View style={styles.sensorItem}>
                                    <Text style={styles.sensorLabel}>Radar:</Text>
                                    <Text style={styles.sensorValue}>{item.sensor.radar.state ? 'Active' : 'Idle'}</Text>
                                </View>
                            )}
                            {item.sensor.sound && (
                                <View style={styles.sensorItem}>
                                    <Text style={styles.sensorLabel}>Sound:</Text>
                                    <Text style={styles.sensorValue}>{formatTimestamp(item.sensor.sound.ts)}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}
            </View>
            <Text style={styles.arrow}>→</Text>
        </Pressable>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Smart Devices</Text>
                <Pressable onPress={handleRefresh}
                           style={({pressed}) => [styles.refreshButton, pressed && {opacity: 0.5}]}>
                    <Text style={styles.refreshText}>Refresh</Text>
                </Pressable>
            </View>

            <View style={styles.statusBar}>
                <Text style={styles.statusTextSmall}>WebSocket: {connectionStatus}</Text>
                <Text style={styles.statusTextSmall}>Auth: {isAuthenticated ? 'Yes' : 'No'}</Text>
            </View>

            <View style={styles.content}>
                {loading && devices.length === 0 ? (
                    <Text style={styles.loadingText}>Loading devices...</Text>
                ) : devices.length > 0 ? (
                    <>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>My Devices ({devices.length})</Text>
                            {refreshing && <Text style={styles.refreshingText}>Refreshing...</Text>}
                        </View>
                        <FlatList
                            data={devices}
                            renderItem={renderDeviceItem}
                            keyExtractor={(item) => item.unique_hardware_id}
                            style={styles.devicesList}
                            showsVerticalScrollIndicator={false}
                        />
                        <Pressable style={styles.addButton} onPress={handleBindNewDevice}>
                            <Text style={styles.addButtonText}>Bind New Device</Text>
                        </Pressable>
                    </>
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyTitle}>No Devices Found</Text>
                        <Text style={styles.emptySubtitle}>Start by binding your first smart device</Text>
                        <Pressable style={({pressed}) => [styles.primaryButton, pressed && {opacity: 0.5}]}
                                   onPress={handleBindNewDevice}>
                            <Text style={styles.primaryButtonText}>Bind New Device</Text>
                        </Pressable>
                    </View>
                )}
            </View>
        </View>
    );
}
