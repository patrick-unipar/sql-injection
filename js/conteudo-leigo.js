// =============================================================================
//  conteudo-leigo.js - Explicações em linguagem simples (para quem ainda não programa)
// -----------------------------------------------------------------------------
//  Para cada aula há uma analogia do dia a dia e, para cada exemplo, uma
//  explicação passo a passo em palavras comuns. A ordem de "exemplos" segue a
//  ordem dos exemplos de cada aula em conteudo-aulas.js.
// =============================================================================
const INTRO_LEIGO = {
    titulo: 'Em palavras simples',
    texto: 'Imagine que você preenche um formulário e um atendente escreve uma ordem para o estoquista juntando o que você disse com o que já estava escrito no papel. Se você disser algo que parece uma nova ordem, o estoquista pode obedecer, porque não sabe separar "o que o chefe mandou" do "que o cliente falou". Isso é o SQL Injection.',
};
const GLOSSARIO = [
    { termo: 'Banco de dados', significado: 'O "armário" onde o sistema guarda as informações (usuários, produtos, clientes).' },
    { termo: 'SQL', significado: 'A "língua" usada para pedir coisas ao banco de dados, como "me mostre os produtos".' },
    { termo: 'Consulta', significado: 'Um pedido escrito em SQL enviado ao banco de dados.' },
    { termo: "Aspa simples ( ' )", significado: 'Símbolo que, em SQL, marca onde um texto começa e termina. É a "tecla de ataque" mais usada.' },
    { termo: 'Dois hífens ( -- )', significado: 'Em SQL, significa "ignore tudo o que vem depois nesta linha".' },
    { termo: 'Payload', significado: 'O texto especial que o atacante digita para enganar o sistema.' },
    { termo: 'Prepared statement', significado: 'A proteção: o sistema envia o pedido e os dados separados, então o que você digita nunca vira ordem.' },
];
const LEIGO = {
    'auth-bypass': {
        analogia: 'Imagine um porteiro com a ordem: "Deixe entrar quem disser o nome E souber a senha secreta". O sistema monta essa ordem juntando o que você digita. Se você escrever algo que muda a própria ordem do porteiro, como "ignore o resto da frase", ele obedece, porque não consegue separar a ordem do que você falou.',
        exemplos: [
            'Você digitou o nome "professor" seguido de uma aspa e dois hífens. A aspa fecha o campo do nome, e os hífens dizem ao banco: "ignore o resto da linha". O resto da linha era justamente a parte da senha. Resultado: o porteiro deixa entrar sem perguntar a senha.',
            'Aqui você escreveu uma frase que é sempre verdadeira ("1 é igual a 1"). O porteiro lê: "deixe entrar quem tem esse nome OU se 1 for igual a 1". Como 1 sempre é igual a 1, ele deixa entrar o primeiro da lista, mesmo sem saber o nome nem a senha.',
        ],
    },
    'error-based': {
        analogia: 'É como um funcionário que, ao receber um pedido que não entende, devolve um bilhete explicando exatamente o que deu errado e como funciona o formulário interno dele. Quem lê o bilhete aprende como o sistema é por dentro.',
        exemplos: [
            'Uma aspa solta é como abrir um parêntese e nunca fechar. O banco não entende o pedido e responde com uma mensagem de erro. Se essa mensagem aparece na tela, quem está atacando ganha pistas sobre o sistema.',
        ],
    },
    'union-based': {
        analogia: 'Pense na lista de produtos de uma loja. O UNION é como colar, no fim dessa lista, uma folha tirada de outro arquivo (por exemplo, a lista de usuários) e fazer parecer que tudo faz parte do mesmo catálogo.',
        exemplos: [
            'Você pediu uma busca por produto, mas escreveu junto um pedido extra: "e também me mostre usuários e senhas". O banco junta as duas respostas numa tabela só, então os usuários aparecem misturados com os produtos.',
        ],
    },
    'boolean-blind': {
        analogia: 'É o jogo das 20 perguntas. Você não consegue ver o segredo, mas pode perguntar "é verdade que...?", e o sistema só responde "o produto apareceu" ou "não apareceu". Com muitas perguntas, dá para descobrir o segredo inteiro.',
        exemplos: [
            '"1 AND 1=1" quer dizer "produto 1 E 1 igual a 1". Isso é verdade, então o produto aparece. Serve para testar se o sistema obedece ao que foi escrito.',
            '"1 AND 1=2" quer dizer "produto 1 E 1 igual a 2". Isso é falso, então nada aparece. Se a resposta muda entre os dois testes, a pessoa sabe que consegue "conversar" com o banco.',
            'Agora a pergunta é "o usuário número 1 é admin?". Se o produto aparecer, a resposta é sim. Fazendo muitas perguntas assim, descobrem-se informações escondidas sem nunca vê-las diretamente.',
        ],
    },
    'time-blind': {
        analogia: 'É como pedir a alguém: "se a resposta for sim, demore 5 segundos para responder". Você não ouve a resposta, mas pelo tempo que ela leva, entende se era sim ou não.',
        exemplos: [
            'O comando pede: "se 1 for igual a 1, espere 5 segundos". Se a página demorou, a condição era verdadeira. Trocando a condição por outras perguntas, dá para descobrir dados só medindo o tempo.',
            'O SQLite não tem o comando "esperar" (SLEEP), então esse truque não funciona nele: o banco reclama que a função não existe. Por isso esta aula serve só para você entender a ideia.',
        ],
    },
    'get-params': {
        analogia: 'O endereço do site é como um bilhete que você entrega no balcão, por exemplo "?cpf=11111111100". Qualquer pessoa pode rabiscar o bilhete antes de entregar. Se o atendente executa o que estiver escrito sem desconfiar, o bilhete rabiscado funciona como uma nova ordem.',
        exemplos: [
            'Uso normal: você pede o cliente com um CPF e recebe só ele. Serve de comparação.',
            'Você escreveu uma frase sempre verdadeira no lugar do CPF. O banco entende "traga o cliente com esse CPF OU qualquer caso em que 1 = 1". Como isso sempre vale, ele devolve todos os clientes.',
        ],
    },
    'post-json': {
        analogia: 'O POST é como entregar uma ficha preenchida em um envelope fechado, em vez de falar no balcão. O envelope esconde o conteúdo da barra de endereços, mas quem preenche a ficha pode escrever o que quiser nela.',
        exemplos: [
            'Uso normal: você preencheu a ficha com o nome e a categoria de um produto e recebeu só o caderno. Serve de comparação.',
            'No campo categoria foi escrita uma frase sempre verdadeira. O filtro deixa de funcionar e o sistema devolve todos os produtos, mesmo os que não combinam com o nome.',
        ],
    },
};
