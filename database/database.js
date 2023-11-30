const Sequelize = require('sequelize')

const connection = new Sequelize('app_medico', 'root', 'root', {
    host : 'localhost',
    dialect : 'mysql'
})


module.exports = connection