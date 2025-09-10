<script setup>
import { DateTime } from 'luxon';
import { computed, defineProps } from 'vue';

const props = defineProps({
    monitoring: {
        type: Array,
        required: true
    }
});

const clientescomdata = computed(() => {
    return props.monitoring.filter((item) => item.ultimoDataHora); // Filtra os itens sem data
});

//*********************************************** Maquinas Online ************************************************************

const maquinasOnline = computed(() => {
    return monitoramentoOnline.value.length;
});
const pingOnline = (date1) => {
    const agora = DateTime.now();
    const statusTime = DateTime.fromFormat(date1, 'yyyy-MM-dd HH:mm:ss');
    const diffMin = Math.abs(statusTime.diff(agora, 'minutes').minutes);
    return diffMin <= 15; // Retorna true se a diferença for menor ou igual a 5 minutos
};

const monitoramentoOnline = computed(() => {
    return clientescomdata.value.filter((item) => pingOnline(item.ultimoDataHora));
});

//*********************************************** Maquinas Atenção **********************************************************************
const maquinasAtencao = computed(() => {
    return monitoramentoAtencao.value.length;
});

const pingAtencao = (date1) => {
    const agora = DateTime.now();
    const statusTime = DateTime.fromFormat(date1, 'yyyy-MM-dd HH:mm:ss');
    const diffMin = Math.abs(statusTime.diff(agora, 'minutes').minutes);
    return diffMin >=15 && diffMin <= 60; // Retorna true se a diferença for maior ou igual a 5 minutos e menor ou igual a 60 minutos
};

const monitoramentoAtencao = computed(() => {
    return clientescomdata.value.filter((item) => pingAtencao(item.ultimoDataHora));
});

//*********************************************** Maquinas Urgentes **********************************************************************

const maquinasUrgentes = computed(() => {
    return monitoramentoUrgente.value.length;
});

const pingUrgente = (date1) => {
    const agora = DateTime.now();
    const statusTime = DateTime.fromFormat(date1, 'yyyy-MM-dd HH:mm:ss');
    const diffMin = Math.abs(statusTime.diff(agora, 'minutes').minutes);
    return diffMin >= 60 && diffMin <= 120; // Retorna true se a diferença for maior ou igual a 5 minutos e menor ou igual a 60 minutos
};

const monitoramentoUrgente = computed(() => {
    return clientescomdata.value.filter((item) => pingUrgente(item.ultimoDataHora));
});

//*********************************************** Maquinas Offline **********************************************************************

const maquinasOffline = computed(() => {
    return monitoramentoOffline.value.length;
});

const pingOffline = (date1) => {
    const agora = DateTime.now();
    const statusTime = DateTime.fromFormat(date1, 'yyyy-MM-dd HH:mm:ss');
    const diffMin = Math.abs(statusTime.diff(agora, 'minutes').minutes);
    return diffMin > 120; // Retorna true se a diferença for maior que 60 minutos
};

const diasEHorasOffline = (date1) => {
    const agora = DateTime.now();
    const statusTime = DateTime.fromFormat(date1, 'yyyy-MM-dd HH:mm:ss');
    const diff = statusTime.diff(agora, ['days', 'hours']).toObject(); // Calcula a diferença em dias e horas
    const dias = Math.floor(Math.abs(diff.days)); // Obtém os dias inteiros
    const horas = Math.floor(Math.abs(diff.hours)); // Obtém as horas inteiras
    return { dias, horas }; // Retorna um objeto com dias e horas inteiros
};

const monitoramentoOffline = computed(() => {
    return clientescomdata.value.filter((item) => pingOffline(item.ultimoDataHora));
});

</script>
<template>
    <div class="">
        <div class="datatable-container mt-8">
            <!-- Máquinas online -->
            <div v-tooltip.top="'0 a 15 minutos'" class="data-online tabela-online">
                <div class="font-semibold text-xl text-center text-black-alpha-80 text-center mb-2">Online : {{ maquinasOnline }}</div>
                <DataTable style="width: 100%" :value="monitoramentoOnline" :rows="50" paginator removableSort :sortField="'ultimoDataHora'" :sortOrder="-1 "
    >
                    <Column style="width: 10%; text-align: center" header="Base">
                        <template #body="slotProps">
                            {{ slotProps.data.base }}
                        </template>
                    </Column>
                    <Column style="width: 30%" class="msg" sortable header="Cliente" field="nome_cliente">
                        <template #body="slotProps">
                            <div class="table-cell">{{ slotProps.data.nome_cliente }}</div>
                        </template>
                    </Column>
                    <Column header="Identificação" style="width: 35%">
                        <template #body="slotProps">
                            <div class="table-cell">{{ slotProps.data.identificacao }}</div>
                        </template>
                    </Column>
                    <Column style="width: 15%" header="Hora" sortable field="ultimoDataHora">
                        <template #body="slotProps">
                            {{ DateTime.fromFormat(slotProps.data.ultimoDataHora, 'yyyy-MM-dd HH:mm:ss').toFormat('HH:mm') }}
                        </template>
                    </Column>
                    <template #empty>
                        <div class="p-4 text-center">
                            <span class="p-text-secondary">Não há dados para serem exibidos</span>
                        </div>
                    </template>
                </DataTable>
            </div>

            <!-- Máquinas em Atenção -->
            <div class="col-span-12 xl:col-span-6 flex flex-col gap-4">
                <div v-tooltip.top="'15 a 60 minutos'" class="data-atencao tabela-atencao">
                    <div class="font-semibold text-xl text-center text-black-alpha-80 mb-2">Atenção : {{ maquinasAtencao }}</div>
                    <DataTable style="width: 100%" :value="monitoramentoAtencao" :rows="50" paginator removableSort responsiveLayout="scroll" :sortField="'ultimoDataHora'" :sortOrder="-1" >
                        <Column style="width: 10%; text-align: center" header="Base">
                            <template #body="slotProps">
                                {{ slotProps.data.base }}
                            </template>
                        </Column>
                        <Column header="Cliente" style="width: 20%" sortable field="nome_cliente">
                            <template #body="slotProps">
                                <div class="table-cell">{{ slotProps.data.nome_cliente }}</div>
                            </template>
                        </Column>
                        <Column header="Identificação" style="width: 20%">
                            <template #body="slotProps">
                                <div class="table-cell">{{ slotProps.data.identificacao }}</div>
                            </template>
                        </Column>
                        <Column style="width: 15%" header="Hora" sortable field="ultimoDataHora">
                            <template #body="slotProps">
                                {{ DateTime.fromFormat(slotProps.data.ultimoDataHora, 'yyyy-MM-dd HH:mm:ss').toFormat('HH:mm') }}
                            </template>
                        </Column>
                        <template #empty>
                            <div class="p-4 text-center">
                                <span class="p-text-secondary">Não há dados para serem exibidos</span>
                            </div>
                        </template>
                    </DataTable>
                </div>
                <div v-tooltip.top="'60 a 120 minutos'" class="data-Urgente tabela-Urgente">
                    <div class="font-semibold text-xl text-center text-black-alpha-80 mb-2">Urgentes : {{ maquinasUrgentes }}</div>
                    <DataTable style="width: 100%" :value="monitoramentoUrgente" :rows="50" paginator removableSort responsiveLayout="scroll" :sortField="'ultimoDataHora'" :sortOrder="-1" >
                        <Column style="width: 10%; text-align: center" header="Base">
                            <template #body="slotProps">
                                {{ slotProps.data.base }}
                            </template>
                        </Column>
                        <Column header="Cliente" style="width: 20%" sortable field="nome_cliente">
                            <template #body="slotProps">
                                <div class="table-cell">{{ slotProps.data.nome_cliente }}</div>
                            </template>
                        </Column>
                        <Column header="Identificação" style="width: 20%">
                            <template #body="slotProps">
                                <div class="table-cell">{{ slotProps.data.identificacao }}</div>
                            </template>
                        </Column>
                        <Column style="width: 15%" header="Hora" sortable field="ultimoDataHora">
                            <template #body="slotProps">
                                {{ DateTime.fromFormat(slotProps.data.ultimoDataHora, 'yyyy-MM-dd HH:mm:ss').toFormat('HH:mm') }}
                            </template>
                        </Column>
                        <template #empty>
                            <div class="p-4 text-center">
                                <span class="p-text-secondary">Não há dados para serem exibidos</span>
                            </div>
                        </template>
                    </DataTable>
                </div>
            </div>

            <!-- Máquinas Offline -->
            <div v-tooltip.top="'Acima de 120 minutos'" class="data-offline tabela-offline">
                <div class="font-semibold text-xl text-center text-black-alpha-80 mb-2">Offline : {{ maquinasOffline }}</div>
                <DataTable style="width: 100%" :value="monitoramentoOffline" :rows="50" paginator removableSort responsiveLayout="scroll" :sortField="'ultimoDataHora'" :sortOrder="-1" >
                    <Column style="width: 10%; text-align: center" header="Base">
                        <template #body="slotProps">
                            {{ slotProps.data.base }}
                        </template>
                    </Column>
                    <Column header="Cliente" style="width: 20%" sortable field="nome_cliente">
                            <template #body="slotProps">
                                <div class="table-cell">{{ slotProps.data.nome_cliente }}</div>
                            </template>
                        </Column>
                        <Column header="Identificação" style="width: 20%">
                            <template #body="slotProps">
                                <div class="table-cell">{{ slotProps.data.identificacao }}</div>
                            </template>
                        </Column>
                    <Column style="width: 30%" header="Dias Offline" sortable field="ultimoDataHora">
                        <template #body="slotProps">
                            <span class="tooltip-target" v-tooltip.left="slotProps.data.ultimoDataHora"> {{ diasEHorasOffline(slotProps.data.ultimoDataHora).dias }} dias e {{ diasEHorasOffline(slotProps.data.ultimoDataHora).horas }} horas</span>
                        </template>
                    </Column>
                    <template #empty>
                        <div class="p-4 text-center">
                            <span class="p-text-secondary">Não há dados para serem exibidos</span>
                        </div>
                    </template>
                </DataTable>
            </div>
        </div>
    </div>
</template>
<style scoped>
.table-cell {
    overflow: hidden; /* Garante que o conteúdo não ultrapasse os limites */
    white-space: nowrap; /* Impede que o texto quebre a linha */
    text-overflow: ellipsis; /* Adiciona "..." ao final do texto truncado */
    display: flex; /* Garante que o comportamento funcione corretamente */
    width: 10ch;
}

.datatable-container {
    display: flex; /* Define o layout como flexbox */
    flex-wrap: wrap; /* Permite que os DataTables quebrem para a próxima linha */
    gap: 0.5rem; /* Espaçamento entre os DataTables */
    justify-content: space-around; /* Ajusta o alinhamento horizontal */
    min-height: 400px; /* Define uma altura mínima */
    position: relative; /* Necessário para o Paginator fixo */
    padding-top: 0rem;
    margin-top: 0rem;
}

.datatable-container > div {
    flex: 1; /* Faz com que todos os DataTables ocupem a mesma largura */
    max-width: 35%; /* Define um limite máximo de largura para cada DataTable */
}

.text-container {
    display: flex; /* Define o layout como flexbox */
    justify-content: space-around; /* Ajusta o alinhamento horizontal */
    margin-bottom: 1rem; /* Espaçamento inferior */
}

/* máquinas online */
.data-online {
    border: 2px solid #008000;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    padding: 1rem;
    background-color: #008000;
    color: #f1f5f9;
}

.tabela-online .p-datatable {
    display: grid;
    align-content: space-between;
}

/*  máquinas em atenção */
.data-atencao {
    border: 2px solid #ffff00;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 1rem;
    background-color: #ffd900;
    color: rgb(36, 36, 36);
    height: 50%;
}

.tabela-atencao .p-datatable {
    display: grid;
    align-content: space-between;
}

/*  máquinas Urgente */
.data-Urgente {
    border: 2px solid #ff8400;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 1rem;
    background-color: #ff8800;
    color: rgb(36, 36, 36);
    height: 50%;
}

.tabela-Urgente .p-datatable {
    display: grid;
    align-content: space-between;
}

/* offline */
.data-offline {
    border: 2px solid #ff0000;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 1rem;
    background-color: #ff0000;
    color: hsl(0, 100%, 97%);
}

.tabela-offline .p-datatable {
    display: grid;
    align-content: space-between;
}

@media (max-width: 768px) {
    .datatable-container {
        flex-direction: column; /* Empilha os DataTables verticalmente */
        gap: 1rem; /* Reduz o espaçamento entre os DataTables */
    }

    .datatable-container > div {
        max-width: 100%; /* Remove o limite máximo de largura */
    }
}

/* Estilo para o Paginator */
.paginator-container {
    position: sticky;
    bottom: 0;
    z-index: 10; /* Garante que o Paginator fique acima de outros elementos */
    padding: 0.5rem;
    text-align: center;
}

/* Estilos para a exibição de tooltip */
.tooltip-target {
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    max-width: 100%;
}

/* Estilos para o tooltip, permitindo múltiplas linhas de texto */
.v-tooltip {
    max-width: 400px;
    white-space: normal;
}

</style>
