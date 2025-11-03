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
    type: "endpoint_state" | "user_auth" | "user_command" | "auth_success",
    payload?: {
        uniqueHardwareId?: string,
        token?: string,
        state?: boolean,
        command?: {
            type: string,
            state?: boolean,
            data?: boolean,
        },
        [key: string]: any,
    },
    message?: string,
}

export interface DeviceDTO {
    unique_hardware_id: string,
    alias: string | null,
    status: boolean,
}
