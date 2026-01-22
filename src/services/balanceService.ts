import { Balance, BalanceItem, ReportData } from '../types';
import { API_BASE_URL } from '../config/api';

export class BalanceService {
  public static getToken(): string {
    return sessionStorage.getItem("token") || '';
  }

  public static async getAll(): Promise<Balance[]> {
    const response = await fetch(`${API_BASE_URL}/api/balance/all`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.getToken(),
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar lançamentos');
    }

    return response.json();
  }

  public static async getAllByDate(startDate: string, endDate: string): Promise<Balance[]> {
    const convertedStartDate = new Date(startDate).toISOString();
    const convertedEndDate = new Date(endDate).toISOString();

    const response = await fetch(
      `${API_BASE_URL}/api/balance/all/date?startDate=${convertedStartDate}&endDate=${convertedEndDate}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.getToken(),
        },
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao buscar lançamentos por data');
    }

    return response.json();
  }

  public static async create(balance: Omit<Balance, 'id' | 'createdAt'>): Promise<Balance> {
    const response = await fetch(`${API_BASE_URL}/api/balance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.getToken(),
      },
      body: JSON.stringify(balance),
    });

    if (!response.ok) {
      throw new Error('Erro ao criar lançamento');
    }

    return response.json();
  }

  public static async update(id: string, balance: Partial<Balance>): Promise<Balance> {
    const response = await fetch(`${API_BASE_URL}/api/balance/update/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.getToken(),
      },
      body: JSON.stringify(balance),
    });

    if (!response.ok) {
      throw new Error('Erro ao atualizar lançamento');
    }

    return response.json();
  }

  public static async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/balance/delete/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.getToken(),
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao deletar lançamento');
    }
  }

  public static async getPending(): Promise<Balance[]> {
    const response = await fetch(`${API_BASE_URL}/api/balance/pending`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.getToken(),
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar lançamentos pendentes');
    }

    return response.json();
  }

  public static async approve(balanceId: string): Promise<Balance> {
    const response = await fetch(`${API_BASE_URL}/api/balance/approve/${balanceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.getToken(),
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao aprovar lançamento');
    }

    return response.json();
  }

  public static async reject(balanceId: string): Promise<Balance> {
    const response = await fetch(`${API_BASE_URL}/api/balance/reject/${balanceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.getToken(),
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao rejeitar lançamento');
    }

    return response.json();
  }

  public static async extractReport<T>(
    startDate: string,
    endDate: string,
    reportType: 'accounting' | 'outgoing'
  ): Promise<T> {
    const convertedStartDate = new Date(this.formatDate(startDate)).toISOString();
    const convertedEndDate = new Date(this.formatDate(endDate)).toISOString();

    const response = await fetch(
      `${API_BASE_URL}/api/balance/report/${reportType}?startDate=${convertedStartDate}&endDate=${convertedEndDate}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.getToken(),
        },
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao extrair relatório');
    }

    return response.json();
  }

  public static formatDate(stringDate: string) {
    const date = new Date(stringDate);
    const formatedDate = date.setHours(date.getHours() - 3);


    const result = new Date(formatedDate).toLocaleDateString('en-US');
    console.log(result);
    return result
  }

}
