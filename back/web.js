const express = require('express');
const bodyParser = require('body-parser');
const modbusRoutes = require('./routes/modbusRoutes');
const sequelize = require('./database/database'); // Sequelize 인스턴스 가져오기
const app = express();
const path = require('path');
const modbusClient = require('./utils/modbusClient');


app.use(bodyParser.json());
app.use('/api/modbus', modbusRoutes);
app.use(express.static(path.join(__dirname, '/build')));
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
  });

modbusClient.startPeriodicSave();

sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
        return sequelize.sync(); // 모델과 데이터베이스 동기화
    })
    .then(() => {
        app.listen(process.env.PORT || 8001, () => {
            console.log(`Server is running on port ${process.env.PORT || 8001}`);
        });
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });
