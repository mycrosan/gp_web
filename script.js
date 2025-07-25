const cores = {
  'Mês Retrasado': '#4b0082',
  'Mês Passado': '#008080',
  'Mês Atual': '#ff8c00',
  'Anteontem': '#4b0082',
  'Ontem': '#008080',
  'Hoje': '#ff8c00'
};

const ultimosDados = {
  carcaca: {},
  producao: {},
  qualidade: {}
};

function atualizarHora() {
  const agora = new Date();
  const horaFormatada = agora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  document.getElementById('horaAtual').textContent = horaFormatada;
}

async function carregarResumo(endpoint, containerId) {
  try {
    const response = await fetch(`http://localhost:8080/api/resumo/${endpoint}`);
    const data = await response.json();

    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const dadosFormatados = {
      'Mês Retrasado': data.mesRetrasado,
      'Mês Passado': data.mesPassado,
      'Mês Atual': data.mesAtual,
      'Anteontem': data.anteontem,
      'Ontem': data.ontem,
      'Hoje': data.hoje
    };

    for (let chave in dadosFormatados) {
      const novoValor = dadosFormatados[chave];
      const valorAnterior = ultimosDados[containerId][chave] ?? 0;

      const card = document.createElement('div');
      card.className = `card`;
      card.style.background = cores[chave]
        ? `linear-gradient(145deg, ${cores[chave]}, ${darkenColor(cores[chave], 20)})`
        : '#007bff';

      const valorHtml = document.createElement('div');
      valorHtml.className = 'valor';

      animarNumero(valorHtml, valorAnterior, novoValor, 800);

      if (valorAnterior !== undefined && valorAnterior !== novoValor) {
        valorHtml.classList.add('animado');
        card.classList.add('animado');
      }

      card.innerHTML = `<strong>${chave}</strong>`;
      card.appendChild(valorHtml);
      container.appendChild(card);

      // Atualiza valor armazenado para próxima comparação
      ultimosDados[containerId][chave] = novoValor;
    }

  } catch (e) {
    console.error(`Erro ao carregar ${endpoint}:`, e);
    document.getElementById(containerId).innerHTML = `<p>Erro ao carregar dados.</p>`;
  }
}

function animarNumero(elemento, inicio, fim, duracao) {
  const range = fim - inicio;
  const inicioTimestamp = performance.now();

  function atualizar(timestamp) {
    const progresso = Math.min((timestamp - inicioTimestamp) / duracao, 1);
    const valorAtual = Math.floor(inicio + range * progresso);
    elemento.textContent = valorAtual;

    if (progresso < 1) {
      requestAnimationFrame(atualizar);
    } else {
      elemento.textContent = fim;
    }
  }

  requestAnimationFrame(atualizar);
}

function darkenColor(hex, percent) {
  const num = parseInt(hex.replace("#", ""), 16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) - amt,
    G = (num >> 8 & 0x00FF) - amt,
    B = (num & 0x0000FF) - amt;
  return "#" + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
}

function atualizarTudo() {
  atualizarHora();
  carregarResumo('carcaca', 'carcaca');
  carregarResumo('producao', 'producao');
  carregarResumo('qualidade', 'qualidade');
}

atualizarTudo();
setInterval(atualizarTudo, 60000); // Atualiza a cada minuto
