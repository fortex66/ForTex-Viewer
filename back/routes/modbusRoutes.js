const express = require('express');
const modbusController = require('../controllers/modbusController');
const router = express.Router();

router.get('/read-current-temperature', modbusController.readCurrentTemperature);
router.get('/read-setting-temperature', modbusController.readSetTemperature);
router.post('/write-set-temperature', modbusController.writeSetTemperature);
router.get('/read-thermostat-status', modbusController.readThermostatStatus);
router.post('/write-thermostat-control', modbusController.writeThermostatControl);

router.get('/temperature-history', modbusController.readTemperatureHistory);

module.exports = router;
