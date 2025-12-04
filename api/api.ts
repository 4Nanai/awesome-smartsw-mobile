import {
    DeviceDTO,
    DeviceUpdateAliasDTO,
    MQTTConfigDTO,
    SetAutomationModeDTO,
    SetPresenceModeDTO,
    SetSensorOffDelayDTO,
    SetTimerConfigDTO,
    UserLoginDTO,
    UserRegisterDTO
} from "@/lib/definition";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { router } from "expo-router";

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://api.example.com';
const ENDPOINT_URL = process.env.EXPO_PUBLIC_ENDPOINT_URL || 'https://endpoint.example.com';


const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem("user-token");
        if (token) {
            config.headers.token = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401) {
            if (originalRequest.url.includes('login')) {
                return Promise.reject(error.response.data || error);
            }
            console.log('Unauthorized, redirecting to login...');
            await AsyncStorage.removeItem("user-token");
            router.replace("/(login)")
        }
        return Promise.reject(error);
    }
);

export default apiClient;

const loginApi = async (username: string, password: string) => {
    const userLoginDTO: UserLoginDTO = {
        username,
        password,
    }
    try {
        const response = await apiClient.post<{ message: string, token: string }>('/user/login', userLoginDTO);
        await AsyncStorage.setItem("user-token", response.data.token);
        await AsyncStorage.setItem("user-username", username);
        return response.data.message;
    } catch (error) {
        console.log("Login API Error:", error);
        throw error;
    }
}

const registerApi = async (username: string, email: string, password: string) => {
    const userRegisterDTO: UserRegisterDTO = {
        username,
        email,
        password,
    }
    try {
        const response = await apiClient.post<{ message: string }>('/user/register', userRegisterDTO);
        return response.data.message;
    } catch (error) {
        console.log("Register API Error:", error);
        throw error;
    }
}

const getAllDevicesApi = async () => {
    try {
        const response = await apiClient.get<DeviceDTO[]>('/device/manage');
        return response.data;
    } catch (error) {
        console.log("Get All Devices API Error:", error);
        throw error;
    }
}

const verifyEndpointAPConnection = async () => {
    try {
        const response = await fetch(`${ENDPOINT_URL}`, {
            method: 'GET',
        });
        return response.ok;
    } catch (error) {
        console.log("Endpoint not connected yet.");
        return false;
    }
}

const getProvisioningToken = async () => {
    try {
        const response = await apiClient.get<{ token: string }>("/device/binding");
        return response.data.token;
    } catch (error) {
        console.log("Error getting provisioning token:", error);
        throw error;
    }
}

const sendWiFiCredentialsToEndpoint = async (ssid: string, password: string, token: string) => {
    try {
        const response = await fetch(`${ENDPOINT_URL}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ssid,
                password,
                provisioning_token: token,
            }),
        });
        return response.ok;
    } catch (error) {
        console.log("Error sending WiFi credentials to endpoint:", error);
        return false;
    }
}

const updateDeviceAliasApi = async (uniqueHardwareId: string, alias: string) => {
    try {
        const updateAliasDTO: DeviceUpdateAliasDTO = {
            unique_hardware_id: uniqueHardwareId,
            alias,
        }
        const response = await apiClient.put<{ message: string }>('/device/manage', updateAliasDTO);
        return response.data.message;
    } catch (error) {
        console.log("Update Device Alias API Error:", error);
        throw error;
    }
}

const deleteDeviceApi = async (uniqueHardwareId: string) => {
    try {
        const response = await apiClient.delete<{ message: string }>(`/device/manage/${uniqueHardwareId}`);
        return response.data.message;
    } catch (error) {
        console.log("Delete Device API Error:", error);
        throw error;
    }
}

const setAutomationModeApi = async (uniqueHardwareId: string, mode: "off" | "presence" | "sound" | "timer" | "ml") => {
    try {
        const setAutomationModeDTO: SetAutomationModeDTO = {
            unique_hardware_id: uniqueHardwareId,
            mode,
        }
        const response = await apiClient.post<{ message: string }>('/device/manage/config/automation-mode', setAutomationModeDTO);
        return response.data.message;
    } catch (error) {
        console.log("Set Automation Mode API Error:", error);
        throw error;
    }
}

const setPresenceModeApi = async (uniqueHardwareId: string, mode: "pir_only" | "radar_only" | "fusion_or" | "fusion_and") => {
    try {
        const setPresenceModeDTO: SetPresenceModeDTO = {
            unique_hardware_id: uniqueHardwareId,
            mode,
        }
        const response = await apiClient.post<{ message: string }>('/device/manage/config/presence-mode', setPresenceModeDTO);
        return response.data.message;
    } catch (error) {
        console.log("Set Presence Mode API Error:", error);
        throw error;
    }
}

const setSensorOffDelayApi = async (uniqueHardwareId: string, delay: number) => {
    try {
        const setSensorOffDelayDTO: SetSensorOffDelayDTO = {
            unique_hardware_id: uniqueHardwareId,
            delay,
        }
        const response = await apiClient.post<{ message: string }>('/device/manage/config/sensor-off-delay', setSensorOffDelayDTO);
        return response.data.message;
    } catch (error) {
        console.log("Set Sensor Off Delay API Error:", error);
        throw error;
    }
}

const setTimerConfigApi = async (uniqueHardwareId: string, timer: SetTimerConfigDTO['timer']) => {
    try {
        const setTimerConfigDTO: SetTimerConfigDTO = {
            unique_hardware_id: uniqueHardwareId,
            timer,
        }
        const response = await apiClient.post<{ message: string }>('/device/manage/config/timer', setTimerConfigDTO);
        return response.data.message;
    } catch (error) {
        console.log("Set Timer Config API Error:", error);
        throw error;
    }
}

const getDeviceManageStatsApi = async () => {
    try {
        const response = await apiClient.get('/device/manage/stats');
        return response.data;
    } catch (error) {
        console.log("Get Device Manage Stats API Error:", error);
        throw error;
    }
}

const setMQTTConfigApi = async (uniqueHardwareId: string, config: MQTTConfigDTO) => {
    try {
        const response = await apiClient.post<{ message: string }>(`/device/manage/${uniqueHardwareId}/mqtt-config`, config);
        return response.data.message;
    } catch (error) {
        console.log("Set MQTT Config API Error:", error);
        throw error;
    }
}

export {
    deleteDeviceApi, getAllDevicesApi, getDeviceManageStatsApi, getProvisioningToken, loginApi,
    registerApi, sendWiFiCredentialsToEndpoint, setAutomationModeApi, setMQTTConfigApi, setPresenceModeApi,
    setSensorOffDelayApi, setTimerConfigApi, updateDeviceAliasApi, verifyEndpointAPConnection
};

