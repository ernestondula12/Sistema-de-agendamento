var appointment = require("../models/Appointment");
var mongoose = require("mongoose")
var appointmentFactory = require("../factories/AppointmentFactory");
//importanod o nodemailer
var mailer = require("nodemailer");
const Appo = mongoose.model("Appointment", appointment);

class AppointmentService{

    //Metodo para envio de dados de consulta

    async Create(nome, email, cpf, description, data, time ){
        var newAppo = new Appo({
            nome,
            email,
            cpf,
            description,
            data,
            time,
            finished: false,
            notified: false
        })

        try{
            await newAppo.save();
            return true;
        }catch(err){
            console.log(err);
            return false
        }
    }
    
    //Metodo para listagem de consultas
    async GetAll(showFinished){

        if(showFinished){
            //Exibindo todas as consultas
           return await Appo.find();
        }else{
            //Exibindo consultas que ainda não estão finalizadas
            var appos =  await Appo.find({'finished': false});
            var appointments = [];

            appos.forEach(appointment => {
                if(appointment.data != undefined){
                    appointments.push(appointmentFactory.Build(appointment))
                }
            });

            return appointments;
        }
    }

    //Criando o metodo que vai buscar os dados do id que ele vai receber
    async GetById(id){
        try{
            var event = await Appo.findOne({'_id': id});
            return event;
        }catch(err){
            console.log(err);
        }
    }

    //Criando o metodo que vai ser responsavel para finalizar uma consulta
    async Finish(id){
        //Pegando o modulo mongo
        try{
            await Appo.findByIdAndUpdate(id,{finished: true});
            return true;
        }catch(err){
            console.log(err);
            return false;
        }
    }
    
    //Metodo responsavel pela busca de uma consulta pelo email ou cpf
    async Search(query){
        //Fazendo a busca ou recebendo um termo de busca
        try{
            var appos = await  Appo.find().or([{email: query},{cpf: query}]);
            return appos;
        }catch(err){
            console.log(err);
            return [];
        }
    }

    //Metodo para envio de notificação
    async SendNotification(){
        var appos = await this.GetAll(false);

        //Tranporter para envio de nosso email
        var transporter = mailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 25,
            auth:{
                user: "c11698a6dd903f",
                pass: "02a65cb423e93b"
            } 
        });

        //Calculando a data e hora para que os clientes recebem uma notificação de E-mail
        appos.forEach( async app => {

            //Pegando a data atual
            var date = app.start.getTime();
            //Calculando 1 hora
            var hour = 1000 * 60 * 60;
            //Pegando a data atual ou a hora atual
            var gap = date-Date.now();

            if(gap <= hour){
                //Verificando se a consulta já foi verificada
                if(!app.notified){

                    //Atualizando a notificação para true
                  await Appo.findByIdAndUpdate(app._id,{notified: true})

                    transporter.sendMail({
                        from: "Mateus Rosa<meteusrosa704@gmail.com>",
                        to: app.email,
                        subject: "Sua consulta vai acontecer em breve",
                        text: "Fica atento!! A sua consulta vai acontecer em breve"
                    }).then(() => {

                    }).catch(err => {

                        console.error("Erro ao enviar notificações", err);
                    })

                }
                //Dentro deste bloco vamos criar o nosso transporter
            }

        })
    }
}

module.exports = new AppointmentService();