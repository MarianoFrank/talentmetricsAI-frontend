import { useState, useCallback } from 'react';

export const useLazyTable = ({ defaultSortField = 'id', defaultSortOrder = 1, defaultRows = 20 } = {}) => {
    const [totalRecords, setTotalRecords] = useState(0);
    const [lazyParams, setLazyParams] = useState({
        first: 0,
        rows: defaultRows,
        page: 0,
        sortField: defaultSortField,
        sortOrder: defaultSortOrder
    });

    const onPage = useCallback((e) => {
        setLazyParams(prev => ({ ...prev, first: e.first, rows: e.rows, page: e.page }));
    }, []);

    const onSort = useCallback((e) => {
        setLazyParams(prev => ({ ...prev, sortField: e.sortField, sortOrder: e.sortOrder }));
    }, []);

    // Ideal para cuando el usuario hace clic en "Buscar" y querés volver a la página 1
    const resetPagination = useCallback(() => {
        setLazyParams(prev => ({ ...prev, first: 0, page: 0 }));
    }, []);

    return {
        lazyParams,
        setLazyParams,
        totalRecords,
        setTotalRecords,
        onPage,
        onSort,
        resetPagination
    };
};
