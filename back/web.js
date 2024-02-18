const express = require('express');
const bodyParser = require('body-parser');
const modbusRoutes = require('./routes/modbusRoutes');
const app = express();
const path = require('path');
const modbusClient = require('./utils/modbusClient');
const sequelize = require('./database/database');


app.use(bodyParser.json());
app.use('/api/modbus', modbusRoutes);

app.use(express.static(path.join(__dirname, "/build")));

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "/build/index.html"));
});

app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "/build/index.html"));
});

// 데이터베이스 동기화 및 서버 시작
sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
        // 모델과 데이터베이스 동기화
        return sequelize.sync({ force: false }); 
    })
    .then(() => {
        console.log('Database & tables created!');
        // 주기적으로 데이터 저장하는 함수 시작
        modbusClient.startPeriodicSave();
        // 서버 시작
        app.listen(process.env.PORT || 8001, () => {
            console.log(`Server is running on port ${process.env.PORT || 8001}`);
        });
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

// 데이터베이스 초기화 및 서버 시작
// sequelize.sync({ force: true }) // 주의: 이 옵션은 기존 테이블을 삭제하고 다시 생성합니다.
//     .then(() => {
//         console.log('Database & tables created!'); // 데이터베이스와 테이블이 생성되었을 때 메시지 출력
//         modbusClient.startPeriodicSave(); // 데이터 저장을 시작합니다.
//         app.listen(process.env.PORT || 8001, () => { // 환경변수에서 PORT 값을 가져오거나, 없으면 8001 포트를 사용합니다.
//             console.log(`Server is running on port ${process.env.PORT || 8001}`);
//         });
//     })
//     .catch(err => {
//         console.error('Unable to synchronize the database:', err);
//     });