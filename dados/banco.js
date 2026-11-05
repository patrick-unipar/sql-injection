// =============================================================================
//  banco.js - O "banco de dados" do SQLi Lab, em TEXTO PURO
// -----------------------------------------------------------------------------
//  Todos os dados são FICTÍCIOS. Pode abrir e editar no Bloco de Notas.
//
//  Por que é .js e não .txt?  Quando você abre o index.html com duplo clique,
//  o navegador não deixa a página ler arquivos .txt da pasta, por segurança.
//  Um arquivo .js ele carrega. Então o texto do banco fica aqui dentro, entre
//  as duas crases ( ` ), exatamente como seria num .txt.
//
//  Formato:
//    [nome_da_tabela]           -> começa uma tabela
//    coluna1 | coluna2 | ...    -> primeira linha: nomes das colunas
//    valor1  | valor2  | ...    -> demais linhas: um registro por linha
//    # comentário               -> linhas com # são ignoradas
// =============================================================================

window.BANCO_TXT = String.raw`
[usuarios]
id | usuario   | senha     | papel
1  | professor | aula2024  | admin
2  | aluno1    | senha123  | usuario
3  | aluno2    | trocar01  | usuario
4  | suporte   | suporte99 | tecnico
5  | visitante | visita00  | leitura

[produtos]
id | nome               | categoria | preco | estoque
1  | Arroz 5kg          | Alimentos | 24.9  | 120
2  | Feijão 1kg         | Alimentos | 8.5   | 200
3  | Macarrão 500g      | Alimentos | 4.2   | 300
4  | Óleo de soja 900ml | Alimentos | 7.8   | 150
5  | Açúcar 1kg         | Alimentos | 5.1   | 180
6  | Café 500g          | Alimentos | 15.0  | 90
7  | Sabão em pó 1kg    | Limpeza   | 12.3  | 110
8  | Detergente 500ml   | Limpeza   | 2.9   | 250
9  | Água sanitária 2L  | Limpeza   | 6.4   | 130
10 | Shampoo 350ml      | Higiene   | 13.7  | 75
11 | Sabonete 90g       | Higiene   | 1.9   | 400
12 | Pasta de dente 90g | Higiene   | 4.5   | 220
13 | Caderno 200 folhas | Papelaria | 18.0  | 60
14 | Caneta azul        | Papelaria | 1.5   | 500
15 | Mochila escolar    | Papelaria | 89.9  | 25

[clientes]
# CPFs inventados, não pertencem a ninguém.
id | nome           | cpf         | cidade
1  | Ana Lima       | 11111111100 | Umuarama
2  | Bruno Costa    | 22222222200 | Maringá
3  | Carla Dias     | 33333333300 | Cascavel
4  | Diego Souza    | 44444444400 | Londrina
5  | Elena Ramos    | 55555555500 | Umuarama
6  | Felipe Alves   | 66666666600 | Toledo
7  | Gabriela Nunes | 77777777700 | Maringá
8  | Hugo Pereira   | 88888888800 | Cascavel
9  | Isabela Rocha  | 99999999900 | Londrina
10 | João Martins   | 10101010100 | Umuarama

[pedidos]
id | cliente_id | produto_id | quantidade | data
1  | 1          | 1          | 2          | 2024-01-10
2  | 2          | 3          | 5          | 2024-01-12
3  | 3          | 7          | 1          | 2024-02-01
4  | 4          | 15         | 1          | 2024-02-03
5  | 5          | 2          | 10         | 2024-02-15
6  | 6          | 6          | 3          | 2024-03-01
7  | 7          | 10         | 2          | 2024-03-05
8  | 8          | 13         | 4          | 2024-03-10
9  | 9          | 4          | 6          | 2024-04-02
10 | 10         | 11         | 8          | 2024-04-07

[funcionarios]
id | nome             | setor       | salario
1  | Mariana Teixeira | Vendas      | 2800.0
2  | Rafael Gomes     | Estoque     | 2500.0
3  | Patrícia Mello   | Financeiro  | 3900.0
4  | Tiago Barros     | TI          | 4500.0
5  | Vanessa Lopes    | Atendimento | 2300.0
`;
