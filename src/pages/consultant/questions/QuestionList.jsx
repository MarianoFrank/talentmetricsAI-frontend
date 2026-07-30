import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { useMountEffect } from 'primereact/hooks';
import { tmApi } from '../../../config/api';
import { useAppToast } from '../../../context/ToastContext.jsx';
import { useLazyTable } from '../../../hooks/useLazyTables.js';

const QuestionList = () => {
    // --- Contextos y Enrutamiento ---
    const { showError } = useAppToast();
    const navigate = useNavigate();

    // --- Estados de Datos y Carga ---
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [competenciasList, setCompetenciasList] = useState([]);
    const [factoresList, setFactoresList] = useState([]);

    // --- Hook de Paginación y Ordenamiento perezoso ---
    const tableState = useLazyTable({ defaultSortField: 'name' });

    // --- Estados de Filtros ---
    const [filters, setFilters] = useState({
        competencyId: null,
        factorId: null,
        questionName: ''
    });

    // --- Carga Inicial de Competencias ---
    useMountEffect(() => {
        tmApi.get('/api/competencies/select')
            .then(res => setCompetenciasList(res.data))
            .catch(() => showError('No se pudieron cargar las competencias.'));
    });

    // --- Carga de Datos Perezosa (Lazy Load) ---
    const loadLazyData = async () => {
        setLoading(true);
        const sortDirection = tableState.lazyParams.sortOrder === 1 ? 'asc' : 'desc';

        const params = {
            page: tableState.lazyParams.page,
            size: tableState.lazyParams.rows,
            sort: `${tableState.lazyParams.sortField},${sortDirection}`,
            ...(filters.competencyId && { competencyId: filters.competencyId }),
            ...(filters.factorId && { factorId: filters.factorId }),
            ...(filters.questionName && { questionName: filters.questionName })
        };

        try {
            const response = await tmApi.get('/api/questions', { params });
            setQuestions(response.data.content);
            tableState.setTotalRecords(response.data.totalElements);
        } catch (error) {
            showError('Hubo un error al obtener las preguntas.');
        } finally {
            setLoading(false);
        }
    };

    // Sincronización ante cambios en los parámetros del hook de tabla
    useEffect(() => {
        loadLazyData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableState.lazyParams]);

    // --- Manejadores de Eventos y Filtros ---
    const handleCompetencyChange = (e) => {
        const selectedId = e.value;
        setFilters(prev => ({ ...prev, competencyId: selectedId, factorId: null }));
        setFactoresList([]);

        if (selectedId) {
            tmApi.get(`/api/factors/select?competencyId=${selectedId}`)
                .then(res => setFactoresList(res.data))
                .catch(() => showError('No se pudieron cargar los factores.'));
        }
    };

    const handleBuscar = () => {
        tableState.resetPagination();
    };

    const handleClearFilters = () => {
        setFilters({ competencyId: null, factorId: null, questionName: '' });
        handleBuscar();
    };

    // --- Templates para la Tabla ---
    const actionBodyTemplate = () => (
        <div className="flex justify-content-center gap-2">
            <Button size="small" icon="pi pi-pencil" severity="secondary" text rounded tooltip="Modificar" tooltipOptions={{ position: 'top' }} />
            <Button size="small" icon="pi pi-trash" severity="danger" text rounded tooltip="Eliminar" tooltipOptions={{ position: 'top' }} />
        </div>
    );

    return (
        <div className="w-full flex flex-column gap-4 pb-8">

            {/* --- Encabezado --- */}
            <div className="flex flex-column sm:flex-row align-items-start sm:align-items-center justify-content-between gap-3 mb-2">
                <div className="flex align-items-center gap-3">
                    <i className="pi pi-list text-3xl text-primary"></i>
                    <div>
                        <h1 className="m-0 text-2xl font-bold text-color">Banco de Preguntas</h1>
                        <p className="m-0 mt-1 text-sm text-color-secondary">Gestioná las preguntas para las evaluaciones</p>
                    </div>
                </div>
                <Button label="Crear Pregunta" icon="pi pi-plus" onClick={() => navigate('/questions/new')} />
            </div>

            {/* --- Contenedor Principal --- */}
            <div className="surface-card border-1 surface-border border-round overflow-hidden flex flex-column">

                {/* Filtros Integrados */}
                <div className="p-4 border-bottom-1 surface-border flex flex-column md:flex-row gap-3 align-items-end">
                    <div className="flex flex-column flex-1 gap-2">
                        <label className="font-medium text-sm text-color-secondary">Competencia</label>
                        <Dropdown
                            value={filters.competencyId}
                            options={competenciasList}
                            onChange={handleCompetencyChange}
                            optionLabel="nombre"
                            optionValue="id"
                            placeholder="Seleccione competencia"
                            className="w-full"
                        />
                    </div>
                    <div className="flex flex-column flex-1 gap-2">
                        <label className="font-medium text-sm text-color-secondary">Factor</label>
                        <Dropdown
                            value={filters.factorId}
                            options={factoresList}
                            onChange={(e) => setFilters(prev => ({ ...prev, factorId: e.value }))}
                            optionLabel="nombre"
                            optionValue="id"
                            placeholder="Seleccione un factor"
                            disabled={!filters.competencyId}
                            className="w-full"
                        />
                    </div>
                    <div className="flex flex-column flex-1 gap-2">
                        <label className="font-medium text-sm text-color-secondary">Nombre de pregunta</label>
                        <InputText
                            value={filters.questionName}
                            onChange={(e) => setFilters(prev => ({ ...prev, questionName: e.target.value }))}
                            onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
                            placeholder="Ej. Nivel de adaptabilidad..."
                            className="w-full"
                        />
                    </div>
                    <Button label="Buscar" icon="pi pi-search" onClick={handleBuscar} className="w-full md:w-auto" />
                    <Button
                        label="Limpiar"
                        icon="pi pi-filter-slash"
                        severity="secondary"
                        outlined
                        onClick={handleClearFilters}
                    />
                </div>

                {/* Tabla de Resultados */}
                <DataTable
                    value={questions}
                    lazy
                    paginator
                    first={tableState.lazyParams.first}
                    rows={tableState.lazyParams.rows}
                    totalRecords={tableState.totalRecords}
                    onPage={tableState.onPage}
                    onSort={tableState.onSort}
                    sortField={tableState.lazyParams.sortField}
                    sortOrder={tableState.lazyParams.sortOrder}
                    loading={loading}
                    emptyMessage="No se encontraron preguntas con estos filtros."
                    size="small"
                    rowHover
                    stripedRows
                >
                    <Column field="competencyName" header="Competencia" sortable sortField="factor.competency.name" />
                    <Column field="factorName" header="Factor" sortable sortField="factor.name" />
                    <Column field="questionName" header="Pregunta" sortable sortField="name" className="font-semibold" />
                    <Column field="updatedAt" header="Última Modif." sortable sortField="updatedAt" className="text-color-secondary text-sm" />
                    <Column header="Acciones" body={actionBodyTemplate} align="center" />
                </DataTable>
            </div>
        </div>
    );
};

export default QuestionList;
