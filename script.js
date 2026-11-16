// Seleção dos elementos do DOM
const formBusca = document.getElementById('form-busca');
const inputCidade = document.getElementById('input-cidade');
const listaRecomendacoes = document.getElementById('lista-recomendacoes');
const areaMensagem = document.getElementById('area-mensagem');
const painelClima = document.getElementById('painel-clima');

const nomeCidadeEl = document.getElementById('nome-cidade');
const regiaoPaisEl = document.getElementById('regiao-pais');
const coordenadasCidadeEl = document.getElementById('coordenadas-cidade');
const iconeClimaEl = document.getElementById('icone-clima');
const temperaturaEl = document.getElementById('temperatura');
const condicaoClimaEl = document.getElementById('condicao-clima');
const sensacaoTermicaEl = document.getElementById('sensacao-termica');
const umidadeEl = document.getElementById('umidade');
const ventoEl = document.getElementById('vento');
const listaSemanaEl = document.getElementById('lista-semana');

// Base de cidades brasileiras para recomendações instantâneas
const CIDADES_BRASIL = [
    { nome: 'São Paulo', uf: 'SP' },
    { nome: 'São Luís', uf: 'MA' },
    { nome: 'São José dos Campos', uf: 'SP' },
    { nome: 'São José do Rio Preto', uf: 'SP' },
    { nome: 'São Bernardo do Campo', uf: 'SP' },
    { nome: 'São Gonçalo', uf: 'RJ' },
    { nome: 'São Carlos', uf: 'SP' },
    { nome: 'São Caetano do Sul', uf: 'SP' },
    { nome: 'São João de Meriti', uf: 'RJ' },
    { nome: 'Rio de Janeiro', uf: 'RJ' },
    { nome: 'Rio Branco', uf: 'AC' },
    { nome: 'Ribeirão Preto', uf: 'SP' },
    { nome: 'Belo Horizonte', uf: 'MG' },
    { nome: 'Belém', uf: 'PA' },
    { nome: 'Brasília', uf: 'DF' },
    { nome: 'Boa Vista', uf: 'RR' },
    { nome: 'Curitiba', uf: 'PR' },
    { nome: 'Cuiabá', uf: 'MT' },
    { nome: 'Campo Grande', uf: 'MS' },
    { nome: 'Campinas', uf: 'SP' },
    { nome: 'Campos do Jordão', uf: 'SP' },
    { nome: 'Fortaleza', uf: 'CE' },
    { nome: 'Florianópolis', uf: 'SC' },
    { nome: 'Goiânia', uf: 'GO' },
    { nome: 'Guarulhos', uf: 'SP' },
    { nome: 'João Pessoa', uf: 'PB' },
    { nome: 'Joinville', uf: 'SC' },
    { nome: 'Londrina', uf: 'PR' },
    { nome: 'Manaus', uf: 'AM' },
    { nome: 'Maceió', uf: 'AL' },
    { nome: 'Macapá', uf: 'AP' },
    { nome: 'Natal', uf: 'RN' },
    { nome: 'Niterói', uf: 'RJ' },
    { nome: 'Osasco', uf: 'SP' },
    { nome: 'Porto Alegre', uf: 'RS' },
    { nome: 'Porto Velho', uf: 'RO' },
    { nome: 'Palmas', uf: 'TO' },
    { nome: 'Pederneiras', uf: 'SP' },
    { nome: 'Recife', uf: 'PE' },
    { nome: 'Salvador', uf: 'BA' },
    { nome: 'Santos', uf: 'SP' },
    { nome: 'Sorocaba', uf: 'SP' },
    { nome: 'Santo André', uf: 'SP' },
    { nome: 'Teresina', uf: 'PI' },
    { nome: 'Uberlândia', uf: 'MG' },
    { nome: 'Vitória', uf: 'ES' }
];

// Remove acentos, pontuações e deixa em minúsculas (ex: "São" -> "sao")
function normalizarTexto(texto) {
    return texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/g, '')
        .toLowerCase()
        .trim();
}

// Filtra e exibe recomendações conforme o usuário digita
inputCidade.addEventListener('input', () => {
    const termoDigitado = normalizarTexto(inputCidade.value);
    listaRecomendacoes.innerHTML = '';

    if (!termoDigitado) {
        listaRecomendacoes.classList.add('oculto');
        return;
    }

    const sugestoes = CIDADES_BRASIL.filter((cidade) => {
        const nomeNormalizado = normalizarTexto(cidade.nome);
        return nomeNormalizado.startsWith(termoDigitado);
    }).slice(0, 6);

    if (sugestoes.length === 0) {
        listaRecomendacoes.classList.add('oculto');
        return;
    }

    sugestoes.forEach((cidade) => {
        const item = document.createElement('li');
        item.innerHTML = `
            <span>${cidade.nome}</span>
            <span class="uf-tag">${cidade.uf}</span>
        `;
        item.addEventListener('click', () => {
            inputCidade.value = cidade.nome;
            listaRecomendacoes.classList.add('oculto');
            buscarDadosClimaticos(cidade.nome);
        });
        listaRecomendacoes.appendChild(item);
    });

    listaRecomendacoes.classList.remove('oculto');
});

// Fecha a barra de recomendações ao clicar fora
document.addEventListener('click', (evento) => {
    if (!evento.target.closest('.campo-wrapper')) {
        listaRecomendacoes.classList.add('oculto');
    }
});

// Evento de envio do formulário
formBusca.addEventListener('submit', (evento) => {
    evento.preventDefault();
    listaRecomendacoes.classList.add('oculto');
    const cidade = inputCidade.value.trim();

    if (!cidade) {
        exibirAviso(
            'Campo de pesquisa vazio',
            'Por favor, digite o nome de uma cidade antes de realizar a busca.',
            true
        );
        painelClima.classList.add('oculto');
        return;
    }

    buscarDadosClimaticos(cidade);
});

// Consulta a API via fetch()
async function buscarDadosClimaticos(nomeCidade) {
    exibirAviso('Carregando...', `Consultando dados meteorológicos de "${nomeCidade}"...`, false);
    painelClima.classList.add('oculto');

    try {
        const urlGeo = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(nomeCidade)}&count=1&language=pt&format=json`;
        const respostaGeo = await fetch(urlGeo);

        if (!respostaGeo.ok) {
            throw new Error('Falha na comunicação com o servidor de localização.');
        }

        const dadosGeo = await respostaGeo.json();

        // Aviso caso a cidade pesquisada não exista
        if (!dadosGeo.results || dadosGeo.results.length === 0) {
            exibirAviso(
                `⚠️ Cidade "${nomeCidade}" não encontrada`,
                'Não encontramos nenhuma cidade com esse nome. Verifique se há erros de digitação e tente novamente.',
                true
            );
            return;
        }

        const local = dadosGeo.results[0];
        const { latitude, longitude } = local;

        // Busca clima atual + previsão diária dos próximos 7 dias (hoje + resto da semana)
        const urlClima = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`;
        const respostaClima = await fetch(urlClima);

        if (!respostaClima.ok) {
            throw new Error('Falha ao obter os dados meteorológicos.');
        }

        const dadosClima = await respostaClima.json();

        atualizarInterface(local, dadosClima.current, dadosClima.daily);

    } catch (erro) {
        console.error('Erro na requisição:', erro);
        exibirAviso(
            '⚠️ Erro de conexão',
            'Não foi possível obter os dados meteorológicos no momento. Verifique sua internet e tente novamente.',
            true
        );
    }
}

// Atualiza o HTML e as cores do CSS com base nos dados
function atualizarInterface(local, climaAtual, dadosDiarios) {
    ocultarMensagem();

    const partesLocal = [];
    if (local.admin1) partesLocal.push(local.admin1);
    if (local.country) partesLocal.push(local.country);

    nomeCidadeEl.textContent = local.name;
    regiaoPaisEl.textContent = partesLocal.join(' - ') || 'Localização identificada';
    coordenadasCidadeEl.textContent = `LAT ${local.latitude.toFixed(2)}° • LON ${local.longitude.toFixed(2)}°`;

    const temp = Math.round(climaAtual.temperature_2m);
    const sensacao = Math.round(climaAtual.apparent_temperature);
    const umidade = climaAtual.relative_humidity_2m;
    const vento = Math.round(climaAtual.wind_speed_10m);

    temperaturaEl.textContent = temp;
    sensacaoTermicaEl.textContent = `${sensacao} °C`;
    umidadeEl.textContent = `${umidade} %`;
    ventoEl.textContent = `${vento} km/h`;

    const infoClima = interpretarCodigoClima(climaAtual.weather_code);
    condicaoClimaEl.textContent = infoClima.descricao;
    iconeClimaEl.textContent = infoClima.icone;

    aplicarTemaTemperatura(temp);
    renderizarPrevisaoSemanal(dadosDiarios);

    painelClima.classList.remove('oculto');
}

// Renderiza os próximos 6 dias (resto da semana)
function renderizarPrevisaoSemanal(dadosDiarios) {
    listaSemanaEl.innerHTML = '';

    if (!dadosDiarios || !dadosDiarios.time) return;

    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    // Começa no índice 1 (amanhã) até o índice 6 (resto da semana)
    for (let i = 1; i < dadosDiarios.time.length; i++) {
        const dataStr = dadosDiarios.time[i]; // formato YYYY-MM-DD
        const [ano, mes, dia] = dataStr.split('-').map(Number);
        const dataObj = new Date(ano, mes - 1, dia);

        const nomeDia = diasSemana[dataObj.getDay()];
        const dataFormatada = `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}`;

        const maxTemp = Math.round(dadosDiarios.temperature_2m_max[i]);
        const minTemp = Math.round(dadosDiarios.temperature_2m_min[i]);
        const infoDia = interpretarCodigoClima(dadosDiarios.weather_code[i]);

        const cardDia = document.createElement('div');
        cardDia.className = 'card-dia';
        cardDia.innerHTML = `
            <div>
                <div class="dia-nome">${nomeDia}</div>
                <div class="dia-data">${dataFormatada}</div>
            </div>
            <div class="dia-icone">${infoDia.icone}</div>
            <div class="dia-desc">${infoDia.descricao}</div>
            <div class="dia-temps">
                <span class="temp-max" title="Máxima">${maxTemp}°</span>
                <span class="temp-min" title="Mínima">${minTemp}°</span>
            </div>
        `;

        listaSemanaEl.appendChild(cardDia);
    }
}

// Altera o tema conforme a faixa de temperatura
function aplicarTemaTemperatura(temperatura) {
    document.body.classList.remove('tema-padrao', 'tema-quente', 'tema-neutro', 'tema-frio');

    if (temperatura >= 37) {
        document.body.classList.add('tema-quente');
    } else if (temperatura >= 25 && temperatura <= 36) {
        document.body.classList.add('tema-neutro');
    } else {
        document.body.classList.add('tema-frio');
    }
}

// Interpreta os códigos climáticos WMO
function interpretarCodigoClima(codigo) {
    const mapaCodigos = {
        0: { descricao: 'Céu limpo', icone: '☀️' },
        1: { descricao: 'Predominantemente limpo', icone: '🌤️' },
        2: { descricao: 'Parcialmente nublado', icone: '⛅' },
        3: { descricao: 'Nublado', icone: '☁️' },
        45: { descricao: 'Nevoeiro', icone: '🌫️' },
        48: { descricao: 'Nevoeiro com geada', icone: '🌫️' },
        51: { descricao: 'Chuvisco leve', icone: '🌦️' },
        53: { descricao: 'Chuvisco moderado', icone: '🌦️' },
        55: { descricao: 'Chuvisco denso', icone: '🌧️' },
        61: { descricao: 'Chuva leve', icone: '🌦️' },
        63: { descricao: 'Chuva moderada', icone: '🌧️' },
        65: { descricao: 'Chuva forte', icone: '🌧️' },
        71: { descricao: 'Neve leve', icone: '❄️' },
        73: { descricao: 'Neve moderada', icone: '❄️' },
        75: { descricao: 'Neve forte', icone: '❄️' },
        80: { descricao: 'Pancadas leves', icone: '🌦️' },
        81: { descricao: 'Pancadas moderadas', icone: '🌧️' },
        82: { descricao: 'Pancadas fortes', icone: '⛈️' },
        95: { descricao: 'Trovoada', icone: '⛈️' },
        96: { descricao: 'Trovoada com granizo', icone: '⛈️' },
        99: { descricao: 'Trovoada forte', icone: '⛈️' }
    };

    return mapaCodigos[codigo] || { descricao: 'Condição variável', icone: '🌡️' };
}

function exibirAviso(titulo, detalhe, isErro) {
    areaMensagem.innerHTML = `
        <span class="aviso-titulo">${titulo}</span>
        <span class="aviso-detalhe">${detalhe}</span>
    `;
    areaMensagem.classList.remove('oculto', 'erro');
    
    if (isErro) {
        areaMensagem.classList.add('erro');
    }
}

function ocultarMensagem() {
    areaMensagem.classList.add('oculto');
    areaMensagem.classList.remove('erro');
}