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

export default function LoginPage() {
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!usernameOrEmail.trim() || !password.trim()) {
            Alert.alert('Login Error', 'Please enter your username/email and password');
            return;
        }

        setIsLoading(true);
        try {
            // TODO: 实现登录逻辑
            console.log('Sign In:', {usernameOrEmail, password});
        } catch (error) {
            Alert.alert('Error', 'Login failed, please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = () => {
        // TODO: 导航到注册页面或实现注册逻辑
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
                        <Text style={styles.inputLabel}>Username/Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Please enter your username or email"
                            value={usernameOrEmail}
                            onChangeText={setUsernameOrEmail}
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="email-address"
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
    loginContainer: {
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
    loginButton: {
        backgroundColor: Colors.light.tint,
        marginTop: 20,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    registerButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: Colors.light.tint,
    },
    registerButtonText: {
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
    forgotPasswordButton: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    forgotPasswordText: {
        color: Colors.light.tint,
        fontSize: 14,
        textDecorationLine: 'underline',
    },
})
