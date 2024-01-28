import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-moment';
import {
    readCurrentTemperature,
    readSettingTemperature,
    writeSetTemperature,
    readThermostatStatus,
    writeThermostatControl,
} from '../services/api';

const Home = () => {
    const [settingTemp, setSettingTemp] = useState('');
    const [currentTemp, setCurrentTemp] = useState(null);
    const [setTemp, setSetTemp] = useState('');
    const [thermostatStatus, setThermostatStatus] = useState(null);
    const [tempStatus, setTempStatus] = useState(false);
    const [refreshSettingTemp, setRefreshSettingTemp] = useState(false);
    const [currentTempData, setCurrentTempData] = useState([]);

    // 데이터 소수점 처리
    const convertTemperature = (temp) => temp / 10;

    useEffect(() => {
        readSettingTemperature().then(response => {
            setSettingTemp(convertTemperature(response.data));
        }).catch(error => console.error('Error:', error));
    }, [refreshSettingTemp]);

    useEffect(() => {
        const interval = setInterval(() => {
            readCurrentTemperature().then(response => {
                const temp = convertTemperature(response.data);
                setCurrentTemp(temp);
                setCurrentTempData(prevData => [...prevData, { x: moment().valueOf(), y: temp }]);
            }).catch(error => console.error('Error:', error));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        readThermostatStatus().then(response => {
            setThermostatStatus(response.data);
        }).catch(error => console.error('Error:', error));
    }, [tempStatus]);

    // 설정 온도 변경
    const handleSetTempChange = (e) => {
        setSetTemp(e.target.value);
    };

    // 설정 온도 변경
    const handleSetTempSubmit = () => {
        const value = parseFloat(setTemp) * 10; // string -> number
        writeSetTemperature(value).then(response => {
            console.log('Set temperature:', response.data);
            setRefreshSettingTemp(prev => !prev);
            setSetTemp('');
        }).catch(error => {
            console.error('Error:', error);
            setSetTemp('오류발생');
        });
    };

    // 온도계 Start / Run 변경
    const handleThermostatControl = (control) => {
        writeThermostatControl(control).then(response => {
            console.log('Thermostat control:', response.data);
            setTempStatus(prev => !prev);
        }).catch(error => console.error('Error:', error));
    };

    // 온도계 상태를 문자열로 반환
    const getThermostatStatusText = (status) => {
        switch (status) {
            case 768: return "off";
            case 512: return "on";
            default: return "unknown";
        }
    };

    // 차트 데이터 설정
    const chartData = {
        labels: currentTempData.map(data => data.x),
        datasets: [{
            label: 'Current Temperature',
            data: currentTempData.map(data => ({ x: data.x, y: data.y })),
            fill: false,
            backgroundColor: 'rgb(75, 192, 192)',
            borderColor: 'rgba(75, 192, 192, 0.2)',
        }],
    };
    // 차트 옵션
    const chartOptions = {
        scales: {
            x: { // x축 시간 축 설정
                type: 'time',
                time: {
                    unit: 'second', // 시간 단위를 '초'로 설정
                    tooltipFormat: 'll HH:mm:ss', // 툴팁에 표시될 시간 형식
                    displayFormats: {
                        second: 'HH:mm:ss', // x축 레이블에 표시될 시간 형식
                    },
                },
                title: {
                    display: true,
                    text: 'Time',
                },
                // x축 범위 조정을 위한 추가 설정
                min: currentTempData.length > 0 ? currentTempData[0].x : moment().subtract(5, 'minutes').valueOf(),
                max: moment().valueOf(),
            },
            y: {
                beginAtZero: true, // y축의 시작점을 0으로 설정
            },
        },
    };

    return (
        <div>
            <h1>PLC Data Viewer</h1>
            <p>설정 온도: {settingTemp}°C</p>
            <p>현재 온도: {currentTemp}°C</p>
            <div>
                <input type="number" value={setTemp} onChange={handleSetTempChange} />
                <button onClick={handleSetTempSubmit}>Set Temperature</button>
            </div>
            <p>온도계 상태: {getThermostatStatusText(thermostatStatus)}</p>
            <button onClick={() => handleThermostatControl(1)}>Run Thermostat</button>
            <button onClick={() => handleThermostatControl(0)}>Stop Thermostat</button>
            <div>
                <Line data={chartData} options={chartOptions} />
            </div>
        </div>
    );
};

export default Home;
