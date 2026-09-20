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

const despesasRef =
    collection(db, "despesas");


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
   CARTÕES DE CRÉDITO
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
   CARTÕES DE DÉBITO
========================================= */

const cartoesDebito = {

    "Cartão Débito Eliane Millennium": {
        id: "debito-eliane-millennium",
        nome: "Eliane Millennium"
    },

    "Cartão Débito Samuel CCA": {
        id: "debito-samuel-cca",
        nome: "Samuel CCA"
    }

};


/* =========================================
   FIRESTORE
========================================= */

onSnapshot(
    despesasRef,
    (snapshot) => {

        despesas =
            snapshot.docs.map(
                (docSnap) => {

                    return {

                        ...docSnap.data(),

                        firestoreId:
                            docSnap.id

                    };

                }
            );


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

    preencherFiltroCategorias();

}


/* =========================================
   CATEGORIA → SUBCATEGORIA
========================================= */

const campoCategoria =
    document.getElementById(
        "categoria"
    );


if (campoCategoria) {

    campoCategoria.addEventListener(
        "change",
        function () {

            const categoria =
                this.value;


            const select =
                document.getElementById(
                    "subcategoria"
                );


            if (!select) {
                return;
            }


            const origemAtual =
                document.getElementById(
                    "origem"
                )?.value || "";


            if (
                origemAtual ===
                "Cartão de Débito"
            ) {

                preencherSubcategoriaDebito();

                return;

            }


            select.innerHTML =
                '<option value="">Selecione</option>';


            if (
                !subcategorias[
                    categoria
                ]
            ) {

                return;

            }


            subcategorias[
                categoria
            ].forEach(
                (item) => {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        item;


                    option.textContent =
                        item;


                    select.appendChild(
                        option
                    );

                }
            );

        }
    );

}


/* =========================================
   FORMA DE PAGAMENTO
========================================= */

const campoOrigem =
    document.getElementById(
        "origem"
    );


if (campoOrigem) {

    campoOrigem.addEventListener(
        "change",
        function () {

            const origem =
                this.value;


            const ehCredito =
                origem === "Cartões";


            const ehDebito =
                origem ===
                "Cartão de Débito";


            const campoCartao =
                document.getElementById(
                    "campoCartao"
                );


            const campoSituacao =
                document.getElementById(
                    "campoSituacao"
                );


            const selectCartao =
                document.getElementById(
                    "cartao"
                );


            const selectSituacao =
                document.getElementById(
                    "situacao"
                );


            if (ehCredito) {

                if (campoCartao) {

                    campoCartao.classList.remove(
                        "campo-oculto"
                    );

                }


                if (selectCartao) {

                    selectCartao.required =
                        true;

                }


                atualizarOpcoesCartao();


                if (selectSituacao) {

                    selectSituacao.value =
                        "A Pagar";

                }


                if (campoSituacao) {

                    campoSituacao.style.display =
                        "none";

                }

            }

            else if (ehDebito) {

                if (campoCartao) {

                    campoCartao.classList.add(
                        "campo-oculto"
                    );

                }


                if (selectCartao) {

                    selectCartao.required =
                        false;

                    selectCartao.value =
                        "";

                }


                preencherSubcategoriaDebito();


                if (selectSituacao) {

                    selectSituacao.value =
                        "Pago";

                }


                if (campoSituacao) {

                    campoSituacao.style.display =
                        "none";

                }

            }

            else {

                if (campoCartao) {

                    campoCartao.classList.add(
                        "campo-oculto"
                    );

                }


                if (selectCartao) {

                    selectCartao.required =
                        false;

                    selectCartao.value =
                        "";

                }


                if (campoSituacao) {

                    campoSituacao.style.display =
                        "block";

                }


                const categoriaAtual =
                    document.getElementById(
                        "categoria"
                    )?.value || "";


                preencherSubcategoriaCategoria(
                    categoriaAtual
                );

            }

        }
    );

}


/* =========================================
   SUBCATEGORIA CARTÃO DÉBITO
========================================= */

function preencherSubcategoriaDebito() {

    const select =
        document.getElementById(
            "subcategoria"
        );


    if (!select) {
        return;
    }


    select.innerHTML =
        '<option value="">Selecione o cartão de débito</option>';


    Object.keys(
        cartoesDebito
    ).forEach(
        (nome) => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                nome;


            option.textContent =
                nome;


            select.appendChild(
                option
            );

        }
    );

}


/* =========================================
   SUBCATEGORIA NORMAL
========================================= */

function preencherSubcategoriaCategoria(
    categoria
) {

    const select =
        document.getElementById(
            "subcategoria"
        );


    if (!select) {
        return;
    }


    select.innerHTML =
        '<option value="">Selecione</option>';


    if (
        !subcategorias[
            categoria
        ]
    ) {

        return;

    }


    subcategorias[
        categoria
    ].forEach(
        (item) => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                item;


            option.textContent =
                item;


            select.appendChild(
                option
            );

        }
    );

}


/* =========================================
   OPÇÕES CARTÃO CRÉDITO
========================================= */

function atualizarOpcoesCartao() {

    const select =
        document.getElementById(
            "cartao"
        );


    if (!select) {
        return;
    }


    select.innerHTML =
        '<option value="">Selecione o cartão</option>';


    Object.keys(
        cartoes
    ).forEach(
        (nome) => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                nome;


            option.textContent =
                cartoes[
                    nome
                ].nome;


            select.appendChild(
                option
            );

        }
    );

}


/* =========================================
   FORMULÁRIO
========================================= */

const formDespesa =
    document.getElementById(
        "formDespesa"
    );


if (formDespesa) {

    formDespesa.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const data =
                document.getElementById(
                    "dataDespesa"
                ).value;


            const descricao =
                document.getElementById(
                    "descricao"
                ).value.trim();


            const categoria =
                document.getElementById(
                    "categoria"
                ).value;


            const subcategoria =
                document.getElementById(
                    "subcategoria"
                ).value;


            const origem =
                document.getElementById(
                    "origem"
                ).value;


            const cartao =
                document.getElementById(
                    "cartao"
                ).value;


            const valor =
                Number(
                    document.getElementById(
                        "valor"
                    ).value
                );


            const observacoes =
                document.getElementById(
                    "observacoes"
                ).value.trim();


            const situacao =
                document.getElementById(
                    "situacao"
                ).value;


            const ehCredito =
                origem === "Cartões";


            const ehDebito =
                origem ===
                "Cartão de Débito";


            if (!data) {

                alert(
                    "Informe a data da despesa."
                );

                return;

            }


            if (!descricao) {

                alert(
                    "Informe a descrição."
                );

                return;

            }


            if (!categoria) {

                alert(
                    "Selecione a categoria."
                );

                return;

            }


            if (!subcategoria) {

                alert(
                    "Selecione a subcategoria."
                );

                return;

            }


            if (!origem) {

                alert(
                    "Selecione a forma de pagamento."
                );

                return;

            }


            if (
                isNaN(valor) ||
                valor < 0
            ) {

                alert(
                    "Informe um valor válido."
                );

                return;

            }


            if (
                ehCredito &&
                !cartao
            ) {

                alert(
                    "Selecione qual cartão de crédito foi utilizado."
                );

                return;

            }


            if (
                ehDebito &&
                !cartoesDebito[
                    subcategoria
                ]
            ) {

                alert(
                    "Selecione o cartão de débito utilizado."
                );

                return;

            }


            try {

                let statusFinal =
                    situacao;


                let cartaoFinal =
                    "";


                if (ehCredito) {

                    statusFinal =
                        "A Pagar";

                    cartaoFinal =
                        cartao;

                }


                if (ehDebito) {

                    statusFinal =
                        "Pago";

                    cartaoFinal =
                        subcategoria;

                }


                const novaDespesa = {

                    data:
                        data,

                    descricao:
                        descricao,

                    categoria:
                        categoria,

                    subcategoria:
                        subcategoria,

                    origem:
                        origem,

                    cartao:
                        cartaoFinal,

                    valor:
                        valor,

                    status:
                        statusFinal,

                    observacoes:
                        observacoes,

                    criadoEm:
                        new Date()
                            .toISOString()

                };


                if (ehDebito) {

                    novaDespesa.origemPagamento =
                        subcategoria;

                    novaDespesa.dataPagamento =
                        data;

                }


                await addDoc(
                    despesasRef,
                    novaDespesa
                );


                alert(
                    "Despesa registada com sucesso."
                );


                formDespesa.reset();


                const campoData =
                    document.getElementById(
                        "dataDespesa"
                    );


                if (campoData) {

                    campoData.value =
                        new Date()
                            .toISOString()
                            .split("T")[0];

                }


                const campoCartao =
                    document.getElementById(
                        "campoCartao"
                    );


                if (campoCartao) {

                    campoCartao.classList.add(
                        "campo-oculto"
                    );

                }


                const campoSituacao =
                    document.getElementById(
                        "campoSituacao"
                    );


                if (campoSituacao) {

                    campoSituacao.style.display =
                        "block";

                }


                mudarAba(
                    "visao"
                );


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


    const ano =
        hoje.getFullYear();


    const mes =
        hoje.getMonth();


    let despesasMes =
        0;


    let despesasPagas =
        0;


    let despesasAbertas =
        0;


    let totalCartoes =
        0;


    let totalDebito =
        0;


    despesas.forEach(
        (item) => {

            const dataItem =
                criarDataLocal(
                    item.data
                );


            const mesmoMes =
                dataItem &&
                dataItem.getFullYear() ===
                    ano &&
                dataItem.getMonth() ===
                    mes;


            if (!mesmoMes) {
                return;
            }


            const valor =
                Number(
                    item.valor || 0
                );


            despesasMes +=
                valor;


            const status =
                obterStatus(
                    item
                );


            if (
                status === "Pago"
            ) {

                despesasPagas +=
                    valor;

            }


            if (
                status === "A Pagar" ||
                status === "Aberto"
            ) {

                despesasAbertas +=
                    valor;

            }


            if (
                ehDespesaCartao(
                    item
                ) &&
                status !== "Pago"
            ) {

                totalCartoes +=
                    valor;

            }


            if (
                ehDespesaDebito(
                    item
                )
            ) {

                totalDebito +=
                    valor;

            }

        }
    );


    definirTexto(
        "despesasMes",
        formatarEuro(
            despesasMes
        )
    );


    definirTexto(
        "despesasPagas",
        formatarEuro(
            despesasPagas
        )
    );


    definirTexto(
        "despesasAbertas",
        formatarEuro(
            despesasAbertas
        )
    );


    definirTexto(
        "totalCartoes",
        formatarEuro(
            totalCartoes
        )
    );


    definirTexto(
        "totalDebito",
        formatarEuro(
            totalDebito
        )
    );

}


/* =========================================
   VISÃO GERAL
========================================= */

function atualizarVisao() {

    const hoje =
        new Date();


    const dataHoje =
        hoje.toISOString()
            .split("T")[0];


    let totalHoje =
        0;


    const categorias =
        {};


    despesas.forEach(
        (item) => {

            const valor =
                Number(
                    item.valor || 0
                );


            if (
                item.data ===
                dataHoje
            ) {

                totalHoje +=
                    valor;

            }


            const categoria =
                item.categoria ||
                "Sem categoria";


            if (
                !categorias[
                    categoria
                ]
            ) {

                categorias[
                    categoria
                ] = 0;

            }


            categorias[
                categoria
            ] += valor;

        }
    );


    definirTexto(
        "despesasHoje",
        "Hoje: " +
        formatarEuro(
            totalHoje
        )
    );


    const resumoCategorias =
        document.getElementById(
            "resumoCategorias"
        );


    if (resumoCategorias) {

        const entradas =
            Object.entries(
                categorias
            )
            .sort(
                (a, b) =>
                    b[1] - a[1]
            );


        if (!entradas.length) {

            resumoCategorias.innerHTML =
                `
                <div class="estado-vazio">
                    Ainda não existem despesas registadas.
                </div>
                `;

        } else {

            resumoCategorias.innerHTML =
                entradas
                    .map(
                        ([categoria, valor]) =>
                            `
                            <div class="linha-resumo">

                                <span>
                                    ${escaparHTML(
                                        categoria
                                    )}
                                </span>

                                <strong>
                                    ${formatarEuro(
                                        valor
                                    )}
                                </strong>

                            </div>
                            `
                    )
                    .join("");

        }

    }


    const ultimas =
        document.getElementById(
            "ultimasDespesas"
        );


    if (ultimas) {

        const lista =
            [...despesas]
                .sort(
                    (a, b) =>
                        obterDataOrdenacao(b) -
                        obterDataOrdenacao(a)
                )
                .slice(
                    0,
                    6
                );


        if (!lista.length) {

            ultimas.innerHTML =
                `
                <div class="estado-vazio">
                    Ainda não existem despesas registadas.
                </div>
                `;

        } else {

            ultimas.innerHTML =
                lista
                    .map(
                        (item) => {

                            const status =
                                obterStatus(
                                    item
                                );


                            return `
                            <div class="linha-resumo">

                                <div>

                                    <strong>
                                        ${escaparHTML(
                                            item.descricao ||
                                            "Despesa"
                                        )}
                                    </strong>

                                    <small>
                                        ${formatarData(
                                            item.data
                                        )}
                                    </small>

                                </div>

                                <div>

                                    <strong>
                                        ${formatarEuro(
                                            item.valor
                                        )}
                                    </strong>

                                    <small>
                                        ${escaparHTML(
                                            status
                                        )}
                                    </small>

                                </div>

                            </div>
                            `;

                        }
                    )
                    .join("");

        }

    }

}


/* =========================================
   CARTÕES
========================================= */

function atualizarCartoes() {

    const lista =
        document.getElementById(
            "listaCartoes"
        );


    const tabela =
        document.getElementById(
            "tabelaCartoes"
        );


    if (!lista) {
        return;
    }


    const resumo =
        {};


    Object.keys(
        cartoes
    ).forEach(
        (nome) => {

            resumo[nome] =
                0;

        }
    );


    const abertas =
        despesas.filter(
            (item) => {

                return (
                    ehDespesaCartao(
                        item
                    ) &&
                    obterStatus(
                        item
                    ) !== "Pago"
                );

            }
        );


    abertas.forEach(
        (item) => {

            const cartao =
                item.cartao ||
                item.subcategoria;


            if (
                resumo[
                    cartao
                ] !== undefined
            ) {

                resumo[
                    cartao
                ] += Number(
                    item.valor || 0
                );

            }

        }
    );


    lista.innerHTML =
        Object.keys(
            cartoes
        )
        .map(
            (nome) => {

                return `
                <div class="cartao-card">

                    <h5>
                        💳 ${escaparHTML(
                            cartoes[
                                nome
                            ].nome
                        )}
                    </h5>

                    <div class="cartao-valor">
                        ${formatarEuro(
                            resumo[
                                nome
                            ]
                        )}
                    </div>

                    <small>
                        Valor em aberto
                    </small>

                    <div class="cartao-status">

                        ${
                            resumo[nome] > 0
                            ? "🔴 Em aberto"
                            : "🟢 Sem valores em aberto"
                        }

                    </div>

                </div>
                `;

            }
        )
        .join("");


    if (!tabela) {
        return;
    }


    if (!abertas.length) {

        tabela.innerHTML =
            `
            <tr>

                <td
                    colspan="7"
                    class="estado-vazio">

                    Não existem compras
                    de cartão em aberto.

                </td>

            </tr>
            `;

        return;

    }


    tabela.innerHTML =
        abertas
            .sort(
                (a, b) =>
                    obterDataOrdenacao(a) -
                    obterDataOrdenacao(b)
            )
            .map(
                (item) => {

                    return `
                    <tr>

                        <td>
                            ${formatarData(
                                item.data
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                item.descricao ||
                                "Despesa"
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                nomeCartao(
                                    item.cartao ||
                                    item.subcategoria
                                )
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                item.categoria ||
                                "—"
                            )}
                        </td>

                        <td>
                            ${formatarEuro(
                                item.valor
                            )}
                        </td>

                        <td>

                            <span class="status-aberto">
                                🔵 Em aberto
                            </span>

                        </td>

                        <td>

                            <button
                                class="btn btn-success btn-sm"
                                onclick="abrirModalPagamento('${item.firestoreId}')">

                                Dar baixa

                            </button>

                        </td>

                    </tr>
                    `;

                }
            )
            .join("");

}


/* =========================================
   ABA A PAGAR
========================================= */

function atualizarApenasPagar() {

    const tabela =
        document.getElementById(
            "tabelaPagar"
        );


    if (!tabela) {
        return;
    }


    const abertas =
        despesas.filter(
            (item) => {

                const status =
                    obterStatus(
                        item
                    );


                return (
                    status === "A Pagar" ||
                    status === "Aberto"
                );

            }
        );


    if (!abertas.length) {

        tabela.innerHTML =
            `
            <tr>

                <td
                    colspan="7"
                    class="estado-vazio">

                    Não existem despesas
                    a pagar.

                </td>

            </tr>
            `;

        return;

    }


    tabela.innerHTML =
        abertas
            .sort(
                (a, b) =>
                    obterDataOrdenacao(a) -
                    obterDataOrdenacao(b)
            )
            .map(
                (item) => {

                    return `
                    <tr>

                        <td>
                            ${formatarData(
                                item.data
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                item.descricao ||
                                "Despesa"
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                item.categoria ||
                                "—"
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                item.origem ||
                                "—"
                            )}
                        </td>

                        <td>
                            ${formatarEuro(
                                item.valor
                            )}
                        </td>

                        <td>

                            <span class="status-aberto">
                                ${escaparHTML(
                                    obterStatus(
                                        item
                                    )
                                )}
                            </span>

                        </td>

                        <td>

                            ${
                                ehDespesaCartao(item)

                                ?

                                `
                                <button
                                    class="btn btn-success btn-sm"
                                    onclick="abrirModalPagamento('${item.firestoreId}')">

                                    Dar baixa

                                </button>
                                `

                                :

                                `
                                <button
                                    class="btn btn-success btn-sm"
                                    onclick="marcarDespesaPaga('${item.firestoreId}')">

                                    Marcar paga

                                </button>
                                `

                            }

                        </td>

                    </tr>
                    `;

                }
            )
            .join("");

}



/* =========================================
   HISTÓRICO
========================================= */

function carregarTabela(
    lista = despesas
) {

    const tbody =
        document.getElementById(
            "tabelaDespesas"
        );


    if (!tbody) return;


    const ordenada =
        [...lista]
            .sort(
                (a, b) =>
                    obterDataOrdenacao(b) -
                    obterDataOrdenacao(a)
            );


    if (!ordenada.length) {

        tbody.innerHTML =
            `
            <tr>

                <td
                    colspan="10"
                    class="estado-vazio">

                    Nenhuma despesa encontrada.

                </td>

            </tr>
            `;

        return;

    }


    tbody.innerHTML =
        ordenada
            .map((item) => {

                const cartao =
                    ehDespesaCartao(item);

                const status =
                    obterStatus(item);


                let statusHTML;


                if (status === "Pago") {

                    statusHTML =
                        `
                        <span class="status status-pago">
                            🟢 Pago
                        </span>
                        `;

                } else if (cartao) {

                    statusHTML =
                        `
                        <span class="status status-cartao">
                            🔵 Em aberto
                        </span>
                        `;

                } else {

                    statusHTML =
                        `
                        <span class="status status-aberto">
                            ⏳ A pagar
                        </span>
                        `;

                }


                const pagamento =
                    item.dataPagamento
                        ? formatarData(
                              item.dataPagamento
                          )
                        : "—";


                return `
                    <tr>

                        <td>
                            ${formatarData(
                                item.dataDespesa ||
                                item.data
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                item.descricao ||
                                item.observacoes ||
                                "Despesa"
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                item.categoria || ""
                            )}
                        </td>

                        <td>
                            ${escaparHTML(
                                item.subcategoria || ""
                            )}
                        </td>

                        <td>

                            ${
                                cartao
                                    ? "Cartão"
                                    : escaparHTML(
                                          item.origem || ""
                                      )
                            }

                        </td>

                        <td>

                            ${
                                cartao
                                    ? escaparHTML(
                                          nomeCartao(
                                              item.subcategoria
                                          )
                                      )
                                    : "—"
                            }

                        </td>

                        <td>

                            <strong>
                                ${formatarEuro(
                                    Number(item.valor || 0)
                                )}
                            </strong>

                        </td>

                        <td>
                            ${statusHTML}
                        </td>

                        <td>

                            ${
                                item.dataPagamento

                                    ?

                                    escaparHTML(
                                        pagamento +
                                        (
                                            item.origemPagamento
                                                ? " • " +
                                                  item.origemPagamento
                                                : ""
                                        )
                                    )

                                    : "—"
                            }

                        </td>

                        <td>

                            ${
                                cartao &&
                                status !== "Pago"

                                    ?

                                    `
                                    <button
                                        type="button"
                                        class="btn-acao btn-baixa btn-dar-baixa"
                                        data-id="${escaparHTML(item.firestoreId)}"
                                        data-valor="${Number(item.valor || 0)}"
                                        data-descricao="${encodeURIComponent(
                                            item.descricao ||
                                            item.observacoes ||
                                            item.subcategoria ||
                                            "Despesa"
                                        )}"
                                        onclick="window.abrirModalPagamento(this)"
                                    >
                                        Dar baixa
                                    </button>
                                    `

                                    :

                                    `
                                    <button
                                        type="button"
                                        class="btn-acao btn-excluir"
                                        onclick="window.excluirDespesa('${escaparHTML(item.firestoreId)}')"
                                    >
                                        Excluir
                                    </button>
                                    `
                            }

                        </td>

                    </tr>
                `;

            })
            .join("");

}


/* =========================================
   FILTROS
========================================= */

function filtrarDespesas() {

    let resultado =
        [...despesas];


    const inicio =
        document
            .getElementById("filtroInicio")
            ?.value || "";


    const fim =
        document
            .getElementById("filtroFim")
            ?.value || "";


    const categoria =
        document
            .getElementById("filtroCategoria")
            ?.value || "";


    const origem =
        document
            .getElementById("filtroOrigem")
            ?.value || "";


    if (inicio) {

        resultado =
            resultado.filter(
                (item) =>
                    (
                        item.dataDespesa ||
                        item.data ||
                        ""
                    ) >= inicio
            );

    }


    if (fim) {

        resultado =
            resultado.filter(
                (item) =>
                    (
                        item.dataDespesa ||
                        item.data ||
                        ""
                    ) <= fim
            );

    }


    if (categoria) {

        resultado =
            resultado.filter(
                (item) =>
                    item.categoria === categoria
            );

    }


    if (origem) {

        resultado =
            resultado.filter(
                (item) =>
                    item.origem === origem
            );

    }


    carregarTabela(resultado);

}


function limparFiltros() {

    const filtroInicio =
        document.getElementById(
            "filtroInicio"
        );

    const filtroFim =
        document.getElementById(
            "filtroFim"
        );

    const filtroCategoria =
        document.getElementById(
            "filtroCategoria"
        );

    const filtroOrigem =
        document.getElementById(
            "filtroOrigem"
        );


    if (filtroInicio) {
        filtroInicio.value = "";
    }

    if (filtroFim) {
        filtroFim.value = "";
    }

    if (filtroCategoria) {
        filtroCategoria.value = "";
    }

    if (filtroOrigem) {
        filtroOrigem.value = "";
    }


    carregarTabela();

}


/* =========================================
   ABRIR MODAL DE PAGAMENTO
========================================= */

function abrirModalPagamento(botao) {

    /*
     * Aqui o data-id contém exclusivamente
     * o firestoreId real.
     */

    const firestoreId =
        botao.getAttribute("data-id");


    const valor =
        Number(
            botao.getAttribute("data-valor") || 0
        );


    const descricaoCodificada =
        botao.getAttribute(
            "data-descricao"
        ) || "";


    let descricao =
        "Despesa";


    try {

        descricao =
            decodeURIComponent(
                descricaoCodificada
            ) || "Despesa";

    } catch (error) {

        console.error(error);

    }


    const inputId =
        document.getElementById(
            "pagamentoId"
        );


    const inputValor =
        document.getElementById(
            "pagamentoValor"
        );


    const inputDescricao =
        document.getElementById(
            "pagamentoDescricao"
        );


    if (inputId) {

        inputId.value =
            firestoreId;

    }


    if (inputValor) {

        inputValor.value =
            valor.toFixed(2);

    }


    if (inputDescricao) {

        inputDescricao.value =
            descricao;

    }


    const origemPagamento =
        document.getElementById(
            "origemPagamento"
        );


    if (origemPagamento) {

        origemPagamento.value =
            "";

    }


    const modal =
        document.getElementById(
            "modalPagamento"
        );


    if (modal) {

        modal.classList.add(
            "ativo"
        );

    }

}


/* =========================================
   FECHAR MODAL DE PAGAMENTO
========================================= */

function fecharModalPagamento() {

    const modal =
        document.getElementById(
            "modalPagamento"
        );


    if (modal) {

        modal.classList.remove(
            "ativo"
        );

    }

}


/* =========================================
   CONFIRMAR PAGAMENTO DO CARTÃO
========================================= */

async function confirmarPagamentoCartao() {

    const firestoreId =
        document.getElementById(
            "pagamentoId"
        )?.value;


    const origemPagamento =
        document
            .getElementById(
                "origemPagamento"
            )
            ?.value || "";


    if (!firestoreId) {

        alert(
            "Despesa não identificada."
        );

        return;

    }


    if (!origemPagamento) {

        alert(
            "Selecione de onde saiu o dinheiro."
        );

        return;

    }


    const despesa =
        despesas.find(
            (item) =>
                item.firestoreId ===
                firestoreId
        );


    if (!despesa) {

        alert(
            "Não foi possível localizar a despesa."
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

                dataPagamento:
                    new Date()
                        .toISOString()
                        .split("T")[0],

                origemPagamento:
                    origemPagamento

            }
        );


        fecharModalPagamento();


        alert(
            "Pagamento registado com sucesso."
        );


    } catch (error) {

        console.error(
            "Erro ao confirmar pagamento:",
            error
        );

        alert(
            "Não foi possível registar o pagamento."
        );

    }

}


/* =========================================
   MARCAR DESPESA COMO PAGA
========================================= */

async function marcarDespesaPaga(
    firestoreId
) {

    if (!firestoreId) {

        alert(
            "Despesa não identificada."
        );

        return;

    }


    const confirmar =
        confirm(
            "Deseja marcar esta despesa como paga?"
        );


    if (!confirmar) {

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

                dataPagamento:
                    new Date()
                        .toISOString()
                        .split("T")[0]

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
            "Despesa não identificada."
        );

        return;

    }


    const despesa =
        despesas.find(
            (item) =>
                item.firestoreId ===
                firestoreId
        );


    if (!despesa) {

        alert(
            "Não foi possível localizar a despesa."
        );

        return;

    }


    const confirmar =
        confirm(
            "Tem certeza que deseja excluir esta despesa?\n\n" +
            "Esta ação não pode ser desfeita."
        );


    if (!confirmar) {

        return;

    }


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

function obterStatus(item) {

    if (
        item.status === "Pago" ||
        item.status === "pago"
    ) {

        return "Pago";

    }


    if (
        item.status === "A Pagar" ||
        item.status === "a pagar" ||
        item.status === "Aberto"
    ) {

        return "A Pagar";

    }


    /*
     * Registos antigos sem status:
     * mantemos o comportamento compatível.
     */

    if (
        ehDespesaCartao(item)
    ) {

        return "A Pagar";

    }


    return "A Pagar";

}


function obterDataOrdenacao(item) {

    const data =
        item.dataDespesa ||
        item.data ||
        item.dataPagamento ||
        "";


    if (!data) {

        return 0;

    }


    const valor =
        new Date(
            data + "T00:00:00"
        ).getTime();


    return Number.isNaN(valor)
        ? 0
        : valor;

}


function formatarData(data) {

    if (!data) {

        return "—";

    }


    const partes =
        String(data).split("-");


    if (
        partes.length !== 3
    ) {

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


function formatarEuro(valor) {

    const numero =
        Number(valor || 0);


    return numero.toLocaleString(
        "pt-PT",
        {
            style: "currency",
            currency: "EUR"
        }
    );

}


function definirTexto(
    id,
    texto
) {

    const elemento =
        document.getElementById(id);


    if (elemento) {

        elemento.textContent =
            texto;

    }

}


function escaparHTML(valor) {

    return String(
        valor ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


function nomeCartao(
    subcategoria
) {

    const nomes = {

        "Cartão Crédito Samuel CCA":
            "Samuel CCA",

        "Cartão Crédito Samuel Millenium":
            "Samuel Millenium",

        "Cartão Crédito Samuel Cetelem":
            "Samuel Cetelem",

        "Cartão Crédito Eliane":
            "Eliane"

    };


    return (
        nomes[subcategoria] ||
        subcategoria ||
        "Cartão"
    );

}


/* =========================================
   ABAS
========================================= */

function mudarAba(
    aba
) {

    document
        .querySelectorAll(
            ".aba-conteudo"
        )
        .forEach(
            (elemento) => {

                elemento.classList.remove(
                    "ativa"
                );

            }
        );


    document
        .querySelectorAll(
            ".aba"
        )
        .forEach(
            (elemento) => {

                elemento.classList.remove(
                    "ativa"
                );

            }
        );


    const conteudo =
        document.getElementById(
            aba
        );


    if (conteudo) {

        conteudo.classList.add(
            "ativa"
        );

    }


    const botao =
        document.querySelector(
            `[data-aba="${aba}"]`
        );


    if (botao) {

        botao.classList.add(
            "ativa"
        );

    }


    if (
        aba === "visao"
    ) {

        atualizarVisao();

    }


    if (
        aba === "cartoes"
    ) {

        atualizarCartoes();

    }


    if (
        aba === "pagar"
    ) {

        atualizarApenasPagar();

    }


    if (
        aba === "historico"
    ) {

        carregarTabela();

    }

}


/* =========================================
   NOVA DESPESA
========================================= */

function abrirAbaNovaDespesa() {

    mudarAba(
        "nova"
    );


    const campo =
        document.getElementById(
            "descricao"
        );


    if (campo) {

        setTimeout(
            () => campo.focus(),
            100
        );

    }

}


/* =========================================
   LOGOUT
========================================= */

function logout() {

    if (
        !confirm(
            "Deseja realmente sair do sistema?"
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


/* =========================================
   DISPONIBILIZAR FUNÇÕES PARA O HTML
========================================= */

window.mudarAba =
    mudarAba;

window.abrirAbaNovaDespesa =
    abrirAbaNovaDespesa;

window.filtrarDespesas =
    filtrarDespesas;

window.limparFiltros =
    limparFiltros;

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

window.logout =
    logout;


/* =========================================
   INICIALIZAÇÃO
========================================= */

const dataInicial =
    document.getElementById(
        "dataDespesa"
    );


if (dataInicial) {

    dataInicial.value =
        new Date()
            .toISOString()
            .split("T")[0];

}


atualizarTudo();
