export interface UserLoginDTO {
    username: string,
    password: string,
}

export interface UserRegisterDTO {
    username: string,
    email: string,
    password: string,
}

export interface UserMessageDTO {
    type: "user_auth" | "user_command" | "auth_success" | "new_device_connected" | "endpoint_state"  | "query_endpoint_state",
    payload?: {
        uniqueHardwareId?: string,
        token?: string,
        state?: "on" | "off" | "online" | "offline" | "error",
        command?: {
            type: "toggle" | string,
            state?: boolean,
            data?: string,
        },
        [key: string]: any,
    },
    message?: string,
}

export interface DeviceDTO {
    unique_hardware_id: string,
    alias: string | null,
    status: "on" | "off" | "online" | "offline" | "error",
}

export interface DeviceUpdateAliasDTO {
    unique_hardware_id: string,
    alias: string,
}
