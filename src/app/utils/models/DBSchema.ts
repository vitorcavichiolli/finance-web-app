import { DBSchema } from "idb";
import { Movimentacao } from "./movimentacao.model";

export interface MyDBSchema extends DBSchema {
    movimentacoes: {
        key: number;
        value: Movimentacao;
        indexes: {
            tipo: string;
            id?: number;
            categoria: number;
            data: Date;
            pagamento: string;
            descricao: string;
            valor: number;
        };
      };
  }