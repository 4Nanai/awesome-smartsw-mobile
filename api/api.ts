import axios from 'axios';
import dotenv from 'dotenv';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {router} from "expo-router";

dotenv.config();
const BASE_URL = process.env.BASE_URL || 'https://api.example.com';

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
                return Promise.reject(error);
            }
            console.log('Unauthorized, redirecting to login...');
            await AsyncStorage.removeItem("user-token");
            router.replace("/(login)")
        }
        return Promise.reject(error);
    }
);

export default apiClient;
