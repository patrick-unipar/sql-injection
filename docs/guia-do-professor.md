# Guia do Professor — SQLi Lab

Material de apoio para conduzir a aula sobre SQL Injection usando o laboratório.

> Lembrete: este laboratório é **didático e seguro**. O sistema executa apenas
> consultas **parametrizadas**. A "consulta insegura" mostrada na tela é uma
> ilustração em texto de como a query ficaria por concatenação — ela não é
> executada. O foco da aula é **reconhecer o padrão perigoso e aplicar a
> correção**.

---

## Objetivos de aprendizagem

Ao final da aula, o aluno deve ser capaz de:

1. Explicar o que é SQL Injection e por que a **concatenação de strings** na
   montagem de SQL é a causa raiz.
2. Reconhecer onde a entrada do usuário entra na consulta (login, busca,
   parâmetros GET, corpo POST/JSON).
3. Diferenciar as técnicas: error-based, UNION-based, boolean-blind, time-blind
   e bypass de autenticação.
4. Aplicar a correção: **prepared statements** com parâmetros vinculados,
   validação de tipo e tratamento de erros.
5. Entender limitações específicas do SQLite (sem `SLEEP`).

## Roteiro sugerido de aula (50 min)

1. **(5 min) Abertura.** Abra o Dashboard e mostre o status e os números do
   banco. Explique que o app simula uma loja fictícia.
2. **(10 min) Login.** Faça login válido (`professor` / `aula2024`). Depois use
   `professor' --` no campo usuário. Mostre o passo 4 (vermelho, se fosse vulnerável)
   e pergunte à turma: "por que a senha nunca seria conferida?". Em
   seguida execute o passo 5 (verde, sistema seguro) e explique por que o parâmetro vinculado impede
   o ataque.
3. **(10 min) Busca de produtos.** Mostre a busca por nome e discuta error-based
   (aspas quebrando a query) e UNION-based (anexar dados de outra tabela).
4. **(8 min) Produto por id.** Mostre a diferença entre um `id` numérico válido
   e uma entrada como `1 AND 1=1`, introduzindo a ideia de boolean-blind e de
   validação de tipo.
5. **(7 min) Clientes e pedidos.** Reforce que parâmetros de URL e filtros
   também são entrada do usuário.
6. **(5 min) POST/JSON.** Mostre que campos enviados em JSON têm o mesmo risco.
7. **(5 min) Fechamento.** Volte à Central de Aprendizado e revise a coluna de
   **correção** de cada técnica.

## Explicação didática de cada vulnerabilidade

### A. Error-based
A entrada quebra a sintaxe (ex.: uma aspa solta) e o banco gera erro. Se o erro
for exibido ao usuário, revela estrutura interna. **Correção:** parametrizar e
nunca exibir o erro bruto — logar no servidor e devolver mensagem genérica.

### B. UNION-based
`UNION SELECT` combina o resultado esperado com dados de outra tabela (ex.:
credenciais). **Correção:** parâmetros vinculados; a entrada vira valor, nunca
estrutura.

### C. Boolean-based blind
Sem erro nem dado visível, o atacante injeta condições verdadeiras/falsas e
observa a mudança na resposta. **Correção:** prepared statements e validação do
formato esperado (ex.: id inteiro).

### D. Time-based blind
Mede o tempo de resposta em vez do conteúdo. Usa `SLEEP()` em MySQL. **O SQLite
não possui `SLEEP`**, então essa técnica não se aplica diretamente a ele — ponto
importante a destacar em aula. **Correção:** as mesmas (parametrizar, validar).

### E. Bypass de autenticação
`' OR '1'='1' --` torna o `WHERE` sempre verdadeiro e o `--` comenta a checagem da senha. **Correção:** prepared
statements + senha com hash (bcrypt/argon2), comparando hash, nunca texto puro
concatenado.

### F. Parâmetros GET
`?id=`, `?nome=`, `?cpf=` são entrada do usuário. **Correção:** validar/tipar
cada parâmetro e usar parâmetros vinculados.

### G. POST/JSON
Campos em JSON são entrada como qualquer outra. **Correção:** validar o schema e
parametrizar cada valor.

## Exercícios para os alunos

1. **Identificação.** Dado o código de `js/motor.js`, aponte, em cada
   consulta, a linha `consultaSegura` e explique por que a concatenação
   equivalente seria perigosa.
2. **Correção guiada.** Escreva, para um endpoint hipotético que montasse SQL por
   concatenação, a versão corrigida com prepared statement.
3. **Validação.** Implemente uma validação de `cpf` (apenas dígitos, tamanho
   fixo) antes da consulta e explique por que isso reduz a superfície de ataque.
4. **Discussão.** Por que armazenar senha em texto puro (como neste banco
   fictício) é uma má prática, e como o hash resolve isso?

## Dicas de condução

- Deixe claro, desde o início, a diferença entre **demonstrar o conceito** (o que
  este laboratório faz) e **atacar um sistema real** (o que não se deve fazer sem
  autorização). Reforce ética e legalidade.
- Use os passos 4 (vermelho) e 5 (verde) como âncora visual: "vermelho = o que não fazer,
  verde = o que fazer".
- Peça aos alunos que anotem, para cada técnica, uma frase de correção.
