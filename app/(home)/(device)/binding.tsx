import {Text, View, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator} from "react-native";
import {useState, useEffect, useRef} from "react";
import {useRouter} from "expo-router";
import {verifyEndpointAPConnection, getProvisioningToken, sendWiFiCredentialsToEndpoint} from "@/api/api";
import {useApiSocket} from "@/hook/useApiSocket";

export default function BindingPage() {
    const router = useRouter();

    const [ssid, setSsid] = useState("");
    const [password, setPassword] = useState("");
    const [isEndpointConnected, setIsEndpointConnected] = useState(false);
    const [isBinding, setIsBinding] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [token, setToken] = useState("");

    useEffect(() => {
        const fetchToken = async () => {
            try {
                // Get provisioning token
                const token = await getProvisioningToken();
                console.log("Got provisioning token:", token);
                setToken(token);
            } catch (error) {
                console.error("Error fetching provisioning token:", error);
                Alert.alert("Error", "Failed to get provisioning token. Please try again.", [
                    {
                        text: "OK",
                        onPress: () => {
                            router.back();
                        }
                    }
                ]);
            }
        }
        void fetchToken();
    }, []);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Initialize WebSocket connection
    useApiSocket();

    // Check endpoint AP connection every 1 second
    useEffect(() => {
        const checkConnection = async () => {
            try {
                const connected = await verifyEndpointAPConnection();
                setIsEndpointConnected(connected);
                setIsChecking(false);
            } catch (error) {
                console.log("Error checking endpoint connection:", error);
                setIsEndpointConnected(false);
                setIsChecking(false);
            }
        };

        // Initial check
        checkConnection();

        // Set up interval to check every 1 second
        intervalRef.current = setInterval(checkConnection, 1000);

        // Cleanup interval on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const handleStartBinding = async () => {
        // Validate inputs
        if (!ssid.trim()) {
            Alert.alert("Error", "Please enter WiFi SSID");
            return;
        }

        // if (!password.trim()) {
        //     Alert.alert("Error", "Please enter WiFi password");
        //     return;
        // }

        setIsBinding(true);

        try {
            // Send WiFi credentials to endpoint
            const success = await sendWiFiCredentialsToEndpoint(ssid, password, token);

            if (success) {
                console.log("WiFi credentials sent, binding completed.");
                setIsBinding(false);
                Alert.alert("Success", "Device binding completed successfully.", [
                    {
                        text: "OK",
                        onPress: () => router.back(),
                    },
                ]);
            } else {
                throw new Error("Failed to send WiFi credentials to endpoint");
            }
        } catch (error) {
            console.error("Binding error:", error);
            Alert.alert("Error", "Failed to bind device. Please try again.");
            setIsBinding(false);
        }
    };

    const getConnectionStatusColor = () => {
        if (isChecking) return '#FFA500'; // Orange for checking
        return isEndpointConnected ? '#4CAF50' : '#F44336'; // Green for connected, red for disconnected
    };

    const getConnectionStatusText = () => {
        if (isChecking) return 'Checking...';
        return isEndpointConnected ? 'Connected' : 'Not Connected';
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Bind New Device</Text>
                <Text style={styles.subtitle}>Connect your device to Endpoint AP</Text>
            </View>

            {/* Endpoint Connection Status */}
            <View style={styles.statusContainer}>
                <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>Endpoint AP Status:</Text>
                    <View style={styles.statusIndicator}>
                        <View style={[styles.statusDot, {backgroundColor: getConnectionStatusColor()}]}/>
                        <Text style={[styles.statusText, {color: getConnectionStatusColor()}]}>
                            {getConnectionStatusText()}
                        </Text>
                    </View>
                </View>
            </View>

            {/* WiFi Credentials Form */}
            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>WiFi SSID</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter WiFi network name"
                        value={ssid}
                        onChangeText={setSsid}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>WiFi Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter WiFi password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>

                <Pressable
                    style={[
                        styles.bindButton,
                        (!isEndpointConnected || isBinding) && styles.bindButtonDisabled
                    ]}
                    onPress={handleStartBinding}
                    disabled={!isEndpointConnected || isBinding}
                >
                    {isBinding ? (
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <ActivityIndicator color="white"/>
                            <Text style={[styles.bindButtonText, {marginLeft: 10}]}>
                                {'Sending credentials...'}
                            </Text>
                        </View>
                    ) : (
                        <Text style={styles.bindButtonText}>
                            {isEndpointConnected ? 'Start Binding' : 'Waiting for Connection...'}
                        </Text>
                    )}
                </Pressable>

                <Pressable
                    style={styles.cancelButton}
                    onPress={() => router.back()}
                    disabled={isBinding}
                >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
            </View>

            {/* Instructions */}
            <View style={styles.instructions}>
                <Text style={styles.instructionsTitle}>Instructions:</Text>
                <Text style={styles.instructionText}>1. Connect your phone to the device's AP network</Text>
                <Text style={styles.instructionText}>2. Wait for "Connected" status above</Text>
                <Text style={styles.instructionText}>3. Enter your home WiFi credentials</Text>
                <Text style={styles.instructionText}>4. Tap "Start Binding" to complete setup</Text>
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
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
    },
    statusContainer: {
        marginHorizontal: 20,
        padding: 15,
        backgroundColor: 'white',
        borderRadius: 8,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    statusIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
    },
    warningText: {
        marginTop: 10,
        fontSize: 12,
        color: '#F44336',
        fontStyle: 'italic',
    },
    form: {
        paddingHorizontal: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'white',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 8,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    bindButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    bindButtonDisabled: {
        backgroundColor: '#9E9E9E',
    },
    bindButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButton: {
        backgroundColor: 'transparent',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
    },
    instructions: {
        marginHorizontal: 20,
        marginTop: 30,
        padding: 15,
        backgroundColor: '#E3F2FD',
        borderRadius: 8,
    },
    instructionsTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1976D2',
        marginBottom: 10,
    },
    instructionText: {
        fontSize: 13,
        color: '#1976D2',
        marginBottom: 5,
    },
});

