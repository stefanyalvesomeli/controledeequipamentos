let registros = JSON.parse(
    localStorage.getItem("equipamentos")
) || [];


/* =========================
   NAVEGAÇÃO
========================= */

function mostrarPagina(pagina) {

    document.querySelectorAll(".pagina").forEach(section => {
        section.classList.remove("active");
    });

    document.querySelectorAll(".menu-btn").forEach(button => {
        button.classList.remove("active");
    });

    document.getElementById(pagina).classList.add("active");

    event.target.classList.add("active");

    if (pagina === "dashboard") {
        atualizarDashboard();
    }

    if (pagina === "historico") {
        carregarHistorico();
    }
}


/* =========================
   SALVAR
========================= */

function salvarDados() {

    localStorage.setItem(
        "equipamentos",
        JSON.stringify(registros)
    );
}


/* =========================
   REGISTRAR RETIRADA
========================= */

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


    if (!lms || !nome || !codigo) {

        alert(
            "Preencha o LMS, nome do colaborador e código do equipamento."
        );

        return;
    }


    const equipamentoExistente = registros.find(
        item =>
            item.codigo.toLowerCase() === codigo.toLowerCase() &&
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

        retirada: agora.toISOString(),

        devolucao: null,

        status: "retirado"

    };


    registros.push(registro);

    salvarDados();


    document.getElementById("lms").value = "";

    document.getElementById("nome").value = "";

    document.getElementById("codigo").value = "";

    document.getElementById("observacao").value = "";


    atualizarDashboard();

    carregarHistorico();

    /*
       O alerta de confirmação foi removido.
    */
}


/* =========================
   DASHBOARD
========================= */

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


/* =========================
   BUSCA DASHBOARD
========================= */

function buscarDashboard() {

    const termo = document
        .getElementById("buscaDashboard")
        .value
        .trim()
        .toLowerCase();


    const resultado = document.getElementById(
        "resultadoDashboard"
    );


    if (!termo) {

        resultado.innerHTML = "";

        return;
    }


    const encontrados = registros.filter(item =>

        item.lms.toLowerCase().includes(termo) ||

        item.nome.toLowerCase().includes(termo) ||

        item.codigo.toLowerCase().includes(termo)

    );


    if (encontrados.length === 0) {

        resultado.innerHTML = `

            <div class="resultado">
                Nenhum registro encontrado.
            </div>

        `;

        return;
    }


    resultado.innerHTML = encontrados.map(item => `

        <div class="resultado">

            <strong>
                ${item.nome}
            </strong>

            <div>
                LMS: ${item.lms}
            </div>

            <div>
                Equipamento: ${item.codigo}
            </div>

            <div>
                Status:

                <span class="status ${item.status}">
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
                ? `
                    <div>
                        Observação:
                        ${item.observacao}
                    </div>
                `
                : ""
            }

        </div>

    `).join("");
}


/* =========================
   BUSCA NA RETIRADA
========================= */

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


    const resultado = document.getElementById(
        "resultadoRetirada"
    );


    if (!lms && !codigo && !nome) {

        resultado.innerHTML = "";

        return;
    }


    const encontrados = registros.filter(item =>

        (lms && item.lms.toLowerCase().includes(lms)) ||

        (codigo && item.codigo.toLowerCase().includes(codigo)) ||

        (nome && item.nome.toLowerCase().includes(nome))

    );


    if (encontrados.length === 0) {

        resultado.innerHTML = `

            <div class="resultado">
                Nenhum registro encontrado.
            </div>

        `;

        return;
    }


    resultado.innerHTML = encontrados.map(item => `

        <div class="resultado">

            <strong>
                ${item.nome}
            </strong>

            <div>
                LMS: ${item.lms}
            </div>

            <div>
                Equipamento: ${item.codigo}
            </div>

            <div>

                Status:

                <span class="status ${item.status}">
                    ${formatarStatus(item.status)}
                </span>

            </div>

            ${
                item.observacao
                ? `
                    <div>
                        Observação: ${item.observacao}
                    </div>
                `
                : ""
            }

            <br>

            <button
                class="btn-editar"
                onclick="abrirEdicao(${item.id})"
            >
                Editar
            </button>

        </div>

    `).join("");
}


/* =========================
   HISTÓRICO
========================= */

function carregarHistorico() {

    const termo = document
        .getElementById("buscaHistorico")
        .value
        .trim()
        .toLowerCase();


    let lista = registros;


    if (termo) {

        lista = registros.filter(item =>

            item.lms.toLowerCase().includes(termo) ||

            item.nome.toLowerCase().includes(termo) ||

            item.codigo.toLowerCase().includes(termo)

        );

    }


    const tabela = document.getElementById(
        "tabelaHistorico"
    );


    if (lista.length === 0) {

        tabela.innerHTML = `

            <tr>

                <td colspan="8">
                    Nenhum registro encontrado.
                </td>

            </tr>

        `;

        return;
    }


    tabela.innerHTML = lista
        .slice()
        .reverse()
        .map(item => `

        <tr>

            <td>
                ${item.lms}
            </td>


            <td>
                ${item.nome}
            </td>


            <td>
                ${item.codigo}
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

                <span class="status ${item.status}">
                    ${formatarStatus(item.status)}
                </span>

            </td>


            <td class="observacao-tabela">

                ${
                    item.observacao || "-"
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

    `).join("");
}


/* =========================
   MOSTRAR TODOS
========================= */

function mostrarTodos() {

    document.getElementById(
        "buscaHistorico"
    ).value = "";


    carregarHistorico();
}


/* =========================
   EDITAR
========================= */

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
    ).value = registro.observacao || "";


    document
        .getElementById("modalEdicao")
        .classList.add("aberto");
}


function salvarEdicao() {

    const id = Number(
        document.getElementById("editarId").value
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


    const novoStatus = document
        .getElementById("editarStatus")
        .value;


    registro.status = novoStatus;


    if (
        novoStatus === "devolvido" &&
        !registro.devolucao
    ) {

        registro.devolucao =
            new Date().toISOString();

    }


    if (novoStatus !== "devolvido") {

        registro.devolucao = null;

    }


    salvarDados();

    fecharModal();

    atualizarDashboard();

    carregarHistorico();
}


function fecharModal() {

    document
        .getElementById("modalEdicao")
        .classList.remove("aberto");
}


/* =========================
   EXCLUIR
========================= */

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


/* =========================
   FORMATAÇÃO
========================= */

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


    return new Date(data).toLocaleString(
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


/* =========================
   INICIALIZAÇÃO
========================= */

atualizarDashboard();

carregarHistorico();
