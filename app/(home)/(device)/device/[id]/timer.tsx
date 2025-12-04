import { setTimerConfigApi } from "@/api/api";
import { TimerConfig, TimerEvent } from "@/lib/definition";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from '@react-native-picker/picker';
import { Stack, useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router/build/hooks";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from "react-native";
import Toast from 'react-native-toast-message';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MAX_EVENTS_PER_DAY = 20;

export default function TimerConfigPage() {
    const router = useRouter();
    const { id, state, alias }: { id?: string; state?: string; alias?: string } = useLocalSearchParams();
    const uniqueHardwareId = typeof id === 'string' ? id : null;
    const deviceState = typeof state === 'string' ? state as "on" | "off" | "error" | "unknown" : "unknown";
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [timerConfig, setTimerConfig] = useState<TimerConfig>({});
    const [selectedDay, setSelectedDay] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [isLoadingConfig, setIsLoadingConfig] = useState(true);

    const isDeviceUnavailable = deviceState === "error" || deviceState === "unknown";

    useEffect(() => {
        loadSavedConfig();
    }, [uniqueHardwareId]);

    const getStorageKey = () => {
        return `device_timer_config_${uniqueHardwareId}`;
    };

    const loadSavedConfig = async () => {
        if (!uniqueHardwareId) return;

        try {
            const savedConfig = await AsyncStorage.getItem(getStorageKey());
            if (savedConfig) {
                setTimerConfig(JSON.parse(savedConfig));
            }
        } catch (error) {
            console.error("Error loading saved timer config:", error);
        } finally {
            setIsLoadingConfig(false);
        }
    };

    const saveConfig = async (config: TimerConfig) => {
        if (!uniqueHardwareId) return;

        try {
            await AsyncStorage.setItem(getStorageKey(), JSON.stringify(config));
        } catch (error) {
            console.error("Error saving timer config:", error);
        }
    };

    const addTimerEvent = () => {
        const dayKey = selectedDay.toString();
        const currentEvents = timerConfig[dayKey] || [];

        if (currentEvents.length >= MAX_EVENTS_PER_DAY) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: `Maximum ${MAX_EVENTS_PER_DAY} events per day`,
                position: 'top',
            });
            return;
        }

        const newEvent: TimerEvent = {
            h: 12,
            m: 0,
            s: 0,
            a: true,
        };

        setTimerConfig(prev => ({
            ...prev,
            [dayKey]: [...currentEvents, newEvent],
        }));
    };

    const updateTimerEvent = (index: number, field: keyof TimerEvent, value: number | boolean) => {
        const dayKey = selectedDay.toString();
        const currentEvents = timerConfig[dayKey] || [];
        const updatedEvents = [...currentEvents];
        updatedEvents[index] = { ...updatedEvents[index], [field]: value };

        setTimerConfig(prev => ({
            ...prev,
            [dayKey]: updatedEvents,
        }));
    };

    const deleteTimerEvent = (index: number) => {
        const dayKey = selectedDay.toString();
        const currentEvents = timerConfig[dayKey] || [];
        const updatedEvents = currentEvents.filter((_, i) => i !== index);

        if (updatedEvents.length > 0) {
            setTimerConfig(prev => ({
                ...prev,
                [dayKey]: updatedEvents,
            }));
        } else {
            setTimerConfig(prev => {
                const newConfig = { ...prev };
                delete newConfig[dayKey];
                return newConfig;
            });
        }
    };

    const handleSave = async () => {
        if (!uniqueHardwareId || loading) {
            console.log("Save operation is already in progress or uniqueHardwareId is missing");
            return
        };

        // Validate timer events
        for (const dayKey in timerConfig) {
            const events = timerConfig[dayKey];
            for (const event of events) {
                if (event.h < 0 || event.h > 23) {
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'Hour must be between 0 and 23',
                        position: 'top',
                    });
                    return;
                }
                if (event.m < 0 || event.m > 59) {
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'Minute must be between 0 and 59',
                        position: 'top',
                    });
                    return;
                }
            }
        }

        setLoading(true);

        try {
            await setTimerConfigApi(uniqueHardwareId, timerConfig);
            await saveConfig(timerConfig);
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Timer configuration saved successfully',
                position: 'top',
            });
            console.log("Timer configuration saved successfully");
            await new Promise(resolve => setTimeout(resolve, 1000));
            router.back();
        } catch (error) {
            console.error("Error saving timer config:", error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to save timer configuration',
                position: 'top',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClearDay = () => {
        Alert.alert(
            "Clear Events",
            `Are you sure you want to clear all timer events for ${DAYS[selectedDay]}?`,
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Clear",
                    style: "destructive",
                    onPress: () => {
                        const dayKey = selectedDay.toString();
                        setTimerConfig(prev => {
                            const newConfig = { ...prev };
                            delete newConfig[dayKey];
                            return newConfig;
                        });
                    }
                }
            ]
        );
    };

    const renderTimeControl = (
        label: string,
        value: number,
        type: 'h' | 'm' | 's',
        index: number,
        disabled: boolean
    ) => {
        const max = type === 'h' ? 23 : 59;
        const range = Array.from({ length: max + 1 }, (_, i) => i);
        
        return (
            <View style={styles.timeControl}>
                <Text style={[styles.timeLabel, isDark && styles.timeLabelDark]}>{label}</Text>
                <View style={styles.timePickerWrapper}>
                    <Picker
                        selectedValue={value}
                        onValueChange={(itemValue) => updateTimerEvent(index, type, itemValue as number)}
                        style={[styles.timePicker, isDark && styles.timePickerDark]}
                        enabled={!disabled}
                        itemStyle={styles.pickerItem}
                    >
                        {range.map((val) => (
                            <Picker.Item 
                                key={val} 
                                label={val.toString().padStart(2, '0')} 
                                value={val}
                                color={isDark ? '#fff' : '#000'}
                            />
                        ))}
                    </Picker>
                </View>
            </View>
        );
    };

    if (isLoadingConfig) {
        return (
            <>
                <Stack.Screen options={{ headerBackTitle: "Settings", headerTitle: "Timer Configuration" }} />
                <View style={[styles.container, isDark && styles.containerDark, styles.loadingContainer]}>
                    <ActivityIndicator size="large" color="#2196F3" />
                    <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>Loading timer configuration...</Text>
                </View>
            </>
        );
    }

    const currentDayEvents = timerConfig[selectedDay.toString()] || [];

    return (
        <>
            <Stack.Screen options={{ headerBackTitle: "Settings", headerTitle: "Timer Configuration" }} />
            <ScrollView style={[styles.container, isDark && styles.containerDark]}>
                <View style={styles.content}>
                    {isDeviceUnavailable && (
                        <View style={[styles.warningCard, isDark && styles.warningCardDark]}>
                            <Text style={[styles.warningTitle, isDark && styles.warningTitleDark]}>⚠️ Device Unavailable</Text>
                            <Text style={[styles.warningMessage, isDark && styles.warningMessageDark]}>
                                The device is currently unavailable. Timer configuration cannot be modified. Please check the device connection.
                            </Text>
                        </View>
                    )}

                    <View style={[styles.card, isDark && styles.cardDark]}>
                        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Select Day</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelector} contentContainerStyle={styles.daySelectorContent}>
                            {DAYS.map((day, index) => (
                                <Pressable
                                    key={index}
                                    style={({ pressed }) => [
                                        styles.dayButton,
                                        isDark && styles.dayButtonDark,
                                        selectedDay === index && styles.dayButtonSelected,
                                        pressed && { opacity: 0.5 },
                                    ]}
                                    onPress={() => setSelectedDay(index)}
                                >
                                    <Text
                                        style={[
                                            styles.dayButtonText,
                                            isDark && styles.dayButtonTextDark,
                                            selectedDay === index && styles.dayButtonTextSelected,
                                        ]}
                                    >
                                        {day.substring(0, 3)}
                                    </Text>
                                    {timerConfig[index.toString()]?.length > 0 && (
                                        <View style={styles.eventBadge}>
                                            <Text style={styles.eventBadgeText}>
                                                {timerConfig[index.toString()].length}
                                            </Text>
                                        </View>
                                    )}
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>

                    <View style={[styles.card, isDark && styles.cardDark]}>
                        <View style={styles.cardHeader}>
                            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                                {DAYS[selectedDay]} Events ({currentDayEvents.length}/{MAX_EVENTS_PER_DAY})
                            </Text>
                            {currentDayEvents.length > 0 && (
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.clearButton,
                                        pressed && { opacity: 0.5 },
                                    ]}
                                    onPress={handleClearDay}
                                >
                                    <Text style={styles.clearButtonText}>Clear</Text>
                                </Pressable>
                            )}
                        </View>

                        {currentDayEvents.length === 0 ? (
                            <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>No timer events for this day</Text>
                        ) : (
                            currentDayEvents.map((event, index) => (
                                <View key={index} style={[styles.eventCard, isDark && styles.eventCardDark]}>
                                    <View style={styles.eventHeader}>
                                        <Text style={[styles.eventTitle, isDark && styles.eventTitleDark]}>Event {index + 1}</Text>
                                        <Pressable
                                            style={({ pressed }) => [
                                                styles.deleteButton,
                                                pressed && { opacity: 0.5 },
                                            ]}
                                            onPress={() => deleteTimerEvent(index)}
                                            disabled={isDeviceUnavailable}
                                        >
                                            <Text style={styles.deleteButtonText}>Delete</Text>
                                        </Pressable>
                                    </View>

                                    <View style={styles.timeRow}>
                                        {renderTimeControl(
                                            'Hour',
                                            event.h,
                                            'h',
                                            index,
                                            isDeviceUnavailable
                                        )}
                                        {renderTimeControl(
                                            'Min',
                                            event.m,
                                            'm',
                                            index,
                                            isDeviceUnavailable
                                        )}
                                        {renderTimeControl(
                                            'Sec',
                                            event.s,
                                            's',
                                            index,
                                            isDeviceUnavailable
                                        )}
                                    </View>

                                    <View style={styles.actionRow}>
                                        <Text style={[styles.actionLabel, isDark && styles.actionLabelDark]}>Action:</Text>
                                        <View style={styles.actionButtons}>
                                            <Pressable
                                                style={({ pressed }) => [
                                                    styles.actionButton,
                                                    isDark && styles.actionButtonDark,
                                                    event.a && styles.actionButtonOn,
                                                    pressed && { opacity: 0.5 },
                                                    isDeviceUnavailable && styles.actionButtonDisabled,
                                                ]}
                                                onPress={() => updateTimerEvent(index, 'a', true)}
                                                disabled={isDeviceUnavailable}
                                            >
                                                <Text
                                                    style={[
                                                        styles.actionButtonText,
                                                        isDark && styles.actionButtonTextDark,
                                                        event.a && styles.actionButtonTextSelected,
                                                    ]}
                                                >
                                                    ON
                                                </Text>
                                            </Pressable>
                                            <Pressable
                                                style={({ pressed }) => [
                                                    styles.actionButton,
                                                    isDark && styles.actionButtonDark,
                                                    !event.a && styles.actionButtonOff,
                                                    pressed && { opacity: 0.5 },
                                                    isDeviceUnavailable && styles.actionButtonDisabled,
                                                ]}
                                                onPress={() => updateTimerEvent(index, 'a', false)}
                                                disabled={isDeviceUnavailable}
                                            >
                                                <Text
                                                    style={[
                                                        styles.actionButtonText,
                                                        isDark && styles.actionButtonTextDark,
                                                        !event.a && styles.actionButtonTextSelected,
                                                    ]}
                                                >
                                                    OFF
                                                </Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                </View>
                            ))
                        )}

                        <Pressable
                            style={({ pressed }) => [
                                styles.addButton,
                                pressed && { opacity: 0.5 },
                                (isDeviceUnavailable || currentDayEvents.length >= MAX_EVENTS_PER_DAY) &&
                                    styles.addButtonDisabled,
                            ]}
                            onPress={addTimerEvent}
                            disabled={isDeviceUnavailable || currentDayEvents.length >= MAX_EVENTS_PER_DAY}
                        >
                            <Text style={styles.addButtonText}>+ Add Timer Event</Text>
                        </Pressable>
                    </View>

                    <Pressable
                        style={({ pressed }) => [
                            styles.saveButton,
                            pressed && { opacity: 0.5 },
                            (loading || isDeviceUnavailable) && styles.saveButtonDisabled,
                        ]}
                        onPress={handleSave}
                        disabled={loading || isDeviceUnavailable}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save Configuration</Text>
                        )}
                    </Pressable>
                </View>
            </ScrollView>
            <Toast />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    containerDark: {
        backgroundColor: '#121212',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    card: {
        backgroundColor: 'white',
        padding: 20,
        marginBottom: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    cardDark: {
        backgroundColor: '#1E1E1E',
        shadowColor: '#fff',
        shadowOpacity: 0.05,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    sectionTitleDark: {
        color: '#E0E0E0',
    },
    daySelector: {
        flexDirection: 'row',
    },
    daySelectorContent: {
        paddingTop: 10,
        paddingBottom: 5,
    },
    dayButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        backgroundColor: 'white',
        marginRight: 10,
        minWidth: 70,
        alignItems: 'center',
        overflow: 'visible',
    },
    dayButtonDark: {
        backgroundColor: '#2A2A2A',
        borderColor: '#404040',
    },
    dayButtonSelected: {
        backgroundColor: '#2196F3',
        borderColor: '#2196F3',
    },
    dayButtonText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    dayButtonTextDark: {
        color: '#B0B0B0',
    },
    dayButtonTextSelected: {
        color: 'white',
    },
    eventBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#F44336',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    eventBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        paddingVertical: 20,
    },
    emptyTextDark: {
        color: '#666',
    },
    eventCard: {
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    eventCardDark: {
        backgroundColor: '#2A2A2A',
        borderColor: '#404040',
    },
    eventHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    eventTitleDark: {
        color: '#E0E0E0',
    },
    deleteButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 5,
        backgroundColor: '#F44336',
    },
    deleteButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    timeRow: {
        flexDirection: 'row',
        marginBottom: 15,
        alignItems: 'center',
    },
    timeControl: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
    },
    timeLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
        marginBottom: 5,
    },
    timeLabelDark: {
        color: '#B0B0B0',
    },
    timePickerWrapper: {
        width: '100%',
        height: Platform.OS === 'ios' ? 150 : 50,
        justifyContent: 'center',
    },
    timePicker: {
        width: '100%',
        height: Platform.OS === 'ios' ? 150 : 50,
    },
    timePickerDark: {
        color: '#fff',
    },
    pickerItem: {
        fontSize: 18,
        height: Platform.OS === 'ios' ? 150 : undefined,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    actionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    actionLabelDark: {
        color: '#E0E0E0',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    actionButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        backgroundColor: 'white',
    },
    actionButtonDark: {
        backgroundColor: '#2A2A2A',
        borderColor: '#404040',
    },
    actionButtonOn: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    actionButtonOff: {
        backgroundColor: '#9E9E9E',
        borderColor: '#9E9E9E',
    },
    actionButtonDisabled: {
        opacity: 0.5,
    },
    actionButtonText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '600',
    },
    actionButtonTextDark: {
        color: '#B0B0B0',
    },
    actionButtonTextSelected: {
        color: 'white',
    },
    addButton: {
        backgroundColor: '#2196F3',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    addButtonDisabled: {
        opacity: 0.5,
    },
    addButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    clearButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 5,
        backgroundColor: '#FF9800',
    },
    clearButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    loadingTextDark: {
        color: '#B0B0B0',
    },
    warningCard: {
        backgroundColor: '#FFF3E0',
        padding: 16,
        marginBottom: 15,
        borderRadius: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#FF9800',
    },
    warningCardDark: {
        backgroundColor: '#3E2723',
        borderLeftColor: '#FF9800',
    },
    warningTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#E65100',
        marginBottom: 8,
    },
    warningTitleDark: {
        color: '#FFB74D',
    },
    warningMessage: {
        fontSize: 14,
        color: '#E65100',
        lineHeight: 20,
    },
    warningMessageDark: {
        color: '#FFB74D',
    },
});
