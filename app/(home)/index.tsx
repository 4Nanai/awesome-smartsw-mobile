import {Pressable, Text} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomePage() {
    return (
        <>
            <Text>
                Home Page
            </Text>
            <Pressable onPress={async () => {
                await AsyncStorage.removeItem("user-token");
            }}>
                <Text>Logout</Text>
            </Pressable>
        </>
    );
}
