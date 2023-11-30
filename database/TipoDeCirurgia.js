const Sequelize = require("sequelize")
const connection = require("./database")

const TipoDeCirurgia = connection.define('TipoDeCirurgia', {
    nome: {
        type: Sequelize.STRING,
        allowNull: false,
    },
});


TipoDeCirurgia.sync({force: false}).then(() => {
    console.log("Tabela TipoDeCirurgia Criada Com Sucesso!")
}).catch((error) => {
    console.log(error)
})

module.exports = TipoDeCirurgia;