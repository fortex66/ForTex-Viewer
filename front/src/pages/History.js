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

    const handleSearch = async () => {
        try {
            const response = await readTemperatureHistory(startDateTime, endDateTime);
            setTemperatureData(response.data);
        } catch (error) {
            console.error('Error fetching temperature history:', error);
        }
    };

    // 차트 데이터 설정
    const chartData = {
        labels: temperatureData.map(data => new Date(data.timestamp)),
        datasets: [{
            label: 'Current Temperature',
            data: temperatureData.map(data => data.temperature),
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
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
                        <SearchButton onClick={handleSearch}>조회</SearchButton>
                    </SearchArea>
                    <ChartArea>
                        <Line data={chartData} />
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
