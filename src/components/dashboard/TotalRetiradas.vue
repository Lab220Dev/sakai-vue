<script setup>
import { useLayout } from '@/layout/composables/layout';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
import { defineProps, onMounted, ref, watch } from 'vue';
const props = defineProps({
    total: {
        type: Array,
        required: true
    }
});
const authStore = useAuthStore();
const { getPrimary, getSurface, isDarkTheme } = useLayout(); // Importa os hooks do layout
const abrirRetiradaDialog = ref(false); // Referência para o dialog de retirada
const chartData = ref(null); // Referência para os dados do gráfico
const chartOptions = ref(null); // Referência para as opções do gráfico
const myChart = ref(null); // Referência para o gráfico
const dadosRetirada = ref([]); // Referência para os dados de retirada
const clienteSelecionado = ref({ id_cliente: 0, dia: '', nome: '' }); // Referência para o cliente selecionado
const totalRetiradas = ref(0); // Total dinâmico de retiradas
const selectAll = ref(true); // Estado inicial: selecionar todos
const isChartUpdating = ref(false);
// Função para alternar a seleção de todos os legends
const toggleAllLegends = async () => {
    if (isChartUpdating.value) return;
    isChartUpdating.value = true;
    try {
        const chart = myChart.value.chart;

        if (selectAll.value) {
            // Desseleciona todos os legends
            chart.data.datasets.forEach((_, index) => {
                if (chart.isDatasetVisible(index)) {
                    chart.hide(index);
                }
            });
        } else {
            // Seleciona todos os legends
            chart.data.datasets.forEach((_, index) => {
                if (!chart.isDatasetVisible(index)) {
                    chart.show(index);
                }
            });
        }

        // Atualiza o total de retiradas com base nos datasets visíveis
        totalRetiradas.value = chart.data.datasets.reduce((sum, dataset, index) => {
            if (chart.isDatasetVisible(index)) {
                return sum + dataset.data.reduce((a, b) => a + b, 0);
            }
            return sum;
        }, 0);

        // Alterna o estado do botão
        selectAll.value = !selectAll.value;
        await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
        console.log('Erro ao alternar a seleção de todos os legends:', error);
    } finally {
        isChartUpdating.value = false;
    }
};

// Função para gerar cores dinâmicas
const generateColors = (count) => {
    const colors = [];
    const step = Math.floor(360 / count);

    for (let i = 0; i < count; i++) {
        const hue = i * step;
        const saturation = 60;
        const lightness = 50;

        const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        colors.push(color);
    }

    return colors;
};

async function getDados(clienteSelecionado) {
    console.log(clienteSelecionado);
    dadosRetirada.value = [];
    const response = await axios.post(
        'http://localhost:3050/retiradaRealizada',
        {
            data: {
                id_cliente: clienteSelecionado.value.id_cliente,
                dia: clienteSelecionado.value.dia,
                nome: clienteSelecionado.value.nome
            }
        },
        {
            headers: {
                Authorization: `Bearer ${authStore.token}` // Adicione o token
            }
        }
    );

    return response.data;
}

const setChartData = () => {
    // Função para definir os dados do gráfico
    const dataCount = props.total.length; // Conta o número de datasets
    const backgroundColors = generateColors(dataCount); // Gera cores dinâmicas para os datasets
    const borderColors = backgroundColors.map((color) => color.replace('0.2', '1')); // Gera cores de borda a partir das cores de fundo
    let diasx = props.total[0].dias.map((data) => data.split('-')[0]); // Pega os dias do mês a partir da data

    const datasets = props.total.map((item, index) => ({
        // Mapeia os dados para o formato do gráfico
        label: item.label, // Nome do cliente
        data: item.data, // Quantidade de retiradas
        id_cliente: item.id_cliente, // ID do cliente
        backgroundColor: backgroundColors[index], // Cor de fundo
        borderColor: borderColors[index], // Cor da borda
        borderWidth: 1 // Largura da borda
    }));

    // Calcula o total inicial de retiradas
    totalRetiradas.value = datasets.reduce((sum, dataset) => {
        return sum + dataset.data.reduce((a, b) => a + b, 0); // Soma a quantidade de retiradas
    }, 0); // Inicializa com 0

    return {
        labels: diasx ? diasx : [], // Dias do mês
        datasets: datasets // Dados de retiradas
    };
};

function setChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement); // Pega o estilo do documento
    const borderColor = documentStyle.getPropertyValue('--surface-border'); // Cor da borda
    const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary'); // Cor do texto secundário

    return {
        maintainAspectRatio: false, // Mantém a proporção
        aspectRatio: 0.8, // Proporção

        onClick: async (event, activeElements) => {
            // Função de clique
            const chart = myChart.value.chart; // Gráfico
            const elements = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false); // Elementos clicados

            if (elements && elements.length) {
                const element = elements[0]; // Elemento clicado
                const datasetIndex = element.datasetIndex; // Índice do dataset
                const dataIndex = element.index; // Índice do dado

                const dataset = chart.data.datasets[datasetIndex]; // Dataset clicado
                clienteSelecionado.value.dia = chart.data.labels[dataIndex]; // Dia selecionado
                clienteSelecionado.value.id_cliente = dataset.id_cliente; // ID do cliente
                dadosRetirada.value = await getDados(clienteSelecionado); // Dados de retirada
                abrirRetiradaDialog.value = true; // Abre o dialog
            }
        },

        plugins: {
            // Plugins
            legend: {
                // Legenda
                onClick: (e, legendItem, legend) => {
                    // Função de clique
                    const chart = legend.chart; // Gráfico
                    const datasetIndex = legendItem.datasetIndex; // Índice do dataset

                    // Alterna a visibilidade do dataset
                    chart.isDatasetVisible(datasetIndex) ? chart.hide(datasetIndex) : chart.show(datasetIndex); // Alterna a visibilidade

                    // Recalcula o total de retiradas com base nos datasets visíveis
                    totalRetiradas.value = chart.data.datasets.reduce((sum, dataset, index) => {
                        // Recalcula o total de retiradas
                        if (chart.isDatasetVisible(index)) {
                            // Se o dataset estiver visível
                            return sum + dataset.data.reduce((a, b) => a + b, 0); // Soma a quantidade de retiradas
                        }
                        return sum; // Retorna a soma
                    }, 0); // Inicializa com 0
                }
            },
            tooltip: {
                xAlign: 'left', // centraliza horizontalmente
                yAlign: 'center', // posiciona acima do ponto de dados
                padding: 10,
                callbacks: {
                    // Exibe no header do tooltip o dia e a somatória dos valores
                    title: function (tooltipItems) {
                        // Pega o label do eixo X (dia)
                        const dayLabel = tooltipItems[0].label;
                        // Calcula a soma dos valores de todos os datasets naquele ponto
                        let sum = 0;
                        tooltipItems.forEach((tooltipItem) => {
                            sum += tooltipItem.parsed.y;
                        });
                        return ['Dia: ' + dayLabel, 'Total Retirado: ' + sum];
                    },
                    // Callback para exibir o label individual (opcional)
                    label: function (context) {
                        const label = context.dataset.label || '';
                        const value = context.parsed.y;
                        return label + ': ' + value;
                    }
                }
            }
        },

        scales: {
            // Escalas
            x: {
                // Eixo X
                stacked: true, // Empilhado
                ticks: {
                    // Marcas
                    color: textMutedColor // Cor do texto
                }, // Marcas
                grid: {
                    //  Grade
                    color: 'transparent', // Cor
                    borderColor: 'transparent' // Cor da borda
                }
            },
            y: {
                stacked: true,
                ticks: {
                    color: textMutedColor
                },
                grid: {
                    color: borderColor,
                    borderColor: 'transparent',
                    drawTicks: false
                }
            }
        }
    };
}

watch([getPrimary, getSurface, isDarkTheme], () => {
    // Atualiza as cores quando o tema muda
    if (chartData.value) {
        const newChartData = setChartData(); // Atualiza os dados do gráfico
        chartData.value.labels = newChartData.labels; // Atualiza os labels
        chartData.value.datasets = newChartData.datasets; // Atualiza os datasets
        chartOptions.value = setChartOptions(); // Atualiza as opções do gráfico
    }
});

watch(
    () => props.total,
    () => {
        if (chartData.value) {
            const newChartData = setChartData(); // Atualiza os dados do gráfico
            chartData.value.labels = newChartData.labels; // Atualiza os labels
            chartData.value.datasets = newChartData.datasets; // Atualiza os datasets
            chartOptions.value = setChartOptions(); // Atualiza as opções do gráfico
        }
    }
);

onMounted(() => {
    chartData.value = setChartData(); // Inicializa os dados do gráfico
    chartOptions.value = setChartOptions(); // Inicializa as opções do gráfico
});
</script>

<template>
    <div class="card">
        <div class="flex justify-between items-center">
            <div class="text-xl font-semibold">
                <span>
                    Ranking de Retiradas do Mês
                    <hr class="mb-0 mt-0" />
                </span>
            </div>
            <Button class="color" :label="selectAll ? 'Desmarcar Todos' : 'Marcar Todos'" :icon="selectAll ? 'pi pi-times' : 'pi pi-check'" size="small" style :disabled="isChartUpdating" @click="toggleAllLegends" />
        </div>

        <Chart ref="myChart" type="bar" :data="chartData" :options="chartOptions" class="h-80" />

        <Dialog v-model:visible="abrirRetiradaDialog" maximizable modal :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <template #header>
                <div class="header" style="display: flex; justify-content: space-between; align-items: center">
                    <!-- Título do cliente -->
                    <div class="title mb-0" style="display: flex; align-items: center">
                        <h5 style="margin-right: 5px">{{ clienteSelecionado.nome }}</h5>
                        <i v-tooltip="'Retiradas realizadas no dia selecionado'" class="mt-1 pi pi-info-circle" style="cursor: pointer; font-size: 1.2em; color: gray"></i>
                    </div>
                </div>
            </template>
            <template v-if="clienteSelecionado?.id_cliente >= 75">
                <DataTable class="mt-0" :value="dadosRetirada" paginator :rows="15" :rowsPerPageOptions="[5, 10, 20, 50]">
                    <column field="ID_DM" header="DM"></column>
                    <column field="ProdutoNome" header="Itens"></column>
                    <column field="Quantidade" header="Quant." style="text-align: center"></column>
                    <column field="nome" header="Nome Func."></column>
                    <column field="matricula" header="Matricula"></column>
                    <column #empty>
                        <div class="p-4 text-center">
                            <span class="p-text-secondary">Não há dados a serem exibidos</span>
                        </div>
                    </column>
                </DataTable>
            </template>

            <template v-else>
                <DataTable class="mt-0" :value="dadosRetirada" paginator :rows="15" :rowsPerPageOptions="[5, 10, 20, 50]">
                    <column field="id_vm" header="DM"></column>
                    <column field="produtonome" header="Itens"></column>
                    <column field="quantidade" header="Quant." style="text-align: center"></column>
                    <column field="nome_comprador" header="Nome Func."></column>
                    <column field="cartao_comprador" header="Matricula"></column>
                    <column #empty>
                        <div class="p-4 text-center">
                            <span class="p-text-secondary">Não há dados a serem exibidos</span>
                        </div>
                    </column>
                </DataTable>
            </template>
        </Dialog>

        <div class="flex justify-end" style="height: 35px">
            <div class="text-sm mb-4 mt-4"><span class="font-bold">Total de Retiradas:</span> {{ totalRetiradas }}</div>
        </div>
    </div>
</template>
<style scoped>
.card {
    padding-bottom: 0rem;
    padding-top: 0rem;
    margin-bottom: 0rem;
    margin-top: 0rem;
}

.color {
    background-color: #e46e00;
    border: 1px solid #e46e00;
}
</style>
