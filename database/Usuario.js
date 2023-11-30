const Sequelize = require("sequelize")
const connection = require("./database")
const bcrypt = require('bcrypt');

const Usuario = connection.define('Usuario', {
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    nome: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    senha: {
        type: Sequelize.STRING,
        allowNull: false,
    },
});


Usuario.beforeCreate(async (usuario) => {
    const hashedSenha = await bcrypt.hash(usuario.senha, 10);
    usuario.senha = hashedSenha;
});

Usuario.sync({force: false}).then(() => {
    console.log("Tabela Usuario Criada Com Sucesso!")
}).catch((error) => {
    console.log(error)
})


module.exports = Usuario;