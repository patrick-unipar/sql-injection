// =============================================================================
//  conteudo-central.js - Conteúdo didático sobre SQL Injection
// -----------------------------------------------------------------------------
//  Catálogo das técnicas de SQL Injection explicadas no laboratório, com
//  conceito, impacto e forma de correção. Usado pela Central de Aprendizado
//  do frontend. Este material é puramente educativo e defensivo.
// =============================================================================

const LICOES = [
  {
    id: 'error-based',
    nome: 'Error-based (baseada em erro)',
    conceito:
      'Quando o texto digitado pelo usuário é juntado diretamente à consulta SQL, caracteres como a aspa simples quebram a sintaxe e o banco devolve uma mensagem de erro. Se essa mensagem for exibida na tela, ela pode revelar como a consulta e o banco são por dentro.',
    impacto:
      'Vazamento de detalhes internos (nomes de colunas e tabelas, tipo de banco), o que facilita ataques seguintes.',
    correcao:
      'Usar prepared statements (parâmetros vinculados) e nunca mostrar a mensagem de erro bruta ao usuário: registrar o erro no log do servidor e devolver uma mensagem genérica.',
  },
  {
    id: 'union-based',
    nome: 'UNION-based',
    conceito:
      'O operador UNION combina o resultado de duas consultas. Numa consulta vulnerável, um atacante pode acrescentar "UNION SELECT ..." para trazer dados de outras tabelas junto do resultado esperado.',
    impacto:
      'Leitura de dados que o usuário não deveria acessar (por exemplo, usuários e senhas da tabela de usuários).',
    correcao:
      'Parametrizar a consulta e validar o tipo da entrada. Com parâmetros vinculados, o que o usuário digita é tratado como valor, nunca como parte da estrutura da SQL.',
  },
  {
    id: 'boolean-blind',
    nome: 'Boolean-based Blind (cega por booleano)',
    conceito:
      'Quando não há mensagem de erro nem dados extras na tela, o atacante injeta condições verdadeiras ou falsas (ex.: AND 1=1 e AND 1=2) e observa se a resposta muda. Essa diferença revela informação aos poucos.',
    impacto:
      'Extração lenta de dados, mesmo sem nenhum retorno direto, apenas observando mudanças na resposta.',
    correcao:
      'Prepared statements impedem que a entrada altere a lógica da condição. Validar o formato esperado (ex.: id numérico) reforça a proteção.',
  },
  {
    id: 'time-blind',
    nome: 'Time-based Blind (cega por tempo)',
    conceito:
      'Variante da técnica cega: em vez de observar o conteúdo, o atacante mede o tempo de resposta. Em bancos como o MySQL usa-se SLEEP(); o SQLite não possui essa função, o que limita essa técnica neste banco.',
    impacto:
      'Dedução de dados pelo tempo de resposta, sem nenhum retorno visível.',
    correcao:
      'Prepared statements e validação de entrada. Observação didática: o SQLite não tem SLEEP, então a técnica time-based tradicional não se aplica diretamente a ele.',
  },
  {
    id: 'auth-bypass',
    nome: 'Bypass de autenticação',
    conceito:
      "Num login que monta a consulta juntando usuário e senha, uma entrada como \"professor' --\" fecha o texto do usuário e comenta o restante da consulta, incluindo a checagem da senha. Já \"' OR '1'='1' --\" torna a condição sempre verdadeira.",
    impacto:
      'Acesso indevido a contas e áreas restritas sem conhecer as credenciais.',
    correcao:
      'Usar prepared statements, guardar as senhas com hash (bcrypt ou argon2) e comparar o hash, nunca a senha em texto puro dentro da consulta.',
  },
  {
    id: 'get-params',
    nome: 'Parâmetros GET na URL',
    conceito:
      'Parâmetros vindos da URL (?id=1, ?nome=arroz, ?cpf=...) também são entrada do usuário. Se forem juntados à SQL, carregam o mesmo risco de qualquer outra entrada.',
    impacto:
      'Os mesmos riscos das outras técnicas, explorados por meio de links manipulados.',
    correcao:
      'Validar e tipar cada parâmetro (ex.: converter o id para número inteiro) e sempre usar parâmetros vinculados na consulta.',
  },
  {
    id: 'post-json',
    nome: 'Corpo POST em JSON',
    conceito:
      'Dados enviados no corpo de uma requisição POST (JSON) também são entrada do usuário. Juntá-los à SQL é tão perigoso quanto juntar parâmetros da URL.',
    impacto:
      'Injeção por meio de campos de formulários e de integrações que enviam JSON.',
    correcao:
      'Validar o formato do JSON (tipos e campos esperados) e usar prepared statements para cada valor.',
  },
];
