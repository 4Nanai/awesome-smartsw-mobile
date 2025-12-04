// Common IANA timezone list
export const TIMEZONES = [
    // UTC
    { label: 'UTC', value: 'UTC' },
    
    // Americas
    { label: 'America/New_York (EST/EDT)', value: 'America/New_York' },
    { label: 'America/Chicago (CST/CDT)', value: 'America/Chicago' },
    { label: 'America/Denver (MST/MDT)', value: 'America/Denver' },
    { label: 'America/Los_Angeles (PST/PDT)', value: 'America/Los_Angeles' },
    { label: 'America/Anchorage (AKST/AKDT)', value: 'America/Anchorage' },
    { label: 'America/Phoenix (MST)', value: 'America/Phoenix' },
    { label: 'America/Toronto', value: 'America/Toronto' },
    { label: 'America/Vancouver', value: 'America/Vancouver' },
    { label: 'America/Mexico_City', value: 'America/Mexico_City' },
    { label: 'America/Sao_Paulo', value: 'America/Sao_Paulo' },
    { label: 'America/Argentina/Buenos_Aires', value: 'America/Argentina/Buenos_Aires' },
    { label: 'America/Lima', value: 'America/Lima' },
    { label: 'America/Bogota', value: 'America/Bogota' },
    { label: 'America/Santiago', value: 'America/Santiago' },
    
    // Europe
    { label: 'Europe/London (GMT/BST)', value: 'Europe/London' },
    { label: 'Europe/Paris (CET/CEST)', value: 'Europe/Paris' },
    { label: 'Europe/Berlin (CET/CEST)', value: 'Europe/Berlin' },
    { label: 'Europe/Rome (CET/CEST)', value: 'Europe/Rome' },
    { label: 'Europe/Madrid (CET/CEST)', value: 'Europe/Madrid' },
    { label: 'Europe/Amsterdam (CET/CEST)', value: 'Europe/Amsterdam' },
    { label: 'Europe/Brussels (CET/CEST)', value: 'Europe/Brussels' },
    { label: 'Europe/Vienna (CET/CEST)', value: 'Europe/Vienna' },
    { label: 'Europe/Zurich (CET/CEST)', value: 'Europe/Zurich' },
    { label: 'Europe/Stockholm (CET/CEST)', value: 'Europe/Stockholm' },
    { label: 'Europe/Athens (EET/EEST)', value: 'Europe/Athens' },
    { label: 'Europe/Istanbul (TRT)', value: 'Europe/Istanbul' },
    { label: 'Europe/Moscow (MSK)', value: 'Europe/Moscow' },
    { label: 'Europe/Dublin (GMT/IST)', value: 'Europe/Dublin' },
    { label: 'Europe/Lisbon (WET/WEST)', value: 'Europe/Lisbon' },
    
    // Asia
    { label: 'Asia/Dubai (GST)', value: 'Asia/Dubai' },
    { label: 'Asia/Kolkata (IST)', value: 'Asia/Kolkata' },
    { label: 'Asia/Bangkok (ICT)', value: 'Asia/Bangkok' },
    { label: 'Asia/Singapore (SGT)', value: 'Asia/Singapore' },
    { label: 'Asia/Hong_Kong (HKT)', value: 'Asia/Hong_Kong' },
    { label: 'Asia/Shanghai (CST)', value: 'Asia/Shanghai' },
    { label: 'Asia/Tokyo (JST)', value: 'Asia/Tokyo' },
    { label: 'Asia/Seoul (KST)', value: 'Asia/Seoul' },
    { label: 'Asia/Taipei (CST)', value: 'Asia/Taipei' },
    { label: 'Asia/Manila (PST)', value: 'Asia/Manila' },
    { label: 'Asia/Jakarta (WIB)', value: 'Asia/Jakarta' },
    { label: 'Asia/Kuala_Lumpur (MYT)', value: 'Asia/Kuala_Lumpur' },
    { label: 'Asia/Karachi (PKT)', value: 'Asia/Karachi' },
    { label: 'Asia/Tehran (IRST)', value: 'Asia/Tehran' },
    { label: 'Asia/Jerusalem (IST)', value: 'Asia/Jerusalem' },
    { label: 'Asia/Riyadh (AST)', value: 'Asia/Riyadh' },
    
    // Pacific
    { label: 'Pacific/Auckland (NZST/NZDT)', value: 'Pacific/Auckland' },
    { label: 'Pacific/Sydney (AEST/AEDT)', value: 'Australia/Sydney' },
    { label: 'Pacific/Melbourne (AEST/AEDT)', value: 'Australia/Melbourne' },
    { label: 'Pacific/Brisbane (AEST)', value: 'Australia/Brisbane' },
    { label: 'Pacific/Perth (AWST)', value: 'Australia/Perth' },
    { label: 'Pacific/Fiji (FJT)', value: 'Pacific/Fiji' },
    { label: 'Pacific/Honolulu (HST)', value: 'Pacific/Honolulu' },
    
    // Africa
    { label: 'Africa/Cairo (EET)', value: 'Africa/Cairo' },
    { label: 'Africa/Johannesburg (SAST)', value: 'Africa/Johannesburg' },
    { label: 'Africa/Lagos (WAT)', value: 'Africa/Lagos' },
    { label: 'Africa/Nairobi (EAT)', value: 'Africa/Nairobi' },
];

// Function to detect user's timezone
export const detectUserTimezone = (): string => {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch (error) {
        console.error('Failed to detect timezone:', error);
        return 'UTC';
    }
};
