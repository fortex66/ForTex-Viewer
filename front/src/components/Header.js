import styled from "styled-components";

const Header = () => {

  return (
    <Container>
        <Title>ForTex-Viewer</Title>
    </Container>
  );
};

const Container = styled.div`
    background-color : black;
`
const Title = styled.div`
    font-size : 28px;
    color : white;
    font-weight : bold;
    padding : 10px 0px 10px 20px;
    
`

export default Header;