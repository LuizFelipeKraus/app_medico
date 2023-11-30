const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const connection = require('./database/database')
const TipoDeCirurgia = require('./database/TipoDeCirurgia');
const TipoDeConvenio = require('./database/TipoDeConvenio');
const Cirurgia = require('./database/Cirurgia');
const bcrypt = require('bcrypt');
const Usuario = require('./database/Usuario');

const session = require('express-session');

const isAuthenticated = (req, res, next) => {
    if (req.session.isAuthenticated) {
      return next();
    }
    res.redirect('/login');
  };

connection
    .authenticate()
    .then(() =>{
        console.log("Conexão feita com o banco de dados!")
    }).catch((error) => {
        console.log(error)
    })

app.use(
    session({
      secret: 'suaChaveSecreta',
      resave: true,
      saveUninitialized: true,
    })
);

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended : false}))
app.use(bodyParser.json())


app.get("/login", (req, res) => {
    res.render('login')
});

app.get("/registrar", (req, res) => {
    res.render('registrar')
});

app.get("/", isAuthenticated, (req, res) => {
    Cirurgia.findAll({
        include: [
            { model: TipoDeCirurgia },
            { model: TipoDeConvenio }
        ],
        order: [
            ['id', 'DESC']
        ]
    }).then(cirurgias => {
        res.render('index', {
            cirurgias: cirurgias
        });
    });
});

app.get("/cadastrar_tipo_cirurgia", isAuthenticated, (req, res) => {
    if (req.session.isAuthenticated) {
        res.render('cadastrar_tipo_cirurgia')
      } else {
        res.redirect('/login');
      }
})

app.get("/cadastrar_tipo_convenio", isAuthenticated, (req, res) => {
    if (req.session.isAuthenticated) {
        res.render('cadastrar_tipo_convenio')
      } else {
        res.redirect('/login');
      }
})

app.get("/cadastrar_cirurgia", isAuthenticated, (req, res) => {
        TipoDeCirurgia.findAll({
        }).then(TipoDeCirurgia =>{
            if (TipoDeCirurgia != undefined){
                TipoDeConvenio.findAll().then(TipoDeConvenio =>{
                    res.render('cadastrar_cirurgia', {
                        TipoDeCirurgias : TipoDeCirurgia,
                        TipoDeConvenios : TipoDeConvenio
                    })
                })
            }else{
                res.redirect('/')
            }
    })
})


app.get("/alterar_cirurgia/:id", isAuthenticated, async (req, res) => {
    const cirurgiaId = req.params.id;

    try {
        const cirurgiaEncontrada = await Cirurgia.findOne({
            where: { id: cirurgiaId },
            include: [
                { model: TipoDeCirurgia },
                { model: TipoDeConvenio }
            ],
            raw: true
        });

        const tiposDeCirurgiasEncontrados = await TipoDeCirurgia.findAll();

        const tiposDeConveniosEncontrados = await TipoDeConvenio.findAll();

        res.render('alterar_cirurgia', {
            cirurgia: cirurgiaEncontrada,
            TipoDeCirurgias: tiposDeCirurgiasEncontrados,
            TipoDeConvenios: tiposDeConveniosEncontrados
        });
    } catch (error) {
        console.error("Erro ao buscar dados para a alteração da cirurgia:", error);
        res.status(500).send("Erro interno ao buscar dados para a alteração da cirurgia.");
    }
});

app.get("/deletar_cirurgia/:id", (req, res) => {
    const cirurgiaId = req.params.id;

    // Recupere a cirurgia com base no ID, incluindo tipos de cirurgia e convênio
    Cirurgia.findByPk(cirurgiaId, {
        include: [
            { model: TipoDeCirurgia },
            { model: TipoDeConvenio }
        ]
    }).then(cirurgia => {
        if (!cirurgia) {
            if (req.session.isAuthenticated) {
                res.redirect('/');
            }else {
                res.redirect('/login');
            }
        } else {
            if (req.session.isAuthenticated) {
            res.render('deletar_cirurgia', {
                cirurgia: cirurgia
            });}else{
                res.redirect('/login');
            }
        }
    }).catch(error => {
        console.error("Erro ao buscar dados para a exclusão da cirurgia:", error);
        res.status(500).send("Erro interno ao buscar dados para a exclusão da cirurgia.");
    });
});

app.post('/registrar', async (req, res) => {
    try {
        const { nome, email, senha } = req.body;

        const usuarioExistente = await Usuario.findOne({
            where: {
                email: email
            }
        });

        if (usuarioExistente) {
            return res.redirect('/login');
        }
       Usuario.create({
            nome: nome,
            email: email,
            senha: senha
        });

        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro interno do servidor');
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        const usuario = await Usuario.findOne({
            where: {
                email : email
            }
        });

        if (!usuario) {
            return res.redirect('/login');
        }


        console.log('Senha recebida:', senha);
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        console.log('Senha correta:', senhaCorreta);


        if (senhaCorreta) {
            req.session.isAuthenticated = true;
            res.redirect('/');
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.error(error);
        res.redirect('/login');
    }
});

app.post("/alterar_cirurgia/:id", (req, res) => {
    const cirurgiaId = req.params.id
    var medico = req.body.medico
    var paciente = req.body.paciente
    var dia = req.body.dia
    var hora = req.body.hora
    var pago = req.body.pago
    var tipoCirurgiaId = req.body.tipoCirurgiaId
    var tipoConvenioId = req.body.tipoConvenioId
    if (pago == 'on'){
        pago = 1
    }else {
        pago = 0
    }
    Cirurgia.findByPk(cirurgiaId).then(cirurgia => {
        if (!cirurgia) {
            res.redirect('/')
        } else {
            cirurgia.medico = medico
            cirurgia.paciente = paciente
            cirurgia.dia = dia
            cirurgia.hora = hora
            cirurgia.pago = pago
            cirurgia.TipoDeCirurgiumId = tipoCirurgiaId
            cirurgia.TipoDeConvenioId  = tipoConvenioId
            cirurgia.save().then(() => {
                res.redirect('/');
            }).catch(error => {
                console.log(error);
                res.redirect('/');
            });
        }
    });
});

app.post("/deletar_cirurgia/:id", (req, res) => {
    const cirurgiaId = req.params.id;

    // Excluir a cirurgia com base no ID
    Cirurgia.destroy({
        where: {
            id: cirurgiaId
        }
    }).then(() => {
        res.redirect('/');
    }).catch(error => {
        console.error("Erro ao excluir a cirurgia:", error);
        res.status(500).send("Erro interno ao excluir a cirurgia.");
    });
});

app.post('/salvar_cirurgia', (req, res) => {
    var medico = req.body.medico
    var paciente = req.body.paciente
    var dia = req.body.dia
    var hora = req.body.hora
    var pago = req.body.pago
    var tipoCirurgiaId = req.body.tipoCirurgiaId
    var tipoConvenioId = req.body.tipoConvenioId
    if (pago == 'on'){
        pago = 1
    }else {
        pago = 0
    }

    Cirurgia.create({
        medico : medico,
        paciente : paciente,
        dia : dia,
        hora : hora,
        pago : pago,
        TipoDeCirurgiumId : tipoCirurgiaId,
        TipoDeConvenioId : tipoConvenioId
    }).then(() => {
        res.redirect('/')
    }).catch((error) =>{
        console.log(error)
    })
})



app.post('/salvar_tipo_cirurgia', (req, res) => {
    var nome = req.body.nome
    TipoDeCirurgia.create({
        nome : nome
    }).then(() => {
        res.redirect('/')
    }).catch((error) =>{
        console.log(error)
    })
})


app.post('/salvar_tipo_convenio', (req, res) => {
    var nome = req.body.nome
    TipoDeConvenio.create({
        nome : nome
    }).then(() => {
        res.redirect('/')
    }).catch((error) =>{
        console.log(error)
    })
})





app.listen(8080, () =>{
    console.log("App Rodando!!")
})