import { db } from "./firebase.js";

import {
collection,
addDoc,
deleteDoc,
doc,
updateDoc,
onSnapshot
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

/* =========================================
ACESSO
========================================= */

const perfilDespesa = localStorage.getItem("perfil");

if (!perfilDespesa) {
window.location.href = "login.html";
}

if (perfilDespesa === "funcionario") {
window.location.href = "pagamentos.html";
}

/* =========================================
DADOS
========================================= */

let despesas = [];

const despesasRef = collection(db, "despesas");

/* =========================================
SUBCATEGORIAS
========================================= */

const subcategorias = {

"Ordenados": [
    "ADM",
    "Funcionário 1",
    "Funcionário 2",
    "Outros"
],

"Ordenado Diário": [
    "Vitória",
    "Mariana",
    "Natália",
    "Eliane",
    "Outros"
],

"Comissões": [
    "ADM",
    "Funcionário 1",
    "Funcionário 2",
    "Outros"
],

"Despesas Operacionais": [
    "Produtos",
    "Material",
    "Fornecedores",
    "Equipamentos"
],

"Alimentação": [
    "Pequeno-almoço",
    "Almoço",
    "Jantar",
    "Café"
],

"Contas": [
    "Água",
    "Luz",
    "Internet",
    "Segurança Social",
    "Outros"
],

"Despesas Pessoais": [
    "Compras do Mês",
    "Compras da Semana",
    "Mercado",
    "Casa",
    "Renda da Casa",
    "Loja das Bombas",
    "Diversos"
],

"Cartões": [
    "Cartão Crédito Samuel CCA",
    "Cartão Crédito Samuel Millenium",
    "Cartão Crédito Samuel Cetelem",
    "Cartão Crédito Eliane"
],

"Combustível": [
    "Gasóleo",
    "Gasolina",
    "Outros"
],

"Oficina Mecânica": [
    "Reparação",
    "Peças",
    "Manutenção"
],

"Outros": [
    "Diversos"
]

};

/* =========================================
CARTÕES
========================================= */

const cartoes = {

"Cartão Crédito Samuel CCA": {
    id: "cca",
    nome: "Samuel CCA"
},

"Cartão Crédito Samuel Millenium": {
    id: "millenium",
    nome: "Samuel Millennium"
},

"Cartão Crédito Samuel Cetelem": {
    id: "cetelem",
    nome: "Samuel Cetelem"
},

"Cartão Crédito Eliane": {
    id: "eliane",
    nome: "Eliane"
}

};

/* =========================================
NOVOS CARTÕES DE DÉBITO
========================================= */

const subcategoriasDebito = [

"Cartão Débito Eliane Millennium",
"Cartão Débito Samuel CCA"

];

/* =========================================
FIRESTORE
IMPORTANTE:
firestoreId = ID REAL DO DOCUMENTO
========================================= */

onSnapshot(
despesasRef,
(snapshot) => {

    despesas = snapshot.docs.map((docSnap) => {

        return {
            ...docSnap.data(),

            /*
             * MUITO IMPORTANTE:
             * Alguns registros antigos possuem um campo
             * chamado "id" dentro dos dados.
             *
             * O Firestore possui outro ID:
             * docSnap.id
             *
             * Por isso usamos exclusivamente firestoreId
             * para atualizar ou excluir documentos.
             */

            firestoreId: docSnap.id
        };

    });

    atualizarTudo();

},
(error) => {

    console.error(
        "Erro ao carregar despesas:",
        error
    );

}

);

/* =========================================
ATUALIZAÇÃO GERAL
========================================= */

function atualizarTudo() {

atualizarResumo();

atualizarVisao();

atualizarCartoes();

atualizarApenasPagar();

carregarTabela();

}

/* =========================================
CATEGORIA → SUBCATEGORIA
========================================= */

const campoCategoria = document.getElementById("categoria");

if (campoCategoria) {

campoCategoria.addEventListener(
    "change",
    function () {

        const categoria = this.value;

        const select =
            document.getElementById("subcategoria");

        if (!select) return;

        select.innerHTML =
            '<option value="">Selecione</option>';

        if (!subcategorias[categoria]) {
            return;
        }

        subcategorias[categoria].forEach(
            (item) => {

                const option =
                    document.createElement("option");

                option.value = item;

                option.textContent = item;

                select.appendChild(option);

            }
        );

    }
);

}

/* =========================================
ORIGEM
========================================= */

const campoOrigem =
document.getElementById("origem");

if (campoOrigem) {

campoOrigem.addEventListener(
    "change",
    function () {

        const ehCartao =
            this.value === "Cartões";

        const ehDebito =
            this.value === "Cartão de Débito";

        const campoCartao =
            document.getElementById("campoCartao");

        const campoSituacao =
            document.getElementById("campoSituacao");

        const selectCartao =
            document.getElementById("cartao");

        const selectSituacao =
            document.getElementById("situacao");

        const selectSubcategoria =
            document.getElementById("subcategoria");


        if (ehCartao) {

            if (campoCartao) {
                campoCartao.classList.remove(
                    "campo-oculto"
                );
            }

            if (selectCartao) {
                selectCartao.required = true;
            }

            if (selectSituacao) {
                selectSituacao.value = "A Pagar";
            }

            if (campoSituacao) {
                campoSituacao.style.display = "none";
            }

        } else if (ehDebito) {

            if (campoCartao) {
                campoCartao.classList.add(
                    "campo-oculto"
                );
            }

            if (selectCartao) {
                selectCartao.required = false;
                selectCartao.value = "";
            }

            if (selectSubcategoria) {

                selectSubcategoria.innerHTML =
                    '<option value="">Selecione</option>';

                subcategoriasDebito.forEach(
                    (item) => {

                        const option =
                            document.createElement("option");

                        option.value = item;
                        option.textContent = item;

                        selectSubcategoria.appendChild(option);

                    }
                );

                selectSubcategoria.required = true;

            }

            if (selectSituacao) {
                selectSituacao.value = "Pago";
            }

            if (campoSituacao) {
                campoSituacao.style.display = "none";
            }

        } else {

            if (campoCartao) {
                campoCartao.classList.add(
                    "campo-oculto"
                );
            }

            if (selectCartao) {
                selectCartao.required = false;
                selectCartao.value = "";
            }

            if (selectSubcategoria) {
                selectSubcategoria.required = false;
            }

            if (campoSituacao) {
                campoSituacao.style.display = "block";
            }

            if (selectSituacao) {
                selectSituacao.value = "";
            }

            if (campoCategoria) {
                campoCategoria.dispatchEvent(
                    new Event("change")
                );
            }

        }

    }
);

}

/* =========================================
FILTRO DE CATEGORIAS
========================================= */

const filtroCategoria =
document.getElementById("filtroCategoria");

if (filtroCategoria) {

Object.keys(subcategorias).forEach(
    (categoria) => {

        const option =
            document.createElement("option");

        option.value = categoria;

        option.textContent = categoria;

        filtroCategoria.appendChild(option);

    }
);

}

/* =========================================
FORMULÁRIO
========================================= */

const formulario =
document.getElementById("formDespesa");

if (formulario) {

formulario.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        try {

            const nome =
                document.getElementById("nome")?.value.trim() || "";

            const categoria =
                document.getElementById("categoria")?.value || "";

            const origem =
                document.getElementById("origem")?.value || "";

            const subcategoria =
                document.getElementById("subcategoria")?.value || "";

            const cartao =
                document.getElementById("cartao")?.value || "";

            const valorCampo =
                document.getElementById("valor")?.value || "0";

            const observacao =
                document.getElementById("observacao")?.value.trim() || "";

            const dataCampo =
                document.getElementById("data")?.value || "";

            const situacaoCampo =
                document.getElementById("situacao")?.value || "";


            const valor =
                Number(
                    valorCampo
                        .replace(",", ".")
                );


            if (!nome) {

                alert(
                    "Informe o nome da despesa."
                );

                return;

            }


            if (!categoria) {

                alert(
                    "Selecione uma categoria."
                );

                return;

            }


            if (!origem) {

                alert(
                    "Selecione a origem."
                );

                return;

            }


            const ehCartao =
                origem === "Cartões";

            const ehDebito =
                origem === "Cartão de Débito";


            let situacao =
                situacaoCampo;


            /*
             * Cartão de débito:
             *
             * A despesa já foi paga.
             * Portanto entra diretamente como Pago.
             */

            if (ehDebito) {

                situacao = "Pago";

            }


            /*
             * Para cartão de crédito,
             * a subcategoria é o cartão selecionado.
             */

            let subcategoriaFinal =
                subcategoria;


            if (ehCartao) {

                if (!cartao) {

                    alert(
                        "Selecione o cartão de crédito."
                    );

                    return;

                }

                subcategoriaFinal =
                    cartao;

                situacao = "A Pagar";

            }


            if (!subcategoriaFinal) {

                alert(
                    "Selecione uma subcategoria."
                );

                return;

            }


            if (!valor || valor <= 0) {

                alert(
                    "Informe um valor válido."
                );

                return;

            }


            if (!dataCampo) {

                alert(
                    "Informe a data da despesa."
                );

                return;

            }


            /*
             * Tipo da despesa
             */

            let tipo = "normal";

            if (ehCartao) {

                tipo = "cartao";

            } else if (ehDebito) {

                tipo = "debito";

            }


            /*
             * Crédito:
             * fica Aberto até Dar Baixa.
             *
             * Débito:
             * já fica Pago.
             *
             * Normal:
             * respeita a situação escolhida.
             */

            const status =
                ehCartao
                    ? "Aberto"
                    : situacao;


            /*
             * Para débito, a própria data
             * da despesa é a data do pagamento.
             */

            const dataPagamento =
                ehDebito
                    ? dataCampo
                    : "";


            /*
             * Para débito, guardamos
             * a conta/cartão utilizado
             * em origemPagamento.
             *
             * Exemplo:
             * Cartão Débito Eliane Millennium
             * Cartão Débito Samuel CCA
             */

            const origemPagamento =
                ehDebito
                    ? subcategoriaFinal
                    : "";


            const novaDespesa = {

                nome,

                categoria,

                subcategoria:
                    subcategoriaFinal,

                origem,

                valor,

                observacao,

                data:
                    dataCampo,

                situacao,

                status,

                tipo,

                cartao:
                    ehCartao
                        ? cartao
                        : "",

                statusCartao:
                    ehCartao
                        ? "Aberto"
                        : "",

                dataPagamento,

                origemPagamento

            };


            await addDoc(
                despesasRef,
                novaDespesa
            );


            alert(
                "Despesa registada com sucesso!"
            );


            formulario.reset();


            /*
             * Depois de gravar,
             * restauramos o estado normal
             * do formulário.
             */

            const campoCartao =
                document.getElementById("campoCartao");

            const campoSituacao =
                document.getElementById("campoSituacao");

            const selectCartao =
                document.getElementById("cartao");

            const selectSituacao =
                document.getElementById("situacao");

            const selectSubcategoria =
                document.getElementById("subcategoria");


            if (campoCartao) {

                campoCartao.classList.add(
                    "campo-oculto"
                );

            }


            if (selectCartao) {

                selectCartao.required = false;

            }


            if (selectSubcategoria) {

                selectSubcategoria.required = false;

                selectSubcategoria.innerHTML =
                    '<option value="">Selecione</option>';

            }


            if (campoSituacao) {

                campoSituacao.style.display =
                    "block";

            }


            if (selectSituacao) {

                selectSituacao.value = "";

            }


        } catch (error) {

            console.error(
                "Erro ao guardar despesa:",
                error
            );

            alert(
                "Não foi possível guardar a despesa."
            );

        }

    }
);

}


/* =========================================
RESUMO
========================================= */

function atualizarResumo() {

const hoje =
new Date();

const anoAtual =
hoje.getFullYear();

const mesAtual =
hoje.getMonth();


let totalMes = 0;

let totalPago = 0;

let totalAberto = 0;

let totalCartoes = 0;

let totalHoje = 0;

let totalDebito = 0;


despesas.forEach(
    (despesa) => {

        if (!despesa.data) {
            return;
        }


        const data =
            new Date(
                despesa.data + "T00:00:00"
            );


        if (
            data.getFullYear() !== anoAtual ||
            data.getMonth() !== mesAtual
        ) {

            return;

        }


        const valor =
            Number(despesa.valor) || 0;


        totalMes += valor;


        const status =
            String(
                despesa.status ||
                despesa.situacao ||
                ""
            ).toLowerCase();


        if (
            status === "pago"
        ) {

            totalPago += valor;

        }


        if (
            status === "aberto" ||
            status === "a pagar"
        ) {

            totalAberto += valor;

        }


        /*
         * Cartões de crédito
         */

        if (
            despesa.origem === "Cartões" ||
            despesa.tipo === "cartao"
        ) {

            if (
                status === "aberto" ||
                status === "a pagar"
            ) {

                totalCartoes += valor;

            }

        }


        /*
         * Cartões de débito
         */

        if (
            despesa.origem === "Cartão de Débito"
        ) {

            totalDebito += valor;

        }


        /*
         * Despesas de hoje
         */

        const dataHoje =
            hoje.toISOString()
                .split("T")[0];


        if (
            despesa.data === dataHoje
        ) {

            totalHoje += valor;

        }

    }
);


/* =========================================
ATUALIZA OS CARDS
========================================= */

definirTexto(
    "totalMes",
    formatarEuro(totalMes)
);


definirTexto(
    "totalPago",
    formatarEuro(totalPago)
);


definirTexto(
    "totalAberto",
    formatarEuro(totalAberto)
);


definirTexto(
    "totalCartoes",
    formatarEuro(totalCartoes)
);


definirTexto(
    "totalHoje",
    formatarEuro(totalHoje)
);


/*
 * Novo card:
 * Débito pago no mês
 */

definirTexto(
    "totalDebito",
    formatarEuro(totalDebito)
);

}


/* =========================================
FORMATAR EURO
========================================= */

function formatarEuro(valor) {

return Number(valor || 0)
    .toLocaleString(
        "pt-PT",
        {
            style: "currency",
            currency: "EUR"
        }
    );

}


/* =========================================
DEFINIR TEXTO
========================================= */

function definirTexto(
    id,
    texto
) {

const elemento =
document.getElementById(id);

if (elemento) {

    elemento.textContent = texto;

}

}

/* =========================================
VISÃO GERAL
========================================= */

function atualizarVisao() {

const tabela =
document.getElementById("tabelaDespesas");

if (!tabela) return;

const corpo =
tabela.querySelector("tbody");

if (!corpo) return;

corpo.innerHTML = "";


/* =========================================
ORDENAÇÃO
Mais recente primeiro
========================================= */

const lista =
[...despesas].sort(
    (a, b) => {

        const dataA =
            new Date(
                (a.data || "") +
                "T00:00:00"
            );

        const dataB =
            new Date(
                (b.data || "") +
                "T00:00:00"
            );

        return dataB - dataA;

    }
);


/* =========================================
MONTAR TABELA
========================================= */

lista.forEach(
    (despesa) => {

        const tr =
            document.createElement("tr");


        const status =
            despesa.status ||
            despesa.situacao ||
            "";


        let classeStatus = "";


        if (
            String(status)
                .toLowerCase() === "pago"
        ) {

            classeStatus =
                "status-pago";

        } else if (
            String(status)
                .toLowerCase() === "aberto" ||
            String(status)
                .toLowerCase() === "a pagar"
        ) {

            classeStatus =
                "status-aberto";

        }


        tr.innerHTML = `

            <td>
                ${formatarData(despesa.data)}
            </td>

            <td>
                ${escaparHTML(despesa.nome)}
            </td>

            <td>
                ${escaparHTML(
                    despesa.categoria || ""
                )}
            </td>

            <td>
                ${escaparHTML(
                    despesa.subcategoria || ""
                )}
            </td>

            <td>
                ${escaparHTML(
                    despesa.origem || ""
                )}
            </td>

            <td>
                ${formatarEuro(
                    despesa.valor
                )}
            </td>

            <td class="${classeStatus}">
                ${escaparHTML(status)}
            </td>

            <td>
                ${escaparHTML(
                    despesa.observacao || ""
                )}
            </td>

        `;


        corpo.appendChild(tr);

    }
);

}


/* =========================================
ATUALIZAR CARTÕES
========================================= */

function atualizarCartoes() {

const container =
document.getElementById("cardsCartoes");

if (!container) return;

container.innerHTML = "";


Object.entries(cartoes)
.forEach(
    ([nomeCartao, dados]) => {

        let total = 0;


        despesas.forEach(
            (despesa) => {

                const ehCartao =
                    despesa.origem === "Cartões" ||
                    despesa.tipo === "cartao";


                if (!ehCartao) {
                    return;
                }


                const cartaoDespesa =
                    despesa.cartao ||
                    despesa.subcategoria;


                if (
                    cartaoDespesa !== nomeCartao
                ) {
                    return;
                }


                const status =
                    String(
                        despesa.status ||
                        despesa.situacao ||
                        ""
                    ).toLowerCase();


                if (
                    status === "aberto" ||
                    status === "a pagar"
                ) {

                    total +=
                        Number(despesa.valor) || 0;

                }

            }
        );


        const card =
            document.createElement("div");

        card.className =
            "card-cartao";


        card.innerHTML = `

            <div class="cartao-titulo">
                ${escaparHTML(dados.nome)}
            </div>

            <div class="cartao-valor">
                ${formatarEuro(total)}
            </div>

            <div class="cartao-legenda">
                Em aberto
            </div>

        `;


        container.appendChild(card);

    }
);

}


/* =========================================
TABELA DE CARTÕES
========================================= */

function carregarTabelaCartoes() {

const tabela =
document.getElementById(
    "tabelaCartoes"
);

if (!tabela) return;

const corpo =
tabela.querySelector("tbody");

if (!corpo) return;

corpo.innerHTML = "";


const lista =
despesas.filter(
    (despesa) => {

        const ehCartao =
            despesa.origem === "Cartões" ||
            despesa.tipo === "cartao";


        if (!ehCartao) {
            return false;
        }


        const status =
            String(
                despesa.status ||
                despesa.situacao ||
                ""
            ).toLowerCase();


        return (
            status === "aberto" ||
            status === "a pagar"
        );

    }
);


lista.forEach(
    (despesa) => {

        const tr =
            document.createElement("tr");


        const nomeCartao =
            despesa.cartao ||
            despesa.subcategoria ||
            "";


        tr.innerHTML = `

            <td>
                ${formatarData(
                    despesa.data
                )}
            </td>

            <td>
                ${escaparHTML(
                    despesa.nome
                )}
            </td>

            <td>
                ${escaparHTML(
                    nomeCartao
                )}
            </td>

            <td>
                ${formatarEuro(
                    despesa.valor
                )}
            </td>

            <td>
                <button
                    type="button"
                    class="btn-baixa"
                    onclick="abrirModalPagamento('${despesa.firestoreId}')"
                >
                    Dar baixa
                </button>
            </td>

        `;


        corpo.appendChild(tr);

    }
);

}


/* =========================================
APENAS A PAGAR
========================================= */

function atualizarApenasPagar() {

const tabela =
document.getElementById(
    "tabelaPagar"
);

if (!tabela) return;

const corpo =
tabela.querySelector("tbody");

if (!corpo) return;

corpo.innerHTML = "";


const lista =
despesas.filter(
    (despesa) => {

        const status =
            String(
                despesa.status ||
                despesa.situacao ||
                ""
            ).toLowerCase();


        return (
            status === "aberto" ||
            status === "a pagar"
        );

    }
);


lista.forEach(
    (despesa) => {

        const tr =
            document.createElement("tr");


        tr.innerHTML = `

            <td>
                ${formatarData(
                    despesa.data
                )}
            </td>

            <td>
                ${escaparHTML(
                    despesa.nome
                )}
            </td>

            <td>
                ${escaparHTML(
                    despesa.categoria
                )}
            </td>

            <td>
                ${escaparHTML(
                    despesa.subcategoria
                )}
            </td>

            <td>
                ${formatarEuro(
                    despesa.valor
                )}
            </td>

            <td>
                <button
                    type="button"
                    class="btn-pagar"
                    onclick="marcarDespesaPaga('${despesa.firestoreId}')"
                >
                    Pagar
                </button>
            </td>

        `;


        corpo.appendChild(tr);

    }
);


/* =========================================
ATUALIZA TABELA ESPECÍFICA DE CARTÕES
========================================= */

carregarTabelaCartoes();

}

/* =========================================
CARREGAR TABELA PRINCIPAL
========================================= */

function carregarTabela() {

const tabela =
document.getElementById(
    "tabelaHistorico"
);

if (!tabela) return;

const corpo =
tabela.querySelector("tbody");

if (!corpo) return;

corpo.innerHTML = "";


const lista =
[...despesas].sort(
    (a, b) => {

        const dataA =
            new Date(
                (a.data || "") +
                "T00:00:00"
            );

        const dataB =
            new Date(
                (b.data || "") +
                "T00:00:00"
            );

        return dataB - dataA;

    }
);


lista.forEach(
    (despesa) => {

        const tr =
            document.createElement("tr");


        const status =
            despesa.status ||
            despesa.situacao ||
            "";


        let informacaoPagamento = "";


        if (
            String(status)
                .toLowerCase() === "pago"
        ) {

            if (despesa.dataPagamento) {

                informacaoPagamento +=
                    `Pago em ${formatarData(
                        despesa.dataPagamento
                    )}`;

            }


            if (despesa.origemPagamento) {

                informacaoPagamento +=
                    ` — ${escaparHTML(
                        despesa.origemPagamento
                    )}`;

            }

        }


        const botoes = [];


        /*
         * Despesa em aberto:
         * permite marcar como paga.
         */

        if (
            String(status)
                .toLowerCase() === "aberto" ||
            String(status)
                .toLowerCase() === "a pagar"
        ) {

            botoes.push(`
                <button
                    type="button"
                    class="btn-pagar"
                    onclick="marcarDespesaPaga('${despesa.firestoreId}')"
                >
                    Pagar
                </button>
            `);

        }


        /*
         * Excluir:
         * utiliza sempre o firestoreId.
         */

        botoes.push(`
            <button
                type="button"
                class="btn-excluir"
                onclick="excluirDespesa('${despesa.firestoreId}')"
            >
                Excluir
            </button>
        `);


        tr.innerHTML = `

            <td>
                ${formatarData(
                    despesa.data
                )}
            </td>

            <td>
                ${escaparHTML(
                    despesa.nome
                )}
            </td>

            <td>
                ${escaparHTML(
                    despesa.categoria || ""
                )}
            </td>

            <td>
                ${escaparHTML(
                    despesa.subcategoria || ""
                )}
            </td>

            <td>
                ${escaparHTML(
                    despesa.origem || ""
                )}
            </td>

            <td>
                ${formatarEuro(
                    despesa.valor
                )}
            </td>

            <td>
                ${escaparHTML(status)}
            </td>

            <td>
                ${informacaoPagamento}
            </td>

            <td>
                ${botoes.join("")}
            </td>

        `;


        corpo.appendChild(tr);

    }
);


/*
 * Também atualiza a tabela dos cartões.
 */

carregarTabelaCartoes();

}


/* =========================================
FILTRO DE DESPESAS
========================================= */

function filtrarDespesas() {

const campoDataInicial =
document.getElementById(
    "filtroDataInicial"
);

const campoDataFinal =
document.getElementById(
    "filtroDataFinal"
);

const campoCategoria =
document.getElementById(
    "filtroCategoria"
);

const campoOrigem =
document.getElementById(
    "filtroOrigem"
);


const dataInicial =
campoDataInicial?.value || "";

const dataFinal =
campoDataFinal?.value || "";

const categoria =
campoCategoria?.value || "";

const origem =
campoOrigem?.value || "";


const tabela =
document.getElementById(
    "tabelaHistorico"
);

if (!tabela) return;


const corpo =
tabela.querySelector("tbody");

if (!corpo) return;

corpo.innerHTML = "";


const lista =
despesas.filter(
    (despesa) => {

        if (
            dataInicial &&
            despesa.data < dataInicial
        ) {

            return false;

        }


        if (
            dataFinal &&
            despesa.data > dataFinal
        ) {

            return false;

        }


        if (
            categoria &&
            despesa.categoria !== categoria
        ) {

            return false;

        }


        if (
            origem &&
            despesa.origem !== origem
        ) {

            return false;

        }


        return true;

    }
)
.sort(
    (a, b) => {

        const dataA =
            new Date(
                (a.data || "") +
                "T00:00:00"
            );

        const dataB =
            new Date(
                (b.data || "") +
                "T00:00:00"
            );

        return dataB - dataA;

    }
);


lista.forEach(
    (despesa) => {

        const tr =
            document.createElement("tr");


        const status =
            despesa.status ||
            despesa.situacao ||
            "";


        let pagamento = "";


        if (
            String(status)
                .toLowerCase() === "pago"
        ) {

            pagamento =
                despesa.dataPagamento
                    ? `Pago em ${formatarData(
                        despesa.dataPagamento
                    )}`
                    : "Pago";


            if (
                despesa.origemPagamento
            ) {

                pagamento +=
                    ` — ${escaparHTML(
                        despesa.origemPagamento
                    )}`;

            }

        }


        tr.innerHTML = `

            <td>
                ${formatarData(
                    despesa.data
                )}
            </td>

            <td>
                ${escaparHTML(
                    despesa.nome
                )}
            </td>

            <td>
                ${escaparHTML(
                    despesa.categoria || ""
                )}
            </td>

            <td>
                ${escaparHTML(
                    despesa.subcategoria || ""
                )}
            </td>

            <td>
                ${escaparHTML(
                    despesa.origem || ""
                )}
            </td>

            <td>
                ${formatarEuro(
                    despesa.valor
                )}
            </td>

            <td>
                ${escaparHTML(status)}
            </td>

            <td>
                ${pagamento}
            </td>

            <td>

                <button
                    type="button"
                    class="btn-excluir"
                    onclick="excluirDespesa('${despesa.firestoreId}')"
                >
                    Excluir
                </button>

            </td>

        `;


        corpo.appendChild(tr);

    }
);


/*
 * Se não houver resultados.
 */

if (!lista.length) {

    const tr =
        document.createElement("tr");

    tr.innerHTML = `
        <td
            colspan="10"
            style="text-align:center;"
        >
            Nenhuma despesa encontrada.
        </td>
    `;

    corpo.appendChild(tr);

}

}


/* =========================================
EVENTOS DOS FILTROS
========================================= */

[
    "filtroDataInicial",
    "filtroDataFinal",
    "filtroCategoria",
    "filtroOrigem"
].forEach(
    (id) => {

        const elemento =
            document.getElementById(id);

        if (!elemento) return;

        elemento.addEventListener(
            "change",
            filtrarDespesas
        );

    }
);


/* =========================================
LIMPAR FILTROS
========================================= */

const btnLimparFiltros =
document.getElementById(
    "limparFiltros"
);

if (btnLimparFiltros) {

btnLimparFiltros.addEventListener(
    "click",
    () => {

        const ids = [

            "filtroDataInicial",
            "filtroDataFinal",
            "filtroCategoria",
            "filtroOrigem"

        ];


        ids.forEach(
            (id) => {

                const elemento =
                    document.getElementById(id);

                if (elemento) {

                    elemento.value = "";

                }

            }
        );


        carregarTabela();

    }
);

}


/* =========================================
MODAL — DAR BAIXA
========================================= */

let despesaSelecionadaParaPagamento =
null;


function abrirModalPagamento(
    firestoreId
) {

    const despesa =
        despesas.find(
            (item) =>
                item.firestoreId === firestoreId
        );


    if (!despesa) {

        alert(
            "Despesa não encontrada."
        );

        return;

    }


    despesaSelecionadaParaPagamento =
        despesa;


    const modal =
        document.getElementById(
            "modalPagamento"
        );


    if (!modal) return;


    const nome =
        document.getElementById(
            "nomeDespesaPagamento"
        );


    const valor =
        document.getElementById(
            "valorDespesaPagamento"
        );


    if (nome) {

        nome.textContent =
            despesa.nome || "";

    }


    if (valor) {

        valor.textContent =
            formatarEuro(
                despesa.valor
            );

    }


    /*
     * Limpa a seleção anterior.
     */

    const origemPagamento =
        document.getElementById(
            "origemPagamento"
        );


    if (origemPagamento) {

        origemPagamento.value = "";

    }


    modal.classList.add(
        "ativo"
    );

    modal.style.display =
        "flex";

}


/* =========================================
FECHAR MODAL
========================================= */

function fecharModalPagamento() {

const modal =
document.getElementById(
    "modalPagamento"
);

if (!modal) return;


modal.classList.remove(
    "ativo"
);

modal.style.display =
    "none";


despesaSelecionadaParaPagamento =
    null;

}


/* =========================================
CONFIRMAR PAGAMENTO DO CARTÃO
========================================= */

async function confirmarPagamentoCartao() {

if (
    !despesaSelecionadaParaPagamento
) {

    alert(
        "Nenhuma despesa selecionada."
    );

    return;

}


const origemPagamento =
document.getElementById(
    "origemPagamento"
);


const origem =
origemPagamento?.value || "";


if (!origem) {

    alert(
        "Selecione de onde saiu o dinheiro."
    );

    return;

}


const despesa =
despesaSelecionadaParaPagamento;


try {

    await updateDoc(
        doc(
            db,
            "despesas",
            despesa.firestoreId
        ),
        {

            status: "Pago",

            situacao: "Pago",

            statusCartao: "Pago",

            dataPagamento:
                new Date()
                    .toISOString()
                    .split("T")[0],

            origemPagamento:
                origem

        }
    );


    alert(
        "Pagamento registado com sucesso!"
    );


    fecharModalPagamento();


} catch (error) {

    console.error(
        "Erro ao registar pagamento:",
        error
    );


    alert(
        "Não foi possível registar o pagamento."
    );

}

}


/* =========================================
MARCAR DESPESA NORMAL COMO PAGA
========================================= */

async function marcarDespesaPaga(
    firestoreId
) {

const despesa =
    despesas.find(
        (item) =>
            item.firestoreId === firestoreId
    );


if (!despesa) {

    alert(
        "Despesa não encontrada."
    );

    return;

}


try {

    await updateDoc(
        doc(
            db,
            "despesas",
            firestoreId
        ),
        {

            status: "Pago",

            situacao: "Pago",

            dataPagamento:
                new Date()
                    .toISOString()
                    .split("T")[0],

            origemPagamento:
                despesa.origem || ""

        }
    );


    alert(
        "Despesa marcada como paga."
    );


} catch (error) {

    console.error(
        "Erro ao marcar despesa como paga:",
        error
    );


    alert(
        "Não foi possível atualizar a despesa."
    );

}

}


/* =========================================
EXCLUIR DESPESA
========================================= */

async function excluirDespesa(
    firestoreId
) {

if (!firestoreId) {

    alert(
        "ID da despesa não encontrado."
    );

    return;

}


const confirmar =
    confirm(
        "Tem certeza que deseja excluir esta despesa?"
    );


if (!confirmar) return;


try {

    await deleteDoc(
        doc(
            db,
            "despesas",
            firestoreId
        )
    );


    alert(
        "Despesa excluída com sucesso."
    );


} catch (error) {

    console.error(
        "Erro ao excluir despesa:",
        error
    );


    alert(
        "Não foi possível excluir a despesa."
    );

}

}

/* =========================================
FUNÇÕES AUXILIARES
========================================= */

function formatarData(data) {

    if (!data) {
        return "";
    }

    const partes =
        String(data).split("-");

    if (partes.length === 3) {

        return `${partes[2]}/${partes[1]}/${partes[0]}`;

    }

    return data;

}


/* =========================================
ESCAPAR HTML
========================================= */

function escaparHTML(valor) {

    if (valor === null ||
        valor === undefined) {

        return "";

    }

    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================
FECHAR MODAL AO CLICAR FORA
========================================= */

const modalPagamento =
    document.getElementById(
        "modalPagamento"
    );

if (modalPagamento) {

    modalPagamento.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                modalPagamento
            ) {

                fecharModalPagamento();

            }

        }
    );

}


/* =========================================
BOTÃO CONFIRMAR PAGAMENTO
========================================= */

const btnConfirmarPagamento =
    document.getElementById(
        "confirmarPagamento"
    );

if (btnConfirmarPagamento) {

    btnConfirmarPagamento.addEventListener(
        "click",
        confirmarPagamentoCartao
    );

}


/* =========================================
BOTÃO FECHAR MODAL
========================================= */

const btnFecharModal =
    document.getElementById(
        "fecharModalPagamento"
    );

if (btnFecharModal) {

    btnFecharModal.addEventListener(
        "click",
        fecharModalPagamento
    );

}


/* =========================================
BOTÃO CANCELAR MODAL
========================================= */

const btnCancelarPagamento =
    document.getElementById(
        "cancelarPagamento"
    );

if (btnCancelarPagamento) {

    btnCancelarPagamento.addEventListener(
        "click",
        fecharModalPagamento
    );

}


/* =========================================
ATUALIZAR FILTRO DE ORIGEM
========================================= */

const filtroOrigem =
    document.getElementById(
        "filtroOrigem"
    );

if (filtroOrigem) {

    /*
     * Mantém as opções existentes
     * e garante a existência de
     * Cartão de Débito.
     */

    const existeDebito =
        Array.from(
            filtroOrigem.options
        ).some(
            option =>
                option.value ===
                "Cartão de Débito"
        );


    if (!existeDebito) {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            "Cartão de Débito";

        option.textContent =
            "Cartão de Débito";

        filtroOrigem.appendChild(
            option
        );

    }

}


/* =========================================
EXPORTAÇÕES
========================================= */

window.abrirModalPagamento =
    abrirModalPagamento;


window.fecharModalPagamento =
    fecharModalPagamento;


window.confirmarPagamentoCartao =
    confirmarPagamentoCartao;


window.marcarDespesaPaga =
    marcarDespesaPaga;


window.excluirDespesa =
    excluirDespesa;


window.filtrarDespesas =
    filtrarDespesas;


window.carregarTabela =
    carregarTabela;


/* =========================================
INICIALIZAÇÃO
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
         * A sincronização principal
         * é feita pelo onSnapshot.
         *
         * Aqui apenas garantimos que
         * os elementos existentes sejam
         * atualizados quando a página
         * termina de carregar.
         */

        atualizarTudo();

    }
);
