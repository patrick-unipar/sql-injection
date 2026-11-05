// =============================================================================
//  motor.js - Lê o banco em texto e responde às consultas do jeito SEGURO
// -----------------------------------------------------------------------------
//  Substitui o antigo servidor. Tudo roda dentro do navegador.
//
//  O que o aluno digita é SEMPRE tratado como um valor a ser comparado, nunca
//  como parte da ordem. É o mesmo efeito de um prepared statement: o texto
//  "professor' --" é procurado literalmente, e ninguém tem esse nome.
//  A "consulta insegura" mostrada nas aulas é só texto ilustrativo.
// =============================================================================

window.Motor = (function () {
  // Colunas que guardam números (o resto é texto).
  const NUMERICAS = new Set(['id', 'preco', 'estoque', 'cliente_id', 'produto_id', 'quantidade', 'salario']);

  function lerBanco(texto) {
    const tabelas = {};
    let atual = null;
    let colunas = null;
    for (const bruta of String(texto || '').split(/\r?\n/)) {
      const linha = bruta.trim();
      if (!linha || linha.startsWith('#')) continue;
      const cabecalho = linha.match(/^\[(.+)\]$/);
      if (cabecalho) {
        atual = cabecalho[1].trim();
        tabelas[atual] = [];
        colunas = null;
        continue;
      }
      if (!atual) continue;
      const partes = linha.split('|').map((p) => p.trim());
      if (!colunas) {
        colunas = partes;
        continue;
      }
      const registro = {};
      colunas.forEach((c, i) => {
        const v = partes[i] ?? '';
        registro[c] = NUMERICAS.has(c) && v !== '' ? Number(v) : v;
      });
      tabelas[atual].push(registro);
    }
    return tabelas;
  }

  const banco = lerBanco(window.BANCO_TXT);
  const tabela = (nome) => banco[nome] || [];

  // Equivalente ao LIKE '%texto%' do SQLite (sem diferenciar maiúsculas).
  const contem = (valor, busca) =>
    String(valor).toLocaleLowerCase('pt-BR').includes(String(busca).toLocaleLowerCase('pt-BR'));

  // Pequena pausa para parecer uma consulta de verdade.
  const responder = (dados) => new Promise((ok) => setTimeout(() => ok(dados), 150));

  return {
    carregado: Object.keys(banco).length > 0,

    status() {
      const totais = {};
      for (const nome of Object.keys(banco)) totais[nome] = banco[nome].length;
      return responder({ banco: Object.keys(banco).length ? 'carregado' : 'não encontrado', totais });
    },

    login(usuario, senha) {
      const consultaSegura = 'SELECT id, usuario, papel FROM usuarios WHERE usuario = ? AND senha = ?';
      const linha = tabela('usuarios').find((u) => u.usuario === usuario && u.senha === senha);
      const pareceInjecao = /('|--|\bOR\b|\bUNION\b|;)/i.test(usuario + ' ' + senha);
      return responder({
        autenticado: Boolean(linha),
        usuario: linha ? { id: linha.id, usuario: linha.usuario, papel: linha.papel } : null,
        consultaSegura,
        explicacao: linha
          ? 'Credenciais corretas: a consulta parametrizada encontrou o usuário.'
          : pareceInjecao
          ? "Sua entrada contém caracteres típicos de injeção (ex.: ' OR '1'='1' -- ou professor' --). Na versão INSEGURA, esses caracteres mudariam a lógica do WHERE e poderiam liberar o acesso. Como o sistema usa prepared statements, a entrada foi tratada como texto e o acesso foi negado."
          : 'Usuário ou senha inválidos (tratados como valores, não como código SQL).',
      });
    },

    buscaProdutos(nome) {
      const resultados = tabela('produtos').filter((p) => contem(p.nome, nome));
      return responder({
        total: resultados.length,
        resultados,
        consultaSegura: 'SELECT * FROM produtos WHERE nome LIKE ?',
        explicacao:
          'A busca usa LIKE com parâmetro vinculado: o texto digitado é só um valor a ser procurado. Na versão insegura, inserir aspas ou UNION SELECT poderia quebrar a consulta (error-based) ou anexar dados de outras tabelas (union-based).',
      });
    },

    produtoPorId(idBruto) {
      const idValido = /^[0-9]+$/.test(String(idBruto).trim());
      const id = Number.parseInt(idBruto, 10);
      const resultados = idValido ? tabela('produtos').filter((p) => p.id === id) : [];
      return responder({
        idValido,
        total: resultados.length,
        resultados,
        consultaSegura: 'SELECT * FROM produtos WHERE id = ?',
        explicacao: idValido
          ? 'O id foi validado como número inteiro antes de ser usado como parâmetro. Validar o tipo esperado é uma defesa importante contra a injeção por booleano cego.'
          : 'O id recebido não é um número inteiro, então foi rejeitado antes de chegar ao banco. Na versão insegura, um valor como "1 AND 1=1" seria juntado à consulta e alteraria o resultado.',
      });
    },

    clientePorCpf(cpf) {
      const resultados = tabela('clientes').filter((c) => String(c.cpf) === cpf);
      return responder({
        total: resultados.length,
        resultados,
        consultaSegura: 'SELECT * FROM clientes WHERE cpf = ?',
        explicacao:
          'A consulta por CPF usa parâmetro vinculado, então o texto digitado é só um valor. Os CPFs são fictícios. Na versão insegura, as aspas permitiriam manipular a cláusula WHERE.',
      });
    },

    filtroProdutos(nome, categoria) {
      const condicoes = [];
      if (nome) condicoes.push('nome LIKE ?');
      if (categoria) condicoes.push('categoria = ?');
      const resultados = tabela('produtos').filter(
        (p) => (!nome || contem(p.nome, nome)) && (!categoria || p.categoria === categoria)
      );
      return responder({
        total: resultados.length,
        resultados,
        consultaSegura: 'SELECT * FROM produtos' + (condicoes.length ? ' WHERE ' + condicoes.join(' AND ') : ''),
        explicacao:
          'Campos recebidos em JSON (POST) são entrada do usuário como qualquer outra. Aqui cada campo vira um parâmetro vinculado; na versão insegura seriam juntados diretamente à SQL.',
      });
    },
  };
})();
