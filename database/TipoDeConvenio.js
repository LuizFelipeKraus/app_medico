const Sequelize = require("sequelize")
const connection = require("./database")

const TipoDeConvenio = connection.define('TipoDeConvenio', {
    nome: {
        type: Sequelize.STRING,
        allowNull: false,
    },
});

TipoDeConvenio.sync({force: false}).then(() => {
    console.log("Tabela TipoDeConvenio Criada Com Sucesso!")
}).catch((error) => {
    console.log(error)
})

module.exports = TipoDeConvenio;