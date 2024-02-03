import styled, { css } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
    faDesktop,
    faDatabase,
    faGear
} from "@fortawesome/free-solid-svg-icons";
const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [selected, setSelected] = useState(null);

    const navigateTo = (path, item) => {
        navigate(path);
        setSelected(item);
    };

    // 페이지 이동시 배경색이 한번에 안바뀜 해결
    useEffect(() => {
        const currentPath = location.pathname;
        if (currentPath === '/') setSelected('Main');
        else if (currentPath === '/History') setSelected('History');
        else if (currentPath === '/Setting') setSelected('Setting');
    }, [location]);

  return (
    <Container>
        <List selected={selected === 'Main'} onClick={() => navigateTo('/', 'Main')}><StyledIcon icon={faDesktop} />Main</List>
        <List selected={selected === 'History'} onClick={() => navigateTo('/History', 'History')}><StyledIcon icon={faDatabase} />History</List>
        <List><StyledIcon icon={faGear} />Setting</List>
    </Container>
  );
};

const Container = styled.div`
    display : flex;
    flex-direction: column;
    background-color : #515151;
    padding-top: 20px;
`
const List = styled.div`
    width : 200px;
    font-size : 24px;
    color : white;
    padding : 50px 20px 50px 20px;
    text-align : center;
    cursor: pointer;
    ${props => props.selected && css`
        background-color: grey;
    `}

`
const StyledIcon = styled(FontAwesomeIcon)`
    margin-right: 10px; // 아이콘과 텍스트 사이 간격 조정
`;

export default Sidebar;