export const tipos = [
    { id: "d", nome: "Despesa"},
    { id: "r", nome: "Receita"},
].sort((a, b) => a.nome.localeCompare(b.nome));

export const pagamentos = [
    { id: "c", nome: "Crédito"},
    { id: "d", nome: "Débito"},
    { id: "p", nome: "Pix"},
    { id: "a", nome: "Alimentação"},
    { id: "r", nome: "Refeição"},
].sort((a, b) => a.nome.localeCompare(b.nome));

export const categorias = [
    {id: 1, nome:'Alimentação'},
    {id: 2, nome:'Mercado'},
    {id: 3, nome:'Combustível'},
    {id: 4, nome:'Lazer'},
    {id: 5, nome:'Saúde'},
    {id: 6, nome:'Estética'},
    {id: 7, nome:'Desnecessário'},
    {id: 8, nome:'Emergencia'},
    {id: 9, nome:'Investimensto'},
    {id: 10, nome:'Eletrodomésticos'},
    {id: 11, nome:'Mobília'},
    {id: 12, nome:'Roupa/Sapato'},
    {id: 13, nome:'Itens para casa'},
    {id: 14, nome:'Necessidades básicas'},
    {id: 15, nome:'Fatura cartão de crédito'},
    {id: 16, nome:'Economia'},
    {id: 17, nome:'Outros'},
    {id: 18, nome:'Movimentação entre contas'},
].sort((a, b) => a.nome.localeCompare(b.nome));

export const contas = [
    { id: "s", nome: "Santander"},
    { id: "b", nome: "Bradesco"},
    { id: "p", nome: "Pic Pay"},
].sort((a, b) => a.nome.localeCompare(b.nome));
