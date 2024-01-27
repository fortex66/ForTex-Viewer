// server.js
const express = require('express');
const bodyParser = require('body-parser');
const modbusClient = require('./ModbusTCPClient');
const app = express();

app.use(bodyParser.json());

app.get('/api/modbus/read-current-temperature', async (req, res) => {
    try {
        const data = await modbusClient.readCurrentTemperature();
        res.json(data.data[0]);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/api/modbus/read-setting-temperature', async (req, res) => {
    try {
        const data = await modbusClient.readSetTemperature();
        res.json(data.data[0]);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/api/modbus/write-set-temperature', async (req, res) => {
    try {
        const { value } = req.body;
        await modbusClient.writeSetTemperature(parseInt(value));
        res.send('Set temperature updated');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/api/modbus/read-thermostat-status', async (req, res) => {
    try {
        const data = await modbusClient.readThermostatStatus();
        res.json(data.data[0]);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/api/modbus/write-thermostat-control', async (req, res) => {
    try {
        const { value } = req.body;
        await modbusClient.writeThermostatControl(parseInt(value));
        res.send('Thermostat control updated');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
