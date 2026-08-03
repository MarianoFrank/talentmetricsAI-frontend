import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { useMountEffect } from 'primereact/hooks';
import { tmApi } from '../../../config/api';
import { useAppToast } from '../../../context/ToastContext.jsx';
import { useLazyTable } from '../../../hooks/useLazyTables.js'; // Reutilizamos tu hook[cite: 13]

const MeritOrderList = () => {
    const { showError } = useAppToast();
    const navigate = useNavigate();

    // --- Estados Principales ---
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [companiesList, setCompaniesList] = useState([]);

    // --- Estados del Modal ---
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [evaluations, setEvaluations] = useState([]);
    const [selectedEvaluation, setSelectedEvaluation] = useState(null);
    const [loadingEvaluations, setLoadingEvaluations] = useState(false);

    // --- Paginación Perezosa ---
    const tableState = useLazyTable({ defaultSortField: 'id' });

    // --- Filtros ---
    const [filters, setFilters] = useState({
        companyId: null,
        positionName: '',
        code: ''
    });

    // --- Carga Inicial ---
    useMountEffect(() => {
        // Asumo que tenés un endpoint de empresas similar al de competencias[cite: 13]
        tmApi.get('/api/companies/select')
            .then(res => setCompaniesList(res.data))
            .catch(() => showError('No se pudieron cargar las empresas.'));
    });

    // --- Fetch de la Tabla ---
    const loadLazyData = async () => {
        setLoading(true);
        const params = {
            page: tableState.lazyParams.page,
            size: tableState.lazyParams.rows,
            ...(filters.companyId && { companyId: filters.companyId }),
            ...(filters.positionName && { positionName: filters.positionName }),
            ...(filters.code && { code: filters.code })
        };

        try {
            // Le pegamos al endpoint que armamos en el ReportController[cite: 11]
            const response = await tmApi.get('/api/reports/merit-order/positions', { params });
            setPositions(response.data.content);
            tableState.setTotalRecords(response.data.totalElements);
        } catch (error) {
            showError('Hubo un error al obtener los puestos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLazyData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableState.lazyParams]);

    const handleBuscar = () => tableState.resetPagination();

    // --- Lógica del Modal ---
    const openModal = async (position) => {
        setSelectedPosition(position);
        setSelectedEvaluation(null);
        setModalVisible(true);
        setLoadingEvaluations(true);

        try {
            // Buscamos las evaluaciones específicas de este puesto[cite: 11]
            const response = await tmApi.get(`/api/reports/merit-order/positions/${position.id}/evaluations`);
            setEvaluations(response.data);
        } catch (error) {
            showError('Error al cargar las evaluaciones del puesto.');
        } finally {
            setLoadingEvaluations(false);
        }
    };

    const handleGenerate = () => {
        // Navegamos al reporte pasando el ID de evaluación por query param si existe
        if (selectedEvaluation) {
            navigate(`/reports/merit-order/${selectedPosition.id}?evaluationId=${selectedEvaluation}`);
        } else {
            navigate(`/reports/merit-order/${selectedPosition.id}`); // Significa "Todas"[cite: 11]
        }
    };

    const handleClearFilters = () => {
        setFilters({ companyId: null, positionName: '', code: '' });
        tableState.resetPagination();
    };
    // --- Templates ---
    const actionBodyTemplate = (rowData) => (
        <Button
            label="Emitir orden de mérito"
            size="small"
            outlined
            severity="secondary"
            onClick={() => openModal(rowData)}
        />
    );

    return (
        <div className="w-full flex flex-column gap-4 pb-8">
            <div className="flex align-items-center gap-3 mb-2">
                <div>
                    <h1 className="m-0 text-2xl font-bold text-color">Orden de mérito</h1>
                </div>
            </div>

            <div className="surface-card border-1 surface-border border-round overflow-hidden flex flex-column">
                {/* Filtros Integrados */}
                <div className="p-4 border-bottom-1 surface-border flex flex-column md:flex-row gap-3 align-items-end">
                    <div className="flex flex-column flex-1 gap-2">
                        <label className="font-medium text-sm text-color-secondary">Empresa</label>
                        <Dropdown
                            filter
                            value={filters.companyId}
                            options={companiesList}
                            onChange={(e) => setFilters({ ...filters, companyId: e.value })}
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Seleccione una empresa"
                            className="w-full"
                        />
                    </div>
                    <div className="flex flex-column flex-1 gap-2">
                        <label className="font-medium text-sm text-color-secondary">Puesto</label>
                        <InputText
                            value={filters.positionName}
                            onChange={(e) => setFilters({ ...filters, positionName: e.target.value })}
                            placeholder="Seleccione un puesto" // Mantenemos el placeholder de tu diseño
                            className="w-full"
                        />
                    </div>
                    <div className="flex flex-column flex-1 gap-2">
                        <label className="font-medium text-sm text-color-secondary">Código</label>
                        <InputText
                            value={filters.code}
                            onChange={(e) => setFilters({ ...filters, code: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
                            placeholder="Ingrese el código del puesto"
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

                {/* Tabla de Puestos */}
                <DataTable
                    value={positions}
                    lazy
                    paginator
                    first={tableState.lazyParams.first}
                    rows={tableState.lazyParams.rows}
                    totalRecords={tableState.totalRecords}
                    onPage={tableState.onPage}
                    loading={loading}
                    emptyMessage="No se encontraron puestos."
                    size="small"
                    rowHover
                    stripedRows
                >
                    <Column field="code" header="Código" />
                    <Column field="positionName" header="Nombre del puesto" />
                    <Column field="companyName" header="Empresa" />
                    <Column field="totalCandidates" header="Candidatos" align="center" />
                    <Column field="completedEvaluations" header="Evaluaciones completadas" align="center" />
                    <Column header="Acción" body={actionBodyTemplate} align="center" />
                </DataTable>
            </div>

            {/* Modal de Selección de Evaluación */}
            <Dialog
                header={`Puesto ${selectedPosition?.code || ''}`}
                visible={modalVisible}
                style={{ width: '450px' }}
                onHide={() => setModalVisible(false)}
            >
                <div className="flex flex-column gap-3 pt-2">
                    <label className="font-medium text-color-secondary">Seleccione una o todas las evaluaciones</label>
                    <Dropdown
                        value={selectedEvaluation}
                        options={evaluations}
                        onChange={(e) => setSelectedEvaluation(e.value)}
                        optionLabel="description" // "Fecha - Candidatos: X - Completadas: Y"[cite: 10]
                        optionValue="id"
                        placeholder="Todas" // Opción por defecto[cite: 11]
                        showClear
                        loading={loadingEvaluations}
                        className="w-full"
                    />
                    <div className="flex justify-content-end mt-3">
                        <Button label="Generar" onClick={handleGenerate} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default MeritOrderList;
