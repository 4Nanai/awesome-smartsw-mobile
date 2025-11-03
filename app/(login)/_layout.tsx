import {Stack} from 'expo-router';

export default function LoginPageLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{
                headerTitle: "Login Page",
                headerShown: true,
            }}/>
        </Stack>
    );
}
