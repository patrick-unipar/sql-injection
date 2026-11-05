# SQLi Lab — Laboratório Didático de SQL Injection

Aplicação **educacional** para aulas de cibersegurança. Mostra, de forma
**controlada e segura**, como o SQL Injection acontece e como evitá-lo.

**Não precisa instalar nada.** Sem Node, sem banco de dados, sem internet.
Só um navegador.

---

## Como usar (alunos)

1. Nesta página do GitHub, clique no botão verde **Code** e depois em
   **Download ZIP**.
2. Extraia o ZIP numa pasta qualquer (clique com o botão direito no arquivo →
   **Extrair tudo**).
3. Abra a pasta extraída e dê **duplo clique em `index.html`**.

Pronto: o laboratório abre no navegador.

> Se aparecer um aviso dizendo que o banco não foi encontrado, você abriu o
> `index.html` de dentro do ZIP sem extrair. Extraia primeiro.

Quem usa Git pode clonar o repositório e abrir o `index.html` do mesmo jeito.

## O que tem no laboratório

O menu tem três abas:

- **Dashboard**: apresentação e o que existe no banco fictício.
- **Aulas Interativas**: uma aula para cada técnica, em linguagem simples.
  Cada aula traz uma analogia do dia a dia, "como funciona", "como é usado",
  exemplos para você digitar (o trecho digitado aparece destacado na consulta),
  o resultado que apareceria **se o sistema fosse vulnerável** (ilustração
  pré-escrita) e o resultado no **sistema seguro** (executado de verdade).
- **Central de Aprendizado**: resumo de cada técnica, impacto e correção.

Técnicas abordadas: error-based, UNION-based, boolean-based blind, time-based
blind, bypass de autenticação, parâmetros GET e corpo POST em JSON.

## Como funciona por dentro

```
SqlInjection/
├─ index.html              ← abra este arquivo
├─ estilo.css              ← cores e aparência
├─ dados/
│  └─ banco.js             ← o "banco de dados", em texto puro
├─ js/
│  ├─ motor.js             ← lê o banco e faz as consultas SEGURAS
│  ├─ app.js               ← a interface (abas, aulas, botões)
│  ├─ conteudo-aulas.js    ← textos e exemplos das aulas
│  ├─ conteudo-leigo.js    ← explicações em linguagem simples e glossário
│  └─ conteudo-central.js  ← textos da Central de Aprendizado
└─ docs/
   └─ guia-do-professor.md ← roteiro de aula e exercícios
```

### O banco de dados é um arquivo de texto

O banco fica em `dados/banco.js` e pode ser aberto no Bloco de Notas. Cada
tabela começa com `[nome]`, a primeira linha traz os nomes das colunas e as
demais linhas são os registros, separados por `|`:

```
[usuarios]
id | usuario   | senha     | papel
1  | professor | aula2024  | admin
```

Ele tem extensão `.js` em vez de `.txt` porque, quando a página é aberta com
duplo clique, o navegador bloqueia a leitura de arquivos `.txt` da pasta por
segurança. Um `.js` ele carrega normalmente.

Tabelas: `usuarios` (5), `produtos` (15), `clientes` (10), `pedidos` (10) e
`funcionarios` (5). **Todos os dados são fictícios.**

| usuário | senha | papel |
| --- | --- | --- |
| professor | aula2024 | admin |
| aluno1 | senha123 | usuario |
| suporte | suporte99 | tecnico |

## Modelo de segurança deste laboratório

- O que você digita é **sempre** tratado como um valor a ser procurado, nunca
  como parte da ordem. É o mesmo efeito de um *prepared statement*.
- A "consulta insegura" que aparece na tela é só uma **ilustração em texto** de
  como o pedido ficaria se fosse montado juntando textos. Ela **não é
  executada**.
- O resultado "se fosse vulnerável" é uma ilustração escrita à mão, com dados
  fictícios.
- Tudo roda no seu navegador. Nada é enviado para a internet.

O objetivo é ensinar a **reconhecer e corrigir** a vulnerabilidade, não
fornecer um sistema vulnerável de verdade. Atacar sistemas reais sem
autorização é crime.

## Limitações

- O SQLite (banco que serviu de modelo) **não tem `SLEEP()`**, então a técnica
  time-based blind é explicada de forma conceitual, sem simular atraso.
- As mensagens de erro mostradas nas ilustrações são do SQLite, mais enxutas que
  as de outros bancos.

## Para o professor

- Roteiro de aula e exercícios em [`docs/guia-do-professor.md`](docs/guia-do-professor.md).
- Para mostrar na sala, basta abrir o `index.html` no computador do projetor.
- Opcional: ative o **GitHub Pages** (Settings → Pages → Branch `main`, pasta
  `/ (root)`) e os alunos acessam por um link, sem baixar nada.
