const perfil = localStorage.getItem("perfil");

if(!perfil){
window.location.href = "login.html";
}

let pagamentos =
JSON.parse(
localStorage.getItem("pagamentos")
) || [];

let agendamentos =
JSON.parse(
localStorage.getItem("agendamentos")
) || [];

let agendamentoSelecionado = null;

/* CARREGAR SERVIÇOS DO DIA */

function carregarServicosHoje(){

const lista =
document.getElementById(
"listaServicosHoje"
);

const hoje = new Date();

const hojeTexto =
${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,'0')}-${String(hoje.getDate()).padStart(2,'0')};

const servicosHoje =
agendamentos.filter(
item => item.data === hojeTexto
);

if(servicosHoje.length === 0){

lista.innerHTML =
"Nenhum serviço agendado para hoje.";

return;

}

lista.innerHTML = "";

servicosHoje
.sort((a,b)=>a.hora.localeCompare(b.hora))
.forEach(item=>{

lista.innerHTML += `

<div
class="item-servico"
onclick="selecionarAgendamento('${item.id}')">

<strong>${item.hora}</strong>
&nbsp;|&nbsp;
${item.cliente}
&nbsp;|&nbsp;
${item.modelo}

</div>

`;

});

}

/* SELECIONAR CLIENTE */

function selecionarAgendamento(id){

const item =
agendamentos.find(
a => a.id === id
);

if(!item){
return;
}

agendamentoSelecionado = item;

document
.getElementById("cliente")
.value =
item.cliente || "";

document
.getElementById("telefone")
.value =
item.telefone || "";

document
.getElementById("modelo")
.value =
item.modelo || "";

document
.getElementById("servicos")
.value =
(item.servicos || []).join(", ");

}

/* GUARDAR PAGAMENTO */

document
.getElementById("formPagamento")
.addEventListener(
"submit",
function(e){

e.preventDefault();

if(!agendamentoSelecionado){

alert(
"Selecione um cliente."
);

return;

}

const valor =
document.getElementById("valor")
.value;

if(!valor){

alert(
"Falta informar o valor."
);

return;

}

const forma =
document.getElementById(
"formaPagamento"
).value;

if(!forma){

alert(
"Selecione a forma de pagamento."
);

return;

}

const status =
document.getElementById(
"status"
).value;

if(!status){

alert(
"Selecione o status."
);

return;

}

const novoPagamento = {

id: Date.now(),

data:
new Date()
.toISOString()
.split("T")[0],

cliente:
document.getElementById("cliente").value,

telefone:
document.getElementById("telefone").value,

modelo:
document.getElementById("modelo").value,

servicos:
document.getElementById("servicos").value,

valor:
parseFloat(valor),

formaPagamento: forma,

status: status,

observacoes:
document.getElementById("observacoes").value

};

pagamentos.push(
novoPagamento
);

localStorage.setItem(
"pagamentos",
JSON.stringify(pagamentos)
);

alert(
"Pagamento registado com sucesso."
);

document
.getElementById("formPagamento")
.reset();

document
.getElementById("cliente")
.value = "";

document
.getElementById("telefone")
.value = "";

document
.getElementById("modelo")
.value = "";

document
.getElementById("servicos")
.value = "";

agendamentoSelecionado = null;

atualizarCards();

carregarPendentes();

}
);

/* CARDS */

function atualizarCards(){

const hoje =
new Date()
.toISOString()
.split("T")[0];

const mesAtual =
new Date().getMonth();

const anoAtual =
new Date().getFullYear();

let recebidoHoje = 0;
let recebidoMes = 0;
let pendente = 0;

pagamentos.forEach(item=>{

const pago =
item.status.startsWith("Pago");

if(item.data === hoje && pago){

recebidoHoje += item.valor;

}

const data =
new Date(item.data);

if(
data.getMonth() === mesAtual
&&
data.getFullYear() === anoAtual
&&
pago
){

recebidoMes += item.valor;

}

if(!pago){

pendente += item.valor;

}

});

document
.getElementById("recebidoHoje")
.textContent =
"€ " + recebidoHoje.toFixed(2);

document
.getElementById("recebidoMes")
.textContent =
"€ " + recebidoMes.toFixed(2);

document
.getElementById("valorPendente")
.textContent =
"€ " + pendente.toFixed(2);

}

/* PENDÊNCIAS */

function carregarPendentes(){

const lista =
document.getElementById(
"listaPendentes"
);

const pendentes =
pagamentos.filter(
p => !p.status.startsWith("Pago")
);

if(pendentes.length === 0){

lista.innerHTML =
"Nenhuma pendência.";

return;

}

lista.innerHTML = "";

pendentes.forEach(item=>{

lista.innerHTML += `

<div class="item-pendente">

<strong>
${item.cliente}
</strong>

<br>

€ ${item.valor.toFixed(2)}

<br>

<span class="pendente">

${item.status}

</span>

</div>

`;

});

}

/* LOGOUT */

function logout(){

localStorage.removeItem(
"perfil"
);

window.location.href =
"login.html";

}

/* INICIALIZAÇÃO */

carregarServicosHoje();

carregarPendentes();

atualizarCards();
