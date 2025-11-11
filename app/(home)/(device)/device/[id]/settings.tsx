import {Stack, useRouter} from "expo-router";
import {Alert, Pressable, Text, View} from "react-native";
import {deleteDeviceApi} from "@/api/api";
import {useLocalSearchParams} from "expo-router/build/hooks";

export default function DeviceSettingPage() {
    const router = useRouter();
    const {id} = useLocalSearchParams();
    const uniqueHardwareId = typeof id === 'string' ? id : null;

    const handleDeleteDevice = async () => {
        if (!uniqueHardwareId) {
            console.error("Invalid uniqueHardwareId");
            return;
        }
        console.log("Attempting to delete device with ID:", uniqueHardwareId);
        try {
            const res = await deleteDeviceApi(uniqueHardwareId);
            console.log("Delete Device Response:", res);
            Alert.alert("Success", "Device unbound successfully", [
                {
                    text: "OK",
                    onPress: () => {
                        router.dismissTo("/(home)/(device)");
                    }
                }
            ]);
        } catch (error) {
            console.error("Error deleting device:", error);
        }
    }

    return (
        <>
            <Stack.Screen options={{headerBackTitle: "Device"}}/>
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <Pressable style={{padding: 10, backgroundColor: '#007AFF', borderRadius: 5}} onPress={handleDeleteDevice}>
                    <Text style={{color: 'white', fontSize: 16}}>Unbind Device</Text>
                </Pressable>
            </View>
        </>
    );
}
