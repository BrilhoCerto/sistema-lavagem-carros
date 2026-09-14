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
   CARREGAR PAGAMENTOS DO FIRESTORE
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
   CARREGAR DESPESAS DO FIRESTORE
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
       RECEITAS / PAGAMENTOS
    ================================= */

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
                        Despesa
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

    const receitaHoje =
        document.getElementById(
            "receitaHoje"
        );

    if (receitaHoje) {

        receitaHoje.textContent =
            "€ " +
            receitas.toFixed(2);

    }


    const despesaHoje =
        document.getElementById(
            "despesaHoje"
        );

    if (despesaHoje) {

        despesaHoje.textContent =
            "€ " +
            despesasTotal.toFixed(2);

    }


    const saldoHoje =
        document.getElementById(
            "saldoHoje"
        );

    if (saldoHoje) {

        saldoHoje.textContent =
            "€ " +
            saldo.toFixed(2);

    }


    const veiculosHoje =
        document.getElementById(
            "veiculosHoje"
        );

    if (veiculosHoje) {

        veiculosHoje.textContent =
            veiculos;

    }


    const totalReceitas =
        document.getElementById(
            "totalReceitas"
        );

    if (totalReceitas) {

        totalReceitas.textContent =
            "€ " +
            receitas.toFixed(2);

    }


    const totalDespesas =
        document.getElementById(
            "totalDespesas"
        );

    if (totalDespesas) {

        totalDespesas.textContent =
            "€ " +
            despesasTotal.toFixed(2);

    }


    const saldoPeriodo =
        document.getElementById(
            "saldoPeriodo"
        );

    if (saldoPeriodo) {

        saldoPeriodo.textContent =
            "€ " +
            saldo.toFixed(2);

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
