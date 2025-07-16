// Dados da simulação
const agents = [
    { id: 1, name: 'Ana Silva' },
    { id: 2, name: 'Carlos Souza' },
    { id: 3, name: 'Márcia Lima' }
];

const ticketTypes = [
    { type: 'Suporte Técnico', priority: 'medium' },
    { type: 'Cancelamento', priority: 'high' },
    { type: 'Informação', priority: 'low' },
    { type: 'Reclamação', priority: 'high' },
    { type: 'Elogio', priority: 'low' },
    { type: 'Financeiro', priority: 'high' },
    { type: 'Mudança de Plano', priority: 'medium' }
];

// Estado da simulação
let simulationInterval;
let simulationSpeed = 5;
let tickets = [];
let ticketCounter = 0;
let isSimulating = false;

// Elementos da UI
const waitingColumn = document.getElementById('waiting');
const inProgressColumn = document.getElementById('in-progress');
const analyzingColumn = document.getElementById('analyzing');
const completedColumn = document.getElementById('completed');
const feedbackColumn = document.getElementById('feedback');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('start-simulation').addEventListener('click', startSimulation);
    document.getElementById('stop-simulation').addEventListener('click', stopSimulation);
    document.getElementById('reset-simulation').addEventListener('click', resetSimulation);
    document.getElementById('simulation-speed').addEventListener('input', updateSpeed);
});

// Iniciar simulação
function startSimulation() {
    if (isSimulating) return;
    isSimulating = true;
    document.getElementById('start-simulation').classList.add('simulation-active');
    
    // Intervalo baseado na velocidade
    const intervalTime = 1100 - (simulationSpeed * 100);
    simulationInterval = setInterval(() => {
        addRandomTicket();
        processTickets();
        updateStats();
    }, intervalTime);
}

// Parar simulação
function stopSimulation() {
    clearInterval(simulationInterval);
    isSimulating = false;
    document.getElementById('start-simulation').classList.remove('simulation-active');
}

// Resetar simulação
function resetSimulation() {
    stopSimulation();
    tickets = [];
    ticketCounter = 0;
    clearColumns();
    updateStats();
}

// Atualizar velocidade
function updateSpeed(e) {
    simulationSpeed = parseInt(e.target.value);
    if (isSimulating) {
        stopSimulation();
        startSimulation();
    }
}

// Adicionar ticket aleatório
function addRandomTicket() {
    const randomType = ticketTypes[Math.floor(Math.random() * ticketTypes.length)];
    const priority = randomType.priority;
    const title = `Chamado #${++ticketCounter}: ${randomType.type}`;
    
    const ticket = {
        id: ticketCounter,
        title: title,
        description: `Cliente está solicitando assistência para: ${randomType.type.toLowerCase()}.`,
        priority: priority,
        status: 'waiting',
        createdAt: new Date(),
        assignedAgent: null,
        startTime: null,
        feedback: null,
        urgent: Math.random() < 0.2 // 20% chance de ser urgente
    };

    tickets.push(ticket);
    renderTicket(ticket);

    // Animar novo ticket
    const ticketElement = document.getElementById(`ticket-${ticket.id}`);
    ticketElement.classList.add('new-ticket-indicator');
    setTimeout(() => {
        ticketElement.classList.remove('new-ticket-indicator');
    }, 1000);
}

// Processar tickets
function processTickets() {
    // Atender tickets em espera (30% chance a cada intervalo)
    if (Math.random() < 0.3) {
        attachRandomAgent();
    }

    // Mover tickets em atendimento para análise (15% chance)
    if (Math.random() < 0.15) {
        moveToAnalyzing();
    }

    // Finalizar tickets em análise (20% chance)
    if (Math.random() < 0.2) {
        completeTickets();
    }

    // Finalizar tickets diretamente (10% chance)
    if (Math.random() < 0.1) {
        completeDirectly();
    }

    // Coletar feedback (40% chance)
    if (Math.random() < 0.4) {
        collectFeedback();
    }
}

// Atribuir agente aleatório
function attachRandomAgent() {
    const waitingTickets = tickets.filter(t => t.status === 'waiting');
    if (waitingTickets.length === 0) return;

    // Escolher um ticket prioritário se existir
    let ticketToAssign;
    const urgentTickets = waitingTickets.filter(t => t.urgent);
    ticketToAssign = urgentTickets.length > 0 ? 
        urgentTickets[Math.floor(Math.random() * urgentTickets.length)] :
        waitingTickets[Math.floor(Math.random() * waitingTickets.length)];

    // Atribuir agente disponível
    const agent = agents[Math.floor(Math.random() * agents.length)];
    ticketToAssign.assignedAgent = agent;
    ticketToAssign.status = 'in-progress';
    ticketToAssign.startTime = new Date();

    // Atualizar UI
    updateTicketStatus(ticketToAssign.id, 'in-progress');
}

// Mover para análise
function moveToAnalyzing() {
    const inProgressTickets = tickets.filter(t => t.status === 'in-progress');
    if (inProgressTickets.length === 0) return;

    const ticketToMove = inProgressTickets[Math.floor(Math.random() * inProgressTickets.length)];
    ticketToMove.status = 'analyzing';

    // Atualizar UI
    updateTicketStatus(ticketToMove.id, 'analyzing');
}

// Completar tickets
function completeTickets() {
    const analyzingTickets = tickets.filter(t => t.status === 'analyzing');
    if (analyzingTickets.length === 0) return;

    const ticketToComplete = analyzingTickets[Math.floor(Math.random() * analyzingTickets.length)];
    ticketToComplete.status = 'completed';

    // Atualizar UI
    updateTicketStatus(ticketToComplete.id, 'completed');
}

// Completar diretamente
function completeDirectly() {
    const inProgressTickets = tickets.filter(t => t.status === 'in-progress');
    if (inProgressTickets.length === 0) return;

    const ticketToComplete = inProgressTickets[Math.floor(Math.random() * inProgressTickets.length)];
    ticketToComplete.status = 'completed';

    // Atualizar UI
    updateTicketStatus(ticketToComplete.id, 'completed');
}

// Coletar feedback
function collectFeedback() {
    const completedTickets = tickets.filter(t => t.status === 'completed' && !t.feedback);
    if (completedTickets.length === 0) return;

    const ticketForFeedback = completedTickets[Math.floor(Math.random() * completedTickets.length)];
    
    // Gerar feedback aleatório
    const feedbackScore = Math.floor(Math.random() * 5) + 1; // 1-5
    ticketForFeedback.feedback = {
        score: feedbackScore,
        comment: feedbackScore >= 4 ? 'Ótimo atendimento!' : 
                feedbackScore >= 2 ? 'Atendimento razoável.' : 'Não ficou satisfeito.'
    };

    updateTicketStatus(ticketForFeedback.id, 'feedback');
}

// Renderizar ticket
function renderTicket(ticket) {
    const ticketElement = document.createElement('div');
    ticketElement.className = 'ticket';
    ticketElement.id = `ticket-${ticket.id}`;
    
    // Determinar classe de prioridade
    let priorityClass;
    let priorityText;
    if (ticket.urgent) {
        priorityClass = 'priority-high';
        priorityText = 'URGENTE';
    } else {
        priorityClass = ticket.priority === 'high' ? 'priority-high' :
                       ticket.priority === 'medium' ? 'priority-medium' : 'priority-low';
        priorityText = ticket.priority === 'high' ? 'ALTA' :
                      ticket.priority === 'medium' ? 'MÉDIA' : 'BAIXA';
    }

    ticketElement.innerHTML = `
        <div class="ticket-header">
            <span class="ticket-id">#${ticket.id}</span>
            <span class="ticket-priority ${priorityClass}">${priorityText}</span>
        </div>
        <div class="ticket-content">
            <div class="ticket-title">${ticket.title}</div>
            <div class="ticket-desc">${ticket.description}</div>
        </div>
        ${ticket.status === 'waiting' ? `
        <div class="action-buttons">
            <button class="btn btn-primary" onclick="assignAgent(${ticket.id})">Atender</button>
        </div>
        ` : ''}
        ${ticket.status === 'in-progress' ? `
        <div class="ticket-footer">
            <div class="ticket-agent">
                <div class="agent-avatar">${ticket.assignedAgent.name.charAt(0)}</div>
                <span class="agent-name">${ticket.assignedAgent.name}</span>
            </div>
            <div class="ticket-time">${formatTimeFromStart(ticket.startTime)}</div>
        </div>
        <div class="action-buttons">
            <button class="btn btn-secondary" onclick="analyzeTicket(${ticket.id})">Analisar</button>
            <button class="btn btn-danger" onclick="completeTicket(${ticket.id})">Finalizar</button>
        </div>
        ` : ''}
        ${ticket.status === 'analyzing' ? `
        <div class="ticket-footer">
            <div class="ticket-agent">
                <div class="agent-avatar">${ticket.assignedAgent.name.charAt(0)}</div>
                <span class="agent-name">${ticket.assignedAgent.name}</span>
            </div>
            <div class="ticket-time">${formatTimeFromStart(ticket.startTime)}</div>
        </div>
        <div class="action-buttons">
            <button class="btn btn-secondary" onclick="completeTicket(${ticket.id})">Finalizar</button>
        </div>
        ` : ''}
        ${ticket.status === 'completed' ? `
        <div class="ticket-footer">
            <div class="ticket-agent">
                <div class="agent-avatar">${ticket.assignedAgent.name.charAt(0)}</div>
                <span class="agent-name">${ticket.assignedAgent.name}</span>
            </div>
            <div class="ticket-time">Finalizado</div>
        </div>
        <div class="action-buttons">
            <button class="btn btn-warning" onclick="collectFeedback(${ticket.id})">Avaliar</button>
        </div>
        ` : ''}
        ${ticket.status === 'feedback' ? `
        <div class="ticket-footer">
            <div class="ticket-agent">
                <div class="agent-avatar">${ticket.assignedAgent.name.charAt(0)}</div>
                <span class="agent-name">${ticket.assignedAgent.name}</span>
            </div>
        </div>
        <div class="feedback">
            <div style="margin-top: 10px; font-size: 13px;">
                Avaliação: ${'★'.repeat(ticket.feedback.score)}${'☆'.repeat(5 - ticket.feedback.score)}
            </div>
            <div style="margin-top: 5px; font-size: 12px; color: #7f8c8d;">
                "${ticket.feedback.comment}"
            </div>
        </div>
        ` : ''}
    `;

    // Adicionar ao Kanban
    document.getElementById(ticket.status === 'waiting' ? 'waiting' : 
                             ticket.status === 'in-progress' ? 'in-progress' : 
                             ticket.status === 'analyzing' ? 'analyzing' : 
                             ticket.status === 'completed' ? 'completed' : 'feedback')
        .appendChild(ticketElement);
}

// Atualizar status do ticket
function updateTicketStatus(ticketId, newStatus) {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    ticket.status = newStatus;

    const ticketElement = document.getElementById(`ticket-${ticketId}`);
    if (ticketElement) {
        const parentColumn = ticketElement.parentNode;
        parentColumn.removeChild(ticketElement);
        
        if (newStatus === 'waiting') waitingColumn.appendChild(ticketElement);
        else if (newStatus === 'in-progress') inProgressColumn.appendChild(ticketElement);
        else if (newStatus === 'analyzing') analyzingColumn.appendChild(ticketElement);
        else if (newStatus === 'completed') completedColumn.appendChild(ticketElement);
        else if (newStatus === 'feedback') feedbackColumn.appendChild(ticketElement);
        
        // Re-renderizar para mostrar conteúdo atualizado
        renderTicket(ticket);
    }
}

// Limpar colunas
function clearColumns() {
    waitingColumn.innerHTML = `
        <div class="column-header">
            <div class="column-title">Em Espera</div>
            <div class="column-count" id="waiting-count">0</div>
        </div>
    `;
    
    inProgressColumn.innerHTML = `
        <div class="column-header">
            <div class="column-title">Em Atendimento</div>
            <div class="column-count" id="in-progress-count">0</div>
        </div>
    `;
    
    analyzingColumn.innerHTML = `
        <div class="column-header">
            <div class="column-title">Analisando</div>
            <div class="column-count" id="analyzing-count">0</div>
        </div>
    `;
    
    completedColumn.innerHTML = `
        <div class="column-header">
            <div class="column-title">Finalizados</div>
            <div class="column-count" id="completed-count">0</div>
        </div>
    `;
    
    feedbackColumn.innerHTML = `
        <div class="column-header">
            <div class="column-title">Avaliação</div>
            <div class="column-count" id="feedback-count">0</div>
        </div>
    `;
}

// Atualizar estatísticas
function updateStats() {
    document.getElementById('total-tickets').textContent = tickets.length;
    document.getElementById('active-tickets').textContent = tickets.filter(t => 
        t.status === 'in-progress' || t.status === 'analyzing').length;
    document.getElementById('completed-tickets').textContent = tickets.filter(t => 
        t.status === 'completed' || t.status === 'feedback').length;

    document.getElementById('waiting-count').textContent = tickets.filter(t => t.status === 'waiting').length;
    document.getElementById('in-progress-count').textContent = tickets.filter(t => t.status === 'in-progress').length;
    document.getElementById('analyzing-count').textContent = tickets.filter(t => t.status === 'analyzing').length;
    document.getElementById('completed-count').textContent = tickets.filter(t => t.status === 'completed').length;
    document.getElementById('feedback-count').textContent = tickets.filter(t => t.status === 'feedback').length;
}

// Funções chamadas pelos botões (para uso manual)
function assignAgent(ticketId) {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket || ticket.status !== 'waiting') return;

    const agent = agents[Math.floor(Math.random() * agents.length)];
    ticket.assignedAgent = agent;
    ticket.status = 'in-progress';
    ticket.startTime = new Date();

    updateTicketStatus(ticketId, 'in-progress');
}

function analyzeTicket(ticketId) {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket || ticket.status !== 'in-progress') return;

    ticket.status = 'analyzing';
    updateTicketStatus(ticketId, 'analyzing');
}

function completeTicket(ticketId) {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket || (ticket.status !== 'in-progress' && ticket.status !== 'analyzing')) return;

    ticket.status = 'completed';
    updateTicketStatus(ticketId, 'completed');
}

function collectFeedback(ticketId) {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket || ticket.status !== 'completed' || ticket.feedback) return;

    // Gerar feedback aleatório
    const feedbackScore = Math.floor(Math.random() * 5) + 1; // 1-5
    ticket.feedback = {
        score: feedbackScore,
        comment: feedbackScore >= 4 ? 'Ótimo atendimento!' : 
                feedbackScore >= 2 ? 'Atendimento razoável.' : 'Não ficou satisfeito.'
    };

    updateTicketStatus(ticketId, 'feedback');
}

// Funções auxiliares
function formatTimeFromStart(startTime) {
    if (!startTime) return '0m';
    
    const diff = new Date() - new Date(startTime);
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 60) {
        return `${minutes}m`;
    } else {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m`;
    }
}

// Permitir acesso global para funções chamadas pelos botões
window.assignAgent = assignAgent;
window.analyzeTicket = analyzeTicket;
window.completeTicket = completeTicket;
window.collectFeedback = collectFeedback;
