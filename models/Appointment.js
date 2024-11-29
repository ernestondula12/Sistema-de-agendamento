//Importando o mongoose
const mongoose = require("mongoose");


//Criando a collection de consulta
const appointment = new mongoose.Schema({
    nome: String,
    email: String,
    cpf: String,
    description: String,
    data: Date,
    time: String,
    finished: Boolean,
    notified: Boolean
})

module.exports = appointment;