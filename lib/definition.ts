export interface UserLoginDTO {
    username: string,
    password: string,
}

export interface UserRegisterDTO {
    username: string,
    email: string,
    password: string,
    timezone: string,
}

export interface UserProfileDTO {
    id: number,
    username: string,
    email: string,
    timezone: string,
    created_at: string,
}

export interface UpdateUserTimezoneDTO {
    timezone: string,
}

export interface UserMessageDTO {
    type: "user_auth" | "set_endpoint_state" | "auth_success" | "auth_failure" | "new_device_connected" | "endpoint_state"  | "query_endpoint_state",
    payload?: {
        uniqueHardwareId?: string,
        token?: string,
        state?: "on" | "off" | "error",
        command?: {
            state?: boolean,
            data?: string,
            from?: "user" | "ml",
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

export interface SetSensorOffDelayDTO {
    unique_hardware_id: string,
    delay: number,
}

export interface TimerEvent {
    h: number;
    m: number;
    s: number;
    a: boolean;
}

export interface TimerConfig {
    [day: string]: TimerEvent[];
}

export interface SetTimerConfigDTO {
    unique_hardware_id: string,
    timer: TimerConfig,
}

export interface MQTTConfigDTO {
    enable: boolean;
    device_name?: string;
    broker_url?: string;
    port?: number;
    topic_prefix?: string;
    username?: string;
    password?: string;
    client_id?: string;
    ha_discovery_enabled?: boolean;
    ha_discovery_prefix?: string;
}
