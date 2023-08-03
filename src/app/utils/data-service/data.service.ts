import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { MyDBSchema } from '../models/DBSchema';
import { Movimentacao } from '../models/movimentacao.model';


@Injectable({
  providedIn: 'root'
})
export class DataService {

  private dbPromise: Promise<IDBPDatabase<MyDBSchema>>;
  constructor() {
    this.dbPromise = openDB<MyDBSchema>('movimentacoes-db', 1, {
      upgrade(db) {
        const store = db.createObjectStore('movimentacoes', { keyPath: 'id', autoIncrement: true });
        store.createIndex('tipo', 'tipo', { unique: false });
        store.createIndex('categoria', 'categoria', { unique: false });
        store.createIndex('data', 'data', { unique: false });
        store.createIndex('valor', 'valor', { unique: false });
        store.createIndex('pagamento', 'pagamento', { unique: false });
        store.createIndex('descricao', 'descricao', { unique: false });

      },
    });
  }

  async saveMovimentacao(movimentacao: Movimentacao): Promise<number> {
    const db = await this.dbPromise;
    return db.add('movimentacoes', movimentacao);
  }

  async getMovimentacao(id: number): Promise<Movimentacao | undefined> {
    const db = await this.dbPromise;
    return db.get('movimentacoes', id);
  }

  

  async updateMovimentacao(movimentacao: Movimentacao): Promise<any> {
    const db = await this.dbPromise;
    if (!movimentacao.id) {
      throw new Error('A movimentação precisa ter um ID válido.');
    }
    return db.put('movimentacoes', movimentacao); // Remover a definição explícita da chave
  }

  async deleteMovimentacao(id: number): Promise<void> {
    if (typeof id === 'number') {
      const db = await this.dbPromise;
      return db.delete('movimentacoes', id);
    } else {
      throw new Error('A movimentação precisa ter um ID válido.');
    }
  }

  async getAllMovimentacoes(): Promise<Movimentacao[]> {
    const db = await this.dbPromise;
    return db.getAll('movimentacoes');
  }

  async getMovimentacaoByCategoriaAndDate(categoria: number, data_ini: Date, data_fim: Date): Promise<Movimentacao[]> {
    const db = await this.dbPromise;
    const store = db.transaction('movimentacoes').objectStore('movimentacoes');
    const categoriaIndex = store.index('categoria');
    const dataIndex = store.index('data');
  
    const categoriaRange = IDBKeyRange.only(categoria);
    const dataRange = IDBKeyRange.bound(data_ini, data_fim);
  
    const categoriasMatched = await categoriaIndex.getAll(categoriaRange);
    const dataMatched = await dataIndex.getAll(dataRange);
  
    // Get the common elements between the two arrays (movimentacoes that have both the categoria and date in range)
    const matchedMovimentacoes = categoriasMatched.filter((movimentacao) =>
      dataMatched.some((m) => m.id === movimentacao.id)
    );
  
    return matchedMovimentacoes;
  }
}
