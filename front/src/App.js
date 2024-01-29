import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import History from './pages/History';
const App = () => {


    return (
        <BrowserRouter>
            <div className='App'>
                <Routes>
                    <Route path="/" element={<Home/>} />
                    <Route path="/History" element={<History/>} />
                </Routes>

            </div>
        </BrowserRouter>
    );
};

export default App;
