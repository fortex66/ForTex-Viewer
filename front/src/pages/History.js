import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import styled from "styled-components";

const History = () => {

    return (
        <div>
            <Header></Header>
            <Body>
                <Sidebar></Sidebar>
                <Contents>
                    <Name>온도 기록</Name>

                </Contents>
            </Body>
        </div>
    );
};

export default History;

const Body = styled.div`
    display: flex;
    width: 100%; // 전체 가로 폭을 사용하도록 설정
`;

const Contents = styled.div`
    flex-grow: 1; // 사용 가능한 공간을 모두 차지하도록 설정
    padding: 20px; // 콘텐츠 내부 여백 설정
    // 필요에 따라 추가적인 스타일 속성을 적용
`;


const Name = styled.div`
    font-size : 24px;
    font-weight: bold;
    margin: 5px 0px 5px 10px;
`
