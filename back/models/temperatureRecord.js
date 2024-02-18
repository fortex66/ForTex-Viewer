const {DataTypes} = require('sequelize');
const  sequelize  = require('../database/database');

const temperaturerecords = sequelize.define('temperaturerecords', {
    temperature: DataTypes.FLOAT,
    settingtemp: DataTypes.FLOAT,
    timestamp: DataTypes.DATE,
    thermostatStatus: DataTypes.BOOLEAN,
}, {
    timestamps: false,
    tableName: 'temperaturerecords',
});

module.exports = temperaturerecords;
