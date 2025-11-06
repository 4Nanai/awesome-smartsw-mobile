import {Text, View, StyleSheet, Pressable, TextInput, Alert} from "react-native";
import {useLocalSearchParams} from "expo-router/build/hooks";
import {useApiSocket} from "@/hook/useApiSocket";
import {UserMessageDTO} from "@/lib/definition";
import {updateDeviceAliasApi} from "@/api/api";
import {useState, useEffect} from "react";
import {ReadyState} from "react-use-websocket";
import {Stack} from "expo-router";

export default function DevicePage() {
    const {id, state, alias} = useLocalSearchParams();
    const uniqueHardwareId = typeof id === 'string' ? id : null;
    const initialState = typeof state === 'string' ? state as "on" | "off" | "online" | "offline" | "error" : "error";
    const initialAlias = typeof alias === 'string' ? alias : uniqueHardwareId;

    const [currentState, setCurrentState] = useState<"on" | "off" | "online" | "offline" | "error">(initialState);
    const [currentAlias, setCurrentAlias] = useState<string>(initialAlias || '');
    const [isEditingAlias, setIsEditingAlias] = useState(false);
    const [editedAlias, setEditedAlias] = useState(currentAlias);

    const handleEndpointStateUpdate = (message: UserMessageDTO) => {
        if (message.payload && message.payload.uniqueHardwareId === uniqueHardwareId && message.payload.state) {
            setCurrentState(message.payload.state);
        }
    };

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
            type: "user_command",
            payload: {
                uniqueHardwareId: uniqueHardwareId,
                command: {
                    type: "toggle",
                    state: newState,
                }
            }
        };
        sendMessage(JSON.stringify(message));
    }

    const handleToggle = () => {
        const newState = currentState === "on" || currentState === "online";
        sendToggleMessage(!newState);
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

    const getStatusColor = (status: "on" | "off" | "online" | "offline" | "error") => {
        switch (status) {
            case "online":
                return '#4CAF50';
            case "offline":
                return '#F44336';
            case "on":
                return '#2196F3';
            case "off":
                return '#9E9E9E';
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

    const isDeviceOn = currentState === "on" || currentState === "online";

    return (
        <>
            <Stack.Screen options={{headerTitle: currentAlias || 'Device Details'}}/>
            <View style={styles.container}>
                <View style={styles.statusBar}>
                    <Text style={styles.statusTextSmall}>WebSocket: {connectionStatus}</Text>
                    <Text style={styles.statusTextSmall}>Auth: {isAuthenticated ? 'Yes' : 'No'}</Text>
                </View>

                <View style={styles.content}>
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
                        <Text style={styles.sectionTitle}>Current Status</Text>
                        <View style={styles.statusDisplay}>
                            <View style={[styles.statusDotLarge, {backgroundColor: getStatusColor(currentState)}]}/>
                            <Text style={[styles.statusTextLarge, {color: getStatusColor(currentState)}]}>
                                {currentState.toUpperCase()}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Control</Text>
                        <Pressable
                            style={({pressed}) => [
                                styles.toggleButton,
                                {backgroundColor: isDeviceOn ? '#4CAF50' : '#9E9E9E'},
                                pressed && {opacity: 0.7}
                            ]}
                            onPress={handleToggle}
                            disabled={readyState !== ReadyState.OPEN || !isAuthenticated}>
                            <Text style={styles.toggleButtonText}>
                                {isDeviceOn ? 'TURN OFF' : 'TURN ON'}
                            </Text>
                        </Pressable>
                        {(readyState !== ReadyState.OPEN || !isAuthenticated) && (
                            <Text style={styles.warningText}>
                                WebSocket not connected. Please check your connection.
                            </Text>
                        )}
                    </View>
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
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
        color: '#333',
    },
    placeholder: {
        width: 60,
    },
    statusBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 8,
        backgroundColor: '#e0e0e0',
        marginHorizontal: 20,
        borderRadius: 5,
        marginBottom: 20,
    },
    statusTextSmall: {
        fontSize: 12,
        color: '#666',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
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
        color: '#666',
        fontWeight: '600',
        flex: 1,
    },
    value: {
        fontSize: 14,
        color: '#333',
        flex: 2,
        textAlign: 'right',
    },
    editContainer: {
        flex: 2,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 8,
        fontSize: 14,
        backgroundColor: '#f9f9f9',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
        gap: 10,
    },
    editButton: {
        backgroundColor: '#2196F3',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    editButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    cancelButton: {
        backgroundColor: '#9E9E9E',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    cancelButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    statusDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    statusDotLarge: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: 10,
    },
    statusTextLarge: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    toggleButton: {
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    toggleButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    warningText: {
        marginTop: 10,
        fontSize: 12,
        color: '#F44336',
        textAlign: 'center',
    },
    messageCard: {
        backgroundColor: '#e3f2fd',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
    },
    messageTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1976d2',
        marginBottom: 5,
    },
    messageText: {
        fontSize: 11,
        color: '#1976d2',
    },
});

