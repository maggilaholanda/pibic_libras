/* Quiz de Libras com dificuldade, modalidades e revisão de erros. */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', iniciarQuiz);

  function iniciarQuiz() {
    if ((document.body.dataset.page || '') !== 'quiz') return;

    const app = window.LibrasApp;
    const config = document.getElementById('configuracaoQuiz');
    const dificuldade = document.getElementById('dificuldadeQuiz');
    const modalidade = document.getElementById('modalidadeQuiz');
    const btnIniciar = document.getElementById('btnIniciarQuiz');
    const btnReiniciar = document.getElementById('btnReiniciarQuizTopo');
    const totalPorDificuldade = { facil: 5, medio: 10, dificil: 20 };
    const quizArea = document.getElementById('quizArea');
    const resultado = document.getElementById('resultadoQuiz');
    const contador = document.getElementById('contadorPergunta');
    const placar = document.getElementById('placarQuiz');
    const imagem = document.getElementById('imagemQuiz');
    const alternativas = document.getElementById('alternativasQuiz');
    const feedback = document.getElementById('feedbackQuiz');
    const btnProxima = document.getElementById('btnProximaPergunta');

    let perguntas = [];
    let perguntaAtual = 0;
    let acertos = 0;
    let respondeu = false;
    let modoRevisao = false;
    let erros = [];

    btnIniciar.addEventListener('click', iniciarConfigurado);
    btnReiniciar.addEventListener('click', function () {
      modoRevisao = false;
      config.classList.remove('oculto');
      quizArea.classList.add('oculto');
      resultado.classList.add('oculto');
    });
    btnProxima.addEventListener('click', proximaPergunta);

    function iniciarConfigurado() {
      const total = totalPorDificuldade[dificuldade.value] || 10;
      perguntas = criarPerguntas(total, modalidade.value);
      modoRevisao = false;
      erros = [];
      acertos = 0;
      perguntaAtual = 0;
      config.classList.add('oculto');
      resultado.classList.add('oculto');
      quizArea.classList.remove('oculto');
      mostrarPergunta();
    }

    function criarPerguntas(total, modo) {
      const letras = app.embaralhar(app.letras).slice(0, total);
      return letras.map(function (letra) {
        let tipo = modo;
        if (modo === 'misto') {
          tipo = Math.random() < 0.5 ? 'iniciante' : 'intermediario';
        }
        return { letra: letra, tipo: tipo };
      });
    }

    function mostrarPergunta() {
      const pergunta = perguntas[perguntaAtual];
      respondeu = false;
      contador.textContent = 'Pergunta ' + (perguntaAtual + 1) + ' de ' + perguntas.length;
      placar.textContent = modoRevisao ? 'Revisão' : 'Acertos: ' + acertos;
      feedback.textContent = '';
      feedback.className = 'feedback';
      btnProxima.disabled = true;
      imagem.innerHTML = '';
      alternativas.innerHTML = '';

      if (pergunta.tipo === 'intermediario') {
        mostrarIntermediario(pergunta);
      } else {
        mostrarIniciante(pergunta);
      }
    }

    function mostrarIniciante(pergunta) {
      imagem.appendChild(app.criarImagem(
        app.caminho('imagens/alfabeto/' + pergunta.letra + '.png'),
        'Sinal em Libras para identificar no quiz',
        'imagem-quiz'
      ));
      montarAlternativasTexto(pergunta.letra);
    }

    function mostrarIntermediario(pergunta) {
      imagem.innerHTML = '<strong class="pergunta-texto">Qual destes sinais representa a letra ' + pergunta.letra + '?</strong>';
      const incorretas = app.embaralhar(app.letras.filter(function (letra) {
        return letra !== pergunta.letra;
      })).slice(0, 3);
      app.embaralhar([pergunta.letra].concat(incorretas)).forEach(function (letra) {
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'alternativa alternativa-imagem';
        botao.setAttribute('aria-label', 'Sinal da letra ' + letra);
        botao.appendChild(app.criarImagem(
          app.caminho('imagens/alfabeto/' + letra + '.png'),
          'Sinal da letra ' + letra,
          'imagem-alternativa'
        ));
        botao.addEventListener('click', function () {
          responder(letra, pergunta.letra, botao);
        });
        alternativas.appendChild(botao);
      });
    }

    function montarAlternativasTexto(letraCorreta) {
      const incorretas = app.embaralhar(app.letras.filter(function (letra) {
        return letra !== letraCorreta;
      })).slice(0, 3);
      app.embaralhar([letraCorreta].concat(incorretas)).forEach(function (letra) {
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'alternativa';
        botao.textContent = letra;
        botao.setAttribute('aria-label', 'Alternativa ' + letra);
        botao.addEventListener('click', function () {
          responder(letra, letraCorreta, botao);
        });
        alternativas.appendChild(botao);
      });
    }

    function responder(escolhida, correta, botaoEscolhido) {
      if (respondeu) return;
      respondeu = true;
      btnProxima.disabled = false;
      alternativas.querySelectorAll('.alternativa').forEach(function (botao) {
        botao.disabled = true;
        const letra = botao.textContent || botao.getAttribute('aria-label').replace('Sinal da letra ', '');
        if (letra === correta) botao.classList.add('correta');
      });

      if (escolhida === correta) {
        acertos += 1;
        placar.textContent = modoRevisao ? 'Revisão' : 'Acertos: ' + acertos;
        botaoEscolhido.classList.add('correta');
        mostrarFeedback('sucesso', modoRevisao ? '✔ Muito bem! Você revisou este conteúdo.' : '✔ Resposta correta! Você ganhou 10 XP.');
        if (!modoRevisao) app.adicionarXP(10);
      } else {
        botaoEscolhido.classList.add('errada');
        if (!modoRevisao) erros.push(perguntas[perguntaAtual]);
        mostrarFeedback('erro', '❌ Ainda não. Esta é a resposta correta: ' + correta + '. Observe novamente antes de continuar.');
      }
    }

    function mostrarFeedback(tipo, texto) {
      feedback.innerHTML = '';
      feedback.className = 'feedback com-icone ' + (tipo === 'sucesso' ? 'sucesso-texto' : 'erro-texto');
      feedback.appendChild(app.criarImagem(
        app.caminho('imagens/icones/' + (tipo === 'sucesso' ? 'correto.png' : 'erro.png')),
        'Ícone de feedback',
        'icone-feedback'
      ));
      const mensagem = document.createElement('span');
      mensagem.textContent = texto;
      feedback.appendChild(mensagem);
    }

    function proximaPergunta() {
      if (!respondeu) return;
      perguntaAtual += 1;
      if (perguntaAtual >= perguntas.length) finalizar();
      else mostrarPergunta();
    }

    function finalizar() {
      if (modoRevisao) {
        quizArea.classList.add('oculto');
        resultado.classList.remove('oculto');
        resultado.innerHTML = '<h2>🎉 Revisão concluída!</h2><p>Você revisou os sinais que teve dificuldade neste Quiz.</p>';
        return;
      }
      const dados = app.carregarProgresso();
      const pontuacao = acertos * 10;
      dados.quizzesConcluidos += 1;
      dados.ultimoQuizPontuacao = pontuacao;
      dados.melhorQuizPontuacao = Math.max(dados.melhorQuizPontuacao || 0, pontuacao);
      const percentual = Math.round((acertos / perguntas.length) * 100);
      dados.melhorQuizPercentual = Math.max(dados.melhorQuizPercentual || 0, percentual);
      app.salvarProgresso(dados);
      quizArea.classList.add('oculto');
      resultado.classList.remove('oculto');
      resultado.innerHTML = '<h2>Resultado do Quiz</h2><p class="numero-destaque">' + pontuacao + '</p><p>Você acertou ' + acertos + ' de ' + perguntas.length + ' perguntas.</p>' + (erros.length ? '<p>' + erros.length + ' sinais precisam de revisão.</p><button class="botao primario" id="revisarErros" type="button">Revisar meus erros</button>' : '<p>🎉 Você concluiu sem erros!</p>');
      document.getElementById('revisarErros')?.addEventListener('click', iniciarRevisao);
    }

    function iniciarRevisao() {
      perguntas = erros.slice();
      perguntaAtual = 0;
      acertos = 0;
      modoRevisao = true;
      resultado.classList.add('oculto');
      quizArea.classList.remove('oculto');
      mostrarPergunta();
    }
  }
})();
