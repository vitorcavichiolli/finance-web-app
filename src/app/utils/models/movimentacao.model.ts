export interface Movimentacao {
    id?: number;
    tipo: string;
    categoria: number;
    data: Date;
    pagamento: string;
    descricao: string;
    valor: number;
  }