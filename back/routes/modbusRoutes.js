const express = require('express');
const modbusController = require('../controllers/modbusController');
const router = express.Router();

router.use(modbusController.recordVisitor);

router.get('/read-current-temperature', modbusController.readCurrentTemperature);
router.get('/read-setting-temperature', modbusController.readSetTemperature);
router.post('/write-set-temperature', modbusController.writeSetTemperature);
router.get('/read-thermostat-status', modbusController.readThermostatStatus);
router.post('/write-thermostat-control', modbusController.writeThermostatControl);

// 최신 온도 기록 조회를 위한 라우트 추가
router.get('/latest-temperature-records', modbusController.getLatestTemperatureRecords);

router.get('/temperature-history', modbusController.readTemperatureHistory);

router.get('/visitors-stats', modbusController.getVisitorStats);



module.exports = router;
