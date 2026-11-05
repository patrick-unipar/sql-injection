// =============================================================================
//  conteudo-aulas.js - Conteúdo das aulas interativas do SQLi Lab
// -----------------------------------------------------------------------------
//  Cada aula segue o mesmo roteiro:
//    1) Como funciona   2) Como é usado   3) Tente você (entrada do aluno)
//    4) Resultado SE o sistema fosse vulnerável (ilustração pré-escrita)
//    5) Resultado no sistema SEGURO (executado de verdade)
//
//  IMPORTANTE: os "resultados se fosse vulnerável" são ILUSTRAÇÕES escritas à
//  mão com dados fictícios. Nada aqui é executado de forma insegura.
// =============================================================================
// ---- Dados fictícios usados nas ilustrações (iguais aos do banco) ----------
const usuarios = [{ id: 1, usuario: 'professor', papel: 'admin' }];
const produtos = [
    { id: 1, nome: 'Arroz 5kg', categoria: 'Alimentos', preco: 24.9, estoque: 120 },
    { id: 2, nome: 'Feijão 1kg', categoria: 'Alimentos', preco: 8.5, estoque: 200 },
    { id: 3, nome: 'Macarrão 500g', categoria: 'Alimentos', preco: 4.2, estoque: 300 },
    { id: 4, nome: 'Óleo de soja 900ml', categoria: 'Alimentos', preco: 7.8, estoque: 150 },
    { id: 5, nome: 'Açúcar 1kg', categoria: 'Alimentos', preco: 5.1, estoque: 180 },
];
const usuariosAnexados = [
    { id: 1, nome: 'professor', categoria: 'aula2024', preco: 'admin', estoque: 0 },
    { id: 2, nome: 'aluno1', categoria: 'senha123', preco: 'usuario', estoque: 0 },
    { id: 3, nome: 'aluno2', categoria: 'trocar01', preco: 'usuario', estoque: 0 },
    { id: 4, nome: 'suporte', categoria: 'suporte99', preco: 'tecnico', estoque: 0 },
    { id: 5, nome: 'visitante', categoria: 'visita00', preco: 'leitura', estoque: 0 },
];
const clientes = [
    { id: 1, nome: 'Ana Lima', cpf: '11111111100', cidade: 'Umuarama' },
    { id: 2, nome: 'Bruno Costa', cpf: '22222222200', cidade: 'Maringá' },
    { id: 3, nome: 'Carla Dias', cpf: '33333333300', cidade: 'Cascavel' },
    { id: 4, nome: 'Diego Souza', cpf: '44444444400', cidade: 'Londrina' },
    { id: 5, nome: 'Elena Ramos', cpf: '55555555500', cidade: 'Umuarama' },
];
const INTRO = {
    titulo: 'O que é SQL Injection?',
    paragrafos: [
        'SQL Injection acontece quando o programa monta um comando SQL juntando o texto digitado pelo usuário. Se esse texto tiver caracteres especiais (como aspas), ele deixa de ser um simples valor e passa a alterar a estrutura do comando.',
        'A causa é sempre a mesma: misturar CÓDIGO (o SQL) com DADOS (o que o usuário digitou). A proteção também é sempre a mesma: separar os dois, usando consultas parametrizadas (prepared statements).',
        'Em cada aula abaixo você vai: entender a técnica, digitar um exemplo, ver o que aconteceria num sistema vulnerável e ver como o sistema seguro reage.',
    ],
};
const LESSONS = [
    // ---------------------------------------------------------------- 1
    {
        id: 'auth-bypass',
        titulo: '1. Bypass de autenticação (login)',
        resumo: 'Entrar numa conta sem saber a senha.',
        comoFunciona: [
            "O login monta a consulta juntando usuário e senha: SELECT * FROM usuarios WHERE usuario = '...' AND senha = '...'.",
            'Se o usuário digitar uma aspa simples, ele "fecha" o texto do valor e pode escrever SQL logo depois.',
            'O trecho -- (dois hífens) é um comentário em SQL: tudo que vem depois é ignorado, inclusive a checagem da senha.',
        ],
        comoEUsado: [
            'O atacante escolhe um usuário que existe (ex.: professor), fecha a aspa e comenta o resto da consulta.',
            'A condição da senha desaparece e o banco devolve a conta sem validar a senha.',
        ],
        fields: [
            { name: 'usuario', label: 'Usuário', placeholder: "ex.: professor' --" },
            { name: 'senha', label: 'Senha', placeholder: 'qualquer coisa' },
        ],
        build: (v) => `SELECT * FROM usuarios WHERE usuario = '${v.usuario ?? ''}' AND senha = '${v.senha ?? ''}'`,
        examples: [
            {
                label: 'Entrar como professor sem a senha',
                values: { usuario: "professor' --", senha: 'qualquer' },
                vulnerable: {
                    kind: 'table',
                    rows: usuarios,
                    note: 'Login ACEITO como professor (admin), mesmo com a senha errada.',
                },
                why: "A consulta virou: WHERE usuario = 'professor' --' AND senha = '...'. Tudo depois do -- é comentário, então a senha nunca é conferida.",
            },
            {
                label: 'Condição sempre verdadeira',
                values: { usuario: "' OR '1'='1' --", senha: 'x' },
                vulnerable: {
                    kind: 'table',
                    rows: usuarios,
                    note: "Login ACEITO: '1'='1' é sempre verdadeiro, então o banco devolve o primeiro usuário da tabela.",
                },
                why: "WHERE usuario = '' OR '1'='1' --... : a condição OR '1'='1' deixa o WHERE verdadeiro para todas as linhas.",
            },
        ],
    },
    // ---------------------------------------------------------------- 2
    {
        id: 'error-based',
        titulo: '2. Error-based (baseada em erro)',
        resumo: 'Usar a mensagem de erro do banco para entender a consulta.',
        comoFunciona: [
            'Quando a entrada quebra a sintaxe da consulta, o banco devolve um erro.',
            'Se a aplicação mostra esse erro ao usuário, ele passa a enxergar detalhes internos: tipo de banco, trecho da consulta, nomes de tabelas e colunas.',
        ],
        comoEUsado: [
            'O atacante digita um caractere que quebra a sintaxe (normalmente uma aspa simples) só para provocar o erro.',
            'A mensagem recebida confirma que a entrada vai direto para a SQL e dá pistas para os próximos passos.',
        ],
        fields: [{ name: 'nome', label: 'Nome do produto', placeholder: "ex.: '" }],
        build: (v) => `SELECT * FROM produtos WHERE nome LIKE '%${v.nome ?? ''}%'`,
        examples: [
            {
                label: 'Provocar um erro com uma aspa simples',
                values: { nome: "'" },
                vulnerable: {
                    kind: 'error',
                    message: 'SQLITE_ERROR: unrecognized token: "\'"',
                    note: 'A mensagem (a redação exata varia) mostra que a aspa quebrou a consulta.',
                },
                why: 'A consulta ficou com uma aspa sobrando e o texto não fecha. O erro bruto confirma que a entrada é interpretada como SQL.',
            },
        ],
    },
    // ---------------------------------------------------------------- 3
    {
        id: 'union-based',
        titulo: '3. UNION-based',
        resumo: 'Anexar dados de outra tabela ao resultado da busca.',
        comoFunciona: [
            'O operador UNION junta o resultado de duas consultas em uma só tabela.',
            'Para funcionar, as duas consultas precisam ter o mesmo número de colunas (a tabela produtos tem 5).',
        ],
        comoEUsado: [
            'O atacante fecha o texto da busca e acrescenta UNION SELECT apontando para outra tabela, como usuarios.',
            'Os dados dessa outra tabela aparecem misturados na lista de produtos, nas colunas de mesmo formato.',
        ],
        fields: [{ name: 'nome', label: 'Nome do produto', placeholder: "ex.: ' UNION SELECT ..." }],
        build: (v) => `SELECT * FROM produtos WHERE nome LIKE '%${v.nome ?? ''}%'`,
        examples: [
            {
                label: 'Anexar a tabela de usuários ao resultado',
                values: { nome: "' UNION SELECT id, usuario, senha, papel, 0 FROM usuarios --" },
                vulnerable: {
                    kind: 'table',
                    rows: usuariosAnexados,
                    note: 'Além dos 15 produtos, aparecem 5 linhas que na verdade são usuários e senhas (a coluna "categoria" mostra a senha).',
                },
                why: 'O UNION SELECT usou 5 colunas (como a tabela produtos) e trouxe usuário e senha da tabela usuarios para dentro do resultado da busca.',
            },
        ],
    },
    // ---------------------------------------------------------------- 4
    {
        id: 'boolean-blind',
        titulo: '4. Boolean-based Blind (cega por booleano)',
        resumo: 'Fazer perguntas de sim ou não ao banco e observar a resposta.',
        comoFunciona: [
            'Aqui a tela não mostra erros nem dados extras. Mas a resposta muda conforme uma condição seja verdadeira ou falsa.',
            'Ex.: com a condição verdadeira o produto aparece; com a falsa, a lista vem vazia.',
        ],
        comoEUsado: [
            'O atacante acrescenta condições como AND 1=1 (verdadeira) e AND 1=2 (falsa) para confirmar que consegue influenciar a consulta.',
            'Depois faz perguntas sobre dados escondidos (ex.: "o primeiro usuário é admin?") e deduz a resposta pelo que a tela mostra, aos poucos.',
        ],
        fields: [{ name: 'id', label: 'ID do produto', placeholder: 'ex.: 1 AND 1=1' }],
        build: (v) => `SELECT * FROM produtos WHERE id = ${v.id ?? ''}`,
        examples: [
            {
                label: 'Condição VERDADEIRA (1 AND 1=1)',
                values: { id: '1 AND 1=1' },
                vulnerable: {
                    kind: 'table',
                    rows: [produtos[0]],
                    note: 'O produto 1 aparece: a condição extra foi aceita e é verdadeira.',
                },
                why: 'AND 1=1 não muda o resultado, mas prova que a entrada afeta a consulta.',
            },
            {
                label: 'Condição FALSA (1 AND 1=2)',
                values: { id: '1 AND 1=2' },
                vulnerable: {
                    kind: 'text',
                    message: 'Nenhum produto encontrado.',
                    note: 'A lista veio vazia: a condição extra é falsa.',
                },
                why: 'A diferença entre os dois resultados mostra que o atacante controla a lógica da consulta. Essa é a base da técnica cega.',
            },
            {
                label: "Pergunta: o usuário 1 é 'admin'?",
                values: { id: "1 AND (SELECT papel FROM usuarios WHERE id=1)='admin'" },
                vulnerable: {
                    kind: 'table',
                    rows: [produtos[0]],
                    note: 'O produto apareceu: a resposta é SIM. Se a lista viesse vazia, seria NÃO.',
                },
                why: 'A resposta só pode ser "aparece" ou "não aparece", mas repetindo perguntas assim o atacante reconstrói dados completos.',
            },
        ],
    },
    // ---------------------------------------------------------------- 5
    {
        id: 'time-blind',
        titulo: '5. Time-based Blind (cega por tempo)',
        resumo: 'Deduzir informação pelo tempo que o servidor demora para responder.',
        comoFunciona: [
            'Quando nem o conteúdo da tela muda, resta o tempo de resposta.',
            'O atacante manda o banco "dormir" por alguns segundos apenas se uma condição for verdadeira.',
            'Em MySQL isso usa SLEEP(); em outros bancos, funções parecidas.',
        ],
        comoEUsado: [
            'Se a página demora cerca de 5 segundos, a condição era verdadeira; se responde na hora, era falsa.',
            'Repetindo, o atacante extrai dados mesmo sem ver nada na tela.',
        ],
        fields: [{ name: 'id', label: 'ID do produto', placeholder: 'ex.: 1 AND SLEEP(5)' }],
        build: (v) => `SELECT * FROM produtos WHERE id = ${v.id ?? ''}`,
        examples: [
            {
                label: 'Exemplo em MySQL: dormir 5s se verdadeiro',
                values: { id: '1 AND IF(1=1, SLEEP(5), 0)' },
                vulnerable: {
                    kind: 'text',
                    message: 'A resposta chegou depois de ~5 segundos (comportamento típico de um MySQL vulnerável).',
                    note: 'Atraso = condição verdadeira. Sem atraso = condição falsa.',
                },
                why: 'O tempo de resposta virou um canal de informação, mesmo sem nenhum dado visível.',
            },
            {
                label: 'A mesma ideia no SQLite',
                values: { id: '1 AND SLEEP(5)' },
                vulnerable: {
                    kind: 'error',
                    message: 'SQLITE_ERROR: no such function: SLEEP',
                    note: 'O SQLite NÃO possui SLEEP(), então essa técnica não funciona assim nele.',
                },
                why: 'Neste laboratório o banco é o SQLite. A técnica é estudada de forma conceitual: não há simulação de atraso no servidor.',
            },
        ],
        limitacao: 'O SQLite não tem a função SLEEP(). Esta aula é conceitual: o exemplo de atraso vale para bancos como o MySQL.',
    },
    // ---------------------------------------------------------------- 6
    {
        id: 'get-params',
        titulo: '6. Parâmetros GET (URL)',
        resumo: 'Manipular parâmetros da URL, como ?cpf=...',
        comoFunciona: [
            'Parâmetros na URL (?cpf=123) podem ser digitados ou alterados livremente pelo usuário.',
            'Se forem juntados à SQL, valem as mesmas regras de qualquer outra entrada.',
        ],
        comoEUsado: [
            'O atacante edita o valor na barra de endereços, fecha a aspa e acrescenta uma condição que é sempre verdadeira.',
            'Em vez de um cliente, a consulta passa a devolver a tabela inteira.',
        ],
        fields: [{ name: 'cpf', label: 'CPF (fictício)', placeholder: "ex.: 11111111100 ou ' OR '1'='1" }],
        build: (v) => `SELECT * FROM clientes WHERE cpf = '${v.cpf ?? ''}'`,
        examples: [
            {
                label: 'Uso normal',
                values: { cpf: '11111111100' },
                vulnerable: {
                    kind: 'table',
                    rows: [clientes[0]],
                    note: 'Comportamento esperado: 1 cliente.',
                },
                why: 'Entrada legítima, serve de comparação.',
            },
            {
                label: 'Trazer TODOS os clientes',
                values: { cpf: "' OR '1'='1" },
                vulnerable: {
                    kind: 'table',
                    rows: clientes,
                    note: 'Todos os 10 clientes foram devolvidos (aqui aparecem 5).',
                },
                why: "WHERE cpf = '' OR '1'='1' é sempre verdadeiro, então nenhum registro é filtrado.",
            },
        ],
    },
    // ---------------------------------------------------------------- 7
    {
        id: 'post-json',
        titulo: '7. Corpo POST em JSON',
        resumo: 'Campos enviados em JSON também são entrada do usuário.',
        comoFunciona: [
            'Formulários e APIs enviam dados no corpo da requisição, em JSON: {"nome": "...", "categoria": "..."}.',
            'Eles não aparecem na URL, mas continuam sob controle de quem envia a requisição.',
        ],
        comoEUsado: [
            'O atacante coloca o payload em um dos campos do JSON.',
            'Se os campos forem juntados à SQL, o efeito é o mesmo dos parâmetros GET.',
        ],
        fields: [
            { name: 'nome', label: 'nome', placeholder: 'ex.: caderno' },
            { name: 'categoria', label: 'categoria', placeholder: "ex.: Papelaria ou ' OR '1'='1" },
        ],
        build: (v) => `SELECT * FROM produtos WHERE nome LIKE '%${v.nome ?? ''}%' AND categoria = '${v.categoria ?? ''}'`,
        examples: [
            {
                label: 'Uso normal',
                values: { nome: 'caderno', categoria: 'Papelaria' },
                vulnerable: {
                    kind: 'table',
                    rows: [{ id: 13, nome: 'Caderno 200 folhas', categoria: 'Papelaria', preco: 18, estoque: 60 }],
                    note: 'Comportamento esperado: 1 produto.',
                },
                why: 'Entrada legítima, serve de comparação.',
            },
            {
                label: 'Ignorar o filtro de categoria',
                values: { nome: 'x', categoria: "' OR '1'='1" },
                vulnerable: {
                    kind: 'table',
                    rows: produtos,
                    note: 'Todos os 15 produtos foram devolvidos (aqui aparecem 5).',
                },
                why: "A condição OR '1'='1' é sempre verdadeira e anula o filtro: o OR libera todas as linhas.",
            },
        ],
    },
];
