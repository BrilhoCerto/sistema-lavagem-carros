let calendario;

let agendamentos =
JSON.parse(localStorage.getItem("agendamentos")) || [];

let agendamentoEditando = null;

let diaSelecionado = null;

/* HORÁRIOS */

function carregarHorarios(){

const selectHora =
document.getElementById("hora");

selectHora.innerHTML = "";

for(let hora=8; hora<=18; hora++){

for(let minuto of [0,15,30,45]){

if(hora === 18 && minuto === 0){
continue;
}

const horario =
String(hora).padStart(2,'0')
+ ':'
+
String(minuto).padStart(2,'0');

const option =
document.createElement("option");

option.value = horario;
option.textContent = horario;

selectHora.appendChild(option);

}

}

}

/* CALENDÁRIO */

document.addEventListener('DOMContentLoaded', function(){

carregarHorarios();

const calendarEl =
document.getElementById('calendar');

calendario =
new FullCalendar.Calendar(calendarEl, {

initialView: 'dayGridMonth',

locale: 'pt',

slotMinTime: '08:00:00',
slotMaxTime: '18:00:00',
scrollTime: '08:00:00',

slotDuration: '00:15:00',
slotLabelInterval: '00:15:00',

slotLabelFormat: {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
},
displayEventtime: false,
allDaySlot: false,

height: 700,

hiddenDays: [0],

headerToolbar: {

left: 'prev,next today',

center: 'title',

right: 'timeGridDay,timeGridWeek,dayGridMonth'

},
eventContent: function(info){

    return {
        html: `
            <div>
                ${info.event.title}
            </div>
        `
    };

},
eventDidMount: function(info){

info.el.style.backgroundColor = "#dc3545";
info.el.style.borderColor = "#dc3545";
info.el.style.color = "#fff";
const hora = info.el.querySelector('.fc-event-time');

    if(hora){
        hora.style.display = 'none';
    }
},

dateClick: function(info){
selecionarDia(info.dateStr);
},

eventClick: function(info){
abrirAgendamento(info.event.id);
}

});

calendario.render();

atualizarCalendario();

});

/* SELEÇÃO DE DIA */

function selecionarDia(data){

diaSelecionado = data;

document
.querySelectorAll(".fc-daygrid-day")
.forEach(d=>{

d.classList.remove("fc-day-selecionado");

});

const celulas =
document.querySelectorAll("[data-date='"+data+"']");

celulas.forEach(c=>{

c.classList.add("fc-day-selecionado");

});

mostrarAgendamentosDoDia(data);

document
.getElementById("data")
.value = data;

}

/* LISTAGEM DO DIA */

function mostrarAgendamentosDoDia(data){

    const lista =
    document.getElementById("listaDia");

    const pagamentos =
    JSON.parse(localStorage.getItem("pagamentos")) || [];

    const agendamentosDia =
    agendamentos.filter(a => a.data === data);

    const ativos = [];
    const concluidos = [];

    agendamentosDia.forEach(item => {

        const pago =
        pagamentos.some(
            p => String(p.agendamentoId) === String(item.id)
        );

        if(pago){
            concluidos.push(item);
        }else{
            ativos.push(item);
        }

    });

    lista.innerHTML = "";

    /* ATIVOS */

    lista.innerHTML += `
        <h6 class="mt-2 mb-2">
            📅 Agendamentos Ativos
        </h6>
    `;

    if(ativos.length === 0){

        lista.innerHTML += `
            <p>Nenhum agendamento ativo.</p>
        `;

    }else{

        ativos
        .sort((a,b)=>a.hora.localeCompare(b.hora))
        .forEach(item=>{

            lista.innerHTML += `
            <div
            class="agendamento-item"
            onclick="abrirAgendamento('${item.id}')">

                <strong>${item.hora}</strong><br>
                ${item.cliente}<br>
                ${item.modelo}

            </div>
            `;

        });

    }

    /* CONCLUÍDOS */

    lista.innerHTML += `
        <hr>
        <h6 class="mt-3 mb-2 text-success">
            ✅ Agendamentos Concluídos
        </h6>
    `;

    if(concluidos.length === 0){

        lista.innerHTML += `
            <p>Nenhum concluído.</p>
        `;

    }else{

        concluidos
        .sort((a,b)=>a.hora.localeCompare(b.hora))
        .forEach(item=>{

            lista.innerHTML += `
            <div
            class="agendamento-item"
            style="
                border-left:5px solid green;
                opacity:0.8;
            "
            onclick="abrirAgendamento('${item.id}')">

                <strong>✅ ${item.hora}</strong><br>
                ${item.cliente}<br>
                ${item.modelo}

            </div>
            `;

        });

    }

}

/* CALENDÁRIO */

function atualizarCalendario(){

calendario.removeAllEvents();

agendamentos.forEach(item=>{

calendario.addEvent({
    id: item.id,
    title:
(item.cliente || "Sem nome") +
"\n" +
(item.modelo || "") +
"\n" +
(
Array.isArray(item.servicos)
? item.servicos.join(", ")
: item.servicos || ""
),
    start: item.data + "T" + item.hora,

end: new Date(
    new Date(item.data + "T" + item.hora)
    .getTime() + (30 * 60000)
).toISOString(),

    extendedProps: {
        cliente: item.cliente,
        telefone: item.telefone,
        modelo: item.modelo,
        servicos: item.servicos,
        valor: item.valor,
        observacoes: item.observacoes
    }
});

});

}

/* ABRIR AGENDAMENTO */

function abrirAgendamento(id){

const item =
agendamentos.find(a => a.id === id);

if(!item) return;

agendamentoEditando = id;

document
.getElementById("cliente")
.value = item.cliente;

document
.getElementById("telefone")
.value = item.telefone;

document
.getElementById("modelo")
.value = item.modelo;

document
.getElementById("data")
.value = item.data;

document
.getElementById("hora")
.value = item.hora;

document
.getElementById("valor")
.value = item.valor;

document
.getElementById("observacoes")
.value = item.observacoes;

document
.querySelectorAll(
'.servico-item input[type="checkbox"]'
)
.forEach(cb=>{

cb.checked =
item.servicos.includes(cb.value);

});

document
.getElementById("btnSalvar")
.style.display = "none";

document
.getElementById("btnAtualizar")
.style.display = "block";

}

/* LIMPAR FORMULÁRIO */

function limparFormulario(){

document.getElementById("formAgendamento").reset();

document
.querySelectorAll(
'.servico-item input[type="checkbox"]'
)
.forEach(cb => cb.checked = false);

agendamentoEditando = null;

document
.getElementById("btnSalvar")
.style.display = "block";

document
.getElementById("btnAtualizar")
.style.display = "none";

}

/* CAPTURA SERVIÇOS */

function obterServicos(){

const servicos = [];

document
.querySelectorAll(
'.servico-item input[type="checkbox"]:checked'
)
.forEach(cb => {

servicos.push(cb.value);

});

return servicos;

}

/* VERIFICA DUPLICIDADE */

function horarioOcupado(data,hora,idIgnorar=null){

return agendamentos.some(a =>

a.data === data
&&
a.hora === hora
&&
a.id !== idIgnorar

);

}

/* SALVAR NOVO */

document
.getElementById("formAgendamento")
.addEventListener("submit", function(e){

e.preventDefault();

const cliente =
document.getElementById("cliente").value;

const telefone =
document.getElementById("telefone").value;

const modelo =
document.getElementById("modelo").value;

const data =
document.getElementById("data").value;

const hora =
document.getElementById("hora").value;

const valor =
document.getElementById("valor").value;

const observacoes =
document.getElementById("observacoes").value;

const servicos =
obterServicos();

/* DUPLICIDADE */

if(horarioOcupado(data,hora)){

alert(
"Este horário já possui um agendamento."
);

return;

}

const novo = {

id: Date.now().toString(),

cliente,
telefone,
modelo,
data,
hora,
valor,
observacoes,
servicos

};

agendamentos.push(novo);

localStorage.setItem(
"agendamentos",
JSON.stringify(agendamentos)
);

atualizarCalendario();

mostrarAgendamentosDoDia(data);

alert("Agendamento criado com sucesso.");

formularioAlterado = false;

limparFormulario();
});

/* ATUALIZAR */

document
.getElementById("btnAtualizar")
.addEventListener("click", function(){

if(!agendamentoEditando){
return;
}

const cliente =
document.getElementById("cliente").value;

const telefone =
document.getElementById("telefone").value;

const modelo =
document.getElementById("modelo").value;

const data =
document.getElementById("data").value;

const hora =
document.getElementById("hora").value;

const valor =
document.getElementById("valor").value;

const observacoes =
document.getElementById("observacoes").value;

const servicos =
obterServicos();

/* DUPLICIDADE */

if(
horarioOcupado(
data,
hora,
agendamentoEditando
)
){

alert(
"Já existe um agendamento nesse horário."
);

return;

}

const indice =
agendamentos.findIndex(
a => a.id === agendamentoEditando
);

if(indice === -1){
return;
}

agendamentos[indice] = {

id: agendamentoEditando,

cliente,
telefone,
modelo,
data,
hora,
valor,
observacoes,
servicos

};

localStorage.setItem(
"agendamentos",
JSON.stringify(agendamentos)
);

atualizarCalendario();

mostrarAgendamentosDoDia(data);

alert("Agendamento atualizado.");
formularioAlterado = false;
limparFormulario();

});

/* EXCLUIR */

function excluirAgendamento(){

if(!agendamentoEditando){
return;
}

if(
!confirm(
"Deseja apagar este agendamento?"
)
){
return;
}

agendamentos =
agendamentos.filter(
a => a.id !== agendamentoEditando
);

localStorage.setItem(
"agendamentos",
JSON.stringify(agendamentos)
);

atualizarCalendario();

if(diaSelecionado){
mostrarAgendamentosDoDia(diaSelecionado);
}

alert("Agendamento removido.");
formularioAlterado = false;
limparFormulario();

}
if(localStorage.getItem("perfil") === "funcionario"){

    const despesas =
    document.getElementById("menuDespesas");

    if(despesas){
        despesas.style.display = "none";
    }

    const relatorios =
    document.getElementById("menuRelatorios");

    if(relatorios){
        relatorios.style.display = "none";
    }

}
 let formularioAlterado = false;

document.querySelectorAll(
"input, select, textarea"
).forEach(campo => {

    campo.addEventListener(
        "change",
        () => {
            formularioAlterado = true;
        }
    );

});

window.addEventListener(
    "beforeunload",
    function(e){

        if(formularioAlterado){

            e.preventDefault();
            e.returnValue = "";

        }

    }
);
 function confirmarSaida(destino){

    if(formularioAlterado){

        const sair = confirm(
            "Existem alterações não salvas. Deseja sair mesmo assim?"
        );

        if(!sair){
            return;
        }

    }

    location.href = destino;

}
