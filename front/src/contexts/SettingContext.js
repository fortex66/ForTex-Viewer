import React, { createContext, useState, useContext } from 'react';

const SettingContext = createContext();

export const useSettings = () => useContext(SettingContext);

export const SettingProvider = ({ children }) => {
    const [refreshInterval, setRefreshInterval] = useState(10000); // 예시 초기값
    const [graphSetMax, setGraphSetMax] = useState(100);
    const [graphSetMin, setGraphSetMin] = useState(0);
    const [color, setColor] = useState('rgb(75, 192, 192)')
    const [darkcolor, setDarkColor] = useState('rgb(253, 183, 0)');


    const value = {
        refreshInterval,
        setRefreshInterval,
        graphSetMax,
        setGraphSetMax,
        graphSetMin,
        setGraphSetMin,
        color,
        setColor,
        darkcolor,
        setDarkColor
    };

    return <SettingContext.Provider value={value}>{children}</SettingContext.Provider>;
};