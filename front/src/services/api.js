import axios from 'axios';

// 현재 온도를 읽어오는 API 호출
export const readCurrentTemperature = async () => {
    return axios.get('/api/modbus/read-current-temperature');
};

// 설정 온도를 읽어오는 API 호출
export const readSettingTemperature = async () => {
    return axios.get('/api/modbus/read-setting-temperature');
};

// 설정 온도를 쓰는 API 호출
export const writeSetTemperature = async (value) => {
    return axios.post('/api/modbus/write-set-temperature', { value });
};

// 온도계 상태를 읽어오는 API 호출
export const readThermostatStatus = async () => {
    return axios.get('/api/modbus/read-thermostat-status');
};

// 온도계 제어를 하는 API 호출
export const writeThermostatControl = async (value) => {
    return axios.post('/api/modbus/write-thermostat-control', { value });
};
