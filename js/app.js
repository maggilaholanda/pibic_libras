(function () {
  'use strict';

  const CHAVE_STORAGE = 'librasKidsProgresso';
  const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const LibrasApp = {
    letras: LETRAS,
    carregarProgresso,
    salvarProgresso,
    adicionarXP,
    calcularProgressoGeral,
    calcularConquistas,
    criarImagem,
    caminho,
    embaralhar,
    mostrarAviso,
    
  };

  window.LibrasApp = LibrasApp;

  document.addEventListener('DOMContentLoaded', function () {
    aplicarPreferenciasVisuais();
    montarCabecalho();
    prepararImagensPendentes(document);
    atualizarResumoInicio();
  });

  function progressoPadrao() {
    return {
      xpTotal: 0,
      xpNivel: 0,
      nivel: 1,
      quizzesConcluidos: 0,
      jogosMemoriaConcluidos: 0,
      ultimoQuizPontuacao: 0,
      melhorQuizPontuacao: 0,
      ultimoMemoriaPontuacao: 0,
      melhorMemoriaPontuacao: 0,
      alfabetoVisto: [],
      configuracoes: {
        fonte: 100,
        escuro: false
      }
    };
  }

  function carregarProgresso() {
    const salvo = localStorage.getItem(CHAVE_STORAGE);

    if (!salvo) {
      return progressoPadrao();
    }

    try {
      return Object.assign(progressoPadrao(), JSON.parse(salvo));
    } catch (erro) {
      console.warn('Não foi possível ler o progresso salvo. Um novo progresso será criado.', erro);
      return progressoPadrao();
    }
  }

  function salvarProgresso(dados) {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(dados));
    atualizarBarraProgressoGeral();
    atualizarResumoInicio();
  }

  function caminho(arquivo) {
    const base = document.body.dataset.basePath || '';
    return base + arquivo;
  }

  function embaralhar(lista) {
    const copia = lista.slice();

    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }

    return copia;
  }

  function aplicarPreferenciasVisuais() {
    const dados = carregarProgresso();
    const fonte = dados.configuracoes.fonte || 100;

    document.documentElement.style.setProperty('--fonte-base', fonte + '%');
    document.body.classList.toggle('modo-escuro', Boolean(dados.configuracoes.escuro));
  }

  function montarCabecalho() {
    const cabecalho = document.getElementById('cabecalho');

    if (!cabecalho) return;

    const paginaAtual = document.body.dataset.page || 'inicio';

    cabecalho.innerHTML = `
      <header class="topo topo-site">
        <div class="container">
          <div class="linha-topo topo-linha">
          </div>

          <nav class="menu menu-principal" aria-label="Menu principal">
            ${linkMenu('inicio', '🏠 Início', caminho('index.html'), paginaAtual)}
            ${linkMenu('alfabeto', '📚 Alfabeto', caminho('paginas/alfabeto.html'), paginaAtual)}
            ${linkMenu('quiz', '❓ Quiz', caminho('paginas/quiz.html'), paginaAtual)}
            ${linkMenu('memoria', '🧠 Memória', caminho('paginas/memoria.html'), paginaAtual)}
            ${linkMenu('sobre', 'ℹ Informações', caminho('paginas/sobre.html'), paginaAtual)}
            <div class="acessibilidade" aria-label="Botões de acessibilidade">
              <button class="botao-acessibilidade" data-acao="fonte-mais" type="button" aria-label="Aumentar fonte">A+</button>
              <button class="botao-acessibilidade" data-acao="fonte-menos" type="button" aria-label="Diminuir fonte">A-</button>
              <button class="botao-acessibilidade" data-acao="modo-escuro" type="button" aria-label="Ativar ou desativar modo escuro">🌙</button>
              <a class="botao neutro botao-perfil" href="${caminho('paginas/perfil.html')}" aria-label="Perfil">👤</a>
            </div>
          </nav>
        </div>
      </header>
    `;

    configurarAcessibilidade();
    configurarMenuMobile();
    atualizarBarraProgressoGeral();
  }

  function linkMenu(chave, texto, href, paginaAtual) {
    const ativo = chave === paginaAtual ? 'ativo' : '';
    return `<a class="${ativo}" href="${href}">${texto}</a>`;
  }

  function configurarAcessibilidade() {
    const btnAumentar = document.querySelector('[data-acao="fonte-mais"]');
    const btnDiminuir = document.querySelector('[data-acao="fonte-menos"]');
    const btnTema = document.querySelector('[data-acao="modo-escuro"]');

    btnAumentar?.addEventListener('click', function () {
      alterarFonte(10);
    });

    btnDiminuir?.addEventListener('click', function () {
      alterarFonte(-10);
    });

    btnTema?.addEventListener('click', function () {
      const dados = carregarProgresso();
      dados.configuracoes.escuro = !dados.configuracoes.escuro;
      salvarProgresso(dados);
      aplicarPreferenciasVisuais();
    });
  }

  function alterarFonte(valor) {
    const dados = carregarProgresso();
    const fonteAtual = dados.configuracoes.fonte || 100;
    const novaFonte = Math.min(140, Math.max(80, fonteAtual + valor));

    dados.configuracoes.fonte = novaFonte;
    salvarProgresso(dados);
    aplicarPreferenciasVisuais();
  }

  function configurarMenuMobile() {
    const botao = document.getElementById('abrirMenu');
    const menu = document.getElementById('menuPrincipal');

    if (!botao || !menu) return;

    botao.addEventListener('click', function () {
      const fechado = menu.classList.toggle('fechado');
      botao.setAttribute('aria-expanded', String(!fechado));
    });
  }

  function atualizarBarraProgressoGeral() {
    const barra = document.getElementById('barraProgressoGeral');
    const texto = document.getElementById('textoProgressoGeral');

    if (!barra || !texto) return;

    const progresso = calcularProgressoGeral();
    barra.style.width = progresso + '%';
    texto.textContent = 'Progresso geral: ' + progresso + '%';
  }

  function calcularProgressoGeral() {
    const dados = carregarProgresso();
    const letrasVistas = Array.isArray(dados.alfabetoVisto) ? dados.alfabetoVisto.length : 0;

    const progressoAlfabeto = Math.min(100, Math.round((letrasVistas / 26) * 100));
    const progressoQuiz = dados.quizzesConcluidos > 0 ? 100 : 0;
    const progressoMemoria = dados.jogosMemoriaConcluidos > 0 ? 100 : 0;
    const progressoXP = Math.min(100, Math.round((dados.xpTotal / 200) * 100));

    return Math.round((progressoAlfabeto + progressoQuiz + progressoMemoria + progressoXP) / 4);
  }

  function adicionarXP(valor) {
    const dados = carregarProgresso();
    let avancouNivel = false;

    dados.xpTotal += valor;
    dados.xpNivel += valor;

    while (dados.xpNivel >= 100) {
      dados.xpNivel -= 100;
      dados.nivel += 1;
      avancouNivel = true;
    }

    salvarProgresso(dados);

    if (avancouNivel) {
      mostrarAviso('Parabéns! Você avançou de nível!');
    }

    return {
      avancouNivel: avancouNivel,
      xpTotal: dados.xpTotal,
      xpNivel: dados.xpNivel,
      nivel: dados.nivel
    };
  }

  function calcularConquistas() {
    const dados = carregarProgresso();

    return [
      {
        titulo: 'Primeiro Quiz Concluído',
        descricao: 'Complete um quiz.',
        imagem: caminho('imagens/icones/trofeu.png'),
        liberada: dados.quizzesConcluidos >= 1
      },
      {
        titulo: 'Primeiro Jogo da Memória',
        descricao: 'Complete um jogo da memória.',
        imagem: caminho('imagens/icones/medalha.png'),
        liberada: dados.jogosMemoriaConcluidos >= 1
      },
      {
        titulo: '50 XP',
        descricao: 'Alcance 50 XP.',
        imagem: caminho('imagens/icones/estrela.png'),
        liberada: dados.xpTotal >= 50
      },
      {
        titulo: '100 XP',
        descricao: 'Alcance 100 XP.',
        imagem: caminho('imagens/icones/trofeu.png'),
        liberada: dados.xpTotal >= 100
      },
      {
        titulo: '200 XP',
        descricao: 'Alcance 200 XP.',
        imagem: caminho('imagens/icones/medalha.png'),
        liberada: dados.xpTotal >= 200
      }
    ];
  }

  function criarImagem(src, alt, classe) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;

    if (classe) {
      img.className = classe;
    }

    configurarFallbackImagem(img);
    return img;
  }

  function prepararImagensPendentes(raiz) {
    const imagens = raiz.querySelectorAll('img');
    imagens.forEach(configurarFallbackImagem);
  }

  function configurarFallbackImagem(img) {
    function substituirImagem() {
      if (!img.parentNode) return;

      const aviso = document.createElement('div');
      aviso.className = 'imagem-placeholder';
      aviso.textContent = 'Imagem pendente: ' + img.getAttribute('src');
      img.replaceWith(aviso);
    }

    img.addEventListener('error', substituirImagem, { once: true });

    if (img.complete && img.naturalWidth === 0) {
      substituirImagem();
    }
  }

  function mostrarAviso(texto) {
    const avisoAntigo = document.querySelector('.aviso-global');

    if (avisoAntigo) {
      avisoAntigo.remove();
    }

    const aviso = document.createElement('div');
    aviso.className = 'aviso-global';
    aviso.setAttribute('role', 'status');
    aviso.textContent = texto;

    document.body.appendChild(aviso);

    setTimeout(function () {
      aviso.remove();
    }, 3500);
  }

  function atualizarResumoInicio() {
    if ((document.body.dataset.page || '') !== 'inicio') return;

    const dados = carregarProgresso();
    const resumoNivel = document.getElementById('resumoNivel');
    const resumoXPNivel = document.getElementById('resumoXPNivel');
    const resumoXP = document.getElementById('resumoXP');
    const barra = document.getElementById('barraXPInicio');

    if (!resumoNivel || !resumoXPNivel || !resumoXP || !barra) return;

    resumoNivel.textContent = 'Nível ' + dados.nivel;
    resumoXPNivel.textContent = dados.xpNivel + '/100 XP';
    resumoXP.textContent = 'XP total. ' + dados.xpTotal;
    barra.style.width = dados.xpNivel + '%';
  }
})();
