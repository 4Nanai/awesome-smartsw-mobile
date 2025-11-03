import {Text} from "react-native";
import {useSearchParams} from "expo-router/build/hooks";

export default function DevicePage() {
    const searchParams = useSearchParams();
    const deviceId = searchParams.get("id");
    return (
        <>
            <Text>
                Device Page for device ID: {deviceId}
            </Text>
        </>
    );
}
