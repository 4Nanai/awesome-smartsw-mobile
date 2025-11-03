import {Tabs} from "expo-router";

export default function HomePageLayout() {
    return (
        <>
            <Tabs>
                <Tabs.Screen name="(device)" options={{headerTitle: "Home", headerShown: false, title: "Home"}}/>
            </Tabs>
        </>
    );
}
