import React, { useState, useEffect, useRef, useCallback, useDeferredValue } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Sidebar } from 'primereact/sidebar';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { ProgressBar } from 'primereact/progressbar';
import { tmApi } from '../../config/api.js';
import { useAppToast } from '../../context/ToastContext.jsx';
import { useLazyTable } from '../../hooks/useLazyTables.js';
import * as XLSX from 'xlsx'; // <-- Importamos la librería para el Excel

const GenerateEvaluation = () => {
    // --- Contextos y Referencias ---
    const { showSuccess, showError } = useAppToast();
    const fileInputRef = useRef(null);

    // --- Estados de Datos y Carga ---
    const [candidates, setCandidates] = useState([]);
    const [positionsList, setPositionsList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false); // Carga específica para el botón Finalizar
    const [selectedCandidates, setSelectedCandidates] = useState([]);
    const [generatedKeys, setGeneratedKeys] = useState([]); // Acá guardamos la respuesta del backend

    // --- Hook de Paginación y Ordenamiento perezoso ---
    const tableState = useLazyTable({ defaultSortField: 'candidateNumber' });

    // --- Estados de Filtros Principales ---
    const [filters, setFilters] = useState({
        firstName: '', lastName: '', candidateNumber: ''
    });

    // --- Estados de Modales y Paneles ---
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const [isPositionModalVisible, setIsPositionModalVisible] = useState(false);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const [isExcelModalVisible, setIsExcelModalVisible] = useState(false);

    // Arrancamos en null para que el usuario tenga que seleccionar
    const [selectedPosition, setSelectedPosition] = useState(null);

    // --- Estados para el Buscador del Sidebar ---
    const [sidebarSearch, setSidebarSearch] = useState('');
    const deferredSearch = useDeferredValue(sidebarSearch);

    // ==========================================
    // LÓGICA DE VALIDACIÓN EN TIEMPO REAL
    // ==========================================
    const invalidCompetencies = selectedPosition?.competencies?.filter(c => c.meetsCondition === false) || [];
    const isNextDisabled = !selectedPosition || invalidCompetencies.length > 0;

    // ==========================================
    // CARGA Y GESTIÓN DE DATOS (API)
    // ==========================================

    const loadCandidates = async () => {
        setLoading(true);
        const sortDirection = tableState.lazyParams.sortOrder === 1 ? 'asc' : 'desc';

        try {
            const params = {
                page: tableState.lazyParams.page,
                size: tableState.lazyParams.rows,
                sort: `${tableState.lazyParams.sortField},${sortDirection}`,
                ...(filters.firstName && { firstName: filters.firstName }),
                ...(filters.lastName && { lastName: filters.lastName }),
                ...(filters.candidateNumber && { candidateNumber: filters.candidateNumber })
            };

            const response = await tmApi.get('/api/candidates', { params });
            setCandidates(response.data.content);
            tableState.setTotalRecords(response.data.totalElements);
        } catch (error) {
            showError("No se pudieron cargar los candidatos.");
        } finally {
            setLoading(false);
        }
    };

    const loadPositions = async () => {
        try {
            const response = await tmApi.get('/api/positions/select');
            setPositionsList(response.data);
        } catch (error) {
            showError("Hubo un error al cargar los puestos.");
        }
    };

    useEffect(() => {
        loadCandidates();
        loadPositions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableState.lazyParams]);

    // ==========================================
    // MANEJADORES DE ACCIÓN Y EVENTOS
    // ==========================================

    const handleSearch = () => {
        tableState.resetPagination();
    };

    const handleClearFilters = () => {
        setFilters({ firstName: '', lastName: '', candidateNumber: '' });
        handleSearch();
    };

    const handleRemoveCandidate = useCallback((candidateId) => {
        setSelectedCandidates(prev => prev.filter(c => c.id !== candidateId));
    }, []);

    const triggerFileInput = () => fileInputRef.current.click();

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        try {
            const response = await tmApi.post('/api/candidates/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            showSuccess(`Se importaron/actualizaron ${response.data.length} candidatos.`);

            setSelectedCandidates(prev => {
                const newlyImported = response.data.filter(
                    imported => !prev.some(selected => selected.id === imported.id)
                );
                return [...prev, ...newlyImported];
            });

            loadCandidates();
        } catch (error) {
            showError("Hubo un error al procesar el archivo CSV.");
        } finally {
            setLoading(false);
            event.target.value = null;
        }
    };

    // ==========================================
    // LÓGICA CORE: GENERACIÓN Y DESCARGA
    // ==========================================

    const handleGenerateEvaluation = async () => {
        setIsGenerating(true);
        try {
            // Armamos el body que espera el backend
            const payload = {
                positionId: selectedPosition.id,
                candidateIds: selectedCandidates.map(c => c.id)
            };

            const response = await tmApi.post('/api/evaluations/generate', payload);

            // Guardamos las claves en el estado y abrimos el modal final
            setGeneratedKeys(response.data);
            setIsConfirmModalVisible(false);
            setIsExcelModalVisible(true);

        } catch (error) {
            showError(error.response?.data?.message || "Hubo un error al generar la evaluación.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownloadExcel = () => {
        if (!generatedKeys || generatedKeys.length === 0) return;

        // 1. Mapeamos la data para que las columnas del Excel queden prolijas
        const excelData = generatedKeys.map(k => ({
            "Nro Candidato": k.candidateNumber,
            "Nombre": k.firstName,
            "Apellido": k.lastName,
            "Clave de Acceso": k.accessKey
        }));

        // 2. Armamos la hoja y el libro de cálculo
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Claves de Acceso");

        // 3. Ajustamos el ancho de las columnas para que no quede todo apretado
        worksheet['!cols'] = [
            { wch: 15 }, // Nro Candidato
            { wch: 25 }, // Nombre
            { wch: 25 }, // Apellido
            { wch: 20 }  // Clave de Acceso
        ];

        // 4. Limpiamos caracteres raros del nombre del puesto para el nombre del archivo
        const safePositionName = selectedPosition.name.replace(/[^a-z0-9]/gi, '_');
        const fileName = `Claves_${safePositionName}.xlsx`;

        // 5. ¡A descargar se ha dicho!
        XLSX.writeFile(workbook, fileName);

        // 6. Reseteamos todo para dejar la pantalla limpita
        setIsExcelModalVisible(false);
        showSuccess("Evaluación generada y archivo descargado.");
        resetForm();
    };

    const handleSkipExcel = () => {
        setIsExcelModalVisible(false);
        showSuccess("Evaluación generada con éxito.");
        resetForm();
    };

    const resetForm = () => {
        setSelectedCandidates([]);
        setSelectedPosition(null);
        setGeneratedKeys([]);
    };

    // ==========================================
    // TEMPLATES PARA TABLAS / SIDEBAR
    // ==========================================

    const sidebarActionTemplate = (rowData) => (
        <Button icon="pi pi-times" severity="danger" text rounded aria-label="Quitar" onClick={() => handleRemoveCandidate(rowData.id)} />
    );

    const sidebarCandidateTemplate = (rowData) => (
        <div className="flex flex-column gap-1">
            <span className="font-semibold text-sm">{rowData.firstName} {rowData.lastName}</span>
            <span className="text-xs text-color-secondary">Nro: {rowData.candidateNumber}</span>
        </div>
    );

    // ==========================================
    // RENDERIZADO DEL COMPONENTE
    // ==========================================

    return (
        <div className="w-full flex flex-column gap-4 pb-8">

            {/* --- ENCABEZADO PRINCIPAL --- */}
            <div className="flex flex-column sm:flex-row align-items-start sm:align-items-center justify-content-between gap-3">
                <div className="flex align-items-center gap-3">
                    <i className="pi pi-users text-3xl text-primary"></i>
                    <div>
                        <h1 className="m-0 text-2xl font-bold text-color">Evaluar Candidatos</h1>
                        <p className="m-0 mt-1 text-sm text-color-secondary">Seleccioná los candidatos que formarán parte de la evaluación</p>
                    </div>
                </div>
                <div>
                    <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
                    <Button
                        label={loading ? "Procesando CSV..." : "Importar Candidatos"}
                        icon={loading ? "pi pi-spin pi-spinner" : "pi pi-upload"}
                        onClick={triggerFileInput}
                        disabled={loading}
                    />
                </div>
            </div>

            {loading && <ProgressBar mode="indeterminate" style={{ height: '4px' }} className="w-full mt-2" />}

            {/* --- CONTENEDOR DE LA TABLA Y FILTROS --- */}
            <div className="surface-card border-1 surface-border border-round overflow-hidden flex flex-column">
                <div className="p-4 border-bottom-1 surface-border flex flex-column md:flex-row gap-3 align-items-end">
                    <div className="flex flex-column flex-1 gap-2">
                        <label htmlFor="firstName" className="font-medium text-sm text-color-secondary">Nombre</label>
                        <InputText id="firstName" placeholder="Ingrese nombre..." value={filters.firstName} onChange={(e) => setFilters({ ...filters, firstName: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                    </div>

                    <div className="flex flex-column flex-1 gap-2">
                        <label htmlFor="lastName" className="font-medium text-sm text-color-secondary">Apellido</label>
                        <InputText id="lastName" placeholder="Ingrese apellido..." value={filters.lastName} onChange={(e) => setFilters({ ...filters, lastName: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                    </div>

                    <div className="flex flex-column flex-1 gap-2">
                        <label htmlFor="candidateNumber" className="font-medium text-sm text-color-secondary">Número Candidato</label>
                        <InputText type='number' id="candidateNumber" placeholder="Ingrese número..." value={filters.candidateNumber} onChange={(e) => setFilters({ ...filters, candidateNumber: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                    </div>

                    <Button label="Buscar" icon="pi pi-search" onClick={handleSearch} className="w-full md:w-auto" />
                    <Button label="Limpiar" icon="pi pi-filter-slash" severity="secondary" outlined onClick={handleClearFilters} />
                </div>

                <DataTable
                    value={candidates}
                    dataKey="id"
                    selection={selectedCandidates}
                    onSelectionChange={(e) => setSelectedCandidates(e.value)}
                    lazy
                    paginator
                    first={tableState.lazyParams.first}
                    rows={tableState.lazyParams.rows}
                    totalRecords={tableState.totalRecords}
                    onPage={tableState.onPage}
                    onSort={tableState.onSort}
                    loading={loading}
                    sortField={tableState.lazyParams.sortField}
                    sortOrder={tableState.lazyParams.sortOrder}
                    emptyMessage="No se encontraron candidatos."
                    size="small"
                    rowHover
                    stripedRows
                >
                    <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                    <Column field="candidateNumber" header="Nro. de Candidato" sortable sortField="candidateNumber" className="text-color-secondary" style={{ width: '180px' }} />
                    <Column field="firstName" header="Nombre" sortable sortField="firstName" className="font-medium" />
                    <Column field="lastName" header="Apellido" sortable sortField="lastName" className="font-medium" />
                </DataTable>
            </div>

            {/* --- BARRA FLOTANTE INFERIOR --- */}
            {selectedCandidates.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 glass-card p-toast-message-error py-3 px-4 shadow-3 z-5 flex flex-column sm:flex-row align-items-center justify-content-between gap-3 border-top-1 surface-border fadein">
                    <div className="flex align-items-center gap-3">
                        <Tag severity="success" value={selectedCandidates.length} rounded className="px-3 py-2 " icon="pi pi-check" />
                        <span className="font-medium text-color-secondary">candidatos seleccionados</span>
                    </div>

                    <div className="flex align-items-center gap-2 w-full sm:w-auto justify-content-end">
                        <Button label="Ver lista" icon="pi pi-list" severity="secondary" text onClick={() => setIsSidebarVisible(true)} />
                        <Button label="Limpiar" icon="pi pi-trash" severity="danger" text onClick={() => setSelectedCandidates([])} />
                        <Divider layout="vertical" className="mx-2" />
                        <Button label="Siguiente: Puesto" icon="pi pi-arrow-right" iconPos="right" onClick={() => setIsPositionModalVisible(true)} />
                    </div>
                </div>
            )}

            {/* --- SIDEBAR DE CANDIDATOS SELECCIONADOS --- */}
            <Sidebar
                visible={isSidebarVisible}
                position="right"
                onHide={() => setIsSidebarVisible(false)}
                className="w-full md:w-30rem"
                header={<div className="font-bold text-xl">Seleccionados</div>}
            >
                <div className="flex flex-column h-full pb-3">
                    <p className="text-color-secondary mb-3 text-sm flex-none">
                        Revisá la lista de postulantes elegidos. Podés quitar individualmente a los que desees antes de continuar.
                    </p>

                    <div className="mb-3 flex-none">
                        <IconField iconPosition="left" className="w-full">
                            <InputIcon className="pi pi-search" />
                            <InputText
                                value={sidebarSearch}
                                onChange={(e) => setSidebarSearch(e.target.value)}
                                placeholder="Buscar por nombre, apellido o número..."
                                className="w-full"
                            />
                        </IconField>
                    </div>

                    <div className="border-1 surface-border border-round overflow-hidden">
                        <DataTable
                            value={selectedCandidates.filter(c => {
                                const query = deferredSearch.toLowerCase();
                                const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
                                const numberStr = String(c.candidateNumber || '').toLowerCase();
                                return fullName.includes(query) || numberStr.includes(query);
                            })}
                            dataKey="id"
                            emptyMessage={<div className="p-4 text-center text-color-secondary text-sm">No se encontraron candidatos.</div>}
                            size="small"
                            rowHover
                            className="p-datatable-sm"
                            scrollable
                            scrollHeight="calc(100vh - 290px)"
                            showHeaders={false}
                            virtualScrollerOptions={{ itemSize: 50 }}
                            pt={{ wrapper: { className: 'border-none' } }}
                        >
                            <Column body={sidebarCandidateTemplate} header="Postulante" />
                            <Column body={sidebarActionTemplate} headerStyle={{ width: '4rem' }} bodyStyle={{ textAlign: 'center' }} />
                        </DataTable>
                    </div>

                    <div className="mt-auto pt-3 surface-border flex-none">
                        <Button label="Cerrar panel" severity="secondary" text className="w-full" onClick={() => setIsSidebarVisible(false)} />
                    </div>
                </div>
            </Sidebar>

            {/* --- MODAL 1: SELECCIÓN DE PUESTO --- */}
            <Dialog
                header="Seleccionar Puesto"
                visible={isPositionModalVisible}
                breakpoints={{ '960px': '75vw', '640px': '95vw' }}
                style={{ width: '45vw' }}
                onHide={() => setIsPositionModalVisible(false)}
                footer={
                    <div className="flex justify-content-end gap-2 pt-4 border-top-1 surface-border mt-3">
                        <Button label="Cancelar" severity="secondary" text onClick={() => setIsPositionModalVisible(false)} />
                        <Button
                            label="Siguiente"
                            icon="pi pi-arrow-right"
                            iconPos="right"
                            onClick={() => { setIsPositionModalVisible(false); setIsConfirmModalVisible(true); }}
                            disabled={isNextDisabled}
                        />
                    </div>
                }
            >
                <div className="flex flex-column gap-4 pt-2">
                    <div className="flex flex-column gap-2">
                        <label className="font-semibold text-sm">Puesto a evaluar</label>
                        <Dropdown filter filterPlaceholder='Buscar puesto...' value={selectedPosition} options={positionsList} onChange={(e) => setSelectedPosition(e.value)} optionLabel="name" placeholder="Seleccioná un puesto..." className="w-full" />
                    </div>

                    {selectedPosition && (
                        <div className="p-4 border-round border-1 surface-border">
                            <span className="font-bold text-sm block mb-2">
                                Empresa: <span className="font-normal text-color-secondary">{selectedPosition.company}</span>
                            </span>
                            <span className="font-bold text-sm block mb-3">Competencias requeridas:</span>
                            <div className="flex flex-wrap gap-2">
                                {selectedPosition.competencies.map((comp, idx) => (
                                    <Tag
                                        key={idx}
                                        severity={comp.meetsCondition === false ? "danger" : "secondary"}
                                        value={`${comp.name} (${comp.weightingRequired})`}
                                    />
                                ))}
                            </div>

                            {/* Cartel de advertencia bloqueante */}
                            {invalidCompetencies.length > 0 && (
                                <div className="mt-4 p-3 surface-ground border-round flex flex-column gap-2 border-left-3 border-pink-500 fadein">
                                    <span className="text-pink-500 font-semibold text-sm">
                                        <i className="pi pi-exclamation-triangle mr-2"></i>
                                        Atención: Las siguientes competencias no cumplen las condiciones para ser evaluadas:
                                    </span>
                                    <ul className="m-0 pl-4 text-sm text-color-secondary line-height-3">
                                        {invalidCompetencies.map((comp, idx) => (
                                            <li key={idx}>{comp.name}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Dialog>

            {/* --- MODAL 2: CONFIRMACIÓN DE GENERACIÓN --- */}
            <Dialog
                header="Confirmar Generación"
                visible={isConfirmModalVisible}
                breakpoints={{ '960px': '75vw', '640px': '95vw' }}
                style={{ width: '50vw' }}
                closable={!isGenerating} // Evita que lo cierren por accidente mientras carga
                onHide={() => setIsConfirmModalVisible(false)}
                footer={
                    <div className="flex justify-content-end gap-2 pt-4 border-top-1 surface-border mt-3">
                        <Button label="Atrás" severity="secondary" text disabled={isGenerating} onClick={() => { setIsConfirmModalVisible(false); setIsPositionModalVisible(true); }} />
                        <Button
                            label="Finalizar"
                            icon="pi pi-check"
                            severity="success"
                            loading={isGenerating} // Muestra el spinner copado de PrimeReact
                            onClick={handleGenerateEvaluation}
                        />
                    </div>
                }
            >
                <p className="m-0 mb-4 text-color-secondary">
                    Estás por generar la evaluación de <strong>{selectedPosition?.name}</strong> para {selectedCandidates.length} candidatos.
                </p>

                <div className="border-1 surface-border border-round overflow-hidden">
                    <DataTable
                        value={selectedCandidates}
                        dataKey="id"
                        className="p-datatable-sm"
                        rowHover
                        scrollable
                        scrollHeight="350px"
                        virtualScrollerOptions={{ itemSize: 40 }}
                        pt={{ wrapper: { className: 'border-none' } }}
                    >
                        <Column field="firstName" header="Nombre" className="font-medium" />
                        <Column field="lastName" header="Apellido" className="font-medium" />
                        <Column field="candidateNumber" header="Número Candidato" className="text-color-secondary" />
                    </DataTable>
                </div>
            </Dialog>

            {/* --- MODAL 3: ÉXITO Y DESCARGA EXCEL --- */}
            <Dialog
                visible={isExcelModalVisible}
                breakpoints={{ '960px': '75vw', '640px': '95vw' }}
                style={{ width: '30vw' }}
                onHide={() => setIsExcelModalVisible(false)}
                showHeader={false}
                closable={false} // Lo obligamos a apretar uno de los dos botones
            >
                <div className="flex flex-column align-items-center gap-3 pt-5 pb-2 text-center">
                    <div className="flex align-items-center justify-content-center surface-100 border-circle w-4rem h-4rem mb-2">
                        <i className="pi pi-file-excel text-green-500 text-4xl"></i>
                    </div>
                    <h2 className="m-0 text-xl font-bold text-color">Evaluación Lista</h2>
                    <p className="m-0 text-color-secondary line-height-3 px-3">
                        ¿Deseás descargar la lista de candidatos con sus claves de acceso en un archivo Excel?
                    </p>
                    <div className="flex gap-3 mt-4 w-full">
                        <Button label="No, gracias" severity="secondary" outlined className="flex-1" onClick={handleSkipExcel} />
                        <Button label="Descargar Excel" severity="success" className="flex-1" onClick={handleDownloadExcel} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default GenerateEvaluation;
