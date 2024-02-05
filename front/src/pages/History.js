import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import { readTemperatureHistory } from '../services/api';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { ThemeContext } from '../style/theme';
import { useSettings } from '../contexts/SettingContext';
import moment from 'moment-timezone';
import { Line } from 'react-chartjs-2';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import 'chartjs-adapter-moment';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFileCsv,
    faFileImage
} from "@fortawesome/free-solid-svg-icons";


const History = () => {
    const [startDateTime, setStartDateTime] = useState('');
    const [endDateTime, setEndDateTime] = useState('');
    const [temperatureData, setTemperatureData] = useState([]);
    const [interval, setInterval] = useState('60'); // 데이터 포인트 간격 (초 단위, 기본값 1분)
    const [verify, setVerify] = useState(false); // 데이터 조회 여부 검사
    const [maxTemperature, setMaxTemperature] = useState(null);
    const [minTemperature, setMinTemperature] = useState(null);
    const [averageTemperature, setAverageTemperature] = useState(null);

    const { isDark } = useContext(ThemeContext);
    const { color, darkcolor } = useSettings();

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
                const closestIndex = Math.round(dataTime.diff(currentTime, 'seconds') / interval); // 데이터베이스에서 가져온 시간과 시작 시간의 차이를 데이터 간격으로 나눈 값을 반올림
                
                // chartData의 해당 인덱스가 아직 비어 있는 경우 or 이미 할당된 데이터 포인트가 있지만, 현재 데이터 포인트가 해당 시간대에 더 가깝다면
                if (!chartData[closestIndex] || Math.abs(chartData[closestIndex].time.diff(dataTime)) > Math.abs(dataTime.diff(currentTime.clone().add(interval * closestIndex, 'seconds')))) {
                    // 현재 데이터 포인트로 교체
                    chartData[closestIndex] = { temperature: dataPoint.temperature, time: dataTime };
                }
            });

            calculateTemperatureStats(chartData); // 데이터 계산

            // 차트 데이터 설정
            chartData.forEach((data, index) => {
                chartLabels.push(currentTime.clone().add(interval * index, 'seconds').toDate());
                chartData[index] = data ? data.temperature : null;
            });

            setTemperatureData({ labels: chartLabels, data: chartData });
            

            setVerify(true); // 조회가 완료되면 캡쳐 및 파일 다운 가능
        } catch (error) {
            console.error('Error fetching temperature history:', error);
            setVerify(false);
        }
    };

    // 조회된 데이터의 계산
    const calculateTemperatureStats = (data) => {
        const validData = data.filter((dataPoint) => dataPoint !== null && dataPoint.temperature !== null).map(dataPoint => dataPoint.temperature);
        console.log(validData);
        if (validData.length > 0) {
            const max = Math.max(...validData);
            const min = Math.min(...validData);
            const average = validData.reduce((acc, curr) => acc + curr, 0) / validData.length;

            setMaxTemperature(max);
            setMinTemperature(min);
            setAverageTemperature(average.toFixed(2)); // 소수점 두 자리까지
        } else {
            setMaxTemperature(null);
            setMinTemperature(null);
            setAverageTemperature(null);
        }
    };

    // 조회 시작 시간과 종료 시간을 기반으로 적절한 time unit과 stepSize를 결정하는 함수
    function getTimeScaleOptions(startDateTime, endDateTime) {
        const duration = moment(endDateTime).diff(moment(startDateTime), 'hours');
        let unit = 'minute';
        let stepSize = 1;
        let displayFormat = 'YYYY-MM-DD HH:mm';

        if (duration <= 24) { // 24시간 이하
            unit = 'minute';
            stepSize = 30; // 30분 간격
        } else if (duration <= 72) { // 3일 이하
            unit = 'hour';
            stepSize = 1; // 1시간 간격
        } else { // 3일 이상
            unit = 'day';
            stepSize = 1; // 1일 간격
            displayFormat = 'YYYY-MM-DD';
        }

        return {
            unit: unit,
            stepSize: stepSize,
            tooltipFormat: 'YYYY-MM-DD HH:mm:ss',
            displayFormats: {
                [unit]: displayFormat
            },
        };
    }



    // 차트 데이터 설정
    const lineChartData = {
        labels: temperatureData.labels,
        datasets: [{
            label: '온도',
            data: temperatureData.data,
            fill: false,
            backgroundColor: isDark ? darkcolor : color,
            borderColor: isDark ? darkcolor : color,
            tension: 0.1,
            pointRadius: 3, // 데이터 포인트의 반지름을 5픽셀로 설정
            pointHoverRadius: 7, // 마우스 오버 시 데이터 포인트의 반지름을 7픽셀로 설정
        }]
    };

    const chartOptions = {
        scales: {
            x: {
                type: 'time',
                time: getTimeScaleOptions(startDateTime, endDateTime),
                title: {
                    display: true,
                    text: 'Time',
                    color: isDark ? '#FEFEFE' : '#202124',
                },
                ticks: {
                    color: isDark ? '#FEFEFE' : '#202124', // x축 레이블 색상
                },
                grid: {
                    color: isDark ? 'rgba(254, 254, 254, 0.1)' : 'rgba(19, 18, 19, 0.1)', // x축 그리드 라인 색상
                },
            },
            y: {
                ticks: {
                    color: isDark ? '#FEFEFE' : '#202124', // y축 레이블 색상
                },
                grid: {
                    color: isDark ? 'rgba(254, 254, 254, 0.1)' : 'rgba(19, 18, 19, 0.1)', // y축 그리드 라인 색상
                },
                beginAtZero: true,
            },
        },
        plugins: {
            legend: { // 범례 설정
                labels: {
                    // 범례 레이블의 색상을 조건부로 설정
                    color: isDark ? '#FEFEFE' : '#131213',
                }
            }
        }
    };
    

    // 조회 시작 시간, 끝 시간에 따른 처리
    const handleTimeChange = (value, type) => {
        if (value) {
            let timeString = value + ':00'; // 선택된 시간에 초를 00초로 추가
            let currentDateTime = type === 'start' ? startDateTime : endDateTime;
            currentDateTime = currentDateTime ? moment(currentDateTime) : moment();
    
            let [hours, minutes] = timeString.split(':');
            currentDateTime.tz('Asia/Seoul').set({ hour: parseInt(hours), minute: parseInt(minutes) });
    
            let isoString = currentDateTime.format();
            type === 'start' ? setStartDateTime(isoString) : setEndDateTime(isoString);
        }
    };
    
    // 조회 시작 날짜, 끝 날짜에 따른 처리
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

    // 데이터를 CSV 형식으로 변환하는 함수
    const convertToCSV = (data) => {
        // CSV 파일의 헤더
        let csvContent = "날짜,시간,온도\n";

        // 각 데이터 포인트를 새 줄에 추가
        data.forEach(item => {
            const date = moment(item.timestamp).format('YYYY-MM-DD');
            const time = moment(item.timestamp).format('HH:mm:ss');
            csvContent += `${date},${time},${item.temperature}\n`;
        });

        return csvContent;
    };

    // 데이터를 CSV 파일로 저장하는 함수
    const handleSaveDataAsCSV = () => {
        if (!verify) {
            alert("먼저 데이터를 조회해주세요.");
            return;
        }
        saveDataAsCSV(temperatureData.data.map((temp, index) => ({
            timestamp: temperatureData.labels[index],
            temperature: temp
        })));
    };

    
    // CSV 파일로 저장하는 함수
    const saveDataAsCSV = (data) => {
        const BOM = '\uFEFF'; // 한글 입력시 깨짐 방지
        const csvContent = convertToCSV(data);
        const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, "temperature-data.csv");
    };

    // 그래프를 이미지로 저장하는 함수
    const handleCaptureGraph = () => {
        if (!verify) {
            alert("먼저 데이터를 조회해주세요.");
            return;
        }
        captureGraph();
    }

    // 그래프 캡쳐
    const captureGraph = () => {
        const graphElement = document.getElementById('graph-container'); // 그래프가 포함된 컨테이너의 ID
        html2canvas(graphElement).then(canvas => {
          canvas.toBlob(function(blob) {
            saveAs(blob, "graph-capture.png");
          });
        });
      };

    return (
        <div>
            <Header></Header>
            <Body>
                <Sidebar></Sidebar>
                <Contents isDark={isDark}>
                    <Title isDark={isDark}>온도 로그</Title>
                        <Top>
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
                                <option value="10">10초</option>
                                <option value="60">1분</option>
                                <option value="600">10분</option>
                                <option value="1800">30분</option>
                                <option value="3600">1시간</option>
                            </DurationSelect>
                            <SearchButton onClick={handleSearch}>조회</SearchButton>

                        </SearchArea>
                        <Save>
                            <SaveDataButton isDark={isDark} onClick={handleSaveDataAsCSV}><FontAwesomeIcon icon={faFileCsv} size="2x" color={"#28a745"}/></SaveDataButton>
                            <CaptureGraphButton isDark={isDark} onClick={handleCaptureGraph}><FontAwesomeIcon icon={faFileImage} size="2x" color={isDark ? '#FFCC44' : 'rgb(75, 192, 192)'}/></CaptureGraphButton>
                        </Save>
                    </Top>
                    <ChartArea id="graph-container" style={{ backgroundColor: isDark ? '#131213' : '#FEFEFE' }}>
                        <Line data={lineChartData} options={chartOptions}/>
                    </ChartArea>
                    <Title isDark={isDark}>데이터 분석</Title>
                    <DataContainer>
                        <DataItem>
                            <Label isDark={isDark} >최댓값</Label>
                            <Value isDark={isDark} >{maxTemperature ? `${maxTemperature}°C` : 'N/A'}</Value>
                        </DataItem>
                        <DataItem>
                            <Label isDark={isDark} >최솟값</Label>
                            <Value isDark={isDark} >{minTemperature ? `${minTemperature}°C` : 'N/A'}</Value>
                        </DataItem>
                        <DataItem>
                            <Label isDark={isDark} >평균값</Label>
                            <Value isDark={isDark} >{averageTemperature ? `${averageTemperature}°C` : 'N/A'}</Value>
                        </DataItem>
                    </DataContainer>
                </Contents>
            </Body>
        </div>
    );
};

export default History;

// Styled Components
const Title = styled.h1`
    font-size : 24px;
    font-weight: bold;
    margin: 5px 0px 20px 10px;
    color: ${({ isDark }) => isDark ? '#FEFEFE' : '#131213'}; /* 조건부 스타일 */
`;

const Top = styled.div`
    display: flex;
    justify-content: space-between;
    margin: 5px 100px 20px 20px;
`;

const Body = styled.div`
    display: flex;
    width: 100%;
`;

const Contents = styled.div`
    flex-grow: 1;
    padding: 20px;
    background-color: ${({ isDark }) => isDark ? '#131213' : '#FEFEFE'}; /* 조건부 스타일 */
`;

const SearchArea = styled.div`
    display: flex;
    align-items: center;
`;

const DateInput = styled.input`
    margin-right: 10px;
    border-radius: 5px;
    height: 20px;
    padding: 5px;
    border: 1px solid #ccc;
`;

const TimeInput = styled.input`
    margin-right: 15px;
    border-radius: 5px;
    height: 20px;
    padding:5px;
    border: 1px solid #ccc;
`;

const DurationSelect = styled.select`
    margin-right: 15px;
    height: 30px;
    border: 1px solid #ccc;
    border-radius: 5px;
    cursor: pointer;
`;

const SearchButton = styled.button`
    height: 30px;
    padding: 5px;
    margin-left: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;

    &:hover {
        background-color: #0056b3;
    }
`;

const Save = styled.div`

`;

const SaveDataButton = styled.button`
    background-color: ${({ isDark }) => isDark ? '#131213' : '#FEFEFE'}; /* 조건부 스타일 */
    border: none;
    border-radius: 5px;
    cursor: pointer;

`;

const CaptureGraphButton = styled.button`
    margin-left: 10px; // 버튼 사이의 간격
    background-color: ${({ isDark }) => isDark ? '#131213' : '#FEFEFE'}; /* 조건부 스타일 */
    border: none;
    border-radius: 5px;
    cursor: pointer;

`;

const ChartArea = styled.div`
    // Add styling for chart area if needed
`;

const DataContainer = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 20px;
`;

const DataItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px;
`;

const Label = styled.span`
  font-size: 20px;
  font-weight: bold;
  color: ${({ isDark }) => isDark ? '#E3E1E3' : '#666'}; /* 조건부 스타일 */
`;

const Value = styled.span`
  margin-top: 10px;
  font-size: 18px;
  font-weight: bold;
  color: ${({ isDark }) => isDark ? '#E3E1E3' : '#333'}; /* 조건부 스타일 */
`;