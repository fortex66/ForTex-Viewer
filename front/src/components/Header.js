import React, { useContext } from "react";
import { ThemeContext } from "../style/theme";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSun,
  faMoon
} from "@fortawesome/free-solid-svg-icons";



const Header = () => {
  const { isDark, setIsDark } = useContext(ThemeContext);

  console.log(isDark);
  const handleMode = () => {
    setIsDark(!isDark);
    console.log(isDark);
  }

  return (
    <Container isDark={isDark}>
        <Title isDark={isDark}>ForTex-Viewer</Title>
        <Mode>
          {isDark ? (
            <FontAwesomeIcon icon={faSun} onClick={handleMode} color="#FEFEFE" size="2x"/>
          ) : (
            <FontAwesomeIcon icon={faMoon} onClick={handleMode} color="#FEFEFE" size="2x"/>
          )}
          
          
        </Mode>
    </Container>
  );
};

const Container = styled.div`
  display : flex;
  justify-content:space-between;
  align-items: center;
  //background-color: ${({ isDark }) => isDark ? '#FEFEFE' : '#202124'}; /* 조건부 스타일 */
  background-color: #202124;
`
const Title = styled.div`
  font-size : 30px;
  // color: ${({ isDark }) => isDark ? '#202124' : '#FEFEFE'}; /* 조건부 스타일 */
  color: #FEFEFE;
  font-weight : bold;
  padding : 10px 0px 10px 20px;
    
`

const Mode = styled.div`
  margin-right : 40px;
  cursor: pointer;
`;

export default Header;