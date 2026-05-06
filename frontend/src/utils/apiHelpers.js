/**
 * Приводит ответ сервера к массиву объектов.
 * Поддерживает форматы:
 * - массив напрямую
 * - объект с полем movies / items / data / genres и т.п.
 * - объект с пагинацией (items, data)
 */
export const normalizeArrayResponse = (data, possibleKeys = ['movies', 'items', 'data', 'genres', 'words']) => {
    if (Array.isArray(data)) return data;

    for (const key of possibleKeys) {
        if (data && Array.isArray(data[key])) {
            return data[key];
        }
    }

    // Если ничего не подошло, возвращаем пустой массив
    console.warn('normalizeArrayResponse: не удалось извлечь массив из:', data);
    return [];
};

/**
 * Безопасное выполнение промиса с возвратом значения по умолчанию в случае ошибки.
 */
export const safePromise = (promise, defaultValue = []) => {
    return promise
        .then(res => res.data)
        .catch(err => {
            console.warn('safePromise error:', err);
            return defaultValue;
        });
};