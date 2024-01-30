const {DataTypes} = require('sequelize');
const  sequelize  = require('../database/database');

const temperaturerecords = sequelize.define('temperaturerecords', {
    temperature: DataTypes.FLOAT,
    timestamp: DataTypes.DATE,
}, {
    timestamps: false,
    tableName: 'temperaturerecords',
});

module.exports = temperaturerecords;
