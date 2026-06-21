/* =========================================================
   Módulo Aprender Alfabeto
   Mostra as letras A até Z e registra letras visualizadas.
   ========================================================= */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', iniciarAlfabeto);

  function iniciarAlfabeto() {
    if ((document.body.dataset.page || '') !== 'alfabeto') return;

    const app = window.LibrasApp;
    const letras = app.letras;
    let indiceAtual = 0;

    const letraAtual = document.getElementById('letraAtual');
    const imagemLetra = document.getElementById('imagemLetra');
    const gradeLetras = document.getElementById('gradeLetras');
    const btnAnterior = document.getElementById('btnAnterior');
    const btnProxima = document.getElementById('btnProxima');

    montarGradeLetras();
    mostrarLetra(indiceAtual);

    btnAnterior.addEventListener('click', function () {
      indiceAtual = indiceAtual === 0 ? letras.length - 1 : indiceAtual - 1;
      mostrarLetra(indiceAtual);
    });

    btnProxima.addEventListener('click', function () {
      indiceAtual = indiceAtual === letras.length - 1 ? 0 : indiceAtual + 1;
      mostrarLetra(indiceAtual);
    });

    function montarGradeLetras() {
      gradeLetras.innerHTML = '';

      letras.forEach(function (letra, indice) {
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'letra-botao';
        botao.textContent = letra;
        botao.setAttribute('aria-label', 'Visualizar letra ' + letra);

        botao.addEventListener('click', function () {
          indiceAtual = indice;
          mostrarLetra(indiceAtual);
        });

        gradeLetras.appendChild(botao);
      });
    }

    function mostrarLetra(indice) {
      const letra = letras[indice];

      letraAtual.textContent = 'Letra ' + letra;
      imagemLetra.innerHTML = '';
      imagemLetra.appendChild(
        app.criarImagem(
          app.caminho('imagens/alfabeto/' + letra + '.png'),
          'Sinal em Libras da letra ' + letra,
          'imagem-alfabeto'
        )
      );

      salvarLetraVisualizada(letra);
      atualizarGrade(letra);
    }

    function salvarLetraVisualizada(letra) {
      const dados = app.carregarProgresso();

      if (!Array.isArray(dados.alfabetoVisto)) {
        dados.alfabetoVisto = [];
      }

      if (!dados.alfabetoVisto.includes(letra)) {
        dados.alfabetoVisto.push(letra);
        app.salvarProgresso(dados);
      }
    }

    function atualizarGrade(letraAtiva) {
      const dados = app.carregarProgresso();
      const botoes = gradeLetras.querySelectorAll('.letra-botao');

      botoes.forEach(function (botao) {
        const letra = botao.textContent.replace(' ✓', '');
        botao.classList.toggle('ativa', letra === letraAtiva);
        botao.classList.toggle('vista', dados.alfabetoVisto.includes(letra));
      });
    }
  }
})();
