// ============================
// API МОДУЛЬ ДЛЯ MARS CRYPTO CONFLICT
// ============================

class MarsGameAPI {
    constructor() {
        // ⚠️ ВАЖНО: ИЗМЕНИ ЭТУ СТРОКУ НА СВОЙ URL!
        this.baseURL = 'https://mars-crypto-conflict-backend.onrender.com/api';
        console.log('🔗 API Base URL:', this.baseURL);
        
        this.telegramUser = null;
        this.initTelegram();
    }

    // Инициализация Telegram Web App
    initTelegram() {
        if (typeof window.Telegram?.WebApp !== 'undefined') {
            const tg = window.Telegram.WebApp;
            const user = tg.initDataUnsafe?.user;
            
            if (user) {
                this.telegramUser = {
                    id: user.id,
                    username: user.username,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    photo_url: user.photo_url,
                    language_code: user.language_code
                };
                console.log('👤 Telegram пользователь получен:', this.telegramUser);
            } else {
                // Telegram Web App есть, но данные пользователя не получены
                console.warn('Telegram Web App есть, но данные пользователя не получены');
                this.telegramUser = this.createTestUser();
            }
        } else {
            // Telegram Web App SDK не найден - тестовый режим
            console.warn('Telegram Web App SDK не найден - тестовый режим');
            this.telegramUser = this.createTestUser();
        }
    }

    // Создание тестового пользователя
    createTestUser() {
        const testId = Date.now(); // Уникальный ID на основе времени
        return {
            id: testId,
            username: 'test_player_' + testId,
            first_name: 'Тестовый',
            last_name: 'Игрок',
            photo_url: null,
            language_code: 'ru'
        };
    }

    // Формирует заголовки с авторизацией
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'X-Client': 'MarsCryptoConflict-WebApp'
        };

        // Добавляем Telegram данные если они есть
        if (typeof window.Telegram?.WebApp !== 'undefined') {
            const tg = window.Telegram.WebApp;
            if (tg.initData) {
                headers['Authorization'] = `tma ${tg.initData}`;
                console.log('🔐 Используем Telegram авторизацию');
            }
        }

        // В тестовом режиме или при отсутствии Telegram данных
        if (!headers['Authorization'] && this.telegramUser?.id) {
            headers['X-Telegram-User-ID'] = this.telegramUser.id.toString();
            headers['X-Test-Mode'] = 'true';
            console.log('🎭 Тестовый режим, Telegram ID:', this.telegramUser.id);
        }

        return headers;
    }

    // Обработка ошибок
    async handleResponse(response) {
        if (!response.ok) {
            try {
                const errorData = await response.json();
                console.error('❌ API Ошибка:', {
                    status: response.status,
                    statusText: response.statusText,
                    url: response.url,
                    error: errorData
                });
                
                const errorMessage = errorData.error || 
                                   errorData.message || 
                                   `HTTP ${response.status}: ${response.statusText}`;
                throw new Error(errorMessage);
            } catch (jsonError) {
                console.error('❌ Не удалось распарсить JSON ошибки:', jsonError);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        }
        
        try {
            return await response.json();
        } catch (jsonError) {
            console.error('❌ Не удалось распарсить JSON ответа:', jsonError);
            throw new Error('Invalid JSON response');
        }
    }

    // ============================
    // API ДЛЯ ПОЛЬЗОВАТЕЛЯ
    // ============================

    // Получить данные текущего пользователя
    async getUserData() {
        try {
            console.log('📥 Запрос данных пользователя...');
            const response = await fetch(`${this.baseURL}/user/me`, {
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('❌ Ошибка получения данных пользователя:', error.message);
            return { error: error.message };
        }
    }

    // Создать пользователя
    async createUser(userData) {
        try {
            console.log('📝 Создание пользователя:', userData);
            const response = await fetch(`${this.baseURL}/user/create`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(userData)
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('❌ Ошибка создания пользователя:', error.message);
            return { error: error.message };
        }
    }

    // Получить статистику пользователя
    async getUserStats() {
        try {
            const response = await fetch(`${this.baseURL}/user/stats`, {
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('❌ Ошибка получения статистики:', error.message);
            return { error: error.message };
        }
    }

    // ============================
    // API ДЛЯ ИГРЫ
    // ============================

    // Получить состояние игры
    async getGameState() {
        try {
            console.log('🎮 Запрос состояния игры...');
            const response = await fetch(`${this.baseURL}/game/state`, {
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('❌ Ошибка получения состояния игры:', error.message);
            return { error: error.message };
        }
    }

    // Получить здания пользователя
    async getBuildings() {
        try {
            console.log('🏗️ Запрос зданий...');
            const response = await fetch(`${this.baseURL}/game/buildings`, {
                headers: this.getHeaders()
            });
            const result = await this.handleResponse(response);
            console.log('✅ Получены здания:', result.length || 0, 'шт.');
            return Array.isArray(result) ? result : [];
        } catch (error) {
            console.error('❌ Ошибка получения зданий:', error.message);
            return [];
        }
    }

    // Сохранить здания
    async saveBuildings(buildings) {
        try {
            console.log('💾 Сохранение зданий:', buildings.length, 'шт.');
            const response = await fetch(`${this.baseURL}/game/buildings/save`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ buildings })
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('❌ Ошибка сохранения зданий:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Переместить здание
    async moveBuilding(buildingId, x, y) {
        try {
            console.log('📍 Перемещение здания:', buildingId, '→', {x, y});
            const response = await fetch(`${this.baseURL}/game/buildings/move`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ 
                    building_id: buildingId,
                    x: x,
                    y: y 
                })
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('❌ Ошибка перемещения здания:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Собрать ресурсы из базы
    async collectResources() {
        try {
            console.log('💰 Сбор ресурсов...');
            
            // Получаем Telegram ID пользователя
            const telegramId = this.telegramUser?.id?.toString() || 'test123';
            console.log('👤 Отправляем telegram_id:', telegramId);
            
            const response = await fetch(`${this.baseURL}/game/collect`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ 
                    telegram_id: telegramId  // ← ИСПРАВЛЕНИЕ ЗДЕСЬ!
                })
            });
            
            const result = await this.handleResponse(response);
            console.log('✅ Ресурсы собраны:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Ошибка сбора ресурсов:', error.message);
            return { 
                success: false, 
                collected: 0, 
                error: error.message 
            };
        }
    }

    // ============================
    // API ДЛЯ КОШЕЛЬКА
    // ============================

    // Сохранить BSC адрес
    async saveWalletAddress(bscAddress) {
        try {
            console.log('💳 Сохранение BSC адреса:', bscAddress);
            const response = await fetch(`${this.baseURL}/wallet/save`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ bsc_address: bscAddress })
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('❌ Ошибка сохранения адреса:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Инициировать вывод средств
    async withdraw(amount) {
        try {
            console.log('🚀 Инициация вывода:', amount, 'MNRT');
            const response = await fetch(`${this.baseURL}/wallet/withdraw`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ amount })
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('❌ Ошибка вывода средств:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Получить историю транзакций
    async getTransactions() {
        try {
            const response = await fetch(`${this.baseURL}/wallet/transactions`, {
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('❌ Ошибка получения транзакций:', error.message);
            return [];
        }
    }

    // Получить информацию о кошельке
    async getWalletInfo() {
        try {
            console.log('👛 Запрос информации о кошельке...');
            const response = await fetch(`${this.baseURL}/wallet/info`, {
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('❌ Ошибка получения информации о кошельке:', error.message);
            return null;
        }
    }

    // Получить таблицу лидеров
    async getLeaderboard() {
        try {
            const response = await fetch(`${this.baseURL}/wallet/leaderboard`, {
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('❌ Ошибка получения таблицы лидеров:', error.message);
            return [];
        }
    }

    // ============================
    // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
    // ============================

    // Инициализация пользователя и игры
    async initializeGame() {
        console.log('🎮 Инициализация игры...');
        
        try {
            // 1. Получаем или создаем пользователя
            console.log('👤 Проверка пользователя...');
            let userData = await this.getUserData();
            
            if (userData && userData.error === 'User not found') {
                console.log('👤 Пользователь не найден, создаем нового...');
                userData = await this.createUser({
                    telegram_id: this.telegramUser.id,
                    username: this.telegramUser.username,
                    first_name: this.telegramUser.first_name,
                    last_name: this.telegramUser.last_name
                });
            } else if (userData && userData.error) {
                console.error('❌ Ошибка получения пользователя:', userData.error);
            }

            // 2. Получаем состояние игры
            console.log('🎮 Получение состояния игры...');
            const gameState = await this.getGameState();
            
            // 3. Получаем здания
            console.log('🏗️ Получение зданий...');
            const buildings = await this.getBuildings();
            
            // 4. Получаем информацию о кошельке
            console.log('👛 Получение информации о кошельке...');
            const walletInfo = await this.getWalletInfo();

            const result = {
                user: userData,
                game: gameState,
                buildings: buildings,
                wallet: walletInfo
            };

            console.log('✅ Инициализация завершена:', {
                user: userData ? 'да' : 'нет',
                game: gameState ? 'да' : 'нет',
                buildings: buildings.length,
                wallet: walletInfo ? 'да' : 'нет'
            });

            return result;
            
        } catch (error) {
            console.error('❌ Ошибка инициализации игры:', error);
            return {
                user: null,
                game: null,
                buildings: [],
                wallet: null
            };
        }
    }

    // Синхронизация игрового состояния
    async syncGameState(localGameState) {
        try {
            // Сохраняем здания
            if (localGameState.buildings && localGameState.buildings.length > 0) {
                console.log('💾 Синхронизация зданий...');
                await this.saveBuildings(localGameState.buildings);
            }
            
            return { success: true };
        } catch (error) {
            console.error('❌ Ошибка синхронизации:', error);
            return { success: false, error: error.message };
        }
    }

    // Тестовый метод для проверки подключения
    async testConnection() {
        try {
            console.log('🔗 Тестирование подключения к API...');
            const response = await fetch(`${this.baseURL}/health`, {
                headers: this.getHeaders()
            });
            const data = await response.json();
            console.log('✅ Подключение к API:', data.status);
            return data;
        } catch (error) {
            console.error('❌ Ошибка подключения к API:', error);
            return { status: 'error', error: error.message };
        }
    }
}

// Экспортируем глобальный экземпляр API
window.MarsGameAPI = MarsGameAPI;
window.gameAPI = new MarsGameAPI();
