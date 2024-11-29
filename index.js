const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const appointmentService = require("./services/AppointmentService");


//configuração de arquivos estativcos
app.use(express.static("public"));
//Configuração do body parser para recebimento dos dados vir url
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Configuração da view engine
app.set('view engine', 'ejs');

//Conexão da base de dados
mongoose.connect("mongodb://localhost:27017/agendamento", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Conectado ao MongoDB");
}).catch(err => {
    console.error("Erro ao conectar ao MongoDB")
})

app.get("/", (req, res) => {

    res.render("index");
})

//Rota para visualização do formulario de cadastro de consulta

app.get("/cadastro", (req, res) => {
    res.render("cadastro");
})

//Rota para envio dos dados do formulario
app.post("/create", async (req, res) => {

    try{
        var status = await appointmentService.Create(
            req.body.nome,
            req.body.email,
            req.body.cpf,
            req.body.description,
            req.body.data,
            req.body.time
        )
    
        if(status){
            res.redirect("/");
        }else{
            
            res.send("Ocorreu uma falha");
        }
    }catch(err){
        console.error("Erro ao criar consulta: ", err);
        res.status(500).send("Erro no servidor");
    }
});

//Rota de listagem de consultas
app.get("/calendar", async (req, res) => {

    //Mostrando consultas menos as que já estão finalizadas
    var appointments = await appointmentService.GetAll(false);

    res.json(appointments);
});

//Rota para exibir detalhes de uma consulta
app.get("/event/:id", async(req, res) => {
    //Buscando a consulta
    var appointment = await appointmentService.GetById(req.params.id);
    res.render("event", {appo: appointment});
})

//Criando a Rota para acessada atraves do formulario e apartir dela vamos inserir o nosso id
app.post("/finish", async (req, res) => {
        var id = req.body.id;
        var result =  await appointmentService.Finish(id);
        res.redirect("/");
})

//Criando uma rota que vai listar todas as consultas
app.get("/list", async (req, res) => {

    //Mostrar dados da consulta de um determinda cliente pesquisado
    //Pesquisando o cliente por email e cpf

    //Mostrar todas as consultas ate todas aquelas que já estão finalizadas
    var appos = await appointmentService.GetAll(true);
    //RENDERIZANDO A NOSSSA VIEW LIST
    res.render("list",{appos});
})

//Rota responsavel por receber o email ou cpf do cliente a ser pesquisado
app.get("/searchresult", async(req,res) => {
    var appos = await appointmentService.Search(req.query.search);
    res.render("list",{appos});
})

var PollTime = 1000 * 60 * 5;

setInterval( async () => {

    await appointmentService.SendNotification();

}, PollTime);

app.listen(8080, () => {
    console.log("Servidor rodando...");
})