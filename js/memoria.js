/* =========================================================
   Jogo da Memória
   Cria pares entre imagem do sinal e letra correspondente.
   ========================================================= */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', iniciarMemoria);

  function iniciarMemoria() {
    if ((document.body.dataset.page || '') !== 'memoria') return;

    const app = window.LibrasApp;
    const pontosPorPar = 10;
    const xpPorPar = 5;

    let cartas = [];
    let viradas = [];
    let bloqueado = false;
    let pontos = 0;
    let tentativas = 0;
    let paresEncontrados = 0;
    let quantidadePares = 1;
    let temporizadorVerificacao = null;

    const tabuleiro = document.getElementById('tabuleiroMemoria');
    const pontosMemoria = document.getElementById('pontosMemoria');
    const tentativasMemoria = document.getElementById('tentativasMemoria');
    const feedback = document.getElementById('feedbackMemoria');
    const resultado = document.getElementById('resultadoMemoria');
    const btnReiniciarTopo = document.getElementById('btnReiniciarMemoriaTopo');
    const seletorCartas = document.getElementById('seletorCartas');

    btnReiniciarTopo.addEventListener('click', novoJogo);
    seletorCartas?.addEventListener('change', novoJogo);

    // iniciar com valor padrão do seletor
    novoJogo();

    function novoJogo() {
      const totalCartas = seletorCartas ? parseInt(seletorCartas.value, 10) : 6;
      quantidadePares = Math.max(1, Math.min(26, Math.floor(totalCartas / 2)));
      const letrasEscolhidas = app.embaralhar(app.letras).slice(0, quantidadePares);

      if (temporizadorVerificacao) {
        clearTimeout(temporizadorVerificacao);
        temporizadorVerificacao = null;
      }

      cartas = [];
      viradas = [];
      bloqueado = false;
      pontos = 0;
      tentativas = 0;
      paresEncontrados = 0;
      feedback.textContent = '';
      feedback.className = 'feedback';
      resultado.classList.add('oculto');

      letrasEscolhidas.forEach(function (letra) {
        cartas.push({ id: 'img-' + letra, letra: letra, tipo: 'imagem', encontrada: false, virada: false });
        cartas.push({ id: 'txt-' + letra, letra: letra, tipo: 'texto', encontrada: false, virada: false });
      });

      cartas = app.embaralhar(cartas);
      atualizarPainel();
      desenharTabuleiro();
    }

    function desenharTabuleiro() {
      tabuleiro.innerHTML = '';

      cartas.forEach(function (carta, indice) {
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'carta';
        botao.setAttribute('aria-label', 'Carta do jogo da memória');
        botao.dataset.indice = indice;

        if (carta.virada || carta.encontrada) {
          botao.classList.add(carta.encontrada ? 'encontrada' : 'virada');
          preencherConteudoCarta(botao, carta);
        } else {
          botao.textContent = '?';
        }

        botao.addEventListener('click', function () {
          virarCarta(indice);
        });

        tabuleiro.appendChild(botao);
      });
    }

    function preencherConteudoCarta(botao, carta) {
      botao.innerHTML = '';

      if (carta.tipo === 'imagem') {
        botao.appendChild(
          app.criarImagem(
            app.caminho('imagens/alfabeto/' + carta.letra + '.png'),
            'Sinal em Libras da letra ' + carta.letra,
            'imagem-carta'
          )
        );
      } else {
        botao.textContent = carta.letra;
      }
    }

    function virarCarta(indice) {
      if (bloqueado) return;

      const carta = cartas[indice];

      if (carta.virada || carta.encontrada) return;

      carta.virada = true;
      viradas.push(indice);
      desenharTabuleiro();

      if (viradas.length === 2) {
        tentativas += 1;
        verificarPar();
      }

      atualizarPainel();
    }

    function mostrarFeedback(tipo, texto) {
      const imagem = tipo === 'sucesso' ? 'correto.png' : 'erro.png';

      feedback.innerHTML = '';
      feedback.className = 'feedback com-icone ' + (tipo === 'sucesso' ? 'sucesso-texto' : 'erro-texto');
      feedback.appendChild(
        app.criarImagem(
          app.caminho('imagens/icones/' + imagem),
          tipo === 'sucesso' ? 'Ícone de acerto' : 'Ícone de erro',
          'icone-feedback'
        )
      );

      const mensagem = document.createElement('span');
      mensagem.textContent = texto;
      feedback.appendChild(mensagem);
    }

    function verificarPar() {
      bloqueado = true;

      const primeira = cartas[viradas[0]];
      const segunda = cartas[viradas[1]];
      const formouPar = primeira.letra === segunda.letra && primeira.tipo !== segunda.tipo;

      temporizadorVerificacao = setTimeout(function () {
        temporizadorVerificacao = null;
        if (formouPar) {
          primeira.encontrada = true;
          segunda.encontrada = true;
          paresEncontrados += 1;
          pontos += pontosPorPar;
          app.adicionarXP(xpPorPar);
          mostrarFeedback('sucesso', '✔ Par correto! Você ganhou pontos e XP.');
        } else {
          primeira.virada = false;
          segunda.virada = false;
          mostrarFeedback('erro', '❌ Não foi dessa vez. Tente outro par.');
        }

        viradas = [];
        bloqueado = false;
        atualizarPainel();
        desenharTabuleiro();

        if (formouPar) {
          animarCartasEncontradas();
        }

        if (paresEncontrados === quantidadePares) {
          finalizarJogo();
        }
      }, 700);
    }

    function animarCartasEncontradas() {
      const botoes = tabuleiro.querySelectorAll('.carta.encontrada');
      botoes.forEach(function (botao) {
        botao.classList.add('animacao-acerto');
      });
    }

    function atualizarPainel() {
      pontosMemoria.textContent = 'Pontos: ' + pontos;
      tentativasMemoria.textContent = 'Tentativas: ' + tentativas;
    }

    function finalizarJogo() {
      const dados = app.carregarProgresso();

      dados.jogosMemoriaConcluidos += 1;
      dados.ultimoMemoriaPontuacao = pontos;
      dados.melhorMemoriaPontuacao = Math.max(dados.melhorMemoriaPontuacao || 0, pontos);
      app.salvarProgresso(dados);

      resultado.classList.remove('oculto');
      resultado.innerHTML = `
        <div class="resultado-icone" id="iconeResultadoMemoria"></div>
        <h2>Parabéns!</h2>
        <p>Você concluiu o jogo da memória.</p>
        <p><strong>Pontuação:</strong> ${pontos}</p>
        <p><strong>Tentativas:</strong> ${tentativas}</p>
        <div class="linha-botoes centralizada">
          <button class="botao primario" id="jogarNovamente" type="button">Jogar novamente</button>
        </div>
      `;

      document.getElementById('iconeResultadoMemoria').appendChild(
        app.criarImagem(
          app.caminho('imagens/icones/parabens.png'),
          'Ícone de parabéns',
          'icone-parabens'
        )
      );

      document.getElementById('jogarNovamente').addEventListener('click', novoJogo);
    }
  }
})();
