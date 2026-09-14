/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://apbmzwmqyiyrximydseq.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_Qlgo3bzEfOZJBLLjyTxMkg_0p6v-Z8n";


const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


/* =========================================================
   DADOS
========================================================= */

let registros = [];

let colaboradores = [];


/* =========================================================
   PAGINAÇÃO DO HISTÓRICO
========================================================= */

let paginaHistorico = 1;

const REGISTROS_POR_PAGINA = 40;

let listaHistorico = [];


/* =========================================================
   FUNÇÕES AUXILIARES
========================================================= */

function normalizarTexto(valor) {

    return String(valor ?? "")
        .trim()
        .toLowerCase();

}


function escaparHTML(texto) {

    if (
        texto === undefined ||
        texto === null
    ) {
        return "";
    }


    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function formatarStatus(status) {

    const nomes = {

        retirado: "Retirado",

        devolvido: "Devolvido",

        extraviado: "Extraviado"

    };


    return nomes[status] || status || "-";

}


function formatarData(data) {

    if (!data) {
        return "-";
    }


    const dataFormatada = new Date(data);


    if (Number.isNaN(dataFormatada.getTime())) {
        return "-";
    }


    return dataFormatada.toLocaleString(
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
   GARANTIR PAGINAÇÃO NA SEÇÃO HISTÓRICO
========================================================= */

function obterPaginacaoHistorico() {

    const historico = document
        .getElementById("historico");


    if (!historico) {
        return null;
    }


    let paginacao = historico
        .querySelector("#paginacaoHistorico");


    /*
       Se o elemento não existir dentro da seção Histórico,
       ele será criado automaticamente depois da tabela.
    */

    if (!paginacao) {

        paginacao = document
            .createElement("div");


        paginacao.id =
            "paginacaoHistorico";


        paginacao.className =
            "paginacao-historico";


        const tabelaContainer = historico
            .querySelector(".tabela-container");


        if (tabelaContainer) {

            tabelaContainer
                .insertAdjacentElement(
                    "afterend",
                    paginacao
                );

        } else {

            const painel = historico
                .querySelector(".painel");


            if (painel) {
                painel.appendChild(paginacao);
            }

        }

    }


    return paginacao;

}


/* =========================================================
   CARREGAR DADOS DO BANCO
========================================================= */

async function carregarDados() {

    const {
        data: dadosRegistros,
        error: erroRegistros
    } = await db
        .from("registros")
        .select("*")
        .order("id", {
            ascending: true
        });


    if (erroRegistros) {

        console.error(
            "Erro ao carregar registros:",
            erroRegistros
        );


        alert(
            "Não foi possível carregar os registros do banco de dados."
        );


        return;

    }


    const {
        data: dadosColaboradores,
        error: erroColaboradores
    } = await db
        .from("colaboradores")
        .select("*")
        .order("id", {
            ascending: true
        });


    if (erroColaboradores) {

        console.error(
            "Erro ao carregar colaboradores:",
            erroColaboradores
        );


        alert(
            "Não foi possível carregar os colaboradores do banco de dados."
        );


        return;

    }


    registros =
        dadosRegistros || [];


    colaboradores =
        dadosColaboradores || [];


    atualizarDashboard();

    await carregarHistorico();

}


/* =========================================================
   NAVEGAÇÃO
========================================================= */

function mostrarPagina(pagina, botao) {

    document
        .querySelectorAll(".pagina")
        .forEach(section => {

            section.classList.remove("active");

        });


    document
        .querySelectorAll(".menu-btn")
        .forEach(button => {

            button.classList.remove("active");

        });


    const paginaSelecionada = document
        .getElementById(pagina);


    if (paginaSelecionada) {

        paginaSelecionada
            .classList.add("active");

    }


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
   CADASTRO DE COLABORADORES
========================================================= */

async function cadastrarColaborador() {

    const campoLms = document
        .getElementById("cadastroLms");


    const campoNome = document
        .getElementById("cadastroNome");


    if (!campoLms || !campoNome) {
        return;
    }


    const lms =
        campoLms.value.trim();


    const nome =
        campoNome.value.trim();


    if (!lms || !nome) {

        alert(
            "Preencha o LMS e o nome do colaborador."
        );


        return;

    }


    const lmsNormalizado =
        normalizarTexto(lms);


    const existente =
        colaboradores.find(
            colaborador =>
                normalizarTexto(colaborador.lms) ===
                lmsNormalizado
        );


    if (existente) {

        alert(
            "Este LMS já está cadastrado."
        );


        return;

    }


    const {
        data,
        error
    } = await db
        .from("colaboradores")
        .insert([
            {
                lms: lms,
                nome: nome
            }
        ])
        .select()
        .single();


    if (error) {

        console.error(
            "Erro ao cadastrar colaborador:",
            error
        );


        alert(
            "Erro ao cadastrar colaborador."
        );


        return;

    }


    colaboradores.push(data);


    campoLms.value = "";

    campoNome.value = "";


    await carregarColaboradores();

}


/* =========================================================
   LISTAR COLABORADORES
========================================================= */

async function carregarColaboradores() {

    const campo = document
        .getElementById("buscaColaborador");


    const tabela = document
        .getElementById("tabelaColaboradores");


    if (!campo || !tabela) {
        return;
    }


    const termo =
        normalizarTexto(campo.value);


    const {
        data,
        error
    } = await db
        .from("colaboradores")
        .select("*")
        .order("id", {
            ascending: true
        });


    if (error) {

        console.error(
            "Erro ao carregar colaboradores:",
            error
        );


        return;

    }


    colaboradores =
        data || [];


    let lista =
        colaboradores;


    if (termo) {

        lista =
            colaboradores.filter(
                colaborador =>

                    normalizarTexto(
                        colaborador.lms
                    ).includes(termo)

                    ||

                    normalizarTexto(
                        colaborador.nome
                    ).includes(termo)
            );

    }


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


    tabela.innerHTML =
        lista
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

    const campo = document
        .getElementById("buscaColaborador");


    if (!campo) {
        return;
    }


    campo.value = "";


    carregarColaboradores();

}


/* =========================================================
   BUSCAR NOME POR LMS
========================================================= */

function buscarNomePorLms() {

    const campoLms = document
        .getElementById("lms");


    const campoNome = document
        .getElementById("nome");


    const status = document
        .getElementById("statusLms");


    if (!campoLms || !campoNome || !status) {
        return;
    }


    const lms =
        normalizarTexto(campoLms.value);


    campoNome.value = "";

    status.textContent = "";

    status.className = "status-lms";


    if (!lms) {
        return;
    }


    const colaborador =
        colaboradores.find(
            item =>
                normalizarTexto(item.lms) === lms
        );


    if (colaborador) {

        campoNome.value =
            colaborador.nome;


        status.textContent =
            "Colaborador encontrado";


        status.classList.add("sucesso");

    } else {

        status.textContent =
            "LMS não cadastrado";


        status.classList.add("erro");

    }

}


/* =========================================================
   REGISTRAR RETIRADA
========================================================= */

async function registrarRetirada() {

    const campoLms = document
        .getElementById("lms");


    const campoNome = document
        .getElementById("nome");


    const campoCodigo = document
        .getElementById("codigo");


    const campoObservacao = document
        .getElementById("observacao");


    if (
        !campoLms ||
        !campoNome ||
        !campoCodigo ||
        !campoObservacao
    ) {
        return;
    }


    const lms =
        campoLms.value.trim();


    const nome =
        campoNome.value.trim();


    const codigo =
        campoCodigo.value.trim();


    const observacao =
        campoObservacao.value.trim();


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


    const {
        data: equipamentoExistente,
        error: erroBusca
    } = await db
        .from("registros")
        .select("*")
        .ilike("codigo", codigo)
        .eq("status", "retirado")
        .limit(1);


    if (erroBusca) {

        console.error(
            "Erro ao verificar equipamento:",
            erroBusca
        );


        alert(
            "Erro ao verificar o equipamento."
        );


        return;

    }


    if (
        equipamentoExistente &&
        equipamentoExistente.length > 0
    ) {

        alert(
            "Este equipamento já está registrado como retirado."
        );


        return;

    }


    const {
        data,
        error
    } = await db
        .from("registros")
        .insert([
            {
                lms: lms,
                nome: nome,
                codigo: codigo,
                observacao: observacao || null,
                retirada: new Date().toISOString(),
                devolucao: null,
                status: "retirado"
            }
        ])
        .select()
        .single();


    if (error) {

        console.error(
            "Erro ao registrar retirada:",
            error
        );


        alert(
            "Erro ao registrar a retirada."
        );


        return;

    }


    registros.push(data);


    campoLms.value = "";

    campoNome.value = "";

    campoCodigo.value = "";

    campoObservacao.value = "";


    const statusLms = document
        .getElementById("statusLms");


    if (statusLms) {

        statusLms.textContent = "";

        statusLms.className =
            "status-lms";

    }


    atualizarDashboard();

    await carregarHistorico();

}


/* =========================================================
   DASHBOARD
========================================================= */

function atualizarDashboard() {

    const retirados =
        registros.filter(
            item =>
                item.status === "retirado"
        ).length;


    const devolvidos =
        registros.filter(
            item =>
                item.status === "devolvido"
        ).length;


    const extraviados =
        registros.filter(
            item =>
                item.status === "extraviado"
        ).length;


    const totalRetirados = document
        .getElementById("totalRetirados");


    const totalDevolvidos = document
        .getElementById("totalDevolvidos");


    const totalExtraviados = document
        .getElementById("totalExtraviados");


    if (totalRetirados) {
        totalRetirados.textContent =
            retirados;
    }


    if (totalDevolvidos) {
        totalDevolvidos.textContent =
            devolvidos;
    }


    if (totalExtraviados) {
        totalExtraviados.textContent =
            extraviados;
    }

}


/* =========================================================
   BUSCA NO DASHBOARD
========================================================= */

function buscarDashboard() {

    const campo = document
        .getElementById("buscaDashboard");


    const resultado = document
        .getElementById("resultadoDashboard");


    if (!campo || !resultado) {
        return;
    }


    const termo =
        normalizarTexto(campo.value);


    if (!termo) {

        resultado.innerHTML = "";

        return;

    }


    const encontrados =
        registros.filter(
            item =>

                normalizarTexto(item.lms)
                    .includes(termo)

                ||

                normalizarTexto(item.nome)
                    .includes(termo)

                ||

                normalizarTexto(item.codigo)
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
            .slice()
            .reverse()
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
                            class="status ${escaparHTML(item.status)}"
                        >
                            ${escaparHTML(
                                formatarStatus(item.status)
                            )}
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
                                    ${escaparHTML(item.observacao)}
                                </div>
                            `
                            : ""
                    }

                </div>

            `)
            .join("");

}


/* =========================================================
   BUSCA NA ABA DE RETIRADA
========================================================= */

function buscarRetirada() {

    const campoLms = document
        .getElementById("lms");


    const campoCodigo = document
        .getElementById("codigo");


    const campoNome = document
        .getElementById("nome");


    const resultado = document
        .getElementById("resultadoRetirada");


    if (
        !campoLms ||
        !campoCodigo ||
        !campoNome ||
        !resultado
    ) {
        return;
    }


    const lms =
        normalizarTexto(campoLms.value);


    const codigo =
        normalizarTexto(campoCodigo.value);


    const nome =
        normalizarTexto(campoNome.value);


    if (!lms && !codigo && !nome) {

        resultado.innerHTML = "";

        return;

    }


    const encontrados =
        registros.filter(
            item =>

                (
                    lms &&
                    normalizarTexto(item.lms)
                        .includes(lms)
                )

                ||

                (
                    codigo &&
                    normalizarTexto(item.codigo)
                        .includes(codigo)
                )

                ||

                (
                    nome &&
                    normalizarTexto(item.nome)
                        .includes(nome)
                )
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
            .slice()
            .reverse()
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
                            class="status ${escaparHTML(item.status)}"
                        >
                            ${escaparHTML(
                                formatarStatus(item.status)
                            )}
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
                                    ${escaparHTML(item.observacao)}
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

            `)
            .join("");

}


/* =========================================================
   HISTÓRICO
========================================================= */

async function carregarHistorico() {

    const campo = document
        .getElementById("buscaHistorico");


    const tabela = document
        .querySelector("#historico #tabelaHistorico");


    if (!campo || !tabela) {
        return;
    }


    const termo =
        normalizarTexto(campo.value);


    const {
        data,
        error
    } = await db
        .from("registros")
        .select("*")
        .order("id", {
            ascending: true
        });


    if (error) {

        console.error(
            "Erro ao carregar histórico:",
            error
        );


        tabela.innerHTML = `

            <tr>

                <td colspan="8">
                    Erro ao carregar o histórico.
                </td>

            </tr>

        `;


        const paginacaoErro =
            obterPaginacaoHistorico();


        if (paginacaoErro) {
            paginacaoErro.innerHTML = "";
        }


        return;

    }


    registros =
        data || [];


    let lista =
        registros;


    if (termo) {

        lista =
            registros.filter(
                item =>

                    normalizarTexto(item.lms)
                        .includes(termo)

                    ||

                    normalizarTexto(item.nome)
                        .includes(termo)

                    ||

                    normalizarTexto(item.codigo)
                        .includes(termo)
            );

    }


    /*
       Os registros mais recentes aparecem primeiro.
    */

    listaHistorico =
        lista
            .slice()
            .reverse();


    /*
       Toda nova busca ou recarregamento
       começa na primeira página.
    */

    paginaHistorico = 1;


    renderizarHistorico();

}


/* =========================================================
   RENDERIZAR HISTÓRICO PAGINADO
========================================================= */

function renderizarHistorico() {

    const historico = document
        .getElementById("historico");


    const tabela = historico
        ? historico.querySelector("#tabelaHistorico")
        : null;


    const paginacao =
        obterPaginacaoHistorico();


    if (!tabela || !paginacao) {
        return;
    }


    if (!listaHistorico.length) {

        tabela.innerHTML = `

            <tr>

                <td colspan="8">
                    Nenhum registro encontrado.
                </td>

            </tr>

        `;


        paginacao.innerHTML = "";

        return;

    }


    const totalPaginas =
        Math.ceil(
            listaHistorico.length /
            REGISTROS_POR_PAGINA
        );


    if (paginaHistorico < 1) {

        paginaHistorico = 1;

    }


    if (paginaHistorico > totalPaginas) {

        paginaHistorico =
            totalPaginas;

    }


    const inicio =
        (
            paginaHistorico - 1
        ) * REGISTROS_POR_PAGINA;


    const fim =
        inicio + REGISTROS_POR_PAGINA;


    const registrosDaPagina =
        listaHistorico.slice(inicio, fim);


    tabela.innerHTML =
        registrosDaPagina
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
                            class="status ${escaparHTML(item.status)}"
                        >
                            ${escaparHTML(
                                formatarStatus(item.status)
                            )}
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


    paginacao.innerHTML = `

        <div class="paginacao-info">

            Exibindo
            ${inicio + 1}
            até
            ${Math.min(
                fim,
                listaHistorico.length
            )}
            de
            ${listaHistorico.length}
            registros

        </div>


        <div class="paginacao-controles">

            <button
                type="button"
                class="btn-paginacao"
                onclick="mudarPaginaHistorico(-1)"
                ${paginaHistorico === 1 ? "disabled" : ""}
            >
                Anterior
            </button>


            <span class="pagina-atual">
                Página ${paginaHistorico} de ${totalPaginas}
            </span>


            <button
                type="button"
                class="btn-paginacao"
                onclick="mudarPaginaHistorico(1)"
                ${
                    paginaHistorico === totalPaginas
                        ? "disabled"
                        : ""
                }
            >
                Próxima
            </button>

        </div>

    `;

}


/* =========================================================
   MUDAR PÁGINA DO HISTÓRICO
========================================================= */

function mudarPaginaHistorico(direcao) {

    const totalPaginas =
        Math.ceil(
            listaHistorico.length /
            REGISTROS_POR_PAGINA
        );


    if (!totalPaginas) {
        return;
    }


    const novaPagina =
        paginaHistorico + Number(direcao);


    if (
        novaPagina < 1 ||
        novaPagina > totalPaginas
    ) {
        return;
    }


    paginaHistorico =
        novaPagina;


    renderizarHistorico();


    const historico =
        document.getElementById("historico");


    if (historico) {

        historico.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


/* =========================================================
   MOSTRAR TODOS OS REGISTROS
========================================================= */

function mostrarTodos() {

    const campo = document
        .getElementById("buscaHistorico");


    if (!campo) {
        return;
    }


    campo.value = "";


    paginaHistorico = 1;


    carregarHistorico();

}


/* =========================================================
   EDITAR REGISTRO
========================================================= */

function abrirEdicao(id) {

    const registro =
        registros.find(
            item =>
                Number(item.id) === Number(id)
        );


    if (!registro) {
        return;
    }


    const campoId = document
        .getElementById("editarId");


    const campoLms = document
        .getElementById("editarLms");


    const campoNome = document
        .getElementById("editarNome");


    const campoCodigo = document
        .getElementById("editarCodigo");


    const campoStatus = document
        .getElementById("editarStatus");


    const campoObservacao = document
        .getElementById("editarObservacao");


    const modal = document
        .getElementById("modalEdicao");


    if (
        !campoId ||
        !campoLms ||
        !campoNome ||
        !campoCodigo ||
        !campoStatus ||
        !campoObservacao ||
        !modal
    ) {
        return;
    }


    campoId.value =
        registro.id;


    campoLms.value =
        registro.lms || "";


    campoNome.value =
        registro.nome || "";


    campoCodigo.value =
        registro.codigo || "";


    campoStatus.value =
        registro.status || "retirado";


    campoObservacao.value =
        registro.observacao || "";


    modal.classList.add("aberto");

}


async function salvarEdicao() {

    const campoId = document
        .getElementById("editarId");


    const campoLms = document
        .getElementById("editarLms");


    const campoNome = document
        .getElementById("editarNome");


    const campoCodigo = document
        .getElementById("editarCodigo");


    const campoStatus = document
        .getElementById("editarStatus");


    const campoObservacao = document
        .getElementById("editarObservacao");


    if (
        !campoId ||
        !campoLms ||
        !campoNome ||
        !campoCodigo ||
        !campoStatus ||
        !campoObservacao
    ) {
        return;
    }


    const id =
        Number(campoId.value);


    const lms =
        campoLms.value.trim();


    const nome =
        campoNome.value.trim();


    const codigo =
        campoCodigo.value.trim();


    const observacao =
        campoObservacao.value.trim();


    const novoStatus =
        campoStatus.value;


    if (!lms || !nome || !codigo) {

        alert(
            "Preencha o LMS, nome e código do equipamento."
        );


        return;

    }


    const registro =
        registros.find(
            item =>
                Number(item.id) === id
        );


    if (!registro) {
        return;
    }


    let devolucao =
        registro.devolucao;


    if (
        novoStatus === "devolvido" &&
        !devolucao
    ) {

        devolucao =
            new Date().toISOString();

    }


    if (novoStatus !== "devolvido") {

        devolucao = null;

    }


    const {
        data,
        error
    } = await db
        .from("registros")
        .update({
            lms: lms,
            nome: nome,
            codigo: codigo,
            observacao: observacao || null,
            status: novoStatus,
            devolucao: devolucao
        })
        .eq("id", id)
        .select()
        .single();


    if (error) {

        console.error(
            "Erro ao editar registro:",
            error
        );


        alert(
            "Erro ao salvar as alterações."
        );


        return;

    }


    const indice =
        registros.findIndex(
            item =>
                Number(item.id) === id
        );


    if (indice !== -1) {

        registros[indice] =
            data;

    }


    fecharModal();

    atualizarDashboard();

    await carregarHistorico();

}


/* =========================================================
   FECHAR MODAL DE REGISTRO
========================================================= */

function fecharModal() {

    const modal = document
        .getElementById("modalEdicao");


    if (modal) {

        modal.classList
            .remove("aberto");

    }

}


/* =========================================================
   EXCLUIR REGISTRO
========================================================= */

async function excluirRegistro(id) {

    const confirmar =
        confirm(
            "Tem certeza que deseja excluir este registro?"
        );


    if (!confirmar) {
        return;
    }


    const {
        error
    } = await db
        .from("registros")
        .delete()
        .eq("id", id);


    if (error) {

        console.error(
            "Erro ao excluir registro:",
            error
        );


        alert(
            "Erro ao excluir o registro."
        );


        return;

    }


    registros =
        registros.filter(
            item =>
                Number(item.id) !== Number(id)
        );


    atualizarDashboard();

    await carregarHistorico();

}


/* =========================================================
   EDITAR COLABORADOR
========================================================= */

function abrirEdicaoColaborador(id) {

    const colaborador =
        colaboradores.find(
            item =>
                Number(item.id) === Number(id)
        );


    if (!colaborador) {
        return;
    }


    const campoId = document
        .getElementById(
            "editarColaboradorId"
        );


    const campoLms = document
        .getElementById(
            "editarColaboradorLms"
        );


    const campoNome = document
        .getElementById(
            "editarColaboradorNome"
        );


    const modal = document
        .getElementById(
            "modalColaborador"
        );


    if (
        !campoId ||
        !campoLms ||
        !campoNome ||
        !modal
    ) {
        return;
    }


    campoId.value =
        colaborador.id;


    campoLms.value =
        colaborador.lms || "";


    campoNome.value =
        colaborador.nome || "";


    modal.classList.add("aberto");

}


async function salvarEdicaoColaborador() {

    const campoId = document
        .getElementById(
            "editarColaboradorId"
        );


    const campoLms = document
        .getElementById(
            "editarColaboradorLms"
        );


    const campoNome = document
        .getElementById(
            "editarColaboradorNome"
        );


    if (
        !campoId ||
        !campoLms ||
        !campoNome
    ) {
        return;
    }


    const id =
        Number(campoId.value);


    const lms =
        campoLms.value.trim();


    const nome =
        campoNome.value.trim();


    if (!lms || !nome) {

        alert(
            "Preencha o LMS e o nome."
        );


        return;

    }


    const outroColaborador =
        colaboradores.find(
            item =>

                Number(item.id) !== id &&

                normalizarTexto(item.lms) ===
                normalizarTexto(lms)
        );


    if (outroColaborador) {

        alert(
            "Este LMS já pertence a outro colaborador."
        );


        return;

    }


    const colaborador =
        colaboradores.find(
            item =>
                Number(item.id) === id
        );


    if (!colaborador) {
        return;
    }


    const lmsAntigo =
        colaborador.lms;


    const {
        error: erroColaborador
    } = await db
        .from("colaboradores")
        .update({
            lms: lms,
            nome: nome
        })
        .eq("id", id);


    if (erroColaborador) {

        console.error(
            "Erro ao editar colaborador:",
            erroColaborador
        );


        alert(
            "Erro ao salvar o colaborador."
        );


        return;

    }


    /*
       Atualiza também os registros antigos
       desse colaborador.
    */

    const {
        error: erroRegistros
    } = await db
        .from("registros")
        .update({
            lms: lms,
            nome: nome
        })
        .ilike("lms", lmsAntigo);


    if (erroRegistros) {

        console.error(
            "Erro ao atualizar registros:",
            erroRegistros
        );


        alert(
            "O colaborador foi atualizado, mas ocorreu um erro ao atualizar os registros antigos."
        );

    }


    colaboradores =
        colaboradores.map(item => {

            if (
                Number(item.id) === id
            ) {

                return {
                    ...item,
                    lms: lms,
                    nome: nome
                };

            }


            return item;

        });


    registros =
        registros.map(item => {

            if (
                normalizarTexto(item.lms) ===
                normalizarTexto(lmsAntigo)
            ) {

                return {
                    ...item,
                    lms: lms,
                    nome: nome
                };

            }


            return item;

        });


    fecharModalColaborador();

    await carregarColaboradores();

    await carregarHistorico();

    atualizarDashboard();

}


/* =========================================================
   FECHAR MODAL DE COLABORADOR
========================================================= */

function fecharModalColaborador() {

    const modal = document
        .getElementById(
            "modalColaborador"
        );


    if (modal) {

        modal.classList
            .remove("aberto");

    }

}


/* =========================================================
   EXCLUIR COLABORADOR
========================================================= */

async function excluirColaborador(id) {

    const colaborador =
        colaboradores.find(
            item =>
                Number(item.id) === Number(id)
        );


    if (!colaborador) {
        return;
    }


    const confirmar =
        confirm(
            `Deseja excluir o colaborador ${colaborador.nome}?`
        );


    if (!confirmar) {
        return;
    }


    const {
        error
    } = await db
        .from("colaboradores")
        .delete()
        .eq("id", id);


    if (error) {

        console.error(
            "Erro ao excluir colaborador:",
            error
        );


        alert(
            "Erro ao excluir o colaborador."
        );


        return;

    }


    colaboradores =
        colaboradores.filter(
            item =>
                Number(item.id) !== Number(id)
        );


    await carregarColaboradores();

}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        obterPaginacaoHistorico();

        await carregarDados();

    }
);
