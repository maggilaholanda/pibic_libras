/* =========================================================
   Quiz de Libras
   Gera perguntas aleatórias com uma resposta correta e 3 incorretas.
   ========================================================= */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', iniciarQuiz);

  function iniciarQuiz() {
    if ((document.body.dataset.page || '') !== 'quiz') return;

    const app = window.LibrasApp;
    const totalPerguntas = 10;
    const xpPorAcerto = 10;

    let perguntas = [];
    let perguntaAtual = 0;
    let acertos = 0;
    let respondeu = false;

    const contadorPergunta = document.getElementById('contadorPergunta');
    const placarQuiz = document.getElementById('placarQuiz');
    const imagemQuiz = document.getElementById('imagemQuiz');
    const alternativasQuiz = document.getElementById('alternativasQuiz');
    const feedbackQuiz = document.getElementById('feedbackQuiz');
    const btnProxima = document.getElementById('btnProximaPergunta');
    const btnReiniciarTopo = document.getElementById('btnReiniciarQuizTopo');
    const quizArea = document.getElementById('quizArea');
    const resultadoQuiz = document.getElementById('resultadoQuiz');

    btnProxima.addEventListener('click', proximaPergunta);
    btnReiniciarTopo.addEventListener('click', criarNovoQuiz);

    criarNovoQuiz();

    function criarNovoQuiz() {
      perguntas = app.embaralhar(app.letras).slice(0, totalPerguntas);
      perguntaAtual = 0;
      acertos = 0;
      respondeu = false;
      resultadoQuiz.classList.add('oculto');
      quizArea.classList.remove('oculto');
      mostrarPergunta();
    }

    function mostrarPergunta() {
      const letraCorreta = perguntas[perguntaAtual];
      respondeu = false;

      contadorPergunta.textContent = 'Pergunta ' + (perguntaAtual + 1) + ' de ' + totalPerguntas;
      placarQuiz.textContent = 'Acertos: ' + acertos;
      feedbackQuiz.textContent = '';
      feedbackQuiz.className = 'feedback';
      btnProxima.disabled = true;

      imagemQuiz.innerHTML = '';
      imagemQuiz.appendChild(
        app.criarImagem(
          app.caminho('imagens/alfabeto/' + letraCorreta + '.png'),
          'Sinal em Libras para identificar no quiz',
          'imagem-quiz'
        )
      );

      montarAlternativas(letraCorreta);
    }

    function montarAlternativas(letraCorreta) {
      const incorretas = app.embaralhar(app.letras.filter(function (letra) {
        return letra !== letraCorreta;
      })).slice(0, 3);

      const alternativas = app.embaralhar([letraCorreta].concat(incorretas));
      alternativasQuiz.innerHTML = '';

      alternativas.forEach(function (letra) {
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'alternativa';
        botao.textContent = letra;
        botao.setAttribute('aria-label', 'Alternativa ' + letra);

        botao.addEventListener('click', function () {
          responder(letra, letraCorreta, botao);
        });

        alternativasQuiz.appendChild(botao);
      });
    }

    function mostrarFeedback(tipo, texto) {
      const imagem = tipo === 'sucesso' ? 'correto.png' : 'erro.png';

      feedbackQuiz.innerHTML = '';
      feedbackQuiz.className = 'feedback com-icone ' + (tipo === 'sucesso' ? 'sucesso-texto' : 'erro-texto');
      feedbackQuiz.appendChild(
        app.criarImagem(
          app.caminho('imagens/icones/' + imagem),
          tipo === 'sucesso' ? 'Ícone de resposta correta' : 'Ícone de resposta incorreta',
          'icone-feedback'
        )
      );

      const mensagem = document.createElement('span');
      mensagem.textContent = texto;
      feedbackQuiz.appendChild(mensagem);
    }

    function responder(letraEscolhida, letraCorreta, botaoEscolhido) {
      if (respondeu) return;

      respondeu = true;
      btnProxima.disabled = false;

      const botoes = alternativasQuiz.querySelectorAll('.alternativa');
      botoes.forEach(function (botao) {
        botao.disabled = true;

        if (botao.textContent === letraCorreta) {
          botao.classList.add('correta');
        }
      });

      if (letraEscolhida === letraCorreta) {
        acertos += 1;
        placarQuiz.textContent = 'Acertos: ' + acertos;
        botaoEscolhido.classList.add('correta');
        mostrarFeedback('sucesso', '✔ Resposta correta! Você ganhou ' + xpPorAcerto + ' XP.');
        app.adicionarXP(xpPorAcerto);
      } else {
        botaoEscolhido.classList.add('errada');
        mostrarFeedback('erro', '❌ Resposta incorreta. A resposta correta é ' + letraCorreta + '.');
      }
    }

    function proximaPergunta() {
      if (!respondeu) return;

      perguntaAtual += 1;

      if (perguntaAtual >= totalPerguntas) {
        finalizarQuiz();
      } else {
        mostrarPergunta();
      }
    }

    function finalizarQuiz() {
      const pontuacao = acertos * 10;
      const dados = app.carregarProgresso();

      dados.quizzesConcluidos += 1;
      dados.ultimoQuizPontuacao = pontuacao;
      dados.melhorQuizPontuacao = Math.max(dados.melhorQuizPontuacao || 0, pontuacao);
      app.salvarProgresso(dados);

      quizArea.classList.add('oculto');
      resultadoQuiz.classList.remove('oculto');
      resultadoQuiz.innerHTML = `
        <div class="resultado-icone" id="iconeResultadoQuiz"></div>
        <h2>Resultado do Quiz</h2>
        <p class="numero-destaque">${pontuacao}</p>
        <p>Você acertou <strong>${acertos}</strong> de <strong>${totalPerguntas}</strong> perguntas.</p>
        <div class="linha-botoes centralizada">
          <button class="botao primario" id="tentarNovamente" type="button">Tentar novamente</button>
        </div>
      `;

      document.getElementById('iconeResultadoQuiz').appendChild(
        app.criarImagem(
          app.caminho('imagens/icones/parabens.png'),
          'Ícone de parabéns',
          'icone-parabens'
        )
      );

      document.getElementById('tentarNovamente').addEventListener('click', criarNovoQuiz);
    }
  }
})();
