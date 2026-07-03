// ---- Configuração ----
const API_KEY = '290afdfa178a3c000f96c527a97b456920fc7a66c1948027b98da4893bec86be'; // gere em https://www.api-fortnite.com
const BASE_URL = 'https://prod.api-fortnite.com';

// ---- Referências do DOM ----
const usernameInput = document.getElementById('username');
const platformSelect = document.getElementById('platform');
const searchBtn = document.getElementById('searchBtn');
const resultsEl = document.getElementById('results');

// ---- Funções de chamada à API ----

async function getAccountId(username) {
    const url = `${BASE_URL}/api/v1/account/displayName/${encodeURIComponent(username)}`;
    const response = await fetch(url, {
        headers: { 'x-api-key': API_KEY }
    });

    if (!response.ok) {
        throw new Error(`Não achei o jogador (status ${response.status})`);
    }

    const data = await response.json();
    return data.id || data.accountId;
}

async function getPlayerStats(accountId) {
    const url = `${BASE_URL}/api/v2/stats/${accountId}`;
    const response = await fetch(url, {
        headers: { 'x-api-key': API_KEY }
    });

    if (!response.ok) {
        throw new Error(`Erro ao buscar stats (status ${response.status})`);
    }

    return response.json();
}

// ---- Funções de interface ----

function showLoading() {
    resultsEl.innerHTML = `<p class="loading-text">Buscando...</p>`;
}

function showError(message) {
    resultsEl.innerHTML = `<p class="error-text">Error: ${message}</p>`;
}

// Soma o valor de todas as chaves que batem com um tipo de stat,
// somando entre playlists e dispositivos (pc, gamepad, touch etc.)
function sumStatType(statsObject, statType) {
    let total = 0;

    for (const [rawKey, value] of Object.entries(statsObject)) {
        const isMatch = rawKey.startsWith(`br_${statType}_`);
        if (isMatch) total += Number(value) || 0;
    }

    return total;
}

// Constrói o resumo com apenas as métricas mais relevantes
function buildSummary(statsObject) {
    const kills = sumStatType(statsObject, 'kills');
    const wins = sumStatType(statsObject, 'placetop1');
    const matches = sumStatType(statsObject, 'matchesplayed');
    const minutesPlayed = sumStatType(statsObject, 'minutesplayed');
    const score = sumStatType(statsObject, 'score');
    const kd = matches > 0 ? kills / matches : 0;
    const winRate = matches > 0 ? (wins / matches) * 100 : 0;
    const hoursPlayed = minutesPlayed / 60;

    return {
        cards: [
            { label: 'Vitórias', value: wins.toLocaleString('pt-BR') },
            { label: 'Abates', value: kills.toLocaleString('pt-BR') },
            { label: 'Partidas jogadas', value: matches.toLocaleString('pt-BR') },
            { label: 'K/D', value: kd.toFixed(2) },
            { label: 'Pontuação total', value: score.toLocaleString('pt-BR') },
            { label: 'Horas jogadas', value: hoursPlayed.toFixed(1) }
        ],
        winRate
    };
}

function showStats(username, statsData) {
    const { cards, winRate } = buildSummary(statsData.stats || {});

    const cardsHtml = cards
        .map(
            ({ label, value }) => `
                <div class="stat-card">
                    <span class="stat-value">${value}</span>
                    <span class="stat-label">${label}</span>
                </div>
            `
        )
        .join('');

    resultsEl.innerHTML = `
        <h2>Stats for ${username}</h2>
        <div class="stat-summary">${cardsHtml}</div>
        <div class="winrate-bar">
            <div class="winrate-bar-header">
                <span class="stat-label">Taxa de vitória</span>
                <span class="winrate-bar-value">${winRate.toFixed(1)}%</span>
            </div>
            <div class="winrate-track">
                <div class="winrate-fill" style="width: ${Math.min(winRate, 100)}%"></div>
            </div>
        </div>
    `;
}

// ---- Fluxo principal ----

async function trackUser() {
    const username = usernameInput.value.trim();

    if (!username) {
        showError('Please enter a username');
        return;
    }

    showLoading();

    try {
        const accountId = await getAccountId(username);
        const statsData = await getPlayerStats(accountId);
        showStats(username, statsData);
    } catch (error) {
        showError(error.message);
    }
}

// ---- Eventos ----
searchBtn.addEventListener('click', trackUser);
