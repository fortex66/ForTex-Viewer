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

  const handleMode = () => {
    setIsDark(!isDark);
  }

  return (
    <Container >
        <Title>ForTex-Viewer</Title>
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
  background-color: #202124;
`
const Title = styled.div`
  font-size : 24px;
  color: #FEFEFE;
  font-weight : bold;
  padding : 10px 0px 10px 20px;
    
`

const Mode = styled.div`
  margin-right : 40px;
  cursor: pointer;
`;

export default Header;