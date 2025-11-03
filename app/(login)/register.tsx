import React, {useState} from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Pressable,
} from "react-native";
import Colors from '../../constants/Colors';
import {registerApi} from "@/api/api";
import {useRouter} from "expo-router";

export default function RegisterPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
        if (!username.trim()) {
            Alert.alert('Registration Error', 'Please enter a username');
            return false;
        }
        if (!email.trim()) {
            Alert.alert('Registration Error', 'Please enter an email address');
            return false;
        }
        if (!email.includes('@')) {
            Alert.alert('Registration Error', 'Please enter a valid email address');
            return false;
        }
        if (!password.trim()) {
            Alert.alert('Registration Error', 'Please enter a password');
            return false;
        }
        if (password.length < 6) {
            Alert.alert('Registration Error', 'Password must be at least 6 characters long');
            return false;
        }
        if (password !== confirmPassword) {
            Alert.alert('Registration Error', 'Passwords do not match');
            return false;
        }
        return true;
    };

    const handleRegister = async () => {
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            console.log('Register:', {username, email, password});
            await registerApi(username, email, password);
            Alert.alert(
                'Registration Successful',
                'Your account has been created successfully. Please sign in.',
                [
                    {
                        text: 'OK',
                        onPress: () => router.back()
                    }
                ]
            );
        } catch (error) {
            Alert.alert('Error', 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToLogin = () => {
        router.back();
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.registerContainer}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Please sign up to continue</Text>

                    {/* Input Fields */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Username</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your username"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="default"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email address"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Confirm Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    {/* Buttons */}
                    <Pressable
                        style={({pressed}) => [pressed && {opacity: 0.5}, styles.button, styles.registerButton]}
                        onPress={handleRegister}
                        disabled={isLoading}
                    >
                        <Text style={styles.registerButtonText}>
                            {isLoading ? "Creating Account..." : "Sign Up"}
                        </Text>
                    </Pressable>

                    {/* Divider */}
                    <View style={styles.divider}>
                        <View style={styles.dividerLine}/>
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.dividerLine}/>
                    </View>

                    {/* Back to login */}
                    <Pressable
                        style={({pressed}) => [pressed && {opacity: 0.5}, styles.button, styles.loginButton]}
                        onPress={handleBackToLogin}
                    >
                        <Text style={styles.loginButtonText}>Already have an account? Sign In</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    registerContainer: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.light.text,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 40,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        color: Colors.light.text,
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
        color: Colors.light.text,
    },
    button: {
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginBottom: 16,
    },
    registerButton: {
        backgroundColor: Colors.light.tint,
        marginTop: 20,
    },
    registerButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    loginButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: Colors.light.tint,
    },
    loginButtonText: {
        color: Colors.light.tint,
        fontSize: 16,
        fontWeight: '600',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#ddd',
    },
    dividerText: {
        marginHorizontal: 16,
        color: '#666',
        fontSize: 14,
    },
});
