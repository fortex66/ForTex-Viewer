const modbusClient = require('../utils/modbusClient');
const temperaturerecords = require('../models/temperatureRecord');

exports.readCurrentTemperature = async (req, res) => {
    try {
        const data = await modbusClient.readCurrentTemperature();
        const temperature = data.data[0];
        const timestamp = new Date();

        // 현재 온도를 데이터베이스에 저장
        await temperaturerecords.create({
            temperature: temperature,
            timestamp: timestamp,
        });

        res.json(temperature);
    } catch (error) {
        console.error("Failed to read and save current temperature:", error);
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

