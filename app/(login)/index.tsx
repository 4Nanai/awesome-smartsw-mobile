import { loginApi } from "@/api/api";
import { useRouter } from "expo-router";
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    useColorScheme,
    View,
} from "react-native";

export default function LoginPage() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const lightColors = {
        background: '#f5f5f5',
        card: 'white',
        text: '#333',
        label: '#666',
        secondaryText: '#999',
        inputBg: '#f9f9f9',
        inputBorder: '#ddd',
        buttonBg: '#2196F3',
        buttonText: 'white',
        registerButtonBg: 'transparent',
        registerButtonBorder: '#2196F3',
        registerButtonText: '#2196F3',
        divider: '#ddd',
        dividerText: '#666',
        forgotPasswordText: '#2196F3',
        shadow: '#000',
    };

    const darkColors = {
        background: '#121212',
        card: '#1e1e1e',
        text: '#fff',
        label: '#ccc',
        secondaryText: '#aaa',
        inputBg: '#2c2c2c',
        inputBorder: '#555',
        buttonBg: '#2196F3',
        buttonText: 'white',
        registerButtonBg: 'transparent',
        registerButtonBorder: '#2196F3',
        registerButtonText: '#2196F3',
        divider: '#555',
        dividerText: '#ccc',
        forgotPasswordText: '#2196F3',
        shadow: '#000',
    };

    const colors = isDark ? darkColors : lightColors;

    const getStyles = (colors: typeof lightColors) => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        scrollContainer: {
            flexGrow: 1,
            justifyContent: 'center',
            padding: 20,
        },
        loginContainer: {
            width: '100%',
            maxWidth: 400,
            alignSelf: 'center',
        },
        title: {
            fontSize: 32,
            fontWeight: 'bold',
            color: colors.text,
            textAlign: 'center',
            marginBottom: 8,
        },
        subtitle: {
            fontSize: 16,
            color: colors.secondaryText,
            textAlign: 'center',
            marginBottom: 40,
        },
        inputContainer: {
            marginBottom: 20,
        },
        inputLabel: {
            fontSize: 16,
            color: colors.text,
            marginBottom: 8,
            fontWeight: '500',
        },
        input: {
            borderWidth: 1,
            borderColor: colors.inputBorder,
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            backgroundColor: colors.inputBg,
            color: colors.text,
        },
        button: {
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
            marginBottom: 16,
        },
        loginButton: {
            backgroundColor: colors.buttonBg,
            marginTop: 20,
        },
        loginButtonText: {
            color: colors.buttonText,
            fontSize: 18,
            fontWeight: '600',
        },
        registerButton: {
            backgroundColor: colors.registerButtonBg,
            borderWidth: 2,
            borderColor: colors.registerButtonBorder,
        },
        registerButtonText: {
            color: colors.registerButtonText,
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
            backgroundColor: colors.divider,
        },
        dividerText: {
            marginHorizontal: 16,
            color: colors.dividerText,
            fontSize: 14,
        },
        forgotPasswordButton: {
            alignItems: 'center',
            paddingVertical: 16,
        },
        forgotPasswordText: {
            color: colors.forgotPasswordText,
            fontSize: 14,
            textDecorationLine: 'underline',
        },
    });

    const styles = getStyles(colors);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) {
            Alert.alert('Login Error', 'Please enter your username/email and password');
            return;
        }

        setIsLoading(true);
        try {
            console.log('Sign In:', {username, password});
            await loginApi(username, password);
            router.replace("/(home)")
        } catch (error) {
            Alert.alert('Error', 'Login failed, please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = () => {
        router.push('/register');
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
                <View style={styles.loginContainer}>
                    <Text style={styles.title}>Welcome back</Text>
                    <Text style={styles.subtitle}>Please login</Text>

                    {/* Input Fields */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Username</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Please enter your username"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="default"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Please enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    {/* Buttons */}
                    <Pressable
                        style={({pressed}) => [pressed && {opacity: 0.5}, styles.button, styles.loginButton]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        <Text style={styles.loginButtonText}>
                            {isLoading ? "Signing You In..." : "Sign In"}
                        </Text>
                    </Pressable>

                    {/* Divider */}
                    <View style={styles.divider}>
                        <View style={styles.dividerLine}/>
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.dividerLine}/>
                    </View>

                    {/* Sign up */}
                    <Pressable
                        style={({pressed}) => [pressed && {opacity: 0.5}, styles.button, styles.registerButton]}
                        onPress={handleRegister}
                    >
                        <Text style={styles.registerButtonText}>Sign Up Now</Text>
                    </Pressable>

                    {/* Forgot password */}
                    <Pressable style={({pressed}) => [pressed && {opacity: 0.5}, styles.forgotPasswordButton]}>
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
