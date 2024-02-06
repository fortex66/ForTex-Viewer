import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { ThemeContext } from '../style/theme';
import { useSettings } from '../contexts/SettingContext';
import {SketchPicker} from 'react-color';


const Setting = () => {
    const { refreshInterval, setRefreshInterval, graphSetMax, setGraphSetMax, graphSetMin, setGraphSetMin, color, setColor, darkcolor, setDarkColor } = useSettings();
    const { isDark } = useContext(ThemeContext);
    const [tempGraphSetMax, setTempGraphSetMax] = useState(graphSetMax);
    const [tempGraphSetMin, setTempGraphSetMin] = useState(graphSetMin);


    // 그래프 y축 최댓값 변경
    const handleGraphSetMaxSubmit = () => {
        setGraphSetMax(parseFloat(tempGraphSetMax));
    };
    
    // 그래프 y축 최솟값 변경
    const handleGraphSetMinSubmit = () => {
        setGraphSetMin(parseFloat(tempGraphSetMin));
    };

    // 드롭다운 메뉴 구현
    const handleIntervalChange = (e) => {
        setRefreshInterval(Number(e.target.value));
    };

    
    const handleChangeComplete = color => {
        if(isDark) {
            setDarkColor(color.hex);
        } else {
            setColor(color.hex);
        }
        
    };

    return (
        <Container>
            <Header></Header>
            <Body>
                <Sidebar></Sidebar>
                <Contents isDark={isDark}>
                    <Title isDark={isDark}>환경설정</Title>
                    <ControlContainer>
                        <InputContainer>
                            <Label isDark={isDark}>데이터 주기</Label>
                            <Select value={refreshInterval} onChange={handleIntervalChange}>
                                <option value="10000">10초</option>
                                <option value="30000">30초</option>
                                <option value="60000">1분</option>
                                <option value="600000">10분</option>
                                <option value="1800000">30분</option>
                                <option value="3600000">1시간</option>
                            </Select>
                        </InputContainer>
                        <InputContainer>
                            <Label isDark={isDark}>그래프 최댓값</Label>
                            <InputContents>
                                <Input type="number" value={tempGraphSetMax} onChange={(e)=>setTempGraphSetMax(e.target.value)} />
                                <Button onClick={handleGraphSetMaxSubmit}>설정</Button>
                            </InputContents>
                        </InputContainer>
                        <InputContainer>
                            <Label isDark={isDark}>그래프 최솟값</Label>
                            <InputContents>
                                <Input type="number" value={tempGraphSetMin} onChange={(e)=>setTempGraphSetMin(e.target.value)} />
                                <Button onClick={handleGraphSetMinSubmit}>설정</Button>
                            </InputContents>
                        </InputContainer>
                        <InputContainer>
                            <Label isDark={isDark}>그래프 색상</Label>
                            <InputContents>
                                <SketchPicker 
                                    color={isDark ? darkcolor : color }
                                    onChangeComplete={handleChangeComplete}
                                />
                            </InputContents>
                        </InputContainer>
                        
                    </ControlContainer>
                    
                        
                </Contents>
            </Body>
        </Container>
    );
}

export default Setting;

// Styled Components

const Container = styled.div`
    
`;
const Body = styled.div`
    display: flex;
    width: 100%;
`;

const Contents = styled.div`
    flex-grow: 1;
    padding: 20px;
    background-color: ${({ isDark }) => isDark ? '#131213' : '#FEFEFE'}; /* 조건부 스타일 */
    min-height: 100vh; /* 최소 높이를 뷰포트의 전체 높이로 설정 */
   
`;

const Title = styled.h1`
    font-size : 22px;
    font-weight: bold;
    margin: 5px 0px 20px 10px;
    color: ${({ isDark }) => isDark ? '#FEFEFE' : '#131213'}; /* 조건부 스타일 */
`;


const Label = styled.span`
  font-size: 18px;
  font-weight: bold;
  color: ${({ isDark }) => isDark ? '#E3E1E3' : '#666'}; /* 조건부 스타일 */

`;

// 온도 제어 섹션 스타일링
const ControlContainer = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 80px;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column; // 세로 방향으로 요소 배치
  align-items: center;
  margin: 30px 50px 10px 30px;
`;

const InputContents = styled.div`
    margin-top: 20px;
    
`

const Input = styled.input`
  font-size: 14px;
  padding: 5px;
  margin-right: 15px; // 레이블과 입력창 사이 간격 조절
  width: 100px; // 입력 필드 너비 조절
`;

const Button = styled.button`
  font-size: 14px;
  padding: 5px 10px;
  color: white;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

const Select = styled.select`
  font-size: 14px;
  padding: 5px 10px;
  margin-top: 20px;
  margin-left: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
`;