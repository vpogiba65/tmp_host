class ASNManager {
    constructor() {
        this.asnList = [
            '0107003900002300',
            '0107003900004100',
            '0107003900015700'
        ];
        this.currentRegistry = null;
        this.init();
    }

    init() {
        this.loadASNFromStorage();
        this.renderASNList();
        this.bindEvents();
        this.updateStats();
    }

    bindEvents() {
        document.getElementById('addAsn').addEventListener('click', () => this.addASN());
        document.getElementById('generateRegistry').addEventListener('click', () => this.generateRegistry());
        document.getElementById('startServer').addEventListener('click', () => this.startServer());
        document.getElementById('stopServer').addEventListener('click', () => this.stopServer());
        document.getElementById('refreshEvents').addEventListener('click', () => this.loadEvents());
    }

    addASN() {
        const asnItem = document.createElement('div');
        asnItem.className = 'asn-item';
        asnItem.innerHTML = `
            <input type="text" class="form-control" value="" placeholder="Введите ASN (16 цифр)" maxlength="16">
            <button class="btn btn-danger btn-sm" onclick="this.parentElement.remove(); asnManager.saveASN();">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        const input = asnItem.querySelector('input');
        input.addEventListener('input', () => {
            input.value = input.value.replace(/\D/g, '').substring(0, 16);
        });
        input.addEventListener('blur', () => this.saveASN());
        
        document.getElementById('asnList').appendChild(asnItem);
    }

    renderASNList() {
        const container = document.getElementById('asnList');
        container.innerHTML = '';
        
        this.asnList.forEach((asn, index) => {
            const asnItem = document.createElement('div');
            asnItem.className = 'asn-item';
            asnItem.innerHTML = `
                <input type="text" class="form-control" value="${asn}" maxlength="16" data-index="${index}">
                <button class="btn btn-danger btn-sm" onclick="asnManager.removeASN(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            const input = asnItem.querySelector('input');
            input.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').substring(0, 16);
                this.asnList[index] = e.target.value;
                this.saveASN();
            });
            
            container.appendChild(asnItem);
        });
    }

    removeASN(index) {
        this.asnList.splice(index, 1);
        this.saveASN();
        this.renderASNList();
    }

    saveASN() {
        const inputs = document.querySelectorAll('#asnList input');
        this.asnList = Array.from(inputs).map(input => input.value).filter(asn => asn.length === 16);
        localStorage.setItem('asnList', JSON.stringify(this.asnList));
    }

    loadASNFromStorage() {
        const stored = localStorage.getItem('asnList');
        if (stored) {
            this.asnList = JSON.parse(stored);
        }
    }

    async generateRegistry() {
        try {
            const response = await fetch('/api/v1/registry');
            const data = await response.json();
            
            if (data.success) {
                this.currentRegistry = data.data;
                this.displayCurrentRegistry();
                this.showNotification('Реестр успешно сгенерирован!', 'success');
            }
        } catch (error) {
            this.showNotification('Ошибка при генерации реестра', 'error');
        }
    }

    displayCurrentRegistry() {
        const container = document.getElementById('currentRegistry');
        if (this.currentRegistry) {
            container.innerHTML = `
                <div class="mb-2">
                    <strong>ID реестра:</strong> ${this.currentRegistry.registryId}
                </div>
                <div class="mb-2">
                    <strong>Дата генерации:</strong> ${new Date(this.currentRegistry.generatedAt).toLocaleString()}
                </div>
                <div>
                    <strong>ASN номера:</strong>
                    ${this.currentRegistry.asn.map(asn => `<div class="registry-item">${asn}</div>`).join('')}
                </div>
            `;
        }
    }

    async startServer() {
        try {
            const response = await fetch('/api/v1/health');
            if (response.ok) {
                this.updateServerStatus(true);
                this.showNotification('Сервер уже запущен', 'info');
            }
        } catch (error) {
            this.showNotification('Сервер не запущен. Запустите сервер командой: node server.js', 'warning');
        }
    }

    async stopServer() {
        this.showNotification('Для остановки сервера используйте Ctrl+C в терминале', 'info');
    }

    updateServerStatus(isRunning) {
        const statusElement = document.getElementById('server-status');
        const startBtn = document.getElementById('startServer');
        const stopBtn = document.getElementById('stopServer');
        
        if (isRunning) {
            statusElement.innerHTML = '<i class="fas fa-circle text-success"></i> Сервер запущен';
            startBtn.disabled = true;
            stopBtn.disabled = false;
        } else {
            statusElement.innerHTML = '<i class="fas fa-circle text-danger"></i> Сервер остановлен';
            startBtn.disabled = false;
            stopBtn.disabled = true;
        }
    }

    async loadEvents() {
        try {
            const response = await fetch('/api/v1/admin/events');
            const data = await response.json();
            
            if (data.success) {
                this.renderEventsTable(data.data);
                this.updateStats(data.stats);
            }
        } catch (error) {
            this.showNotification('Ошибка при загрузке событий', 'error');
        }
    }

    renderEventsTable(events) {
        const tbody = document.getElementById('eventsTable');
        tbody.innerHTML = '';
        
        events.forEach(event => {
            const row = document.createElement('tr');
            row.className = 'event-package';
            row.innerHTML = `
                <td><code>${event.id.substring(0, 8)}...</code></td>
                <td>${event.tid}</td>
                <td>${new Date(event.sent_at).toLocaleString()}</td>
                <td>${event.events_count}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="asnManager.showEventDetails('${event.id}')">
                        <i class="fas fa-eye"></i> Детали
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async showEventDetails(packageId) {
        try {
            const response = await fetch(`/api/v1/admin/events/${packageId}`);
            const data = await response.json();
            
            if (data.success) {
                const modal = new bootstrap.Modal(document.getElementById('eventDetailsModal'));
                const content = document.getElementById('eventDetailsContent');
                
                content.innerHTML = `
                    <div class="mb-3">
                        <strong>ID пакета:</strong> ${data.data.id}<br>
                        <strong>Терминал:</strong> ${data.data.tid}<br>
                        <strong>Дата отправки:</strong> ${new Date(data.data.sent_at).toLocaleString()}
                    </div>
                    <div>
                        <strong>События:</strong>
                        <pre>${JSON.stringify(data.data.events, null, 2)}</pre>
                    </div>
                `;
                
                modal.show();
            }
        } catch (error) {
            this.showNotification('Ошибка при загрузке деталей события', 'error');
        }
    }

    updateStats(stats = null) {
        if (stats) {
            document.getElementById('packagesCount').textContent = stats.packages || 0;
            document.getElementById('eventsCount').textContent = stats.events || 0;
        }
    }

    showNotification(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

// Инициализация
const asnManager = new ASNManager();

// Проверка статуса сервера при загрузке
window.addEventListener('load', () => {
    asnManager.startServer();
    asnManager.loadEvents();
}); 