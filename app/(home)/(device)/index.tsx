import { getAllDevicesApi } from "@/api/api";
import { useApiSocket } from "@/hook/useApiSocket";
import { DeviceDTO, UserMessageDTO } from "@/lib/definition";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { ReadyState } from 'react-use-websocket';

export default function HomePage() {
    const router = useRouter();
    const [devices, setDevices] = useState<DeviceDTO[]>([]);
    const [loading, setLoading] = useState(true);

    const handleEndpointStateUpdate = (message: UserMessageDTO) => {
        if (message.payload && message.payload.uniqueHardwareId && message.payload.state) {
            setDevices(prevDevices => prevDevices.map(device => {
                if (device.unique_hardware_id === message.payload!.uniqueHardwareId) {
                    return {
                        ...device,
                        status: message.payload!.state!
                    };
                }
                return device;
            }));
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

    const fetchDevices = async () => {
        try {
            setLoading(true);
            const devices = await getAllDevicesApi();
            console.log('Fetched devices:', devices);
            if (devices.length !== 0) {
                setDevices(devices);
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
        } catch (error) {
            console.error('Failed to fetch devices:', error);
            setLoading(false);
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
                fetchDevices();
            }
        }, [isAuthenticated])
    );
    const handleRefresh = async () => {
        fetchDevices();
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

            {lastMessage && (
                <Text style={styles.message}>Last Message: {lastMessage.data}</Text>
            )}

            <View style={styles.content}>
                {loading ? (
                    <Text style={styles.loadingText}>Loading devices...</Text>
                ) : devices.length > 0 ? (
                    <>
                        <Text style={styles.sectionTitle}>My Devices ({devices.length})</Text>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
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
        color: '#333',
    },
    refreshButton: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 5,
        marginLeft: 40,
    },
    refreshText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    statusBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 8,
        backgroundColor: '#e0e0e0',
        marginHorizontal: 20,
        borderRadius: 5,
        marginBottom: 10,
    },
    statusTextSmall: {
        fontSize: 12,
        color: '#666',
    },
    message: {
        marginHorizontal: 20,
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#e3f2fd',
        borderRadius: 5,
        fontSize: 12,
        color: '#1976d2',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    loadingText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#666',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    devicesList: {
        flex: 1,
    },
    deviceItem: {
        backgroundColor: 'white',
        padding: 15,
        marginBottom: 10,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
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
        color: '#333',
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
        color: '#666',
        marginLeft: 10,
    },
    addButton: {
        backgroundColor: '#2196F3',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    addButtonText: {
        color: 'white',
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
        color: '#333',
        marginBottom: 10,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
    },
    primaryButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 8,
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
