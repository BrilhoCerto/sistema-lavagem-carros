const perfil =
localStorage.getItem("perfil");

const utilizador =
localStorage.getItem("utilizador");

/* GESTOR */

function isGestor(){

return perfil === "gestor";

}

/* ADMINISTRADOR */

function isAdministrador(){

return perfil === "administrador";

}

/* FUNCIONÁRIO */

function isFuncionario(){

return perfil === "funcionario";

}

/* CONTROLO DE ACESSO */

function semPermissao(){

alert(
"Ação não permitida.\n\nSolicite autorização ao Gestor."
);

return false;

}
