import {DeviceDTO} from "@/lib/definition";

const getAllDevicesMockApi = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay
    return [
        {unique_hardware_id: "AC-A3-BE-42-11-E1", alias: 'Smart Light 1', status: "online"},
        {unique_hardware_id: "AC-A3-BE-42-11-E2", alias: 'Smart Thermostat', status: "offline"},
        {unique_hardware_id: "AC-A3-BE-42-11-E3", alias: 'Smart Lock', status: "on"},
        {unique_hardware_id: "AC-A3-BE-42-11-E4", alias: 'Smart Camera', status: "off"},
        {unique_hardware_id: "AC-A3-BE-42-11-E5", alias: 'Smart Plug', status: "on"},
        {unique_hardware_id: "AC-A3-BE-42-11-E6", alias: 'Smart Speaker', status: "offline"},
    ] as DeviceDTO[];
}

export { getAllDevicesMockApi };
