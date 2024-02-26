const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const visitorLogs = sequelize.define('visitorLogs', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    visitor_id: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    visit_timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: false,
    tableName: 'visitor_logs'
});

module.exports = visitorLogs;
