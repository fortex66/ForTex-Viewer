import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import History from './pages/History';
import Setting from './pages/Setting';
import { ThemeContext } from './style/theme';
import { SettingProvider } from './contexts/SettingContext';
// uuid 라이브러리에서 v4 함수를 가져옵니다.
import { v4 as uuidv4 } from 'uuid';

const App = () => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // localStorage에서 visitorId를 확인합니다.
        const now = new Date();
        let visitorId = localStorage.getItem('visitorId');
        const expiresIn = localStorage.getItem('expiresIn');

        // 다음 자정까지의 시간을 계산합니다.
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0); // 다음 날의 자정
        const timeUntilMidnight = tomorrow.getTime() - now.getTime();
        
        // 만료 시간이 지났거나 visitorId가 없는 경우 새로 생성하여 localStorage에 저장합니다.
        if (!visitorId || !expiresIn || now.getTime() > parseInt(expiresIn)) {
            visitorId = uuidv4(); // UUID 생성
            const newExpiresIn = now.getTime() + timeUntilMidnight; // 다음 자정까지의 시간을 더합니다.

            // visitorId와 만료 시간을 로컬 스토리지에 저장합니다.
            localStorage.setItem('visitorId', visitorId);
            localStorage.setItem('expiresIn', newExpiresIn.toString());

            // 서버에 첫 방문을 알리는 API 요청을 보냅니다.
            fetch('/api/visit/first-visit', {
                method: 'POST', // HTTP 메소드
                headers: {
                    'Content-Type': 'application/json', // 요청의 컨텐츠 타입
                },
                body: JSON.stringify({ visitorId }), // 요청 본문
            })
            .then(response => {
                if (response.ok) {
                    console.log('Visit recorded successfully');
                } else {
                    console.error('Failed to record visit');
                }
            })
            .catch(error => {
                console.error('Error recording visit:', error);
            });
        }
    }, []); // 빈 배열을 전달하여 컴포넌트 마운트 시에만 실행되도록 합니다.

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
