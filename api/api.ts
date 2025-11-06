import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {router} from "expo-router";
import {DeviceDTO, DeviceUpdateAliasDTO, UserLoginDTO, UserRegisterDTO} from "@/lib/definition";

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
                encryption_type: "wpa2-psk",
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

export {
    loginApi,
    registerApi,
    getAllDevicesApi,
    verifyEndpointAPConnection,
    getProvisioningToken,
    sendWiFiCredentialsToEndpoint,
    updateDeviceAliasApi,
};
