/**
 * 모드버스 클라이언트 부분이다.
 * PLC에 모드버스 프로토콜에 맞게 요청을 보내고 받는다. 
 * 
 */ 
const Modbus = require('modbus-serial');
const client = new Modbus();
const dotenv = require("dotenv"); //환경변수 처리
dotenv.config();


// 환경변수에서 설정값 가져오기
const HOST = process.env.TCP_HOST;
const PORT = process.env.TCP_PORT || 502;
const TIMEOUT = parseInt(process.env.TCP_TIMEOUT || 5000); // 기본값 5초
const RETRY_LIMIT = process.env.RETRY_LIMIT || 3; // 최대 재시도 횟수

// 모델 가져오기
const temperaturerecords = require('../models/temperatureRecord');
const saveInterval = 10000; // 10초 주기로 저장


client.setTimeout(TIMEOUT); // 모드버스 응답에 대해서 타임아웃 추가 -> 무한대기 방지

// Modbus 클라이언트 설정 및 연결
async function connectClient() {
    try {
        await client.connectTCP(HOST, { port: PORT });
        client.setID(1);
        console.log("Modbus client connected");
    } catch (error) {
        console.error("Failed to connect Modbus client:", error);
        
    }
}

connectClient();

// Modbus 서버(PLC)와의 연결 상태를 검사하는 함수
async function checkConnection() {
    try {
        // 간단한 요청으로 연결 상태 확인
        await client.readCoils(0, 1);
    } catch (error) {
        console.error("Connection check failed, trying to reconnect:", error);
        await connectClient();
    }
}

// 연결 상태를 확인하고 주어진 작업을 재시도 로직과 함께 실행한다. 작업 실행 중 예외가 발생하면, 지정된 횟수(RETRY_LIMIT)만큼 작업을 재시도
async function modbusOperation(operationFunc, ...args) {
    await checkConnection();
    for (let attempt = 1; attempt <= RETRY_LIMIT; attempt++) {
        try {
            return await operationFunc(...args);
        } catch (error) {
            console.error(`Attempt ${attempt}: ${error.message}`);

            // 네트워크 에러 처리
            if (error.name == 'PortNotOpenError') {
                console.log("Network error detected, attempting to reconnect...");
                //await reconnectWithBackoff(attempt);
            }
            // 응답 없음 에러 처리
            else if (error.name == 'NoResponseError') {
                console.log("No response from the device, checking connection...");
                await checkConnection();
            }
            // 타임아웃 에러 처리
            else if (error.name == 'TransactionTimedOutError'){
                console.log("Timeout Error, server not responding in 5 seconds ")
            }
            // 다른 유형의 에러 처리
            else {
                console.log("An unexpected error occurred, retrying...");
            }

            if (attempt === RETRY_LIMIT) throw new Error("Max retry attempts reached.");
        }
    }
}

    // // 지수 백오프를 사용한 재연결 시도
    // async function reconnectWithBackoff(attempt) {
    //     const backoffTime = calculateBackoffTime(attempt);
    //     console.log(`Waiting ${backoffTime}ms before next attempt...`);
    //     await sleep(backoffTime);
    //     await connectClient();
    // }

    // // 지수 백오프 시간 계산
    // function calculateBackoffTime(attempt) {
    //     const baseDelay = 10000; // 기본 지연 시간 (10초)
    //     return baseDelay * Math.pow(2, attempt - 1);
    // }

    // // 비동기 sleep 함수
    // function sleep(ms) {
    //     return new Promise(resolve => setTimeout(resolve, ms));
    // }



// D1000 : 현재 온도 소수점 
// D2000 : 설정 온도 쓰기
// D1200 : PLC 온도 제어 시작 (1) 종료 (0)
// D1105 : h200 = TIC on 상태 / h300 = TIC off 상태

// D1000 레지스터 읽기 (현재 온도)
async function readCurrentTemperature() {
    return await modbusOperation(async () => {
        const { data } = await client.readInputRegisters(1000, 1);
        return data[0] / 10; // 소수점 처리
    });
}

// D2000 레지스터 읽기 (설정 온도)
async function readSetTemperature() {
    return await modbusOperation(async () => {
        const  { data }  = await client.readInputRegisters(2000, 1);
        return data[0] / 10; // 소수점 처리
    });
}

// D2000 레지스터 쓰기 (설정 온도)
async function writeSetTemperature(value) {
    return await modbusOperation(async () => {
        await client.writeRegister(2000,value); // 소수점 처리를 반영하여 저장
    });
}

// D1105 레지스터 읽기 (온도계 상태) on -> 512 / off -> 768
async function readThermostatStatus() {
    return await modbusOperation(async () => {
        const { data } = await client.readInputRegisters(1105, 1);
        return data[0]; // 상태 코드 반환
    });
}

// D1200 레지스터 쓰기 (온도계 제어)
async function writeThermostatControl(value) {
    return await modbusOperation(async () => {
        await client.writeRegister(1200, value); // 온도계 제어 값 쓰기
    });
}


async function saveTemperaturePeriodically() {
    try {
        const thermostatStatus = await modbusOperation(readThermostatStatus);
        // 온도계 상태가 ON일 때만 데이터를 저장
        if (thermostatStatus === 512) {
            const currentTemperature = await modbusOperation(readCurrentTemperature);
            const settingTemperature = await modbusOperation(readSetTemperature);
            const timestamp = new Date();
            
            // 현재 온도와 설정 온도, 타임스탬프를 데이터베이스에 저장
            await temperaturerecords.create({
                temperature: currentTemperature,
                settingtemp: settingTemperature,
                timestamp
            });
            console.log(`Data saved: Current Temperature = ${currentTemperature}°C, Setting Temperature = ${settingTemperature}°C at ${timestamp}`);
        } else {
            console.log("Thermostat is OFF. Skipping data save.");
        }
    } catch (error) {
        console.error("Failed to save temperature data:", error);
    }
}


// 주기적 저장을 시작하는 함수
function startPeriodicSave() {
    setInterval(saveTemperaturePeriodically, saveInterval);
}



module.exports = {
    modbusOperation,
    checkConnection,
    readCurrentTemperature,
    readSetTemperature,
    writeSetTemperature,
    readThermostatStatus,
    writeThermostatControl,
    startPeriodicSave
};