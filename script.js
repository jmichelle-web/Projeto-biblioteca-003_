// ========================================
// FIREBASE
// ========================================

import { db } from "./firebase-config.js";

import {
    collection,
    getDocs,
    setDoc,
    doc,
    deleteDoc,
    onSnapshot
} from
    "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";


// ========================================
// DADOS
// ========================================

let alunos = [];

let livros = [];

let emprestimos = [];


// ========================================
// CONFIGURAÇÃO DAS MULTAS
// ========================================

// 15 dias de tolerância depois do vencimento
const DIAS_TOLERANCIA = 15;

// Primeira multa
const MULTA_INICIAL = 2;

// A cada 7 dias depois da multa inicial
const MULTA_SEMANAL = 4;


// ========================================
// REFERÊNCIAS DO FIRESTORE
// ========================================

const alunosRef =
    collection(db, "alunos");

const livrosRef =
    collection(db, "livros");

const emprestimosRef =
    collection(db, "emprestimos");


// ========================================
// GERAR ID
// ========================================

function gerarId(lista) {

    if (lista.length === 0) {
        return 1;
    }

    return Math.max(
        ...lista.map(item => Number(item.id))
    ) + 1;
}


// ========================================
// CONVERTER DATA
// ========================================

function converterData(data) {

    if (!data) {
        return null;
    }

    const partes =
        data.split("-");

    return new Date(
        Number(partes[0]),
        Number(partes[1]) - 1,
        Number(partes[2])
    );
}


// ========================================
// CALCULAR DIAS DE ATRASO
// ========================================

function calcularDiasAtraso(
    previsaoEntrega,
    dataFinal
) {

    const dataPrevista =
        converterData(
            previsaoEntrega
        );

    const dataAtual =
        converterData(
            dataFinal
        );

    if (
        !dataPrevista ||
        !dataAtual
    ) {
        return 0;
    }

    const diferenca =
        dataAtual - dataPrevista;

    const dias =
        Math.floor(
            diferenca /
            (1000 * 60 * 60 * 24)
        );

    return Math.max(
        0,
        dias
    );
}


// ========================================
// CALCULAR MULTA
// ========================================

function calcularMulta(
    previsaoEntrega,
    dataFinal
) {

    const diasAtraso =
        calcularDiasAtraso(
            previsaoEntrega,
            dataFinal
        );


    if (
        diasAtraso <=
        DIAS_TOLERANCIA
    ) {

        return 0;

    }


    const diasDepoisTolerancia =
        diasAtraso -
        DIAS_TOLERANCIA;


    let multa =
        MULTA_INICIAL;


    const semanasExtras =
        Math.floor(
            (diasDepoisTolerancia - 1) / 7
        );


    multa +=
        semanasExtras *
        MULTA_SEMANAL;


    return multa;
}


// ========================================
// STATUS DA DEVOLUÇÃO
// ========================================

function obterStatusDevolucao(
    emprestimo,
    dataFinal
) {

    const diasAtraso =
        calcularDiasAtraso(
            emprestimo.previsaoEntrega,
            dataFinal
        );


    if (
        diasAtraso === 0
    ) {

        return {

            texto:
                "🟢 Devolvido no prazo",

            classe:
                "no-prazo"

        };

    }


    if (
        diasAtraso <=
        DIAS_TOLERANCIA
    ) {

        return {

            texto:
                "🟡 Dentro do prazo de tolerância",

            classe:
                "tolerancia"

        };

    }


    const multa =
        calcularMulta(
            emprestimo.previsaoEntrega,
            dataFinal
        );


    return {

        texto:
            `🔴 Precisou pagar multa: R$ ${multa
                .toFixed(2)
                .replace(".", ",")}`,

        classe:
            "com-multa"

    };
}


// ========================================
// FIREBASE - SALVAR ALUNO
// ========================================

async function salvarAluno(aluno) {

    try {

        await setDoc(
            doc(
                db,
                "alunos",
                String(aluno.id)
            ),
            aluno
        );

    } catch (erro) {

        console.error(
            "Erro ao salvar aluno:",
            erro
        );

        alert(
            "Erro ao salvar aluno no Firebase."
        );

        throw erro;
    }
}


// ========================================
// FIREBASE - SALVAR LIVRO
// ========================================

async function salvarLivro(livro) {

    try {

        await setDoc(
            doc(
                db,
                "livros",
                String(livro.id)
            ),
            livro
        );

    } catch (erro) {

        console.error(
            "Erro ao salvar livro:",
            erro
        );

        alert(
            "Erro ao salvar livro no Firebase."
        );

        throw erro;
    }
}


// ========================================
// FIREBASE - SALVAR EMPRÉSTIMO
// ========================================

async function salvarEmprestimo(
    emprestimo
) {

    try {

        await setDoc(
            doc(
                db,
                "emprestimos",
                String(emprestimo.id)
            ),
            emprestimo
        );

    } catch (erro) {

        console.error(
            "Erro ao salvar empréstimo:",
            erro
        );

        alert(
            "Erro ao salvar empréstimo no Firebase."
        );

        throw erro;
    }
}


// ========================================
// FIREBASE - EXCLUIR ALUNO
// ========================================

async function removerAluno(id) {

    await deleteDoc(
        doc(
            db,
            "alunos",
            String(id)
        )
    );
}


// ========================================
// FIREBASE - EXCLUIR LIVRO
// ========================================

async function removerLivro(id) {

    await deleteDoc(
        doc(
            db,
            "livros",
            String(id)
        )
    );
}


// ========================================
// CADASTRAR ALUNO
// ========================================

document
    .getElementById("formAluno")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const aluno = {

                id:
                    gerarId(alunos),

                nome:
                    document
                        .getElementById(
                            "nomeAluno"
                        )
                        .value
                        .trim(),

                matricula:
                    document
                        .getElementById(
                            "matricula"
                        )
                        .value
                        .trim(),

                turma:
                    document
                        .getElementById(
                            "turma"
                        )
                        .value
                        .trim(),

                email:
                    document
                        .getElementById(
                            "email"
                        )
                        .value
                        .trim(),

                telefone:
                    document
                        .getElementById(
                            "telefone"
                        )
                        .value
                        .trim()

            };


            try {

                await salvarAluno(
                    aluno
                );


                this.reset();


                alert(
                    "Aluno cadastrado com sucesso!"
                );


            } catch (erro) {

                console.error(erro);

            }

        }
    );


// ========================================
// LISTAR ALUNOS
// ========================================

function listarAlunos() {

    const tabela =
        document.getElementById(
            "tabelaAlunos"
        );


    if (!tabela) {
        return;
    }


    tabela.innerHTML = "";


    alunos.forEach(aluno => {

        const linha =
            document.createElement("tr");


        linha.innerHTML = `

            <td>
                ${aluno.id}
            </td>

            <td>
                ${aluno.nome}
            </td>

            <td>
                ${aluno.matricula}
            </td>

            <td>
                ${aluno.turma}
            </td>

            <td>
                ${aluno.email || "-"}
            </td>

            <td>
                ${aluno.telefone || "-"}
            </td>

            <td>

                <button
                    class="btn-delete"
                    onclick="excluirAluno(${aluno.id})">

                    Excluir

                </button>

            </td>

        `;


        tabela.appendChild(
            linha
        );

    });

}


// ========================================
// EXCLUIR ALUNO
// ========================================

async function excluirAluno(id) {

    const confirmar =
        confirm(
            "Deseja realmente excluir este aluno?"
        );


    if (!confirmar) {
        return;
    }


    try {

        await removerAluno(id);


        alert(
            "Aluno excluído com sucesso!"
        );


    } catch (erro) {

        console.error(
            "Erro ao excluir aluno:",
            erro
        );

        alert(
            "Erro ao excluir aluno."
        );

    }

}


// ========================================
// DISPONIBILIZAR FUNÇÃO PARA O HTML
// ========================================

window.excluirAluno =
    excluirAluno;


// ========================================
// CADASTRAR LIVRO
// ========================================

document
    .getElementById("formLivro")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const livro = {

                id:
                    gerarId(livros),

                titulo:
                    document
                        .getElementById(
                            "tituloLivro"
                        )
                        .value
                        .trim(),

                autor:
                    document
                        .getElementById(
                            "autor"
                        )
                        .value
                        .trim(),

                isbn:
                    document
                        .getElementById(
                            "isbn"
                        )
                        .value
                        .trim(),

                categoria:
                    document
                        .getElementById(
                            "categoria"
                        )
                        .value,

                tipo:
                    document
                        .getElementById(
                            "tipoLivro"
                        )
                        .value,

                ano:
                    document
                        .getElementById(
                            "ano"
                        )
                        .value,

                status:
                    "Disponível"

            };


            try {

                await salvarLivro(
                    livro
                );


                this.reset();


                alert(
                    "Livro cadastrado com sucesso!"
                );


            } catch (erro) {

                console.error(erro);

            }

        }
    );


// ========================================
// LISTAR LIVROS
// ========================================

function listarLivros() {

    const tabela =
        document.getElementById(
            "tabelaLivros"
        );


    if (!tabela) {
        return;
    }


    tabela.innerHTML = "";


    livros.forEach(livro => {

        const linha =
            document.createElement("tr");


        linha.innerHTML = `

            <td>
                ${livro.id}
            </td>

            <td>
                ${livro.titulo}
            </td>

            <td>
                ${livro.autor}
            </td>

            <td>
                ${livro.categoria}
            </td>

            <td>
                ${livro.tipo}
            </td>

            <td>
                ${livro.ano}
            </td>

            <td>

                <span class="status
                    ${
                        livro.status ===
                        "Disponível"
                            ? "disponivel"
                            : "indisponivel"
                    }">

                    ${
                        livro.status ===
                        "Disponível"
                            ? "🟢 Disponível"
                            : "🔴 Emprestado"
                    }

                </span>

            </td>

            <td>

                <button
                    class="btn-delete"
                    onclick="excluirLivro(${livro.id})">

                    Excluir

                </button>

            </td>

        `;


        tabela.appendChild(
            linha
        );

    });

}


// ========================================
// EXCLUIR LIVRO
// ========================================

async function excluirLivro(id) {

    const livro =
        livros.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (
        livro &&
        livro.status ===
        "Emprestado"
    ) {

        alert(
            "Este livro está emprestado."
        );

        return;
    }


    const confirmar =
        confirm(
            "Deseja realmente excluir este livro?"
        );


    if (!confirmar) {
        return;
    }


    try {

        await removerLivro(id);


        alert(
            "Livro excluído com sucesso!"
        );


    } catch (erro) {

        console.error(
            "Erro ao excluir livro:",
            erro
        );

        alert(
            "Erro ao excluir livro."
        );

    }

}


window.excluirLivro =
    excluirLivro;


// ========================================
// CARREGAR ALUNOS
// ========================================

function carregarAlunos() {

    const select =
        document.getElementById(
            "alunoEmprestimo"
        );


    if (!select) {
        return;
    }


    select.innerHTML = `

        <option value="">
            Selecione o aluno
        </option>

    `;


    alunos.forEach(aluno => {

        select.innerHTML += `

            <option value="${aluno.id}">

                ${aluno.nome}
                -
                ${aluno.matricula}

            </option>

        `;

    });

}


// ========================================
// CARREGAR LIVROS DISPONÍVEIS
// ========================================

function carregarLivros() {

    const select =
        document.getElementById(
            "livroEmprestimo"
        );


    if (!select) {
        return;
    }


    select.innerHTML = `

        <option value="">
            Selecione o livro
        </option>

    `;


    livros
        .filter(
            livro =>
                livro.status ===
                "Disponível"
        )
        .forEach(livro => {

            select.innerHTML += `

                <option value="${livro.id}">

                    ${livro.titulo}

                </option>

            `;

        });

}


// ========================================
// EMPRÉSTIMO
// ========================================

document
    .getElementById("formEmprestimo")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const alunoId =
                Number(
                    document
                        .getElementById(
                            "alunoEmprestimo"
                        )
                        .value
                );


            const livroId =
                Number(
                    document
                        .getElementById(
                            "livroEmprestimo"
                        )
                        .value
                );


            const dataEmprestimo =
                document
                    .getElementById(
                        "dataEmprestimo"
                    )
                    .value;


            const previsaoEntrega =
                document
                    .getElementById(
                        "previsaoEntrega"
                    )
                    .value;


            const dataDevolucao =
                document
                    .getElementById(
                        "dataDevolucao"
                    )
                    .value;


            if (
                !alunoId ||
                !livroId
            ) {

                alert(
                    "Selecione o aluno e o livro."
                );

                return;
            }


            if (!dataEmprestimo) {

                alert(
                    "Informe a data do empréstimo."
                );

                return;
            }


            if (!previsaoEntrega) {

                alert(
                    "Informe a previsão de entrega."
                );

                return;
            }


            const livro =
                livros.find(
                    item =>
                        Number(item.id) ===
                        Number(livroId)
                );


            if (!livro) {

                alert(
                    "Livro não encontrado."
                );

                return;
            }


            if (
                livro.status !==
                "Disponível"
            ) {

                alert(
                    "Este livro não está disponível."
                );

                return;
            }


            let multa = 0;

            let statusDevolucao =
                "Emprestado";


            if (dataDevolucao) {

                multa =
                    calcularMulta(
                        previsaoEntrega,
                        dataDevolucao
                    );

                statusDevolucao =
                    "Devolvido";

            }


            const emprestimo = {

                id:
                    gerarId(
                        emprestimos
                    ),

                alunoId:
                    alunoId,

                livroId:
                    livroId,

                dataEmprestimo:
                    dataEmprestimo,

                previsaoEntrega:
                    previsaoEntrega,

                dataDevolucao:
                    dataDevolucao,

                multa:
                    multa,

                status:
                    statusDevolucao

            };


            try {

                // Salvar empréstimo
                await salvarEmprestimo(
                    emprestimo
                );


                // Atualizar livro
                livro.status =
                    dataDevolucao
                        ? "Disponível"
                        : "Emprestado";


                await salvarLivro(
                    livro
                );


                this.reset();


                alert(
                    "Empréstimo registrado com sucesso!"
                );


            } catch (erro) {

                console.error(
                    "Erro no empréstimo:",
                    erro
                );

                alert(
                    "Erro ao registrar empréstimo."
                );

            }

        }
    );


// ========================================
// LISTAR EMPRÉSTIMOS
// ========================================

function listarEmprestimos() {

    const tabela =
        document.getElementById(
            "tabelaEmprestimos"
        );


    if (!tabela) {
        return;
    }


    tabela.innerHTML = "";


    emprestimos.forEach(
        emprestimo => {

            const aluno =
                alunos.find(
                    item =>
                        Number(item.id) ===
                        Number(
                            emprestimo.alunoId
                        )
                );


            const livro =
                livros.find(
                    item =>
                        Number(item.id) ===
                        Number(
                            emprestimo.livroId
                        )
                );


            if (
                !aluno ||
                !livro
            ) {

                return;

            }


            const linha =
                document.createElement(
                    "tr"
                );


            let statusAtual =
                "Emprestado";


            let multaAtual =
                0;


            if (
                emprestimo.status ===
                "Devolvido"
            ) {

                statusAtual =
                    "Devolvido";


                multaAtual =
                    Number(
                        emprestimo.multa
                    ) || 0;

            } else {

                const hoje =
                    new Date()
                        .toISOString()
                        .split("T")[0];


                const diasAtraso =
                    calcularDiasAtraso(
                        emprestimo.previsaoEntrega,
                        hoje
                    );


                multaAtual =
                    calcularMulta(
                        emprestimo.previsaoEntrega,
                        hoje
                    );


                if (
                    diasAtraso ===
                    0
                ) {

                    statusAtual =
                        "🟢 No prazo";

                } else if (
                    diasAtraso <=
                    DIAS_TOLERANCIA
                ) {

                    statusAtual =
                        "🟡 Tolerância";

                } else {

                    statusAtual =
                        "🔴 Com multa";

                }

            }


            let situacaoAluno =
                "";


            if (
                emprestimo.status ===
                "Devolvido"
            ) {

                const status =
                    obterStatusDevolucao(
                        emprestimo,
                        emprestimo.dataDevolucao
                    );


                situacaoAluno = `

                    <div
                        class="${status.classe}">

                        ${status.texto}

                    </div>

                `;

            } else {

                const hoje =
                    new Date()
                        .toISOString()
                        .split("T")[0];


                const status =
                    obterStatusDevolucao(
                        emprestimo,
                        hoje
                    );


                situacaoAluno = `

                    <div
                        class="${status.classe}">

                        ${status.texto}

                    </div>

                `;

            }


            linha.innerHTML = `

                <td>

                    <strong>
                        ${aluno.nome}
                    </strong>

                    ${situacaoAluno}

                </td>


                <td>
                    ${livro.titulo}
                </td>


                <td>
                    ${formatarData(
                        emprestimo.dataEmprestimo
                    )}
                </td>


                <td>
                    ${formatarData(
                        emprestimo.previsaoEntrega
                    )}
                </td>


                <td>

                    ${
                        emprestimo.dataDevolucao
                            ? formatarData(
                                emprestimo.dataDevolucao
                            )
                            : "-"
                    }

                </td>


                <td>

                    ${
                        multaAtual > 0

                            ? `

                                <strong
                                    style="color:#d32f2f">

                                    R$
                                    ${multaAtual
                                        .toFixed(2)
                                        .replace(
                                            ".",
                                            ","
                                        )}

                                </strong>

                            `

                            : `

                                <span
                                    style="color:#2e7d32">

                                    R$ 0,00

                                </span>

                            `
                    }

                </td>


                <td>

                    <span class="status">

                        ${statusAtual}

                    </span>

                </td>


                <td>

                    ${
                        emprestimo.status ===
                        "Emprestado"

                        ? `

                            <button
                                class="btn-success"
                                onclick="devolverLivro(
                                    ${emprestimo.id}
                                )">

                                Devolver

                            </button>

                        `

                        : "-"

                    }

                </td>

            `;


            tabela.appendChild(
                linha
            );

        }
    );

}


// ========================================
// DEVOLVER LIVRO
// ========================================

async function devolverLivro(id) {

    const emprestimo =
        emprestimos.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!emprestimo) {
        return;
    }


    const livro =
        livros.find(
            item =>
                Number(item.id) ===
                Number(
                    emprestimo.livroId
                )
        );


    const hoje =
        new Date()
            .toISOString()
            .split("T")[0];


    const multa =
        calcularMulta(
            emprestimo.previsaoEntrega,
            hoje
        );


    emprestimo.dataDevolucao =
        hoje;


    emprestimo.multa =
        multa;


    emprestimo.status =
        "Devolvido";


    if (livro) {

        livro.status =
            "Disponível";

    }


    try {

        await salvarEmprestimo(
            emprestimo
        );


        if (livro) {

            await salvarLivro(
                livro
            );

        }


        if (multa > 0) {

            alert(

                "Livro devolvido com sucesso!\n\n" +

                "⚠️ O aluno precisará pagar uma multa de " +

                "R$ " +

                multa
                    .toFixed(2)
                    .replace(".", ",") +

                "."

            );

        } else {

            alert(

                "Livro devolvido com sucesso!\n\n" +

                "🟢 O livro foi devolvido sem multa."

            );

        }


    } catch (erro) {

        console.error(
            "Erro ao devolver livro:",
            erro
        );

        alert(
            "Erro ao registrar a devolução."
        );

    }

}


window.devolverLivro =
    devolverLivro;


// ========================================
// CATÁLOGO
// ========================================

let filtroAtual =
    "todos";


function listarCatalogo() {

    const tabela =
        document.getElementById(
            "tabelaCatalogo"
        );


    if (!tabela) {
        return;
    }


    tabela.innerHTML = "";


    const campoPesquisa =
        document.getElementById(
            "pesquisaLivro"
        );


    const pesquisa =
        campoPesquisa
            ? campoPesquisa.value.toLowerCase()
            : "";


    livros.forEach(livro => {


        if (
            filtroAtual !==
            "todos" &&

            livro.status !==
            filtroAtual &&

            livro.tipo !==
            filtroAtual
        ) {

            return;

        }


        const texto = `

            ${livro.titulo}

            ${livro.autor}

            ${livro.categoria}

            ${livro.tipo}

        `.toLowerCase();


        if (
            pesquisa &&
            !texto.includes(
                pesquisa
            )
        ) {

            return;

        }


        const linha =
            document.createElement(
                "tr"
            );


        linha.innerHTML = `

            <td>

                <strong>
                    ${livro.titulo}
                </strong>

                <br>

                <small>

                    ISBN:
                    ${livro.isbn ||
                    "Não informado"}

                </small>

            </td>


            <td>
                ${livro.autor}
            </td>


            <td>
                ${livro.categoria}
            </td>


            <td>
                ${livro.tipo}
            </td>


            <td>
                ${livro.ano || "-"}
            </td>


            <td>

                <span
                    class="status
                    ${
                        livro.status ===
                        "Disponível"
                            ? "disponivel"
                            : "indisponivel"
                    }">

                    ${
                        livro.status ===
                        "Disponível"

                            ? "🟢 Disponível"

                            : "🔴 Emprestado"
                    }

                </span>

            </td>

        `;


        tabela.appendChild(
            linha
        );

    });


    if (
        tabela.children.length ===
        0
    ) {

        tabela.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="sem-livros">

                    📚 Nenhum livro encontrado.

                </td>

            </tr>

        `;

    }

}


// ========================================
// FILTRO
// ========================================

function filtrarLivros(
    filtro,
    botao
) {

    filtroAtual =
        filtro;


    document
        .querySelectorAll(
            ".filtro"
        )
        .forEach(
            button => {

                button.classList.remove(
                    "ativo"
                );

            }
        );


    if (botao) {

        botao.classList.add(
            "ativo"
        );

    }


    listarCatalogo();

}


window.filtrarLivros =
    filtrarLivros;


// ========================================
// PESQUISA
// ========================================

function pesquisarLivros() {

    listarCatalogo();

}


window.pesquisarLivros =
    pesquisarLivros;


// ========================================
// FORMATAR DATA
// ========================================

function formatarData(data) {

    if (!data) {
        return "-";
    }


    const partes =
        data.split("-");


    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


// ========================================
// CARREGAR DADOS DO FIREBASE
// ========================================

async function carregarDadosFirebase() {

    try {

        const alunosSnapshot =
            await getDocs(
                alunosRef
            );


        alunos =
            alunosSnapshot.docs.map(
                documento => ({

                    id:
                        Number(
                            documento.id
                        ),

                    ...documento.data()

                })
            );


        const livrosSnapshot =
            await getDocs(
                livrosRef
            );


        livros =
            livrosSnapshot.docs.map(
                documento => ({

                    id:
                        Number(
                            documento.id
                        ),

                    ...documento.data()

                })
            );


        const emprestimosSnapshot =
            await getDocs(
                emprestimosRef
            );


        emprestimos =
            emprestimosSnapshot.docs.map(
                documento => ({

                    id:
                        Number(
                            documento.id
                        ),

                    ...documento.data()

                })
            );


        atualizarInterface();


    } catch (erro) {

        console.error(
            "Erro ao carregar Firebase:",
            erro
        );


        alert(
            "Não foi possível conectar ao Firebase."
        );

    }

}


// ========================================
// ATUALIZAR INTERFACE
// ========================================

function atualizarInterface() {

    listarAlunos();

    listarLivros();

    carregarAlunos();

    carregarLivros();

    listarCatalogo();

    listarEmprestimos();

}


// ========================================
// SINCRONIZAÇÃO EM TEMPO REAL
// ========================================

function iniciarSincronizacao() {


    // ====================================
    // ALUNOS
    // ====================================

    onSnapshot(
        alunosRef,
        snapshot => {

            alunos =
                snapshot.docs.map(
                    documento => ({

                        id:
                            Number(
                                documento.id
                            ),

                        ...documento.data()

                    })
                );


            listarAlunos();

            carregarAlunos();

        },

        erro => {

            console.error(
                "Erro ao sincronizar alunos:",
                erro
            );

        }
    );


    // ====================================
    // LIVROS
    // ====================================

    onSnapshot(
        livrosRef,
        snapshot => {

            livros =
                snapshot.docs.map(
                    documento => ({

                        id:
                            Number(
                                documento.id
                            ),

                        ...documento.data()

                    })
                );


            listarLivros();

            carregarLivros();

            listarCatalogo();

            listarEmprestimos();

        },

        erro => {

            console.error(
                "Erro ao sincronizar livros:",
                erro
            );

        }
    );


    // ====================================
    // EMPRÉSTIMOS
    // ====================================

    onSnapshot(
        emprestimosRef,
        snapshot => {

            emprestimos =
                snapshot.docs.map(
                    documento => ({

                        id:
                            Number(
                                documento.id
                            ),

                        ...documento.data()

                    })
                );


            listarEmprestimos();

        },

        erro => {

            console.error(
                "Erro ao sincronizar empréstimos:",
                erro
            );

        }
    );

}


// ========================================
// INICIALIZAÇÃO
// ========================================

async function iniciarSistema() {

    console.log(
        "Conectando ao Firebase..."
    );


    await carregarDadosFirebase();


    iniciarSincronizacao();


    console.log(
        "Sistema conectado ao Firebase."
    );

}


iniciarSistema();


// ========================================
// ATUALIZAR MULTAS AUTOMATICAMENTE
// ========================================

setInterval(
    listarEmprestimos,
    60000
);
