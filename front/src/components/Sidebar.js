import styled, { css } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
    faDesktop,
    faDatabase,
    faGear
} from "@fortawesome/free-solid-svg-icons";
import { getVisitorLogs } from "../services/api";

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [selected, setSelected] = useState(null);
    const [visitors, setVisitors] = useState({ totalVisitors: 0, todayVisitors: 0 });

    const navigateTo = (path, item) => {
        navigate(path);
        setSelected(item);
    };

    useEffect(() => {
        const fetchVisitors = async () => {
            try {
                const response = await getVisitorLogs();
                console.log(response);
                setVisitors(response.data);
            } catch (error) {
                console.error('Error fetching visitor stats:', error);
            }
        };

        fetchVisitors();
    }, []); // 빈 의존성 배열을 사용하여 컴포넌트 마운트 시에만 호출


    // 페이지 이동시 배경색이 한번에 안바뀜 해결
    useEffect(() => {
        const currentPath = location.pathname;
        if (currentPath === '/') setSelected('Main');
        else if (currentPath === '/History') setSelected('History');
        else if (currentPath === '/Setting') setSelected('Setting');
    }, [location]);

  return (
    <Container >
        <List  selected={selected === 'Main'} onClick={() => navigateTo('/', 'Main')}><StyledIcon icon={faDesktop} />Main</List>
        <List  selected={selected === 'History'} onClick={() => navigateTo('/History', 'History')}><StyledIcon icon={faDatabase} />History</List>
        <List selected={selected === 'Setting'} onClick={() => navigateTo('/Setting', 'Setting')}><StyledIcon icon={faGear} />Setting</List>
        <Visitor>
            <VisitorItem>
                <p>전체</p>
                <p>{visitors.totalVisitors}</p>
            </VisitorItem>
            <VisitorItem>
                <p>오늘</p>
                <p>{visitors.todayVisitors}</p>
            </VisitorItem>
        </Visitor>
    </Container>
  );
};

const Container = styled.div`
    display : flex;
    flex-direction: column;
    background-color: #38393E;
    padding-top: 20px; 
`
const List = styled.div`
    width : 150px;
    font-size : 20px;
    color : #FEFEFE;
    padding : 32px 20px 32px 20px;
    text-align : center;
    cursor: pointer;
    ${props => props.selected && css`
        background-color: #766C76;
    `}

`
const StyledIcon = styled(FontAwesomeIcon)`
    margin-right: 10px; // 아이콘과 텍스트 사이 간격 조정
`;

const Visitor = styled.div`
    display: flex;
    justify-content: space-around; // 컨텐츠를 양 끝에 배치하여 공간을 균등하게 분할
    padding: 20px; // 상하좌우 패딩
    background-color: #484A4F; // 배경색
    color: #FEFEFE; // 텍스트 색상
    margin: 20px; // 주변 여백
    border-radius: 10px; // 테두리 둥글게
`;

// `Visitor` 컴포넌트 내부에 사용할 각 항목을 위한 스타일 컴포넌트
const VisitorItem = styled.div`
    display: flex;
    flex-direction: column; // 항목 내부 텍스트를 세로로 정렬
    align-items: center; // 센터 정렬
`;


export default Sidebar;