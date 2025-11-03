import FontAwesome from '@expo/vector-icons/FontAwesome';
import {DarkTheme, DefaultTheme, ThemeProvider} from '@react-navigation/native';
import {useFonts} from 'expo-font';
import {Stack, useRouter} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {useEffect, useState} from 'react';
import 'react-native-reanimated';

import {useColorScheme} from '@/components/useColorScheme';
import AsyncStorage from "@react-native-async-storage/async-storage";

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary,
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [fontLoaded, error] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
        ...FontAwesome.font,
    });

    const [loginCheckLoaded, setLoginCheckLoaded] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const checkLoginStatus = async () => {
            const token = await AsyncStorage.getItem("user-token");
            if (token) {
                console.log("User is logged in");
                router.replace("/(home)")
            } else {
                console.log("User is not logged in");
                router.replace("/(login)")
            }
            await new Promise(resolve => setTimeout(resolve, 500));
            setLoginCheckLoaded(true);
        };
        checkLoginStatus();
    }, []);

    // Expo Router uses Error Boundaries to catch errors in the navigation tree.
    useEffect(() => {
        if (error) throw error;
    }, [error]);

    useEffect(() => {
        if (fontLoaded && loginCheckLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontLoaded, loginCheckLoaded]);

    if (!fontLoaded) {
        return null;
    }

    return <RootLayoutNav />;
}

function RootLayoutNav() {
    const colorScheme = useColorScheme();

    return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name="(login)" />
                <Stack.Screen name="(home)" />
            </Stack>
        </ThemeProvider>
    );
}
