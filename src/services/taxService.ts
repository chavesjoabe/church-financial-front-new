import { Tax } from '../types';
import { API_BASE_URL } from '../config/api';

export class TaxService {
  public static getToken() {
    return sessionStorage.getItem("token")
  }
  public static async getAll(): Promise<Tax> {
    const response = await fetch(`${API_BASE_URL}/api/tax/all`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.getToken(),
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar impostos');
    }

    return response.json();
  }

  public static async create(tax: Omit<Tax, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tax> {
    const response = await fetch(`${API_BASE_URL}/api/tax/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.getToken(),
      },
      body: JSON.stringify(tax),
    });

    if (!response.ok) {
      throw new Error('Erro ao criar imposto');
    }

    return response.json();
  }

  public static async update(id: string, tax: Partial<Tax>): Promise<Tax> {
    const response = await fetch(`${API_BASE_URL}/api/tax/update/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.getToken(),
      },
      body: JSON.stringify(tax),
    });

    if (!response.ok) {
      throw new Error('Erro ao atualizar imposto');
    }

    return response.json();
  }
}
