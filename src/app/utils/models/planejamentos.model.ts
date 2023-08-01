export interface Planejamento {
    id?: number;
    data_inicial: Date;
    data_final: Date;
}

export interface ItemPlanejamento {
    id?: number;
    categoria: number;
    porcentagem: number;
    planejamento: number;
}

