/* =========================================================
   DADOS
========================================================= */

let registros = JSON.parse(
    localStorage.getItem("equipamentos")
) || [];


let colaboradores = JSON.parse(
    localStorage.getItem("colaboradores")
) || [];


/* =========================================================
   NAVEGAÇÃO
========================================================= */

function mostrarPagina(pagina, botao) {

    document.querySelectorAll(".pagina").forEach(section => {

        section.classList.remove("active");

    });


    document.querySelectorAll(".menu-btn").forEach(button => {

        button.classList.remove("active");

    });


    document
        .getElementById(pagina)
        .classList.add("active");


    if (botao) {

        botao.classList.add("active");

    }


    if (pagina === "dashboard") {

        atualizarDashboard();

    }


    if (pagina === "colaboradores") {

        carregarColaboradores();

    }


    if (pagina === "historico") {

        carregarHistorico();

    }

}


/* =========================================================
   SALVAR DADOS
========================================================= */

function salvarDados() {

    localStorage.setItem(
        "equipamentos",
        JSON.stringify(registros)
    );

}


function salvarColaboradores() {

    localStorage.setItem(
        "colaboradores",
        JSON.stringify(colaboradores)
    );

}


/* =========================================================
   CADASTRO DE COLABORADORES
========================================================= */

function cadastrarColaborador() {

    const lms = document
        .getElementById("cadastroLms")
        .value
        .trim();


    const nome = document
        .getElementById("cadastroNome")
        .value
        .trim();


    if (!lms || !nome) {

        alert(
            "Preencha o LMS e o nome do colaborador."
        );

        return;
    }


    const lmsNormalizado = lms.toLowerCase();


    const existente = colaboradores.find(
        colaborador =>
            colaborador.lms.toLowerCase() ===
            lmsNormalizado
    );


    if (existente) {

        alert(
            "Este LMS já está cadastrado."
        );

        return;
    }


    colaboradores.push({

        id: Date.now(),

        lms: lms,

        nome: nome

    });


    salvarColaboradores();


    document.getElementById(
        "cadastroLms"
    ).value = "";


    document.getElementById(
        "cadastroNome"
    ).value = "";


    carregarColaboradores();

}


/* =========================================================
   LISTAR COLABORADORES
========================================================= */

function carregarColaboradores() {

    const campo = document
        .getElementById("buscaColaborador");


    if (!campo) return;


    const termo = campo
        .value
        .trim()
        .toLowerCase();


    let lista = colaboradores;


    if (termo) {

        lista = colaboradores.filter(
            colaborador =>

                colaborador.lms
                    .toLowerCase()
                    .includes(termo)

                ||

                colaborador.nome
                    .toLowerCase()
                    .includes(termo)
        );

    }


    const tabela = document
        .getElementById(
            "tabelaColaboradores"
        );


    if (!lista.length) {

        tabela.innerHTML = `

            <tr>

                <td colspan="3">
                    Nenhum colaborador encontrado.
                </td>

            </tr>

        `;

        return;
    }


    tabela.innerHTML = lista
        .slice()
        .reverse()
        .map(colaborador => `

            <tr>

                <td>
                    ${escaparHTML(colaborador.lms)}
                </td>

                <td>
                    ${escaparHTML(colaborador.nome)}
                </td>

                <td>

                    <button
                        class="btn-editar"
                        onclick="abrirEdicaoColaborador(${colaborador.id})"
                    >
                        Editar
                    </button>


                    <button
                        class="btn-excluir"
                        onclick="excluirColaborador(${colaborador.id})"
                    >
                        Excluir
                    </button>

                </td>

            </tr>

        `)
        .join("");

}


/* =========================================================
   MOSTRAR TODOS OS COLABORADORES
========================================================= */

function mostrarTodosColaboradores() {

    document.getElementById(
        "buscaColaborador"
    ).value = "";


    carregarColaboradores();

}


/* =========================================================
   BUSCAR NOME AUTOMATICAMENTE PELO LMS
========================================================= */

function buscarNomePorLms() {

    const campoLms = document
        .getElementById("lms");


    const campoNome = document
        .getElementById("nome");


    const status = document
        .getElementById("statusLms");


    const lms = campoLms
        .value
        .trim()
        .toLowerCase();


    campoNome.value = "";

    status.textContent = "";

    status.className = "status-lms";


    if (!lms) {

        return;
    }


    const colaborador = colaboradores.find(
        item =>
            item.lms.toLowerCase() === lms
    );


    if (colaborador) {

        campoNome.value =
            colaborador.nome;


        status.textContent =
            "Colaborador encontrado";


        status.classList.add(
            "sucesso"
        );

    } else {

        status.textContent =
            "LMS não cadastrado";


        status.classList.add(
            "erro"
        );

    }

}


/* =========================================================
   REGISTRAR RETIRADA
========================================================= */

function registrarRetirada() {

    const lms = document
        .getElementById("lms")
        .value
        .trim();


    const nome = document
        .getElementById("nome")
        .value
        .trim();


    const codigo = document
        .getElementById("codigo")
        .value
        .trim();


    const observacao = document
        .getElementById("observacao")
        .value
        .trim();


    if (!lms || !codigo) {

        alert(
            "Preencha o LMS e o código do equipamento."
        );

        return;
    }


    if (!nome) {

        alert(
            "O LMS informado não está cadastrado. Cadastre o colaborador primeiro."
        );

        return;
    }


    const equipamentoExistente = registros.find(
        item =>

            item.codigo.toLowerCase() ===
            codigo.toLowerCase()

            &&

            item.status === "retirado"
    );


    if (equipamentoExistente) {

        alert(
            "Este equipamento já está registrado como retirado."
        );

        return;
    }


    const agora = new Date();


    const registro = {

        id: Date.now(),

        lms: lms,

        nome: nome,

        codigo: codigo,

        observacao: observacao,

        retirada:
            agora.toISOString(),

        devolucao: null,

        status: "retirado"

    };


    registros.push(registro);


    salvarDados();


    document.getElementById("lms").value = "";

    document.getElementById("nome").value = "";

    document.getElementById("codigo").value = "";

    document.getElementById("observacao").value = "";

    document.getElementById("statusLms").textContent = "";

    document.getElementById("statusLms").className =
        "status-lms";


    atualizarDashboard();

    carregarHistorico();

}


/* =========================================================
   DASHBOARD
========================================================= */

function atualizarDashboard() {

    const retirados = registros.filter(
        item => item.status === "retirado"
    ).length;


    const devolvidos = registros.filter(
        item => item.status === "devolvido"
    ).length;


    const extraviados = registros.filter(
        item => item.status === "extraviado"
    ).length;


    document.getElementById(
        "totalRetirados"
    ).textContent = retirados;


    document.getElementById(
        "totalDevolvidos"
    ).textContent = devolvidos;


    document.getElementById(
        "totalExtraviados"
    ).textContent = extraviados;

}


/* =========================================================
   BUSCA DASHBOARD
========================================================= */

function buscarDashboard() {

    const termo = document
        .getElementById("buscaDashboard")
        .value
        .trim()
        .toLowerCase();


    const resultado = document
        .getElementById(
            "resultadoDashboard"
        );


    if (!termo) {

        resultado.innerHTML = "";

        return;
    }


    const encontrados = registros.filter(
        item =>

            item.lms
                .toLowerCase()
                .includes(termo)

            ||

            item.nome
                .toLowerCase()
                .includes(termo)

            ||

            item.codigo
                .toLowerCase()
                .includes(termo)
    );


    if (!encontrados.length) {

        resultado.innerHTML = `

            <div class="resultado">
                Nenhum registro encontrado.
            </div>

        `;

        return;
    }


    resultado.innerHTML =
        encontrados
            .map(item => `

                <div class="resultado">

                    <strong>
                        ${escaparHTML(item.nome)}
                    </strong>

                    <div>
                        LMS:
                        ${escaparHTML(item.lms)}
                    </div>

                    <div>
                        Equipamento:
                        ${escaparHTML(item.codigo)}
                    </div>

                    <div>

                        Status:

                        <span
                            class="status ${item.status}"
                        >
                            ${formatarStatus(item.status)}
                        </span>

                    </div>

                    <div>
                        Retirada:
                        ${formatarData(item.retirada)}
                    </div>

                    <div>
                        Devolução:
                        ${
                            item.devolucao
                            ? formatarData(item.devolucao)
                            : "-"
                        }
                    </div>

                    ${
                        item.observacao
                        ?
                        `
                            <div>
                                Observação:
                                ${escaparHTML(item.observacao)}
                            </div>
                        `
                        :
                        ""
                    }

                </div>

            `)
            .join("");

}


/* =========================================================
   BUSCA NA RETIRADA
========================================================= */

function buscarRetirada() {

    const lms = document
        .getElementById("lms")
        .value
        .trim()
        .toLowerCase();


    const codigo = document
        .getElementById("codigo")
        .value
        .trim()
        .toLowerCase();


    const nome = document
        .getElementById("nome")
        .value
        .trim()
        .toLowerCase();


    const resultado = document
        .getElementById(
            "resultadoRetirada"
        );


    if (!lms && !codigo && !nome) {

        resultado.innerHTML = "";

        return;
    }


    const encontrados = registros.filter(
        item =>

            (lms &&
                item.lms
                    .toLowerCase()
                    .includes(lms))

            ||

            (codigo &&
                item.codigo
                    .toLowerCase()
                    .includes(codigo))

            ||

            (nome &&
                item.nome
                    .toLowerCase()
                    .includes(nome))
    );


    if (!encontrados.length) {

        resultado.innerHTML = `

            <div class="resultado">
                Nenhum registro encontrado.
            </div>

        `;

        return;
    }


    resultado.innerHTML =
        encontrados
            .map(item => `

                <div class="resultado">

                    <strong>
                        ${escaparHTML(item.nome)}
                    </strong>

                    <div>
                        LMS:
                        ${escaparHTML(item.lms)}
                    </div>

                    <div>
                        Equipamento:
                        ${escaparHTML(item.codigo)}
                    </div>

                    <div>

                        Status:

                        <span
                            class="status ${item.status}"
                        >
                            ${formatarStatus(item.status)}
                        </span>

                    </div>


                    ${
                        item.observacao
                        ?
                        `
                            <div>
                                Observação:
                                ${escaparHTML(item.observacao)}
                            </div>
                        `
                        :
                        ""
                    }


                    <br>


                    <button
                        class="btn-editar"
                        onclick="abrirEdicao(${item.id})"
                    >
                        Editar
                    </button>

                </div>

            `)
            .join("");

}


/* =========================================================
   HISTÓRICO
========================================================= */

function carregarHistorico() {

    const termo = document
        .getElementById("buscaHistorico")
        .value
        .trim()
        .toLowerCase();


    let lista = registros;


    if (termo) {

        lista = registros.filter(
            item =>

                item.lms
                    .toLowerCase()
                    .includes(termo)

                ||

                item.nome
                    .toLowerCase()
                    .includes(termo)

                ||

                item.codigo
                    .toLowerCase()
                    .includes(termo)
        );

    }


    const tabela = document
        .getElementById(
            "tabelaHistorico"
        );


    if (!lista.length) {

        tabela.innerHTML = `

            <tr>

                <td colspan="8">
                    Nenhum registro encontrado.
                </td>

            </tr>

        `;

        return;
    }


    tabela.innerHTML =
        lista
            .slice()
            .reverse()
            .map(item => `

                <tr>

                    <td>
                        ${escaparHTML(item.lms)}
                    </td>


                    <td>
                        ${escaparHTML(item.nome)}
                    </td>


                    <td>
                        ${escaparHTML(item.codigo)}
                    </td>


                    <td>
                        ${formatarData(item.retirada)}
                    </td>


                    <td>
                        ${
                            item.devolucao
                            ? formatarData(item.devolucao)
                            : "-"
                        }
                    </td>


                    <td>

                        <span
                            class="status ${item.status}"
                        >
                            ${formatarStatus(item.status)}
                        </span>

                    </td>


                    <td class="observacao-tabela">

                        ${
                            item.observacao
                            ? escaparHTML(item.observacao)
                            : "-"
                        }

                    </td>


                    <td>

                        <button
                            class="btn-editar"
                            onclick="abrirEdicao(${item.id})"
                        >
                            Editar
                        </button>


                        <button
                            class="btn-excluir"
                            onclick="excluirRegistro(${item.id})"
                        >
                            Excluir
                        </button>

                    </td>

                </tr>

            `)
            .join("");

}


/* =========================================================
   MOSTRAR TODOS
========================================================= */

function mostrarTodos() {

    document.getElementById(
        "buscaHistorico"
    ).value = "";


    carregarHistorico();

}


/* =========================================================
   EDITAR REGISTRO
========================================================= */

function abrirEdicao(id) {

    const registro = registros.find(
        item => item.id === id
    );


    if (!registro) return;


    document.getElementById(
        "editarId"
    ).value = registro.id;


    document.getElementById(
        "editarLms"
    ).value = registro.lms;


    document.getElementById(
        "editarNome"
    ).value = registro.nome;


    document.getElementById(
        "editarCodigo"
    ).value = registro.codigo;


    document.getElementById(
        "editarStatus"
    ).value = registro.status;


    document.getElementById(
        "editarObservacao"
    ).value =
        registro.observacao || "";


    document
        .getElementById("modalEdicao")
        .classList.add("aberto");

}


function salvarEdicao() {

    const id = Number(
        document.getElementById(
            "editarId"
        ).value
    );


    const registro = registros.find(
        item => item.id === id
    );


    if (!registro) return;


    registro.lms = document
        .getElementById("editarLms")
        .value
        .trim();


    registro.nome = document
        .getElementById("editarNome")
        .value
        .trim();


    registro.codigo = document
        .getElementById("editarCodigo")
        .value
        .trim();


    registro.observacao = document
        .getElementById("editarObservacao")
        .value
        .trim();


    const novoStatus =
        document.getElementById(
            "editarStatus"
        ).value;


    registro.status = novoStatus;


    if (
        novoStatus === "devolvido" &&
        !registro.devolucao
    ) {

        registro.devolucao =
            new Date().toISOString();

    }


    if (
        novoStatus !== "devolvido"
    ) {

        registro.devolucao = null;

    }


    salvarDados();


    fecharModal();


    atualizarDashboard();


    carregarHistorico();

}


/* =========================================================
   FECHAR MODAL DE REGISTRO
========================================================= */

function fecharModal() {

    document
        .getElementById("modalEdicao")
        .classList.remove("aberto");

}


/* =========================================================
   EXCLUIR REGISTRO
========================================================= */

function excluirRegistro(id) {

    const confirmar = confirm(
        "Tem certeza que deseja excluir este registro?"
    );


    if (!confirmar) return;


    registros = registros.filter(
        item => item.id !== id
    );


    salvarDados();


    atualizarDashboard();


    carregarHistorico();

}


/* =========================================================
   EDITAR COLABORADOR
========================================================= */

function abrirEdicaoColaborador(id) {

    const colaborador =
        colaboradores.find(
            item => item.id === id
        );


    if (!colaborador) return;


    document.getElementById(
        "editarColaboradorId"
    ).value = colaborador.id;


    document.getElementById(
        "editarColaboradorLms"
    ).value = colaborador.lms;


    document.getElementById(
        "editarColaboradorNome"
    ).value = colaborador.nome;


    document
        .getElementById(
            "modalColaborador"
        )
        .classList.add("aberto");

}


function salvarEdicaoColaborador() {

    const id = Number(
        document.getElementById(
            "editarColaboradorId"
        ).value
    );


    const lms = document
        .getElementById(
            "editarColaboradorLms"
        )
        .value
        .trim();


    const nome = document
        .getElementById(
            "editarColaboradorNome"
        )
        .value
        .trim();


    if (!lms || !nome) {

        alert(
            "Preencha o LMS e o nome."
        );

        return;
    }


    const outroColaborador =
        colaboradores.find(
            item =>
                item.id !== id &&
                item.lms.toLowerCase() ===
                lms.toLowerCase()
        );


    if (outroColaborador) {

        alert(
            "Este LMS já pertence a outro colaborador."
        );

        return;
    }


    const colaborador =
        colaboradores.find(
            item => item.id === id
        );


    if (!colaborador) return;


    const lmsAntigo =
        colaborador.lms;


    colaborador.lms = lms;

    colaborador.nome = nome;


    /*
       Atualiza também os registros antigos
       desse colaborador.
    */

    registros.forEach(registro => {

        if (
            registro.lms.toLowerCase() ===
            lmsAntigo.toLowerCase()
        ) {

            registro.lms = lms;

            registro.nome = nome;

        }

    });


    salvarColaboradores();

    salvarDados();


    fecharModalColaborador();


    carregarColaboradores();

    carregarHistorico();

    atualizarDashboard();

}


/* =========================================================
   FECHAR MODAL DE COLABORADOR
========================================================= */

function fecharModalColaborador() {

    document
        .getElementById(
            "modalColaborador"
        )
        .classList.remove("aberto");

}


/* =========================================================
   EXCLUIR COLABORADOR
========================================================= */

function excluirColaborador(id) {

    const colaborador =
        colaboradores.find(
            item => item.id === id
        );


    if (!colaborador) return;


    const confirmar = confirm(

        `Deseja excluir o colaborador ${colaborador.nome}?`

    );


    if (!confirmar) return;


    colaboradores =
        colaboradores.filter(
            item => item.id !== id
        );


    salvarColaboradores();


    carregarColaboradores();

}


/* =========================================================
   FORMATAÇÃO
========================================================= */

function formatarStatus(status) {

    const nomes = {

        retirado: "Retirado",

        devolvido: "Devolvido",

        extraviado: "Extraviado"

    };


    return nomes[status] || status;

}


function formatarData(data) {

    if (!data) return "-";


    return new Date(data)
        .toLocaleString(
            "pt-BR",
            {

                day: "2-digit",

                month: "2-digit",

                year: "numeric",

                hour: "2-digit",

                minute: "2-digit"

            }
        );

}


/* =========================================================
   SEGURANÇA BÁSICA PARA TEXTO INSERIDO NA TABELA
========================================================= */

function escaparHTML(texto) {

    if (texto === undefined ||
        texto === null) {

        return "";

    }


    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

atualizarDashboard();

carregarHistorico();
