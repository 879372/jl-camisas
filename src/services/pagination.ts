import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import api from './api';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

const isPaginatedResponse = <T>(value: unknown): value is PaginatedResponse<T> => {
  if (!value || typeof value !== 'object') return false;
  return Array.isArray((value as PaginatedResponse<T>).results);
};

export async function getAllPages<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T[]> {
  const results: T[] = [];
  const visited = new Set<string>();
  let nextUrl: string | null = url;
  let nextConfig = config;

  while (nextUrl) {
    if (visited.has(nextUrl)) {
      throw new Error('A API retornou uma referência circular de paginação.');
    }
    visited.add(nextUrl);

    const response: AxiosResponse<PaginatedResponse<T> | T[]> = await api.get(
      nextUrl,
      nextConfig,
    );
    nextConfig = undefined;

    if (Array.isArray(response.data)) {
      results.push(...response.data);
      break;
    }
    if (!isPaginatedResponse<T>(response.data)) {
      throw new Error('Formato de paginação inválido retornado pela API.');
    }

    results.push(...response.data.results);
    nextUrl = response.data.next;
  }

  return results;
}
