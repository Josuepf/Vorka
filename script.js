let pessoaParaAcao = null;
let tarefaParaAcao = null;
let tipoDeAcao = null;
let pessoaAtiva = null;

const pessoas = [
    { nome: 'João', tarefas: [] },
    { nome: 'Maria', tarefas: [] },
    { nome: 'Pedro', tarefas: [] }
];

const tarefasFeitas = [];

function toggleEquipe() {
    const lista = document.getElementById('lista-equipe');
    lista.style.display = (lista.style.display === 'none') ? 'block' : 'none';
}

function mostrarTarefasPessoa(index) {
    pessoaAtiva = index;

    const conteudo = document.getElementById('conteudo');

    conteudo.innerHTML = `
        <h2>Tarefas de ${pessoas[index].nome}</h2>
        <input type="text" id="busca" placeholder="Buscar tarefas..." oninput="atualizarListaTarefas()">
        <select id="filtro-data" onchange="atualizarListaTarefas()">
            <option value="">Todas</option>
            <option value="hoje">Hoje</option>
            <option value="semana">Esta semana</option>
            <option value="mes">Este mês</option>
            <option value="ano">Este ano</option>
        </select>
        <div id="lista-tarefas"></div>
    `;

    atualizarListaTarefas();
}

function atualizarListaTarefas() {
    const busca = document.getElementById('busca').value.toLowerCase();
    const filtro = document.getElementById('filtro-data').value;

    let tarefas = pessoas[pessoaAtiva].tarefas;

    if (busca) {
        tarefas = tarefas.filter(t => t.descricao.toLowerCase().includes(busca));
    }

    if (filtro) {
        const hoje = new Date();
        tarefas = tarefas.filter(t => {
            const dataTarefa = new Date(t.data);
            if (filtro === 'hoje') {
                return dataTarefa.toDateString() === hoje.toDateString();
            } else if (filtro === 'semana') {
                const primeiroDia = new Date(hoje);
                primeiroDia.setDate(hoje.getDate() - hoje.getDay());
                const ultimoDia = new Date(primeiroDia);
                ultimoDia.setDate(primeiroDia.getDate() + 6);
                return dataTarefa >= primeiroDia && dataTarefa <= ultimoDia;
            } else if (filtro === 'mes') {
                return dataTarefa.getMonth() === hoje.getMonth() && dataTarefa.getFullYear() === hoje.getFullYear();
            } else if (filtro === 'ano') {
                return dataTarefa.getFullYear() === hoje.getFullYear();
            }
            return true;
        });
    }

    const lista = document.getElementById('lista-tarefas');
    if (tarefas.length === 0) {
        lista.innerHTML = '<p>Sem tarefas.</p>';
    } else {
        lista.innerHTML = '<ul>' + tarefas.map((t, idx) => `
            <li>
                ${t.descricao} - ${t.data} ${t.hora || ''}
                <button onclick="editarTarefa(${pessoaAtiva}, ${idx})">Editar</button>
                <button onclick="concluirTarefa(${pessoaAtiva}, ${idx})">Concluir</button>
                <button onclick="excluirTarefa(${pessoaAtiva}, ${idx})">Excluir</button>
            </li>
        `).join('') + '</ul>';
    }
}

function adicionarTarefa() {
    const novaTarefa = document.getElementById('novaTarefa').value;
    const novaData = document.getElementById('novaData').value;
    const novaHora = document.getElementById('novaHora').value;
    const responsavelIndex = document.getElementById('responsavel').value;

    if (!novaTarefa || !novaData) {
        alert('Descrição e data são obrigatórias.');
        return;
    }

    pessoas[responsavelIndex].tarefas.push({ descricao: novaTarefa, data: novaData, hora: novaHora });

    mostrarTarefasPessoa(responsavelIndex);

    mostrarSucesso('Tarefa adicionada com sucesso!');
}

function mostrarConteudo(tipo) {
    const conteudo = document.getElementById('conteudo');

    if (tipo === 'tarefas') {
        let html = '<h2>Tarefas Feitas</h2>';
        if (tarefasFeitas.length === 0) {
            html += '<p>Nenhuma tarefa concluída ainda.</p>';
        } else {
            html += '<ul>' + tarefasFeitas.map(t => `
                <li>${t.descricao} - ${t.data} ${t.hora || ''} (Feita por ${t.pessoa} em ${t.dataConclusao} ${t.horaConclusao})</li>
            `).join('') + '</ul>';
        }
        conteudo.innerHTML = html;

    } else if (tipo === 'criar') {
        conteudo.innerHTML = `
            <h2>Criar Atividade</h2>
            <div class="form-linha">
                <select id="responsavel">
                    ${pessoas.map((p, i) => `<option value="${i}">${p.nome}</option>`).join('')}
                </select>
                <input type="text" id="novaTarefa" placeholder="Descrição">
                <input type="date" id="novaData">
                <input type="time" id="novaHora">
                <button onclick="adicionarTarefa()">Adicionar</button>
            </div>
        `;
    }
}


function concluirTarefa(pessoaIndex, tarefaIndex) {
    pessoaParaAcao = pessoaIndex;
    tarefaParaAcao = tarefaIndex;
    tipoDeAcao = 'concluir';

    const tarefa = pessoas[pessoaIndex].tarefas[tarefaIndex];
    const texto = `Deseja concluir: "${tarefa.descricao}"?`;

    configurarModal(texto, 'verde');
}

function excluirTarefa(pessoaIndex, tarefaIndex) {
    pessoaParaAcao = pessoaIndex;
    tarefaParaAcao = tarefaIndex;
    tipoDeAcao = 'excluir';

    const tarefa = pessoas[pessoaIndex].tarefas[tarefaIndex];
    const texto = `Deseja excluir: "${tarefa.descricao}"?`;

    configurarModal(texto, 'vermelho');
}


let pessoaParaEditar = null;
let tarefaParaEditar = null;

function editarTarefa(pessoaIndex, tarefaIndex) {
    pessoaParaEditar = pessoaIndex;
    tarefaParaEditar = tarefaIndex;

    const tarefa = pessoas[pessoaIndex].tarefas[tarefaIndex];

    document.getElementById('input-edicao').value = tarefa.descricao;

    document.getElementById('edicao').style.display = 'block';
}

function salvarEdicao() {
    const novaDescricao = document.getElementById('input-edicao').value.trim();
    if (novaDescricao) {
        pessoas[pessoaParaEditar].tarefas[tarefaParaEditar].descricao = novaDescricao;
        mostrarTarefasPessoa(pessoaParaEditar);
    }
    document.getElementById('edicao').style.display = 'none';
}

function cancelarEdicao() {
    document.getElementById('edicao').style.display = 'none';
}



function configurarModal(texto, corBotao) {
    document.getElementById('confirmacao-texto').textContent = texto;

    const btn = document.getElementById('btn-confirmar');
    btn.className = ''; 
    btn.classList.add(corBotao);

    document.getElementById('confirmacao').style.display = 'block';
}

function confirmarAcao() {
    const tarefa = pessoas[pessoaParaAcao].tarefas[tarefaParaAcao];
    if (tipoDeAcao === 'concluir') {
        const dataConclusao = new Date();
        tarefasFeitas.push({
            descricao: tarefa.descricao,
            data: tarefa.data,
            hora: tarefa.hora,
            pessoa: pessoas[pessoaParaAcao].nome,
            dataConclusao: dataConclusao.toLocaleDateString(),
            horaConclusao: dataConclusao.toLocaleTimeString()
        });
    }
    pessoas[pessoaParaAcao].tarefas.splice(tarefaParaAcao, 1);
    document.getElementById('confirmacao').style.display = 'none';
    mostrarTarefasPessoa(pessoaParaAcao);
}

function cancelarAcao() {
    document.getElementById('confirmacao').style.display = 'none';
}

function mostrarSucesso(msg) {
    document.getElementById('sucesso-texto').textContent = msg;
    document.getElementById('sucesso').style.display = 'block';
}

function fecharSucesso() {
    document.getElementById('sucesso').style.display = 'none';
}
