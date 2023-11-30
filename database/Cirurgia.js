const Sequelize = require("sequelize")
const connection = require("./database")

const TipoDeCirurgia = require('./TipoDeCirurgia'); // Importe o modelo TipoDeCirurgia
const TipoDeConvenio = require('./TipoDeConvenio'); // Importe o modelo TipoDeConvenio

const Cirurgia = connection.define('Cirurgia', {
    medico: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    paciente: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    dia: {
        type: Sequelize.DATEONLY,
        allowNull: false,
    },
    hora: {
        type: Sequelize.TIME,
        allowNull: false,
    },
    pago: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    },
});

// Relacione a cirurgia com o tipo de cirurgia
Cirurgia.belongsTo(TipoDeCirurgia);

// Relacione a cirurgia com o tipo de convênio
Cirurgia.belongsTo(TipoDeConvenio);

Cirurgia.sync({force: false}).then(() => {
    console.log("Tabela Cirurgia Criada Com Sucesso!")
}).catch((error) => {
    console.log(error)
})

module.exports = Cirurgia;