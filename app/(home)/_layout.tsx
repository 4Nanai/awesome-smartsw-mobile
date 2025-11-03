import {Tabs} from "expo-router";

export default function HomePageLayout() {
    return (
        <>
            <Tabs>
                <Tabs.Screen name="index" options={{headerTitle: "Home", headerShown: true, title: "Home"}}/>
            </Tabs>
        </>
    );
}
