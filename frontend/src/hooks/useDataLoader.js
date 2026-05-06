// hooks/useDataLoader.js
import { useState, useEffect, useCallback } from 'react';
import { normalizeArrayResponse, safePromise } from '../utils/apiHelpers';

export const useDataLoader = (queries) => {
    const [state, setState] = useState({
        data: {},
        loading: true,
        error: null,
    });

    const executeQueries = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const results = {};

            const independent = queries.filter(q => !q.dependsOn || q.dependsOn.length === 0);
            const dependent = queries.filter(q => q.dependsOn && q.dependsOn.length > 0);

            // Параллельное выполнение независимых запросов
            if (independent.length > 0) {
                const promises = independent.map(q =>
                    safePromise(q.fetcher()).then(data => ({ key: q.key, data, config: q }))
                );
                const settled = await Promise.all(promises);
                for (const { key, data, config } of settled) {
                    let processed = data;
                    if (config.normalize !== false) {
                        processed = normalizeArrayResponse(data, config.normalizeKeys);
                    }
                    if (config.transform) {
                        processed = config.transform(processed, results);
                    }
                    results[key] = processed;
                }
            }

            // Последовательное выполнение зависимых запросов
            for (const q of dependent) {
                const depsReady = q.dependsOn.every(depKey => results.hasOwnProperty(depKey));
                if (!depsReady) {
                    console.warn(`Зависимости для ${q.key} не готовы, пропускаем`);
                    continue;
                }

                let fetcherResult;
                if (q.fetcher.length > 0) {
                    const depValues = q.dependsOn.map(depKey => results[depKey]);
                    fetcherResult = await q.fetcher(...depValues);
                } else {
                    fetcherResult = await q.fetcher();
                }

                let processed = await safePromise(Promise.resolve(fetcherResult));
                if (q.normalize !== false) {
                    processed = normalizeArrayResponse(processed, q.normalizeKeys);
                }
                if (q.transform) {
                    processed = q.transform(processed, results);
                }
                results[q.key] = processed;
            }

            setState({ data: results, loading: false, error: null });
        } catch (err) {
            console.error('useDataLoader error:', err);
            setState({ data: {}, loading: false, error: err.message });
        }
    }, [queries]);

    useEffect(() => {
        executeQueries();
    }, [executeQueries]);

    const refetch = useCallback(() => {
        executeQueries();
    }, [executeQueries]);

    return {
        ...state.data,
        isLoading: state.loading,
        error: state.error,
        refetch,
    };
};