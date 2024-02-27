const express = require('express');
const router = express.Router();
const visitorLogs = require('../models/visitorLogs'); // 방문자 로그를 저장하기 위한 모델

// 클라이언트에서 첫 방문 시 호출하는 엔드포인트
router.post('/first-visit', async (req, res) => {
    try {
        const { visitorId } = req.body;

        // 방문 기록을 데이터베이스에 저장
        await visitorLogs.create({
            visitor_id: visitorId,
            visit_timestamp: new Date() // 현재 시간 사용
        });

        res.status(200).send('Visit recorded successfully');
    } catch (error) {
        console.error('Error recording visit:', error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;