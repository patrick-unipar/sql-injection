// =============================================================================
//  app.js - Interface do SQLi Lab (HTML + JavaScript puro, sem instalação)
// -----------------------------------------------------------------------------
//  Usa o conteúdo de conteudo-aulas.js, conteudo-leigo.js e conteudo-central.js
//  e as consultas seguras de motor.js.
// =============================================================================

(function () {
  const INI = '\u0001';
  const FIM = '\u0002';

  const estado = {
    aba: 'dashboard',
    idx: 0,
    valores: {},
    seguro: null,
  };

  // ---------------------------------------------------------------- utilidades
  function esc(texto) {
    return String(texto ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  const $ = (sel) => document.querySelector(sel);

  function tabelaHtml(linhas) {
    if (!linhas || linhas.length === 0) return '<p class="vazio">Nenhum registro encontrado.</p>';
    const colunas = Object.keys(linhas[0]);
    return `
      <div class="tabela-wrap"><table>
        <thead><tr>${colunas.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead>
        <tbody>${linhas
          .map((l) => `<tr>${colunas.map((c) => `<td>${esc(l[c])}</td>`).join('')}</tr>`)
          .join('')}</tbody>
      </table></div>`;
  }

  function cannedHtml(c) {
    let h = '';
    if (c.kind === 'table') h += tabelaHtml(c.rows);
    if (c.kind === 'error') h += `<pre class="erro-box">${esc(c.message)}</pre>`;
    if (c.kind === 'text') h += `<p class="texto-box">${esc(c.message)}</p>`;
    if (c.note) h += `<p class="nota">${esc(c.note)}</p>`;
    return h;
  }

  // ---------------------------------------------------------------- abas
  function render() {
    document.querySelectorAll('nav button').forEach((b) => {
      b.classList.toggle('ativo', b.dataset.aba === estado.aba);
    });
    const main = $('main');
    if (estado.aba === 'dashboard') main.innerHTML = dashboardHtml();
    if (estado.aba === 'aulas') renderAulas();
    if (estado.aba === 'central') main.innerHTML = centralHtml();
    if (estado.aba === 'dashboard') carregarStatus();
  }

  function irPara(aba) {
    estado.aba = aba;
    render();
    window.scrollTo(0, 0);
  }

  // ---------------------------------------------------------------- dashboard
  function dashboardHtml() {
    return `
      <section class="card">
        <h2>Bem-vindo ao SQLi Lab</h2>
        <p>Este laboratório mostra, de forma didática e segura, como o SQL Injection acontece e como
        evitá-lo. Nas aulas você digita exemplos, vê o que aconteceria num sistema vulnerável e
        compara com o sistema seguro.</p>

        <div class="simples">
          <h4>Em palavras simples</h4>
          <p>SQL Injection é um truque em que alguém escreve, num campo de formulário, um texto que
          engana o sistema e o faz obedecer a uma ordem que não deveria. Aqui você aprende a
          reconhecer esse truque e entende por que ele não funciona num sistema bem feito.</p>
        </div>

        ${Motor.carregado ? '' : `<p class="alerta">O arquivo <code>dados/banco.js</code> não foi encontrado ou está vazio.
          Baixe o repositório completo e abra o <code>index.html</code> de dentro da pasta.</p>`}

        <div class="cards">
          <div class="mini">
            <h3>Status</h3>
            <p>Sistema: <b>funcionando no seu navegador</b></p>
            <p>Banco de dados: <b id="st-banco">...</b></p>
          </div>
          <div class="mini">
            <h3>Cenários</h3>
            <p><b>${LICOES.length}</b> técnicas explicadas</p>
            <button data-ir="aulas">Começar pelas aulas</button>
          </div>
          <div class="mini">
            <h3>Registros no banco</h3>
            <ul id="st-totais"><li>...</li></ul>
          </div>
        </div>

        <div class="categorias">
          <h3>Categorias implementadas</h3>
          <div class="chips">${LICOES.map((l) => `<span class="chip">${esc(l.nome)}</span>`).join('')}</div>
        </div>
      </section>`;
  }

  async function carregarStatus() {
    const s = await Motor.status();
    if (estado.aba !== 'dashboard') return;
    $('#st-banco').textContent = s.banco;
    $('#st-totais').innerHTML = Object.entries(s.totais)
      .map(([k, v]) => `<li>${esc(k)}: <b>${v}</b></li>`)
      .join('');
  }

  // ---------------------------------------------------------------- central
  function centralHtml() {
    return `
      <section class="card">
        <h2>Central de Aprendizado</h2>
        <p>Cada técnica de SQL Injection explicada: conceito, impacto e como corrigir.</p>
        <div class="licoes">
          ${LICOES.map(
            (l) => `
            <article class="licao">
              <h3>${esc(l.nome)}</h3>
              <p><b>Conceito:</b> ${esc(l.conceito)}</p>
              <p><b>Impacto:</b> ${esc(l.impacto)}</p>
              <p class="correcao"><b>Correção:</b> ${esc(l.correcao)}</p>
            </article>`
          ).join('')}
        </div>
      </section>`;
  }

  // ---------------------------------------------------------------- aulas
  function aulaAtual() {
    return LESSONS[estado.idx];
  }

  function indiceExemplo(lesson) {
    return lesson.examples.findIndex((e) =>
      Object.entries(e.values).every(([k, val]) => (estado.valores[k] ?? '') === val)
    );
  }

  function consultaHtml(lesson) {
    const marcados = {};
    for (const f of lesson.fields) marcados[f.name] = INI + (estado.valores[f.name] ?? '') + FIM;
    const partes = lesson.build(marcados).split(new RegExp(`(${INI}[^${FIM}]*${FIM})`));
    return partes
      .map((p) => (p.startsWith(INI) ? `<mark>${esc(p.slice(1, -1)) || ' '}</mark>` : esc(p)))
      .join('');
  }

  function explicaExemploHtml(lesson) {
    const i = indiceExemplo(lesson);
    if (i < 0) return '';
    return `
      <div class="simples">
        <h4>Explicando este exemplo em palavras simples</h4>
        <p>${esc(LEIGO[lesson.id].exemplos[i])}</p>
      </div>`;
  }

  function passo4Html(lesson) {
    const i = indiceExemplo(lesson);
    if (i >= 0) {
      const ex = lesson.examples[i];
      return `
        ${cannedHtml(ex.vulnerable)}
        <p class="porque"><b>Por quê:</b> ${esc(ex.why)}</p>
        <small class="muted">Ilustração pré-escrita com dados fictícios. Nada disso foi executado no banco.</small>`;
    }
    const digitou = lesson.fields.some((f) => (estado.valores[f.name] ?? '').length > 0);
    return digitou
      ? `<p class="muted">Para esta entrada não há ilustração pronta. Observe o pedido montado acima e use um dos
         exemplos para ver o resultado ilustrado.</p>`
      : '<p class="muted">Escolha um exemplo ou digite algo no passo 3.</p>';
  }

  function seguroHtml() {
    const s = estado.seguro;
    if (!s) return '';
    const resultado =
      'autenticado' in s
        ? `<p class="${s.autenticado ? 'ok' : 'nok'}">${
            s.autenticado
              ? `Autenticado como ${esc(s.usuario.usuario)} (${esc(s.usuario.papel)}).`
              : 'Acesso negado: o que você digitou foi tratado como texto, não como ordem.'
          }</p>`
        : tabelaHtml(s.resultados);
    return `
      ${resultado}
      <p class="rotulo">Pedido realmente executado (o ? é onde entra o que você digitou, sempre como texto):</p>
      <pre class="sql-box seguro-box">${esc(s.consultaSegura)}</pre>
      <p class="porque">${esc(s.explicacao)}</p>`;
  }

  // Atualiza só as partes que dependem do que foi digitado (mantém o foco no campo).
  function atualizarDigitacao() {
    const lesson = aulaAtual();
    $('#consulta').innerHTML = consultaHtml(lesson);
    $('#explica-exemplo').innerHTML = explicaExemploHtml(lesson);
    $('#passo4').innerHTML = passo4Html(lesson);
  }

  function renderAulas() {
    const lesson = aulaAtual();
    const leigo = LEIGO[lesson.id];
    $('main').innerHTML = `
      <section class="card">
        <h2>${esc(INTRO.titulo)}</h2>
        ${INTRO.paragrafos.map((p) => `<p>${esc(p)}</p>`).join('')}

        <div class="simples">
          <h4>${esc(INTRO_LEIGO.titulo)}</h4>
          <p>${esc(INTRO_LEIGO.texto)}</p>
        </div>

        <details class="glossario">
          <summary>Palavrinhas que vão aparecer (glossário)</summary>
          <dl>${GLOSSARIO.map((g) => `<div><dt>${esc(g.termo)}</dt><dd>${esc(g.significado)}</dd></div>`).join('')}</dl>
        </details>

        <div class="seletor">
          ${LESSONS.map(
            (l, i) => `<button class="${i === estado.idx ? 'ativo' : ''}" data-aula="${i}">${esc(l.titulo)}</button>`
          ).join('')}
        </div>

        <h2 class="aula-titulo">${esc(lesson.titulo)}</h2>
        <p class="muted">${esc(lesson.resumo)}</p>

        <div class="simples">
          <h4>Em palavras simples</h4>
          <p>${esc(leigo.analogia)}</p>
        </div>

        <div class="passo">
          <h3><span class="num">1</span> Como funciona</h3>
          <ul>${lesson.comoFunciona.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
        </div>

        <div class="passo">
          <h3><span class="num">2</span> Como é usado</h3>
          <ul>${lesson.comoEUsado.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
          ${lesson.limitacao ? `<p class="alerta-info">${esc(lesson.limitacao)}</p>` : ''}
        </div>

        <div class="passo">
          <h3><span class="num">3</span> Tente você</h3>
          <p class="muted">Clique em um exemplo para preencher os campos (ou digite o seu).</p>
          <div class="exemplos">
            ${lesson.examples
              .map((e, i) => `<button class="exemplo" data-exemplo="${i}">Usar exemplo: ${esc(e.label)}</button>`)
              .join('')}
          </div>
          <div class="form">
            ${lesson.fields
              .map(
                (f) => `
              <label class="campo">
                <span>${esc(f.label)}</span>
                <input data-campo="${esc(f.name)}" placeholder="${esc(f.placeholder)}"
                       value="${esc(estado.valores[f.name] ?? '')}" autocomplete="off" spellcheck="false" />
              </label>`
              )
              .join('')}
          </div>
          <p class="rotulo">O pedido (consulta) que seria montado SEM proteção. O trecho <mark>destacado</mark> é o que você digitou:</p>
          <pre class="sql-box" id="consulta">${consultaHtml(lesson)}</pre>
          <div id="explica-exemplo">${explicaExemploHtml(lesson)}</div>
        </div>

        <div class="passo vermelho">
          <h3><span class="num">4</span> Se o sistema fosse VULNERÁVEL</h3>
          <div id="passo4">${passo4Html(lesson)}</div>
        </div>

        <div class="passo verde">
          <h3><span class="num">5</span> No sistema SEGURO (executado de verdade)</h3>
          <p class="muted">Aqui o sistema separa a ordem do que você digitou. Veja a diferença.</p>
          <button class="acao" id="executar">Executar no sistema seguro</button>
          <div id="seguro">${seguroHtml()}</div>
        </div>

        <div class="nav-aulas">
          <button data-aula="${estado.idx - 1}" ${estado.idx === 0 ? 'disabled' : ''}>Aula anterior</button>
          <button data-aula="${estado.idx + 1}" ${estado.idx === LESSONS.length - 1 ? 'disabled' : ''}>Próxima aula</button>
        </div>
      </section>`;
  }

  function trocarAula(i) {
    estado.idx = i;
    estado.valores = {};
    estado.seguro = null;
    renderAulas();
    $('.aula-titulo').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function executar() {
    const l = aulaAtual();
    const v = estado.valores;
    let r;
    switch (l.id) {
      case 'auth-bypass':
        r = await Motor.login(v.usuario ?? '', v.senha ?? '');
        break;
      case 'error-based':
      case 'union-based':
        r = await Motor.buscaProdutos(v.nome ?? '');
        break;
      case 'boolean-blind':
      case 'time-blind':
        r = await Motor.produtoPorId(v.id ?? '');
        break;
      case 'get-params':
        r = await Motor.clientePorCpf(v.cpf ?? '');
        break;
      default:
        r = await Motor.filtroProdutos(v.nome ?? '', v.categoria ?? '');
    }
    estado.seguro = r;
    $('#seguro').innerHTML = seguroHtml();
  }

  // ---------------------------------------------------------------- eventos
  document.addEventListener('click', (ev) => {
    const alvo = ev.target.closest('button');
    if (!alvo || alvo.disabled) return;
    if (alvo.dataset.aba) return irPara(alvo.dataset.aba);
    if (alvo.dataset.ir) return irPara(alvo.dataset.ir);
    if (alvo.dataset.aula !== undefined) return trocarAula(Number(alvo.dataset.aula));
    if (alvo.dataset.exemplo !== undefined) {
      const ex = aulaAtual().examples[Number(alvo.dataset.exemplo)];
      estado.valores = { ...ex.values };
      estado.seguro = null;
      document.querySelectorAll('input[data-campo]').forEach((inp) => {
        inp.value = estado.valores[inp.dataset.campo] ?? '';
      });
      $('#seguro').innerHTML = '';
      atualizarDigitacao();
      return;
    }
    if (alvo.id === 'executar') executar();
  });

  document.addEventListener('input', (ev) => {
    const campo = ev.target.dataset && ev.target.dataset.campo;
    if (!campo) return;
    estado.valores = { ...estado.valores, [campo]: ev.target.value };
    atualizarDigitacao();
  });

  render();
})();
