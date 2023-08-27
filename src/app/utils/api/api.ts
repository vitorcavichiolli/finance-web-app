export const BASE_URL = 'http://192.168.1.25:88/api/';
//export const BASE_URL = 'https://localhost:44365/api/';
//planejamentos
export const API_LISTAGEM_PLANEJAMENTOS = BASE_URL + 'Planejamento/getPlanejamentos';
export const API_LISTAGEM_PLANEJAMENTOS_BY_ID = BASE_URL + 'Planejamento/getPlanejamento';
export const API_LISTAGEM_PLANEJAMENTOS_BY_DATAFINAL = BASE_URL + 'Planejamento/getPlanejamentosByDataFinal';
export const API_LISTAGEM_PLANEJAMENTOS_WITH_ITENS = BASE_URL + 'Planejamento/getPlanejamentoWithItens';
export const API_LISTAGEM_PLANEJAMENTOS_ITENS = BASE_URL + 'Planejamento/getItens';
export const API_INSERT_PLANEJAMENTO = BASE_URL + 'Planejamento/addPlanejamento';
export const API_UPDATE_PLANEJAMENTO = BASE_URL + 'Planejamento/updtPlanejamento';
export const API_DELETE_PLANEJAMENTO = BASE_URL + 'Planejamento/deletePlanejamento';

//MOVIMENTACOES
export const API_LISTAGEM_MOVIMENTACOES = BASE_URL + 'Movimentacao/getMovimentacoes';
export const API_LISTAGEM_MOVIMENTACOES_BY_CATEGORA_DATA = BASE_URL + 'Movimentacao/getMovimentacoesByDataAndCategoria';
export const API_LISTAGEM_MOVIMENTACAO = BASE_URL + 'Movimentacao/getMovimentacao';
export const API_INSERT_MOVIMENTACAO = BASE_URL + 'Movimentacao/addMovimentacao';
export const API_UPDATE_MOVIMENTACAO = BASE_URL + 'Movimentacao/updtMovimentacao';
export const API_DELETE_MOVIMENTACAO = BASE_URL + 'Movimentacao/deleteMovimentacao';