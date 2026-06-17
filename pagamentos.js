let pagamentos =
JSON.parse(localStorage.getItem("pagamentos")) || [];

let agendamentos =
JSON.parse(localStorage.getItem("agendamentos")) || [];

let agendamentoSelecionado = null;

/* SERVIÇOS DO DIA */
function carregarServicosHoje() {

    const lista =
    document.getElementById("listaServicosHoje");

    const agendamentosPagos =
pagamentos
.filter(
    p => p.status.startsWith("Pago")
)
.map(
    p => String(p.agendamentoId)
);

    const servicosPendentes =
    agendamentos
    .filter(item =>
        !agendamentosPagos.includes(
            String(item.id)
        )
    )
    .sort((a,b)=>{

        const dataA =
        new Date(a.data + "T" + a.hora);

        const dataB =
        new Date(b.data + "T" + b.hora);

        return dataA - dataB;

    });

    if(servicosPendentes.length === 0){

        lista.innerHTML =
        "<p>Nenhum serviço pendente.</p>";

        return;

    }

    lista.innerHTML = "";

    servicosPendentes.forEach(item=>{

        lista.innerHTML +=

        '<div class="item-servico" onclick="selecionarAgendamento(\'' +

        item.id +

        '\')">' +

        '<strong>' +

        item.data +

        '</strong> | ' +

        item.hora +

        ' | ' +

        (pagamentos.some(
    p =>
    String(p.agendamentoId) === String(item.id)
    &&
    !p.status.startsWith("Pago")
)
? "🔴 "
: "") +

item.cliente +

        ' | ' +

        item.modelo +

        ' | € ' +

        (item.valor || 0) +

        '</div>';

    });

}

/*  AGENDAMENTO */

function selecionarAgendamento(id) {

    const item =
    agendamentos.find(
        a => String(a.id) === String(id)
    );

    if (!item) {
        return;
    }

    agendamentoSelecionado = item;

    document.getElementById("cliente").value =
    item.cliente || "";

    document.getElementById("telefone").value =
    item.telefone || "";

    document.getElementById("modelo").value =
    item.modelo || "";

    document.getElementById("servicos").value =
    Array.isArray(item.servicos)
    ? item.servicos.join(", ")
    : "";

    document.getElementById("valor").value =
    item.valor || "";

    }
    /* REGISTAR PAGAMENTO */

document
.getElementById("formPagamento")
.addEventListener("submit", function(e){

    e.preventDefault();

    if(!agendamentoSelecionado){

        alert(
        "Selecione um cliente da lista."
        );

        return;
    }

    const valor =
    document.getElementById("valor").value;

    const formaPagamento =
    document.getElementById("formaPagamento").value;

    const status =
    document.getElementById("status").value;

    if(!valor){

        alert(
        "Falta preencher o valor."
        );

        return;
    }

    if(!formaPagamento){

        alert(
        "Selecione a forma de pagamento."
        );

        return;
    }

    if(!status){

        alert(
        "Selecione o status."
        );

        return;
    }

    const confirmar =
    confirm(
    "Tem certeza que deseja registar este pagamento?"
    );

    if(!confirmar){
        return;
    }

    const pagamento = {

        id: Date.now().toString(),

        agendamentoId:
        agendamentoSelecionado.id,

       data:

document.getElementById("dataRecebimento").value

||

new Date()
.toISOString()
.split("T")[0],

        cliente:
        agendamentoSelecionado.cliente,

        telefone:
        agendamentoSelecionado.telefone,

        modelo:
        agendamentoSelecionado.modelo,

        servicos:
        agendamentoSelecionado.servicos,

        valor:
        parseFloat(valor),

        formaPagamento,

        status,

        observacoes:
        document.getElementById("observacoes").value

    };
        
    const indicePendente =
pagamentos.findIndex(
    p =>
    String(p.agendamentoId) ===
    String(agendamentoSelecionado.id)
);

if(indicePendente !== -1){

    pagamentos[indicePendente] =
    pagamento;

}else{

    pagamentos.push(pagamento);

}
    
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

    document.getElementById("cliente").value = "";
    document.getElementById("telefone").value = "";
    document.getElementById("modelo").value = "";
    document.getElementById("servicos").value = "";

    agendamentoSelecionado = null;

    atualizarCards();

    carregarServicosHoje();

    carregarPendentes();

    carregarPagamentosHoje();

});

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
    let recebidoDinheiro = 0;
    let recebidoMbway = 0;

    pagamentos.forEach(item => {

        const pago =
        item.status.startsWith("Pago");

        if(item.data === hoje && pago){

    recebidoHoje += item.valor;

    if(item.formaPagamento === "Dinheiro"){
        recebidoDinheiro += item.valor;
    }

    if(
        item.formaPagamento === "MB Way" ||
        item.formaPagamento === "Multibanco"
    ){
        recebidoMbway += item.valor;
    }

}

        const dataItem =
        new Date(item.data);

        if(
            dataItem.getMonth() === mesAtual
            &&
            dataItem.getFullYear() === anoAtual
            &&
            pago
        ){

            recebidoMes += item.valor;

        }

        if(!pago){

            pendente += item.valor;

        }

    });

    document.getElementById("recebidoHoje").textContent =
    "€ " + recebidoHoje.toFixed(2);

    document.getElementById("recebidoMes").textContent =
    "€ " + recebidoMes.toFixed(2);

    document.getElementById("valorPendente").textContent =
    "€ " + pendente.toFixed(2);

    document.getElementById("recebidoDinheiro").textContent =
    "€ " + recebidoDinheiro.toFixed(2);

    document.getElementById("recebidoMbway").textContent =
    "€ " + recebidoMbway.toFixed(2);
    }
    /* PENDÊNCIAS */

function carregarPendentes(){

    const lista =
    document.getElementById("listaPendentes");

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

    pendentes.forEach(item => {

        lista.innerHTML +=
        '<div class="item-pendente">' +
        '<strong>' +
        item.cliente +
        '</strong><br>' +
        '€ ' +
        item.valor.toFixed(2) +
        '<br>' +
        '<span class="pendente">' +
        item.status +
        '</span>' +
        '</div>';

    });

}

/* PAGAMENTOS REGISTADOS HOJE */

function carregarPagamentosHoje(){

    const lista =
    document.getElementById(
        "listaPagamentosHoje"
    );

    if(!lista){
        return;
    }

    const hoje =
    new Date()
    .toISOString()
    .split("T")[0];

    const hojePagos =
pagamentos.filter(
    p =>
        p.data === hoje &&
        p.status.startsWith("Pago")
);

    if(hojePagos.length === 0){

        lista.innerHTML =
        "Nenhum pagamento registado hoje.";

        return;
    }

    lista.innerHTML = "";

    hojePagos.forEach(item => {

        lista.innerHTML +=
        '<div class="item-pendente">' +
        '<strong>' +
        item.cliente +
        '</strong><br>' +
        '€ ' +
        item.valor.toFixed(2) +
        '<br>' +
        item.formaPagamento +
        '</div>';

    });

}
function carregarRecebidosMes(){

    const lista =
    document.getElementById(
        "listaRecebidosMes"
    );

    if(!lista){
        return;
    }

    const mesAtual =
    new Date().getMonth();

    const anoAtual =
    new Date().getFullYear();

    const recebidos =
    pagamentos.filter(item => {

        const dataItem =
        new Date(item.data);

        return (
            item.status.startsWith("Pago")
            &&
            dataItem.getMonth() === mesAtual
            &&
            dataItem.getFullYear() === anoAtual
        );

    });

    if(recebidos.length === 0){

        lista.innerHTML =
        "Nenhum pagamento registado este mês.";

        return;

    }

    lista.innerHTML = "";

    recebidos.forEach(item => {

        lista.innerHTML +=

        '<div class="item-pendente">' +

        item.data +

        ' | ' +

        item.cliente +

        ' | € ' +

        item.valor.toFixed(2) +

        '</div>';

    });

}
/* LOGOUT */

function logout(){

    localStorage.removeItem("perfil");

    window.location.href =
    "login.html";

}

/* INICIAR */

carregarServicosHoje();

carregarPendentes();

carregarPagamentosHoje();

carregarRecebidosMes();

atualizarCards();
