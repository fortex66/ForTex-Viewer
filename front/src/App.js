import React, {useState} from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import History from './pages/History';
import {ThemeContext} from './style/theme';
const App = () => {

    const [isDark, setIsDark] = useState(false);


    return (
        
        <BrowserRouter>
            <div className='App'>
                <ThemeContext.Provider value={{ isDark, setIsDark }}>
                    <Routes>
                        <Route path="/" element={<Home/>} />
                        <Route path="/History" element={<History/>} />
                    </Routes>
                </ThemeContext.Provider>
            </div>
        </BrowserRouter>
    );
};

export default App;
