// ModbusTCPClient.js
const Modbus = require('modbus-serial');
const client = new Modbus();
const dotenv = require("dotenv"); //환경변수 처리
dotenv.config();


// PLC 연결 설정
const HOST = process.env.TCP_HOST;
const PORT = 502;

// Modbus 클라이언트 설정 및 연결
async function connectClient() {
    try {
        await client.connectTCP(HOST, { port: PORT });
        client.setID(255);
        console.log("Modbus client connected");
    } catch (error) {
        console.error("Failed to connect Modbus client:", error);
        // 여기서 연결 실패에 대한 처리를 할 수 있습니다.
    }
}

// 연결 시도
connectClient();


// 연결 상태 확인 및 필요시 재연결 시도
async function ensureConnection() {
    if (!client.isOpen) {
        console.log("Reconnecting Modbus client...");
        await connectClient();
    }
}

// D1000 : 현재 온도 소수점 
// D2000 : 설정 온도 쓰기
// D1200 : PLC 온도 제어 시작 (1) 종료 (0)
// D1105 : h200 = TIC on 상태 / h300 = TIC off 상태

// D1000 레지스터 읽기 (현재 온도)
async function readCurrentTemperature() {
    try {
        await ensureConnection(); // 연결 상태 확인 및 재연결 시도
        const data = await client.readInputRegisters(1000, 1);
        return data;
    } catch (error) {
        console.error("Failed to read current temperature:", error);
        throw error;
    }
}

// D2000 레지스터 읽기 (설정 온도)
async function readSetTemperature() {
    try {
        await ensureConnection(); // 연결 상태 확인 및 재연결 시도
        const data = await client.readInputRegisters(2000, 1);
        return data;
    } catch (error) {
        console.error("Failed to read setting temperature:", error);
        throw error;
    }
}

// D2000 레지스터 쓰기 (설정 온도)
async function writeSetTemperature(value) {
    try {
        await ensureConnection(); // 연결 상태 확인 및 재연결 시도
        await client.writeRegister(2000, value);
    } catch (error) {
        console.error("Failed to write set temperature:", error);
        throw error;
    }
}

// D1105 레지스터 읽기 (온도계 상태)
async function readThermostatStatus() {
    try {
        await ensureConnection(); // 연결 상태 확인 및 재연결 시도
        const data = await client.readInputRegisters(1105, 1);
        return data;
    } catch (error) {
        console.error("Failed to read thermostat status:", error);
        throw error;
    }
}

// D1200 레지스터 쓰기 (온도계 제어)
async function writeThermostatControl(value) {
    try {
        await ensureConnection(); // 연결 상태 확인 및 재연결 시도
        await client.writeRegister(1200, value);
    } catch (error) {
        console.error("Failed to write thermostat control:", error);
        throw error;
    }
}



module.exports = {
    readCurrentTemperature,
    readSetTemperature,
    writeSetTemperature,
    readThermostatStatus,
    writeThermostatControl
};
