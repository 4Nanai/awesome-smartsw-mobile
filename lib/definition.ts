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
    type: "user_auth" | "user_command" | "auth_success" | "auth_failure" | "new_device_connected" | "endpoint_state"  | "query_endpoint_state",
    payload?: {
        uniqueHardwareId?: string,
        token?: string,
        state?: "on" | "off" | "error",
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
    status: "on" | "off" | "unknown" | "error",
}

export interface DeviceUpdateAliasDTO {
    unique_hardware_id: string,
    alias: string,
}

export interface SetAutomationModeDTO {
    unique_hardware_id: string,
    mode: "off" | "presence" | "sound" | "timer" | "ml",
}

export interface SetPresenceModeDTO {
    unique_hardware_id: string,
    mode: "pir_only" | "radar_only" | "fusion_or" | "fusion_and",
}

export interface SetSoundModeDTO {
    unique_hardware_id: string,
    mode: "noise" | "clap",
}
