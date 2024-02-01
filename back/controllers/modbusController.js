const modbusClient = require('../utils/modbusClient');
const TemperatureRecord = require('../models/temperatureRecord'); // 모델 임포트
const { Op } = require('sequelize'); // Sequelize 연산자 임포트


exports.readCurrentTemperature = async (req, res) => {
    try {
        const data = await modbusClient.readCurrentTemperature();
        res.json(data.data[0]);
    } catch (error) {
        res.status(500).send(error.message);
    }
};



exports.readSetTemperature = async (req, res) => {
    try {
        const data = await modbusClient.readSetTemperature();
        res.json(data.data[0]);
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
        res.json(data.data[0]);
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
        const { startDate, endDate } = req.query;
        const records = await TemperatureRecord.findAll({
            where: {
                timestamp: {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                }
            },
            order: [['timestamp', 'ASC']]
        });
        res.json(records);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }

}

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
        const filteredData = [];
        let lastTimestamp = null;
        records.forEach(record => {
            const currentTimestamp = new Date(record.timestamp).getTime();
            if (!lastTimestamp || currentTimestamp - lastTimestamp >= intervalInSeconds * 1000) {
                filteredData.push(record);
                lastTimestamp = currentTimestamp;
            }
        });

        res.json(filteredData);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};