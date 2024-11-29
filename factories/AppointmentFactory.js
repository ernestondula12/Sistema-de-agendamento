class AppointmentFactory{

    Build(simpleAppointment){

        //Convertendo os campo start e end para assim termos a possibilidade de juntarmos a data e hora
        var day = simpleAppointment.data.getDate()+1;
        var month = simpleAppointment.data.getMonth();
        var year = simpleAppointment.data.getFullYear();
        var hour = Number.parseInt(simpleAppointment.time.split(":")[0]);
        var minutes = Number.parseInt(simpleAppointment.time.split(":")[1]);

        //Criando uma data nova
        var startDate = new Date(year,month,day,hour,minutes,0,0);
        //Convertendo a hora de acordo com o timezone da africa ocidental
        //startDate.setHours( startDate.getHours() + 1);

       //Criando uma consulta preparada para o calendario
        var appo = {
            id: simpleAppointment._id,
            title: simpleAppointment.nome + " - " + simpleAppointment.description,
            start: startDate,
            end: startDate,
            notified: simpleAppointment.notified,
            email: simpleAppointment.email
        }

        return appo;
    }


}

module.exports = new AppointmentFactory();