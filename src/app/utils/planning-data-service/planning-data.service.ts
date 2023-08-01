import { Injectable } from '@angular/core';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { MyDBSchema } from '../models/DBSchema';
import { ItemPlanejamento, Planejamento } from '../models/planejamentos.model';

const DB_NAME = 'planejamentos-db';
const PLANEJAMENTO_STORE = 'planejamento';
const ITEM_PLANEJAMENTO_STORE = 'item_planejamento';

interface YourDB extends DBSchema {
  [PLANEJAMENTO_STORE]: {
    key: number;
    value: Planejamento;
    indexes: { 'by_date': Date };
  };
  [ITEM_PLANEJAMENTO_STORE]: {
    key: number;
    value: ItemPlanejamento;
    indexes: { 'by_planejamento': number };
  };
}

@Injectable({
  providedIn: 'root'
})


export class PlanningDataService {
  private dbPromise!: Promise<IDBPDatabase<YourDB>>;

  constructor() {
    this.initDatabase();
  }

  private async initDatabase(): Promise<void> {
    this.dbPromise = openDB<YourDB>(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(PLANEJAMENTO_STORE)) {
          const planejamentoStore = db.createObjectStore(PLANEJAMENTO_STORE, { keyPath: 'id', autoIncrement: true });
          planejamentoStore.createIndex('by_date', 'data_inicial');
        }

        if (!db.objectStoreNames.contains(ITEM_PLANEJAMENTO_STORE)) {
          const itemPlanejamentoStore = db.createObjectStore(ITEM_PLANEJAMENTO_STORE, { keyPath: 'id', autoIncrement: true });
          itemPlanejamentoStore.createIndex('by_planejamento', 'planejamento');
        }
      },
    });
  }

  async addPlanejamentoWithItems(planejamento: Planejamento, itens: ItemPlanejamento[]): Promise<number> {
    const db = await this.dbPromise;
    const planejamentoId = await db.add(PLANEJAMENTO_STORE, planejamento);
    for (const item of itens) {
      item.planejamento = planejamentoId;
      await db.add(ITEM_PLANEJAMENTO_STORE, item);
    }
    return planejamentoId;
  }
  
  async getPlanejamentoWithItems(planejamentoId: number): Promise<{ planejamento: Planejamento, itens: ItemPlanejamento[] }> {
    const db = await this.dbPromise;

    try {
      const planejamento = await db.get(PLANEJAMENTO_STORE, planejamentoId);

      if (typeof planejamento === 'undefined') {
        throw new Error(`Planejamento with ID ${planejamentoId} not found.`);
      }

      const itens = await db.getAllFromIndex(ITEM_PLANEJAMENTO_STORE, 'by_planejamento', planejamentoId);
      return { planejamento, itens };
    } catch (error) {
      console.error('Error fetching planejamento:', error);
      throw error;
    }
  }

  async updatePlanejamentoWithItems(planejamento: Planejamento, itens: ItemPlanejamento[]): Promise<void> {
    const db = await this.dbPromise;
    await db.put(PLANEJAMENTO_STORE, planejamento);
    
    const existingItens = await db.getAllFromIndex(ITEM_PLANEJAMENTO_STORE, 'by_planejamento', planejamento.id);
    const itensToDelete = existingItens.filter(existingItem => !itens.some(updatedItem => updatedItem.id === existingItem.id));
    const itensToUpdate = itens.filter(item => item.id != null);
    const itensToAdd = itens.filter(item => item.id == null);

    for (const item of itensToDelete) {
      await db.delete(ITEM_PLANEJAMENTO_STORE, item.id!);
    }

    for (const item of itensToUpdate) {
      await db.put(ITEM_PLANEJAMENTO_STORE, item);
    }

    for (const item of itensToAdd) {
      item.planejamento = planejamento.id!;
      await db.add(ITEM_PLANEJAMENTO_STORE, item);
    }
  }

  async deletePlanejamento(planejamentoId: number): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction([PLANEJAMENTO_STORE, ITEM_PLANEJAMENTO_STORE], 'readwrite');
    const planejamentoStore = tx.objectStore(PLANEJAMENTO_STORE);
    const itemPlanejamentoStore = tx.objectStore(ITEM_PLANEJAMENTO_STORE);

    try {
      // Delete the associated items first
      const itemIndex = itemPlanejamentoStore.index('by_planejamento');
      let itemCursor = await itemIndex.openCursor(IDBKeyRange.only(planejamentoId));
      while (itemCursor) {
        await itemCursor.delete();
        itemCursor = await itemCursor.continue();
      }

      // Delete the planejamento
      await planejamentoStore.delete(planejamentoId);

      // Complete the transaction
      await tx.done;
    } catch (error) {
      console.error('Error deleting planejamento:', error);
      throw error;
    }
  }

  async getAllPlanejamentos(): Promise<Planejamento[]> {
    const db = await this.dbPromise;
    return await db.getAll(PLANEJAMENTO_STORE);

    // // Busca os itens associados a cada planejamento
    // const planejamentosComItensPromises = planejamentos.map(async (planejamento) => {
    //   const itens = await this.getItensByPlanejamentoId(planejamento.id!);
    //   return { planejamento, itens };
    // });

    // // Aguarda a resolução de todas as promises
    // const planejamentosComItens = await Promise.all(planejamentosComItensPromises);

    // // Retorna apenas os planejamentos (sem os itens) como resultado final
    // return planejamentosComItens.map(({ planejamento }) => planejamento);
  }

  // Método auxiliar para buscar os itens de um planejamento pelo seu ID
  async getItensByPlanejamentoId(planejamentoId: number): Promise<ItemPlanejamento[]> {
    const db = await this.dbPromise;
    return db.getAllFromIndex(ITEM_PLANEJAMENTO_STORE, 'by_planejamento', planejamentoId);
  }
}
