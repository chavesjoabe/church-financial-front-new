import { User, LoginResponse } from '../types';
import { API_BASE_URL } from '../config/api';

export class AuthService {
  public static async login(document: string, password: string): Promise<string> {
    try {
      // Remove formatação do CPF se houver
      const cleanDocument = document.replace(/\D/g, '');

      const loginPayload = {
        document: cleanDocument,
        password,
      };

      const rawResponse = await fetch(`${API_BASE_URL}/api/user/login`, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify(loginPayload),
      });

      if (rawResponse.status === 403) {
        throw new Error('Credenciais inválidas');
      }

      if (!rawResponse.ok) {
        throw new Error('Erro ao fazer login');
      }

      const response: LoginResponse = await rawResponse.json();
      return response.token;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer login';
      console.error('ERROR ON LOGIN:', error);
      throw new Error(errorMessage);
    }
  }

  public static async getUserByDocument(document: string, token: string): Promise<User> {
    try {
      const cleanDocument = document.replace(/\D/g, '');

      const rawResponse = await fetch(`${API_BASE_URL}/api/user/document/${cleanDocument}`, {
        method: 'GET',
        headers: {
          'Content-type': 'application/json',
          Authorization: token,
        },
      });

      if (!rawResponse.ok) {
        throw new Error('Erro ao buscar dados do usuário');
      }

      const response = await rawResponse.json();
      return response;
    } catch (error) {
      const errorMessage = 'Erro ao buscar dados do usuário';
      console.error('ERROR GET USER BY DOCUMENT:', error);
      throw new Error(errorMessage);
    }
  }

  public static logout(): void {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
  }

  public static getCurrentUser(): User | null {
    const userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  public static getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  public static isAuthenticated(): boolean {
    return !!sessionStorage.getItem('token');
  }
}