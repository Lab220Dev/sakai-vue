/**
 * Importa a instância `axios`, configurada para facilitar as requisições HTTP.
 */
import axios from 'axios';

/**
 * Define a URL base da API. A URL é obtida de uma variável de ambiente `VITE_API_URL`
 * ou, se não estiver definida, usa o valor padrão 'http://localhost:3050/api'.
 */
const baseURL = 'http://userlab-001-site15.atempurl.com';

/**
 * Cria uma instância do `axios`, configurada com a URL base da API.
 * Isso facilita o uso de requisições HTTP em toda a aplicação com uma configuração centralizada.
 */
const instance = axios.create({
    baseURL: baseURL // Configura a URL base para todas as requisições.
});

/**
 * Adiciona um interceptor para as requisições antes de serem enviadas.
 * O interceptor verifica se há um token JWT armazenado no `localStorage`
 * e, se encontrado, o inclui no cabeçalho das requisições como `Authorization`.
 */
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Obtém o token de autenticação do localStorage.
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`; // Adiciona o token no cabeçalho da requisição.
        }
        return config; // Retorna a configuração da requisição modificada.
    },
    (error) => {
        return Promise.reject(error); // Se houver um erro ao configurar a requisição, retorna o erro.
    }
);

export default instance;
