let form = document.forms[0];

let gruposSelect = form.grupos;

let colaboradorSelect = form.colaboradores;

let semanasSelect = form.semanas;

let dadosJson;

//busca os grupos e o colaboradores
fetch("api/grupos")
.then(res => res.json())
.then(function(data) {
    dadosJson = data;
    buscaGrupos(dadosJson);
});

function buscaGrupos() {
    let saida = "";
    saida += `<option value="">Escolha um grupo</option>`;

    for (i = 0; i < dadosJson.length; i++){
        grupo = dadosJson[i].name;
        saida += `<option value="${grupo}">${grupo}</option>`;
    }
    gruposSelect.innerHTML = saida;
}

gruposSelect.addEventListener("change", buscaFuncionarios); //quando o select de grupos tem alteração, chama a busca de funcionários

function buscaFuncionarios() {
    let grupo = gruposSelect.value;
    if (grupo.trim() === '') { //se o valor estiver vazio
        colaboradorSelect.disabled = true; //desativa o select
        colaboradorSelect.selectIndex  = 0; // e mostra a opção de selecionar funcionário
        return false;
    }
    
    let saida = "";
    saida += `<option value="">Escolha um colaborador</option>`;

    for (i = 0; i < dadosJson.length; i++){
        if (dadosJson[i].name === grupo) { //se o nome do grupo na posição atual for igual ao grupo selecionado
            let colaboradores = dadosJson[i].colaboradores;//pega os colaboradores do grupo no posição atual do loop
            for (j = 0; j < colaboradores.length; j ++) {
                let id = colaboradores[j][0];
                let nome = colaboradores[j][1];
                saida += `<option value="${id}">${nome}</option>`; //por último adiciona esses valores ao select
            }
        }    
    }
    colaboradorSelect.innerHTML = saida;
    colaboradorSelect.disabled = false;
}



//busca dados da semana pro select
fetch("api/semanas")
.then(res => res.json())
.then(function(data) {
    dadosJson = data;
    carregaSemanas(dadosJson);
});

function carregaSemanas() {
    let saida = "";
    saida += `<option value="">Escolha uma semana</option>`;

    for (i = 0; i < dadosJson.length; i++){
        let inicioSemana = formatarData(dadosJson[i].data_inicio);
        let fimSemana = formatarData(dadosJson[i].data_fim);
        let semanaId = dadosJson[i].id;
                
        saida += `<option value="${semanaId}">${inicioSemana} - ${fimSemana}</option>`;
    }
    semanasSelect.innerHTML = saida;
}

function formatarData(dataJson) {
    const data = new Date(dataJson);
    let dia = String(data.getDate()).padStart(2, '0');
    let mes = String(data.getMonth() + 1).padStart(2, '0');
    let ano = data.getFullYear();

    return `${dia}/${mes}/${ano}`;
}

//fetch post para criar um plantão

form.addEventListener('submit', event => {
    event.preventDefault();

    const colaboradorId = document.getElementById('colaboradores_select').value;
    console.log('id colaborador: ',colaboradorId);

    const semanaId = document.getElementById('semanas').value;
    console.log('semana id:', semanaId);

    const diasMarcados = document.querySelectorAll('input[name="dias_semana"]:checked');
    const diasSelecionados = Array.from(diasMarcados).map(checkbox => checkbox.value);
    console.log('dias marcados,',diasSelecionados);

    const horaInicio = document.getElementById('hora-inicio').value;
    
    console.log(horaInicio)

    const horaFim = document.getElementById('hora-fim').value;
    
    console.log(horaFim)

    const dados = {
        colaborador: colaboradorId,
        semana: semanaId,
        dias: diasSelecionados,
        hora_inicio: horaInicio + ":00",
        hora_fim: horaFim + ":00"
    }
    console.log(dados)
    fetch("api/plantoes", {
        method: 'POST',
        headers: {
            "Content-type": "application/json",
            "X-CSRFToken": getCSRFToken()
        },
        body: JSON.stringify(dados)
    }).then(response => response.json())
      .then(result => console.log('Sucesso:', result))
      .catch(error => console.error('Erro ao enviar:', error));
});

function getCSRFToken() {
    return document.querySelector('meta[name="csrf-token').getAttribute('content');
}
