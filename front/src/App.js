import React, {useState} from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import History from './pages/History';
import Setting from './pages/Setting';
import {ThemeContext} from './style/theme';
import {SettingProvider } from './contexts/SettingContext';

const App = () => {

    const [isDark, setIsDark] = useState(false);


    return (
        
        <BrowserRouter>
            <div className='App'>
                <ThemeContext.Provider value={{ isDark, setIsDark }}>
                    <SettingProvider >
                        <Routes>
                            <Route path="/" element={<Home/>} />
                            <Route path="/History" element={<History/>} />
                            <Route path="/Setting" element={<Setting/>} />
                        </Routes>
                    </SettingProvider>
                </ThemeContext.Provider>
            </div>
        </BrowserRouter>
    );
};

export default App;
