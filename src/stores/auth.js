import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: null,
        Admin: false,
        tempopreferido: null
    }),
    actions: {
        setToken(token) {
            this.token = token;
        },
        clearToken() {
            this.token = null;
        },
        logout() {
            this.$reset();
        },
        setAdmin(value) {
            this.Admin = value;
        },
        setTempoPreferido(value) {
            this.tempopreferido = value.toString();
        }
    },
    getters: {
        userToken: (state) => {
            return state.token;
        },
        isAdmin: (state) => {
            return state.Admin;
        },
        preferredTime: (state) => {
            return state.tempopreferido;
        }
    },
    persist: true
});
