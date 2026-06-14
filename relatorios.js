const perfil = localStorage.getItem("perfil");

if (!perfil) {
    window.location.href = "login.html";
}

const pagamentos =
JSON.parse(localStorage.getItem("pagamentos")) || [];

const despesas =
JSON.parse(localStorage.getItem("despesas")) || [];

function carregarRelatorios() {

    const hoje =
    new Date().toISOString().split("T")[0];

    let receitaHoje = 0;
    let despesaHoje = 0;
    let veiculosHoje = 0;

    pagamentos.forEach(item => {

        const pago =
        item.status &&
        item.status.startsWith("Pago");

        if(item.data === hoje && pago){

            receitaHoje +=
            Number(item.valor || 0);

            veiculosHoje++;

        }

    });

    despesas.forEach(item => {

        if(item.data === hoje){

            despesaHoje +=
            Number(item.valor || 0);

        }

    });

    const saldoHoje =
    receitaHoje - despesaHoje;

    document.getElementById("receitaHoje").textContent =
    "€ " + receitaHoje.toFixed(2);

    document.getElementById("despesaHoje").textContent =
    "€ " + despesaHoje.toFixed(2);

    document.getElementById("saldoHoje").textContent =
    "€ " + saldoHoje.toFixed(2);

    document.getElementById("veiculosHoje").textContent =
    veiculosHoje;

    carregarMovimentacoes();
}

/* TABELA */

function carregarMovimentacoes(){

    const tabela =
    document.getElementById("tabelaMovimentos");

    tabela.innerHTML = "";

    pagamentos.forEach(item => {

        const pago =
        item.status &&
        item.status.startsWith("Pago");

        if(!pago){
            return;
        }

        tabela.innerHTML += `
        <tr>
            <td>${item.data}</td>
            <td>Receita</td>
            <td>${item.cliente}</td>
            <td>€ ${Number(item.valor).toFixed(2)}</td>
        </tr>
        `;
    });

    despesas.forEach(item => {

        tabela.innerHTML += `
        <tr>
            <td>${item.data}</td>
            <td>Despesa</td>
            <td>${item.categoria || "Despesa"}</td>
            <td>€ ${Number(item.valor).toFixed(2)}</td>
        </tr>
        `;
    });

}

/* INICIAR */

carregarRelatorios();
