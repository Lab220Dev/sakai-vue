<script setup></script>

<template>
    <router-view />
</template>

<style>

/* Estilo para a tabela de Máquinas onlines */
.tabela-online .p-datatable {
    background-color: #e6f4ea; /* Verde claro */
    border: 1px solid #008000; /* Borda verde */
    border-radius: 8px;
    height: 95%;
    
}

.tabela-online .p-datatable-thead > tr > th {
    background-color: #005500; /* Fundo do cabeçalho */
    color: #c6ffc6; /* Cor do texto do cabeçalho */
}

.tabela-online .p-datatable-tbody > tr > td {
    background-color: #98de98; /* Fundo das células */
    color: #003a00; /* Cor do texto */
}

/* Estilo para a tabela de Máquinas em Atenção */
.tabela-atencao .p-datatable {
    background-color: #fff8d6; /* Amarelo claro */
    border: 1px solid #ffd900; /* Borda amarela */
    border-radius: 8px;
    height: 95%;
}

.tabela-atencao .p-datatable-thead > tr > th {
    background-color: #8c7002; /* Fundo do cabeçalho */
    color: #fff9ba; /* Cor do texto do cabeçalho */
}

.tabela-atencao .p-datatable-tbody > tr > td {
    background-color: #fff693; 
    color: #3a2f00;
}

/* Estilo para a tabela de Máquinas em Atenção */
.tabela-Urgente .p-datatable {
    background-color: #ffedd6; /* Amarelo claro */
    border: 1px solid #ff8c00; /* Borda amarela */
    border-radius: 8px;
    height: 95%;
}

.tabela-Urgente .p-datatable-thead > tr > th {
    background-color: #8c4e02; /* Fundo do cabeçalho */
    color: #ffd7ba; /* Cor do texto do cabeçalho */
}

.tabela-Urgente .p-datatable-tbody > tr > td {
    background-color: #ffce93; 
    color: #3a2f00;
    
}

/* Estilo para a tabela de Máquinas Offline */
.tabela-offline .p-datatable {
    background-color: #fbe4e4; /* Vermelho claro */
    border: 1px solid #ff0000; /* Borda vermelha */
    border-radius: 8px;
    height: 95%;
    overflow-y: hidden;
}

.tabela-offline .p-datatable-thead > tr > th {
    background-color: #780000; /* Fundo do cabeçalho */
    color: #ffd6d6; /* Cor do texto do cabeçalho */
    overflow-y: hidden;
}

.tabela-offline .p-datatable-tbody > tr > td {
    background-color: #feb3b3;  /* Fundo das células */
    color: #3d0000; /* Cor do texto */
    overflow-y: hidden;
}

.p-datatable-table-container {
    overflow-y: hidden;
}

.p-inputnumber-horizontal .p-inputnumber-input {
    order: 2;
    border-radius: 0;
    width: 40px;
}

.p-datatable-column-sorted .p-datatable-sort-icon {
    color: #ffffff; /* Cor do ícone de ordenação */
}
</style>
