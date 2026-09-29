import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* ================================
   PERFIL / ACESSO
================================ */

const perfilRelatorio = localStorage.getItem("perfil");

if (!perfilRelatorio) {
    window.location.href = "login.html";
}

if (perfilRelatorio === "funcionario") {
    window.location.href = "pagamentos.html";
}


/* ================================
   DADOS
================================ */

let pagamentos = [];
let despesas = [];


/* ================================
   CARREGAR PAGAMENTOS
================================ */

async function carregarPagamentosFirebase() {

    try {

        const snapshot =
            await getDocs(collection(db, "pagamentos"));

        pagamentos = [];

        snapshot.forEach(documento => {

            pagamentos.push({
                firebaseId: documento.id,
                ...documento.data()
            });

        });

        console.log(
            "Pagamentos carregados no Relatório:",
            pagamentos.length
        );

        carregarRelatorios();

    } catch (erro) {

        console.error(
            "Erro ao carregar pagamentos:",
            erro
        );

    }

}


/* ================================
   CARREGAR DESPESAS
================================ */

const despesasRef =
    collection(db, "despesas");

onSnapshot(despesasRef, (snapshot) => {

    despesas = snapshot.docs.map(documento => ({

        id: documento.id,
        ...documento.data()

    }));

    console.log(
        "Despesas carregadas no Relatório:",
        despesas.length
    );

    carregarRelatorios();

});


/* ================================
   FORMATAR DATA
================================ */

function formatarData(data) {

    if (!data) {
        return "";
    }

    const partes =
        String(data).split("-");

    if (partes.length !== 3) {
        return data;
    }

    return (
        partes[2] +
        "/" +
        partes[1] +
        "/" +
        partes[0]
    );

}


/* ================================
   FILTRO DE PERÍODO
================================ */

function obterPeriodo() {

    const filtro =
        document.getElementById(
            "filtroPeriodo"
        ).value;

    const hoje = new Date();

    let inicio;
    let fim;


    switch (filtro) {

        case "hoje":

            inicio = new Date();
            fim = new Date();

            break;


        case "ontem":

            inicio = new Date();

            inicio.setDate(
                inicio.getDate() - 1
            );

            fim = new Date(inicio);

            break;


        case "semana":

            inicio = new Date();

            inicio.setDate(
                inicio.getDate() - 7
            );

            fim = new Date();

            break;


        case "mes":

            inicio = new Date(
                hoje.getFullYear(),
                hoje.getMonth(),
                1
            );

            fim = new Date();

            break;


        case "ano":

            inicio = new Date(
                hoje.getFullYear(),
                0,
                1
            );

            fim = new Date();

            break;


        case "personalizado":

            const dataInicial =
                document.getElementById(
                    "dataInicial"
                ).value;

            const dataFinal =
                document.getElementById(
                    "dataFinal"
                ).value;


            if (!dataInicial || !dataFinal) {

                alert(
                    "Selecione a data inicial e final."
                );

                return null;

            }


            inicio =
                new Date(dataInicial);

            fim =
                new Date(dataFinal);

            break;


        default:

            inicio = new Date();
            fim = new Date();

            break;

    }


    inicio.setHours(
        0,
        0,
        0,
        0
    );

    fim.setHours(
        23,
        59,
        59,
        999
    );


    return {
        inicio,
        fim
    };

}


/* ================================
   RELATÓRIOS
================================ */

function carregarRelatorios() {

    const periodo =
        obterPeriodo();

    if (!periodo) {
        return;
    }


    let receitas = 0;
    let despesasTotal = 0;
    let veiculos = 0;


    const tabela =
        document.getElementById(
            "tabelaMovimentos"
        );


    if (!tabela) {
        return;
    }


    tabela.innerHTML = "";


    /* ================================
       RECEITAS
    ================================= */

    const pagamentosPeriodo = [];


    pagamentos.forEach(item => {

        if (!item.data) {
            return;
        }


        const data =
            new Date(item.data);


        const pago =
            String(
                item.status || ""
            ).startsWith("Pago");


        if (
            data >= periodo.inicio &&
            data <= periodo.fim &&
            pago
        ) {

            const valor =
                Number(item.valor || 0);


            receitas += valor;

            veiculos++;

            pagamentosPeriodo.push(item);


            tabela.innerHTML += `

                <tr>

                    <td>
                        ${formatarData(item.data)}
                    </td>

                    <td>
                        Receita
                    </td>

                    <td>
                        ${item.cliente || "Cliente"}
                    </td>

                    <td>
                        € ${valor.toFixed(2)}
                    </td>

                </tr>

            `;

        }

    });


    /* ================================
       DESPESAS
    ================================= */

    despesas.forEach(item => {

        if (!item.data) {
            return;
        }


        const data =
            new Date(item.data);


        if (
            data >= periodo.inicio &&
            data <= periodo.fim
        ) {

            const valor =
                Number(item.valor || 0);


            despesasTotal += valor;


            tabela.innerHTML += `

                <tr>

                    <td>
                        ${formatarData(item.data)}
                    </td>

                    <td>
    ${
        item.origem === "Cartão de Débito" ||
        item.tipo === "debito" ||
        String(item.subcategoria || "").startsWith("Cartão Débito")
            ? "Despesa - Cartão de Débito"
            : "Despesa"
    }
</td>

                    <td>
                        ${item.categoria || "Despesa"}
                    </td>

                    <td>
                        € ${valor.toFixed(2)}
                    </td>

                </tr>

            `;

        }

    });


    /* ================================
       SALDO
    ================================= */

    const saldo =
        receitas - despesasTotal;


    /* ================================
       CARDS
    ================================= */

    atualizarElemento(
        "receitaHoje",
        "€ " + receitas.toFixed(2)
    );


    atualizarElemento(
        "despesaHoje",
        "€ " + despesasTotal.toFixed(2)
    );


    atualizarElemento(
        "saldoHoje",
        "€ " + saldo.toFixed(2)
    );


    atualizarElemento(
        "veiculosHoje",
        veiculos
    );


    atualizarElemento(
        "totalReceitas",
        "€ " + receitas.toFixed(2)
    );


    atualizarElemento(
        "totalDespesas",
        "€ " + despesasTotal.toFixed(2)
    );


    atualizarElemento(
        "saldoPeriodo",
        "€ " + saldo.toFixed(2)
    );


    /* ================================
       INDICADORES
    ================================= */

    carregarIndicadores(
        pagamentosPeriodo,
        receitas,
        despesasTotal,
        saldo,
        veiculos
    );

}


/* ================================
   INDICADORES
================================ */

function carregarIndicadores(
    pagamentosPeriodo,
    receitas,
    despesasTotal,
    saldo,
    veiculos
) {

    const area =
        document.getElementById(
            "indicadores"
        );


    if (!area) {
        return;
    }


    /* ================================
       TICKET MÉDIO
    ================================= */

    let ticketMedio = 0;

    if (veiculos > 0) {

        ticketMedio =
            receitas / veiculos;

    }


    /* ================================
       MELHOR FORMA DE PAGAMENTO
    ================================= */

    const formas = {};


    pagamentosPeriodo.forEach(item => {

        const forma =
            item.formaPagamento ||
            "Não informado";

        const valor =
            Number(item.valor || 0);


        if (!formas[forma]) {

            formas[forma] = 0;

        }


        formas[forma] += valor;

    });


    let melhorForma =
        "Nenhuma";

    let maiorValorForma = 0;


    Object.keys(formas).forEach(forma => {

        if (
            formas[forma] >
            maiorValorForma
        ) {

            maiorValorForma =
                formas[forma];

            melhorForma =
                forma;

        }

    });


    /* ================================
       MAIOR RECEBIMENTO
    ================================= */

    let maiorRecebimento = 0;

    let clienteMaiorRecebimento =
        "";


    pagamentosPeriodo.forEach(item => {

        const valor =
            Number(item.valor || 0);


        if (
            valor >
            maiorRecebimento
        ) {

            maiorRecebimento =
                valor;

            clienteMaiorRecebimento =
                item.cliente ||
                "Cliente";

        }

    });


    /* ================================
       DESPESA SOBRE RECEITA
    ================================= */

    let percentualDespesas = 0;


    if (receitas > 0) {

        percentualDespesas =
            (despesasTotal / receitas) *
            100;

    }


    /* ================================
       MARGEM
    ================================= */

    let margem = 0;


    if (receitas > 0) {

        margem =
            (saldo / receitas) *
            100;

    }


    /* ================================
       HTML DOS INDICADORES
    ================================= */

    area.innerHTML = `

        <div class="row g-3">

            <!-- TICKET MÉDIO -->

            <div class="col-md-4">

                <div class="p-3 border rounded bg-light">

                    <div>
                        🎫 <strong>Ticket Médio</strong>
                    </div>

                    <div class="fs-4 fw-bold text-success mt-2">

                        € ${ticketMedio.toFixed(2)}

                    </div>

                    <small>
                        Média recebida por veículo
                    </small>

                </div>

            </div>


            <!-- MELHOR FORMA -->

            <div class="col-md-4">

                <div class="p-3 border rounded bg-light">

                    <div>
                        💳 <strong>Melhor Forma de Pagamento</strong>
                    </div>

                    <div class="fs-5 fw-bold mt-2">

                        ${melhorForma}

                    </div>

                    <small>
                        € ${maiorValorForma.toFixed(2)}
                    </small>

                </div>

            </div>


            <!-- MAIOR RECEBIMENTO -->

            <div class="col-md-4">

                <div class="p-3 border rounded bg-light">

                    <div>
                        🏆 <strong>Maior Recebimento</strong>
                    </div>

                    <div class="fs-4 fw-bold text-success mt-2">

                        € ${maiorRecebimento.toFixed(2)}

                    </div>

                    <small>
                        ${clienteMaiorRecebimento}
                    </small>

                </div>

            </div>


            <!-- VEÍCULOS -->

            <div class="col-md-4">

                <div class="p-3 border rounded bg-light">

                    <div>
                        🚗 <strong>Veículos Pagos</strong>
                    </div>

                    <div class="fs-4 fw-bold mt-2">

                        ${veiculos}

                    </div>

                    <small>
                        No período selecionado
                    </small>

                </div>

            </div>


            <!-- DESPESAS -->

            <div class="col-md-4">

                <div class="p-3 border rounded bg-light">

                    <div>
                        💸 <strong>Despesas / Receita</strong>
                    </div>

                    <div class="fs-4 fw-bold text-danger mt-2">

                        ${percentualDespesas.toFixed(1)}%

                    </div>

                    <small>
                        Percentual da receita consumido
                    </small>

                </div>

            </div>


            <!-- MARGEM -->

            <div class="col-md-4">

                <div class="p-3 border rounded bg-light">

                    <div>
                        📈 <strong>Margem do Período</strong>
                    </div>

                    <div class="fs-4 fw-bold text-primary mt-2">

                        ${margem.toFixed(1)}%

                    </div>

                    <small>
                        Resultado sobre a receita
                    </small>

                </div>

            </div>

        </div>

    `;

}


/* ================================
   ATUALIZAR ELEMENTO
================================ */

function atualizarElemento(
    id,
    valor
) {

    const elemento =
        document.getElementById(id);


    if (elemento) {

        elemento.textContent =
            valor;

    }

}


/* ================================
   EVENTOS
================================ */

const btnAplicarFiltro =
    document.getElementById(
        "btnAplicarFiltro"
    );


if (btnAplicarFiltro) {

    btnAplicarFiltro.addEventListener(
        "click",
        carregarRelatorios
    );

}


const filtroPeriodo =
    document.getElementById(
        "filtroPeriodo"
    );


if (filtroPeriodo) {

    filtroPeriodo.addEventListener(
        "change",
        carregarRelatorios
    );

}


/* ================================
   INICIAR
================================ */

carregarPagamentosFirebase();


/* ================================
   LOGOUT
================================ */

function logout() {

    if (
        !confirm(
            "Deseja sair do sistema?"
        )
    ) {

        return;

    }


    localStorage.removeItem(
        "perfil"
    );


    window.location.href =
        "login.html";

}


window.logout = logout;
