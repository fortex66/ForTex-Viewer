const modbusClient = require('../utils/modbusClient');
const TemperatureRecord = require('../models/temperatureRecord'); // 모델 임포트
const { Op } = require('sequelize'); // Sequelize 연산자 임포트


exports.readCurrentTemperature = async (req, res) => {
    try {
        const data = await modbusClient.readCurrentTemperature();
        res.json(data);
    } catch (error) {
        res.status(500).send(error.message);
    }
};



exports.readSetTemperature = async (req, res) => {
    try {
        const data = await modbusClient.readSetTemperature();
        res.json(data);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.writeSetTemperature = async (req, res) => {
    try {
        const { value } = req.body;
        await modbusClient.writeSetTemperature(parseInt(value));
        res.send('Set temperature updated');
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.readThermostatStatus = async (req, res) => {
    try {
        const data = await modbusClient.readThermostatStatus();
        res.json(data);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.writeThermostatControl = async (req, res) => {
    try {
        const { value } = req.body;
        await modbusClient.writeThermostatControl(parseInt(value));
        res.send('Thermostat control updated');
    } catch (error) {
        res.status(500).send(error.message);
    }
};


exports.readTemperatureHistory = async (req, res) => {
    try {
        const { startDate, endDate, interval } = req.query;
        const intervalInSeconds = parseInt(interval || '60'); // 기본값 60초 (1분)

        // 날짜 간격에 맞는 데이터만 조회
        const records = await TemperatureRecord.findAll({
            where: {
                timestamp: {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                }
            },
            order: [['timestamp', 'ASC']]
        });
        console.log(intervalInSeconds);

        // 필요한 경우 데이터 다운샘플링 (간격에 따라 데이터 필터링)
        const filteredData = []; // 다운샘플링된 데이터를 저장할 배열
        let lastTimestamp = null; // 마지막으로 추가된 데이터 포인트의 타임스탬프
        records.forEach(record => {
            const currentTimestamp = new Date(record.timestamp).getTime(); // 현재 데이터 포인트의 타임스탬프
            // 마지막으로 추가된 데이터 포인트가 아니거나 현재 데이터 포인트 - 마지막으로 추가된 데이터 포인트의 차가 사용자 지정 데이터 주기보다 크거나 같은 경우
            if (!lastTimestamp || currentTimestamp - lastTimestamp >= intervalInSeconds * 1000) {
                filteredData.push(record); // 다운샘플링 데이터 배열에 추가
                lastTimestamp = currentTimestamp; // 마지막으로 추가된 데이터 포인트를 현재 데이터 포인트의 타임스탬프로 업데이트
            }
        });

        res.json(filteredData);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

// 최신 30개의 온도 기록을 조회하는 컨트롤러 함수
exports.getLatestTemperatureRecords = async (req, res) => {
    try {
        const latestRecords = await TemperatureRecord.findAll({
            limit: 30, // 최신 30개의 데이터만 조회
            order: [['timestamp', 'DESC']], // 최신 기록부터 정렬
        });
        res.json(latestRecords); // 조회된 데이터를 JSON 형태로 응답
        console.log(latestRecords);
    } catch (error) {
        console.error("Error fetching latest temperature records:", error);
        res.status(500).send("Error fetching latest temperature records");
    }
};
