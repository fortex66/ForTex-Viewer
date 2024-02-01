import React, { useState } from 'react';
import styled from 'styled-components';
import { readTemperatureHistory } from '../services/api';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import moment from 'moment-timezone';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-moment';

const History = () => {
    const [startDateTime, setStartDateTime] = useState('');
    const [endDateTime, setEndDateTime] = useState('');
    const [temperatureData, setTemperatureData] = useState([]);
    const [interval, setInterval] = useState('60'); // 데이터 포인트 간격 (초 단위, 기본값 1분)


    // 데이터 간격 선택 핸들러
    const handleIntervalChange = (e) => {
        setInterval(e.target.value);
    };

    const handleSearch = async () => {
        try {
            const response = await readTemperatureHistory(startDateTime, endDateTime, interval);

            // 시작 시간과 종료 시간 사이를 간격별로 나누어 시간대 생성
            let currentTime = moment(startDateTime);
            const endTime = moment(endDateTime);
            const chartLabels = [];
            const chartData = new Array(Math.ceil(endTime.diff(currentTime, 'seconds') / interval)).fill(null);

            // 가장 가까운 데이터 포인트 찾기
            response.data.forEach(dataPoint => {
                const dataTime = moment(dataPoint.timestamp); // 데이터베이스에서 가져온 각 온도 데이터의 시간
                const closestIndex = Math.round(dataTime.diff(currentTime, 'seconds') / interval);
                if (!chartData[closestIndex] || Math.abs(chartData[closestIndex].time.diff(dataTime)) > Math.abs(dataTime.diff(currentTime.clone().add(interval * closestIndex, 'seconds')))) {
                    chartData[closestIndex] = { temperature: dataPoint.temperature, time: dataTime };
                }
            });

            // 차트 데이터 설정
            chartData.forEach((data, index) => {
                chartLabels.push(currentTime.clone().add(interval * index, 'seconds').toDate());
                chartData[index] = data ? data.temperature : null;
            });

            setTemperatureData({ labels: chartLabels, data: chartData });
        } catch (error) {
            console.error('Error fetching temperature history:', error);
        }
    };


    // 차트 데이터 설정
    const lineChartData = {
        labels: temperatureData.labels,
        datasets: [{
            label: '온도',
            data: temperatureData.data,
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    };

    const chartOptions = {
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'second',
                    tooltipFormat: 'YYYY-MM-DD HH:mm:ss', // 툴팁에 표시될 시간 형식
                    displayFormats: {
                        second: 'YYYY-MM-DD HH:mm:ss', // x축 레이블에 표시될 시간 형식
                    },
                },
                title: {
                    display: true,
                    text: 'Time',
                },
            },
            y: {
                beginAtZero: true, // y축의 시작점을 0으로 설정
            },
        },
    };
    


    const handleTimeChange = (value, type) => {
        if (value) {
            let timeString = value + ':00';
            let currentDateTime = type === 'start' ? startDateTime : endDateTime;
            currentDateTime = currentDateTime ? moment(currentDateTime) : moment();
    
            let [hours, minutes] = timeString.split(':');
            currentDateTime.tz('Asia/Seoul').set({ hour: parseInt(hours), minute: parseInt(minutes) });
    
            let isoString = currentDateTime.format();
            type === 'start' ? setStartDateTime(isoString) : setEndDateTime(isoString);
        }
    };
    
    const handleDateChange = (value, type) => {
        if (value) {
            let date = moment(value);
            let currentDateTime = type === 'start' ? startDateTime : endDateTime;
            currentDateTime = currentDateTime ? moment(currentDateTime) : moment();
    
            date.tz('Asia/Seoul').set({ year: date.year(), month: date.month(), date: date.date() });
    
            let isoString = date.format();
            type === 'start' ? setStartDateTime(isoString) : setEndDateTime(isoString);
        }
    };

    return (
        <div>
            <Header></Header>
            <Body>
                <Sidebar></Sidebar>
                <Contents>
                    <Title>온도 로그</Title>
                    <SearchArea>
                        <DateInput
                            type="date"
                            value={startDateTime ? startDateTime.split('T')[0] : ""}
                            onChange={(e) => handleDateChange(e.target.value, 'start')}
                        />
                        <TimeInput
                            type="time"
                            value={startDateTime ? startDateTime.split('T')[1].substring(0, 5) : ""}
                            onChange={(e) => handleTimeChange(e.target.value, 'start')}
                        />
                        <DateInput
                            type="date"
                            value={endDateTime ? endDateTime.split('T')[0] : ""}
                            onChange={(e) => handleDateChange(e.target.value, 'end')}
                        />
                        <TimeInput
                            type="time"
                            value={endDateTime ? endDateTime.split('T')[1].substring(0, 5): ""}
                            onChange={(e) => handleTimeChange(e.target.value, 'end')}
                        />
                        <DurationSelect value={interval} onChange={handleIntervalChange}>
                            <option value="60">1분</option>
                            <option value="600">10분</option>
                            <option value="1800">30분</option>
                            <option value="3600">1시간</option>
                        </DurationSelect>
                        <SearchButton onClick={handleSearch}>조회</SearchButton>
                    </SearchArea>
                    <ChartArea>
                        <Line data={lineChartData} options={chartOptions}/>
                    </ChartArea>
                </Contents>
            </Body>
        </div>
    );
};

export default History;

// Styled Components
const Title = styled.h1`
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 20px;
`;

const Body = styled.div`
    display: flex;
    width: 100%;
`;

const Contents = styled.div`
    flex-grow: 1;
    padding: 20px;
`;

const SearchArea = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 20px;
`;

const DateInput = styled.input`
    margin-right: 10px;
`;

const TimeInput = styled.input`
    margin-right: 10px;
`;

const DurationSelect = styled.select`
    margin-right: 10px;
    padding: 5px 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    cursor: pointer;
`;


const SearchButton = styled.button`
    padding: 5px 15px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;

    &:hover {
        background-color: #0056b3;
    }
`;

const ChartArea = styled.div`
    // Add styling for chart area if needed
`;
