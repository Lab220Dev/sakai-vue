<script setup>
import Monitoring from '@/components/dashboard/Monitoring.vue'; // Importa o componente Monitoring
import TotalRetiradas from '@/components/dashboard/TotalRetiradas.vue'; // Importa o componente TotalRetiradas
import { useAuthStore } from '@/stores/auth'; // Importa o store de autenticação
import { io } from 'socket.io-client'; // Importa o cliente do socket.io
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'; // Importa os hooks do Vue

const store = useAuthStore(); // Instância do store de autenticação
const valorTempo = ref(5);
const monitoring = ref([]); // Referência para o array de monitoramento
const ranking = ref([]); // Referência para o array de ranking
const total = ref([]); // Referência para o array de ranking
const tempo = ref(0);
let socket; // Variável para armazenar a instância do socket
let poolingDataInicialRecebido = false;
let progressInterval = null;
let changedDuringCycle = false;
const refreshToken = () => {
    // Função que emite o evento para solicitar a renovação do token
    console.log('Solicitando refresh do token...');
    socket.emit('refreshTokenRequest', { token: store.userToken });
};

onMounted(() => {
    socket = io('http://localhost:3050/', {
        extraHeaders: {
            Authorization: 'Bearer ' + store.userToken
        }
    }); // Conecta ao servidor do socket.io
    valorTempo.value = store.preferredTime || 5; // Define o valor do tempo preferido
    socket.on('connect', () => {
        //console.log('Socket connected:', socket.id);
        socket.emit('statusPooling', { tempo: valorTempo.value });
        socket.emit('dataPooling');
        socket.emit('rankingPool');
        startCountdown();
    });

    socket.on('connect_error', (err) => {
        console.error('Connection error:', err);
    });

    //pool que alimenta as tabelas
    socket.on('poolingData', (data) => {
        console.log('Pool das tabelas:', data);
        monitoring.value = data;
    });

    //pool do ranking;
    socket.on('poolingRanking', (data) => {
        console.log('Inicia o pool do ranking:', data);
        ranking.value = data;
    });

    //pool do gráfico
    socket.on('rankingData', (data) => {
        console.log('Grafico data:', data);
        total.value = data;
        startCountdown();
    });

    socket.on('refreshNeeded', (data) => {
        console.log('Aviso de refresh recebido:', data.msg);
        refreshToken();
    });
    socket.on('refreshTokenResponse', (data) => {
        if (data.error) {
            console.error('Erro ao renovar token:', data.error);
        } else {
            console.log('Token renovado com sucesso!', data.token);
            store.setToken(data.token);
        }
    });
});

watch(valorTempo, (newValue, oldValue) => {
    // Observa mudanças no valor do tempo
    if (newValue !== oldValue) {
        // Se o novo valor for diferente do antigo
        store.setTempoPreferido(newValue); // Atualiza o tempo preferido no store
        socket.emit('statusPooling', { tempo: newValue }); // Envia o novo tempo para o servidor
        changedDuringCycle = true; // Marca que houve uma mudança durante o ciclo
    }
});

const startCountdown = () => {
    if (progressInterval) clearInterval(progressInterval);
    let elapsedSeconds = 0;
    const totalSeconds = valorTempo.value * 60;
    tempo.value = totalSeconds; // Inicializa com o total de segundos

    progressInterval = setInterval(() => {
        elapsedSeconds++;
        tempo.value = totalSeconds - elapsedSeconds; // Calcula os segundos restantes

        if (changedDuringCycle) {
            clearInterval(progressInterval);
            changedDuringCycle = false;
            startCountdown();
            return;
        }
        if (elapsedSeconds >= totalSeconds) {
            clearInterval(progressInterval);
            tempo.value = 0; // Zera o tempo ao final
            if (!changedDuringCycle) {
                startCountdown();
            }
        }
    }, 1000);
};

const tempoFormatado = computed(() => {
    const minutos = Math.floor(tempo.value / 60)
        .toString()
        .padStart(2, '0');
    const segundos = (tempo.value % 60).toString().padStart(2, '0');
    return `${minutos}:${segundos}`;
});

onUnmounted(() => {
    if (socket) {
        socket.disconnect();
    }
    if (progressInterval) {
        clearInterval(progressInterval);
    }
});

//*********************************** countdown do proximo ping  ************************/
</script>

<template>
    <div class="card grid grid-cols-12 gap-1">
        <div class="col-span-12 xl:col-span-1 my-2">
            <InputNumber v-tooltip="'Escolha o intervalo de atualização.'" class="ml-2" min="1" :max="59" v-model="valorTempo" showButtons buttonLayout="horizontal" />
        </div>
        <div class="col-span-12 xl:col-span-11 justify-self-end flex items-center justify-between mr-2">
            <div v-tooltip.left="'Tempo restante até a próxima atualização do gráfico.'" class="my-2 ml-4 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-mono text-lg shadow">
                {{ tempoFormatado }}
            </div>
        </div>
        <div v-if="total.length > 0" class="col-span-12 xl:col-span-12">
            <TotalRetiradas :total="total" />
        </div>
        <div v-if="monitoring.length > 0" class="col-span-12 xl:col-span-12">
            <Monitoring :monitoring="monitoring" />
        </div>
    </div>
</template>
<style scoped>
.card {
    padding: 0.2rem;
}

h5 {
    margin: 0;
}

.bg-blue-100 {
    background-color: #ebf8ff;
}

.text-blue-800 {
    color: #2c5282;
}

.rounded-lg {
    border-radius: 0.5rem;
}

.shadow {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
