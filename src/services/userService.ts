import { User } from '../types';
import { API_BASE_URL } from '../config/api';

export interface CreateUserPayload {
  name: string;
  email: string;
  document: string;
  role?: string;
  password: string;
}

export class UserService {

  public static getToken(): string {
    return sessionStorage.getItem("token");
  }

  public static async getAll(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/api/user/all`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.getToken(),
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar usuários');
    }

    return response.json();
  }

  public static async create(user: CreateUserPayload): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/user/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.getToken(),
      },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      throw new Error('Erro ao criar usuário');
    }

    return response.json();
  }

  public static async update(document: string, user: CreateUserPayload): Promise<User> {
    const cleanDocument = document.replace(/\D/g, '');

    const response = await fetch(`${API_BASE_URL}/api/user/update/${cleanDocument}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.getToken(),
      },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      throw new Error('Erro ao atualizar usuário');
    }

    return response.json();
  }

  public static async toggleActivity(document: string, activityStatus: boolean): Promise<User> {
    const endpoint = activityStatus ? "active" : "unactive";

    const response = await fetch(`${API_BASE_URL}/api/user/${endpoint}/${document}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.getToken(),
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao atualizar usuário');
    }

    return response.json();
  }

  public static async activate(document: string, token: string): Promise<User> {
    const cleanDocument = document.replace(/\D/g, '');

    const response = await fetch(`${API_BASE_URL}/api/user/active/${cleanDocument}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao ativar usuário');
    }

    return response.json();
  }

  public static async deactivate(document: string, token: string): Promise<User> {
    const cleanDocument = document.replace(/\D/g, '');

    const response = await fetch(`${API_BASE_URL}/api/user/unactive/${cleanDocument}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao desativar usuário');
    }

    return response.json();
  }

  public static async getUserByDocument(document: string, token: string): Promise<User> {
    const cleanDocument = document.replace(/\D/g, '');

    const response = await fetch(`${API_BASE_URL}/api/user/document/${cleanDocument}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar usuário');
    }

    return response.json();
  }
}
