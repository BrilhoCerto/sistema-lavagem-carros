/* ========================= */
/* PARTE 1 DE 10 */
/* ========================= */

/* ========================= */
/* LOCAL STORAGE */
/* ========================= */

let contasPagar =
JSON.parse(
localStorage.getItem("contasPagar")
) || [];

/* ========================= */
/* VARIÁVEIS GLOBAIS */
/* ========================= */

let parcelamentoSelecionado = null;

/* ========================= */
/* PERSISTÊNCIA */
/* ========================= */

function guardarDados(){

localStorage.setItem(
"contasPagar",
JSON.stringify(contasPagar)
);

}

function carregarDados(){

contasPagar =
JSON.parse(
localStorage.getItem("contasPagar")
) || [];

}

/* ========================= */
/* UTILITÁRIOS */
/* ========================= */

function gerarId(){

return Date.now().toString();

}

function formatarEuro(valor){

return "€ " +

Number(valor || 0)
.toFixed(2)
.replace(".",",");

}

function obterDataHoje(){

return new Date()
.toISOString()
.split("T")[0];

}

function formatarData(data){

if(!data){
return "";
}

const partes = data.split("-");

return partes[2] + "/" +
partes[1] + "/" +
partes[0];

}

/* ========================= */
/* LOCALIZAR PARCELAMENTO */
/* ========================= */

function procurarParcelamento(id){

return contasPagar.find(

item =>

String(item.id) === String(id)

);

}

/* ========================= */
/* LIMPAR FORMULÁRIO */
/* ========================= */

function limparFormulario(){

const formulario =

document.getElementById(
"formContaPagar"
);

if(formulario){

formulario.reset();

}

parcelamentoSelecionado = null;

const origem =

document.getElementById(
"parcelamentoOrigem"
);

if(origem){

origem.value = "";

}

}

/* ========================= */
/* ATUALIZAÇÃO GERAL */
/* ========================= */

function atualizarSistema(){

carregarCards();

carregarParcelamentos();

}

/* ========================= */
/* INICIALIZAÇÃO */
/* ========================= */

document.addEventListener(

"DOMContentLoaded",

function(){

carregarDados();

atualizarSistema();

}

);

/* ========================= */
/* FIM PARTE 1 */
/* ========================= */



/* ========================= */
/* PARTE 2 DE 10 */
/* ========================= */

/* ========================= */
/* FORMULÁRIO */
/* ========================= */

const btnNovo =
document.getElementById("btnMostrarFormulario");

const formulario =
document.getElementById("formularioParcelamento");

if(btnNovo){

btnNovo.addEventListener("click",function(){

if(formulario.style.display==="none"){

formulario.style.display="block";

btnNovo.textContent="Cancelar";

}else{

formulario.style.display="none";

btnNovo.textContent="Novo";

limparFormulario();

}

});

}

/* ========================= */
/* CALCULAR VALOR DA PARCELA */
/* ========================= */

function atualizarValorParcela(){

const valorTotal=

parseFloat(
document.getElementById("valorTotal").value
);

const quantidade=

parseInt(
document.getElementById("quantidadeParcelas").value
);

const campo=

document.getElementById("valorParcela");

if(

isNaN(valorTotal)
||

isNaN(quantidade)
||

quantidade<=0

){

campo.value="";

return;

}

const valor=

(valorTotal/quantidade)
.toFixed(2)
.replace(".",",");

campo.value="€ "+valor;

}

document
.getElementById("valorTotal")
.addEventListener(
"input",
atualizarValorParcela
);

document
.getElementById("quantidadeParcelas")
.addEventListener(
"input",
atualizarValorParcela
);

/* ========================= */
/* GERAR PARCELAS */
/* ========================= */

function gerarParcelas(

quantidade,

valorTotal,

primeiroVencimento

){

const parcelas=[];

let data=
new Date(primeiroVencimento);

let restante=
Number(valorTotal);

const valorBase=

Math.floor(

(valorTotal/quantidade)

*100

)/100;

for(

let i=1;

i<=quantidade;

i++

){

let valor;

if(i===quantidade){

valor=

Number(

restante.toFixed(2)

);

}else{

valor=valorBase;

restante-=valor;

}

parcelas.push({

numero:i,

valor,

vencimento:
data
.toISOString()
.split("T")[0],

status:"Pendente",

dataPagamento:null

});

data.setMonth(

data.getMonth()+1

);

}

return parcelas;

}

/* ========================= */
/* CADASTRAR */
/* ========================= */

document

.getElementById("formContaPagar")

.addEventListener(

"submit",

function(e){

e.preventDefault();

const entidade=

document.getElementById("entidade").value;

const descricao=

document.getElementById("descricao").value;

const processo=

document.getElementById("processo").value;

const valorTotal=

parseFloat(
document.getElementById("valorTotal").value
);

const quantidadeParcelas=

parseInt(
document.getElementById("quantidadeParcelas").value
);

const primeiroVencimento=

document.getElementById("primeiroVencimento").value;

const observacoes=

document.getElementById("observacoes").value;

const novo={

id:gerarId(),

entidade,

descricao,

processo,

valorTotal,

quantidadeParcelas,

valorParcela:

Number(

(valorTotal/quantidadeParcelas)

.toFixed(2)

),

primeiroVencimento,

observacoes,

parcelas:

gerarParcelas(

quantidadeParcelas,

valorTotal,

primeiroVencimento

)

};

contasPagar.push(novo);

guardarDados();

alert(

"Parcelamento cadastrado com sucesso."

);

limparFormulario();

formulario.style.display="none";

btnNovo.textContent="Novo";

atualizarSistema();

});

/* ========================= */
/* FIM PARTE 2 */
/* ========================= */








