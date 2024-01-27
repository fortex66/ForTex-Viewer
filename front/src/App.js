// PLCDataViewer.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from "styled-components";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale, // 시간 축(Time Scale) 추가
    TimeSeriesScale,
  } from 'chart.js';
import { Line } from 'react-chartjs-2';
import moment from 'moment';
import 'chartjs-adapter-moment';


ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
    TimeSeriesScale // 시간 축 등록
  );

  

const PLCDataViewer = () => {
    const [settingTemp, setSettingTemp] = useState('');
    const [currentTemp, setCurrentTemp] = useState(null);
    const [setTemp, setSetTemp] = useState('');
    const [thermostatStatus, setThermostatStatus] = useState(null);
    const [tempStatus,setTempStatus] = useState(false);
    const [refreshSettingTemp, setRefreshSettingTemp] = useState(false);
    const [currentTempData, setCurrentTempData] = useState([]); // 현재 온도 데이터 배열

    // 설정온도 읽기
    useEffect(()=> {
        setTimeout(()=> {
            axios.get('/api/modbus/read-setting-temperature')
            .then(response=>{
                // 받은 값을 변환해서 저장
                const convertTemp1 = convertTemperature(response.data);
                setSettingTemp(convertTemp1)
            })
            .catch(error => console.error('Error:', error));
        }, 500);
    }, [refreshSettingTemp]);

    // 현재 온도 갱신
    useEffect(() => {
        const interval = setInterval(() => {
            axios.get('/api/modbus/read-current-temperature')
                .then(response => {
                    // 받은 값을 변환해서 저장
                    const convertTemp2 = convertTemperature(response.data);
                    setCurrentTemp(convertTemp2)
                    // 현재 온도 데이터 배열에 추가
                    setCurrentTempData(prevData => {
                        const newData = [...prevData, { x: moment().valueOf(), y: convertTemp2 }]
                        return newData;
                    });
                })
                .catch(error => console.error('Error:', error));
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // 차트 데이터 설정
    const chartData = {
        labels: currentTempData.map((_, index) => index),
        datasets: [
            {
                label: 'Current Temperature',
                data: currentTempData,
                fill: false,
                backgroundColor: 'rgb(75, 192, 192)',
                borderColor: 'rgba(75, 192, 192, 0.2)',
            },
        ],
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
            y: { // y축 설정
                beginAtZero: true, // y축의 시작점을 0으로 설정
            },
        },
    };



    // 설정 온도 변경
    const handleSetTempChange = (e) => {
        setSetTemp(e.target.value);
    };

    const handleSetTempSubmit = () => {
        console.log(setTemp);
        const tempValue = parseFloat(setTemp) * 10; // string -> number
        console.log(tempValue);
        axios.post('/api/modbus/write-set-temperature', { value: tempValue })
            .then(response => {
                console.log('Set temperature:', response.data);
                setRefreshSettingTemp(prev => !prev);
                setSetTemp(''); // 입력 필드 비우기
            })
            .catch(error => {
                console.error('Error:', error);
                setSetTemp('오류발생'); 
            
            });
    };

    // 온도계 상태 확인
    useEffect(() => {
        axios.get('/api/modbus/read-thermostat-status')
            .then(response => setThermostatStatus(response.data))
            .catch(error => console.error('Error:', error));
    }, [tempStatus]);


    // 데이터 소수점 처리
    const convertTemperature = (temp) => {
        return temp /10;
    }

    // 온도계 제어
    const handleThermostatControl = (control) => {
        axios.post('/api/modbus/write-thermostat-control', { value: control })
        .then(response => {
          console.log('Thermostat control:', response.data);
          setTimeout(() => {
            setTempStatus(tempStatus => !tempStatus); // 지연 후 상태 변경
        }, 500); // 0.5초 후에 상태 변경
        })
            .catch(error => console.error('Error:', error));
    };

    // 온도계 상태를 문자열로 변환
    const getThermostatStatusText = (status) => {
      switch(status) {
          case 768:
              return "off";
          case 512:
              return "on";
          default:
              return "unknown";
      }
  };


    return (
        <div>
            <h1>PLC Data Viewer</h1>
            <p>설정 온도 : {settingTemp}°C</p>
            <p>현재 온도 : {currentTemp}°C</p>
            <div>
                <Line data={chartData} options={chartOptions} />
            </div>
            <div>
                <input type="number" value={setTemp} onChange={handleSetTempChange} />
                <button onClick={handleSetTempSubmit}>Set Temperature</button>
            </div>
            <p>온도계 상태 : {getThermostatStatusText(thermostatStatus)}</p>
            <button onClick={() => handleThermostatControl(1)}>Run Thermostat</button>
            <button onClick={() => handleThermostatControl(0)}>Stop Thermostat</button>
        </div>
    );
};

export default PLCDataViewer;
