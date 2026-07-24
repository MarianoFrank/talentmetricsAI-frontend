import React, { useState, useEffect, useRef, useCallback } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Sidebar } from 'primereact/sidebar';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { tmApi } from '../../../config/api';

const GenerateEvaluation = () => {
    const toast = useRef(null);
    const fileInputRef = useRef(null);

    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);
    const [lazyParams, setLazyParams] = useState({
        first: 0, rows: 20, page: 0, sortField: 'candidateNumber', sortOrder: 1
    });

    const [filters, setFilters] = useState({
        firstName: '', lastName: '', candidateNumber: ''
    });

    const [selectedCandidates, setSelectedCandidates] = useState([]);
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);

    // --- ESTADOS PARA LOS MODALES DEL FLUJO (Wireframes CU25-3 al CU25-5) ---
    const [isPositionModalVisible, setIsPositionModalVisible] = useState(false);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const [isExcelModalVisible, setIsExcelModalVisible] = useState(false);

    // Mock visual de puestos (hasta que conectes tu API)
    const mockPositions = [
        {
            id: 1,
            name: 'Desarrollador Backend Senior (Java/Spring)',
            company: 'Tech Solutions Argentina',
            competencies: [
                { name: 'Arquitectura de Software', count: 10 },
                { name: 'Resolución de Problemas', count: 5 },
                { name: 'Trabajo en Equipo', count: 2 }
            ]
        },
        {
            id: 2,
            name: 'Analista Funcional IT',
            company: 'SoftCorp S.A.',
            competencies: [
                { name: 'Modelado UML', count: 8 },
                { name: 'Comunicación Efectiva', count: 6 }
            ]
        }
    ];

    const [selectedPosition, setSelectedPosition] = useState(mockPositions[0]);

    useEffect(() => {
        loadCandidates();
    }, [lazyParams]);

    const loadCandidates = async () => {
        setLoading(true);
        const sortDirection = lazyParams.sortOrder === 1 ? 'asc' : 'desc';

        try {
            const params = {
                page: lazyParams.page,
                size: lazyParams.rows,
                sort: `${lazyParams.sortField},${sortDirection}`,
                ...(filters.firstName && { firstName: filters.firstName }),
                ...(filters.lastName && { lastName: filters.lastName }),
                ...(filters.candidateNumber && { candidateNumber: filters.candidateNumber })
            };

            const response = await tmApi.get('/api/candidates', { params });
            setCandidates(response.data.content);
            setTotalRecords(response.data.totalElements);
        } catch (error) {
            showError("No se pudieron cargar los candidatos.");
        } finally {
            setLoading(false);
        }
    };

    const onPage = useCallback((e) => {
        setLazyParams(prev => ({ ...prev, first: e.first, rows: e.rows, page: e.page }));
    }, []);

    const onSort = useCallback((e) => {
        setLazyParams(prev => ({ ...prev, sortField: e.sortField, sortOrder: e.sortOrder }));
    }, []);

    const handleSearch = () => {
        setLazyParams(prev => ({ ...prev, first: 0, page: 0 }));
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

            showSuccess(`¡Se importaron/actualizaron ${response.data.length} candidatos!`);

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

    const showError = (detail) => toast.current.show({ severity: 'error', summary: 'Error', detail, life: 3000 });
    const showSuccess = (detail) => toast.current.show({ severity: 'success', summary: 'Éxito', detail, life: 3000 });

    return (
        <div className="p-6 max-w-350 mx-auto text-gray-800 bg-[#f8f9fc] min-h-screen pb-24">
            <Toast ref={toast} />

            {/* --- ENCABEZADO --- */}
            <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <i className="pi pi-users text-2xl text-blue-600"></i>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Evaluar Candidatos</h1>
                </div>

                <div>
                    <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                    <Button
                        label="Importar Candidatos"
                        icon="pi pi-upload"
                        className="bg-blue-600 text-white hover:bg-blue-700 border-none px-5 py-2.5 font-semibold rounded-lg shadow-sm transition-transform hover:scale-105"
                        onClick={triggerFileInput}
                    />
                </div>
            </div>

            {/* --- FILTROS --- */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row gap-5 items-end transition-all">
                <div className="flex flex-col flex-1 w-full">
                    <label className="text-sm font-semibold text-gray-600 mb-1.5 ml-1">Nombre</label>
                    <InputText
                        placeholder="Ingrese nombre..."
                        value={filters.firstName}
                        onChange={(e) => setFilters({ ...filters, firstName: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full border-gray-300 rounded-lg"
                    />
                </div>

                <div className="flex flex-col flex-1 w-full">
                    <label className="text-sm font-semibold text-gray-600 mb-1.5 ml-1">Apellido</label>
                    <InputText
                        placeholder="Ingrese apellido..."
                        value={filters.lastName}
                        onChange={(e) => setFilters({ ...filters, lastName: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full border-gray-300 rounded-lg"
                    />
                </div>

                <div className="flex flex-col flex-1 w-full">
                    <label className="text-sm font-semibold text-gray-600 mb-1.5 ml-1">Número Candidato</label>
                    <InputText
                        placeholder="Ingrese número..."
                        value={filters.candidateNumber}
                        onChange={(e) => setFilters({ ...filters, candidateNumber: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full border-gray-300 rounded-lg"
                    />
                </div>

                <Button
                    label="Buscar"
                    icon="pi pi-search"
                    className="w-full md:w-32 bg-blue-600 border-none text-white hover:bg-blue-700 font-semibold h-12 rounded-lg"
                    onClick={handleSearch}
                />
            </div>

            {/* --- TABLA PRINCIPAL A ANCHO COMPLETO --- */}
            <div className="flex flex-col w-full mb-8">
                <div className="flex items-center justify-between mb-3 h-7">
                    <div className="flex items-center gap-2">
                        <i className="pi pi-search text-lg text-blue-600"></i>
                        <h2 className="text-lg font-bold text-gray-900">Resultados de Búsqueda</h2>
                    </div>
                    <span className="text-sm text-gray-500 font-medium">
                        Seleccioná los candidatos que formarán parte de la evaluación
                    </span>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <DataTable
                        value={candidates}
                        dataKey="id"
                        selection={selectedCandidates}
                        onSelectionChange={(e) => setSelectedCandidates(e.value)}
                        lazy paginator first={lazyParams.first} rows={lazyParams.rows}
                        totalRecords={totalRecords} onPage={onPage} onSort={onSort} loading={loading}
                        sortField={lazyParams.sortField} sortOrder={lazyParams.sortOrder}
                        emptyMessage="No se encontraron candidatos."
                        className="p-datatable-sm"
                        stripedRows rowHover
                        size="small"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                        <Column field="firstName" header="Nombre" sortable sortField="firstName" className="text-gray-900 font-medium py-3" />
                        <Column field="lastName" header="Apellido" sortable sortField="lastName" className="text-gray-900 font-medium py-3" />
                        <Column field="candidateNumber" header="Nro. de Candidato" sortable sortField="candidateNumber" className="text-gray-700 py-3" />
                    </DataTable>
                </div>
            </div>

            {/* --- BARRA FLOTANTE DE SELECCIÓN --- */}
            {selectedCandidates.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md text-white py-4 px-8 shadow-2xl z-50 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800 transition-all animate-fade-in">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-500/20 text-green-400 p-2 rounded-xl border border-green-500/30">
                            <i className="pi pi-check-square text-xl"></i>
                        </div>
                        <div>
                            <span className="font-bold text-lg">{selectedCandidates.length}</span>
                            <span className="text-slate-300 ml-1.5">candidatos seleccionados para la evaluación</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        <Button
                            label="Ver lista seleccionada"
                            icon="pi pi-list"
                            className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
                            onClick={() => setIsSidebarVisible(true)}
                        />
                        <Button
                            label="Limpiar"
                            icon="pi pi-trash"
                            className="p-button-text text-slate-400 hover:text-red-400 hover:bg-slate-800 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
                            onClick={() => setSelectedCandidates([])}
                        />
                        <Button
                            label="Siguiente: Seleccionar Puesto"
                            icon="pi pi-arrow-right"
                            iconPos="right"
                            className="bg-blue-600 hover:bg-blue-700 text-white border-none px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/30 transition-all"
                            onClick={() => setIsPositionModalVisible(true)}
                        />
                    </div>
                </div>
            )}

            {/* --- PANEL LATERAL (DRAWER) --- */}
            <Sidebar
                visible={isSidebarVisible}
                position="right"
                onHide={() => setIsSidebarVisible(false)}
                className="w-full md:w-112.5 p-0 shadow-2xl"
                header={
                    <div className="flex items-center gap-2 font-bold text-xl text-gray-900">
                        <i className="pi pi-check-square text-green-600 text-2xl"></i>
                        <span>Seleccionados ({selectedCandidates.length})</span>
                    </div>
                }
            >
                <div className="flex flex-col h-full pt-2">
                    <p className="text-sm text-gray-500 mb-4">
                        Revisá la lista de postulantes elegidos. Podés quitar individualmente a los que desees.
                    </p>

                    <div className="flex-1 overflow-y-auto max-h-[calc(100vh-220px)] border border-gray-200 rounded-xl shadow-sm bg-white divide-y divide-gray-100 pr-1">
                        {selectedCandidates.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm">
                                No hay candidatos seleccionados.
                            </div>
                        ) : (
                            selectedCandidates.map((c) => (
                                <div key={c.id} className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-900 text-sm">
                                            {c.firstName} {c.lastName}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            Nro: <span className="font-medium text-gray-700">{c.candidateNumber}</span>
                                        </span>
                                    </div>
                                    <Button
                                        label="Quitar"
                                        className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 h-7 px-2.5 text-xs font-semibold rounded-md shadow-none transition-all"
                                        onClick={() => handleRemoveCandidate(c.id)}
                                    />
                                </div>
                            ))
                        )}
                    </div>

                    <div className="pt-4 mt-4 border-t border-gray-100 flex justify-end">
                        <Button
                            label="Cerrar"
                            className="bg-blue-600 hover:bg-blue-700 text-white border-none px-6 py-2.5 rounded-xl font-bold w-full shadow-md"
                            onClick={() => setIsSidebarVisible(false)}
                        />
                    </div>
                </div>
            </Sidebar>

            {/* ========================================================================= */}
            {/* --- MODAL 1: SELECCIONAR PUESTO (Basado en wireframe CU25-3) --- */}
            {/* ========================================================================= */}
            <Dialog
                header={
                    <div className="flex items-center gap-2 font-bold text-xl text-gray-900">
                        <i className="pi pi-briefcase text-blue-600 text-xl"></i>
                        <span>Seleccionar Puesto para la Evaluación</span>
                    </div>
                }
                visible={isPositionModalVisible}
                style={{ width: '90vw', maxWidth: '550px' }}
                onHide={() => setIsPositionModalVisible(false)}
                className="p-fluid rounded-2xl"
                footer={
                    <div className="flex justify-end gap-3 pt-3">
                        <Button
                            label="Cancelar"
                            className="p-button-text text-gray-600"
                            onClick={() => setIsPositionModalVisible(false)}
                        />
                        <Button
                            label="Siguiente"
                            icon="pi pi-arrow-right"
                            iconPos="right"
                            className="bg-blue-600 hover:bg-blue-700 text-white border-none px-6 py-2.5 rounded-xl font-bold shadow-md"
                            onClick={() => {
                                setIsPositionModalVisible(false);
                                setIsConfirmModalVisible(true);
                            }}
                        />
                    </div>
                }
            >
                <div className="pt-2 flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-700">Puesto</label>
                        <Dropdown
                            value={selectedPosition}
                            options={mockPositions}
                            onChange={(e) => setSelectedPosition(e.value)}
                            optionLabel="name"
                            placeholder="Seleccioná un puesto..."
                            className="w-full border-gray-300 rounded-lg"
                        />
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 flex flex-col gap-2">
                        <span className="text-sm font-bold text-gray-800">
                            Empresa: <span className="font-normal text-gray-600">{selectedPosition?.company}</span>
                        </span>

                        <div className="mt-1">
                            <span className="text-sm font-bold text-gray-800 block mb-1.5">Competencias requeridas:</span>
                            <ul className="list-disc list-inside text-sm text-gray-600 flex flex-col gap-1 pl-1">
                                {selectedPosition?.competencies.map((comp, idx) => (
                                    <li key={idx}>
                                        <span className="font-medium text-gray-800">{comp.name}</span> ({comp.count})
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </Dialog>

            {/* ========================================================================= */}
            {/* --- MODAL 2: CONFIRMACIÓN DE CANDIDATOS (Basado en wireframe CU25-4) --- */}
            {/* ========================================================================= */}
            <Dialog
                header={
                    <div className="flex items-center gap-2 font-bold text-xl text-gray-900">
                        <i className="pi pi-check-circle text-green-600 text-xl"></i>
                        <span>Candidatos Seleccionados para: {selectedPosition?.name}</span>
                    </div>
                }
                visible={isConfirmModalVisible}
                style={{ width: '90vw', maxWidth: '700px' }}
                onHide={() => setIsConfirmModalVisible(false)}
                className="p-fluid rounded-2xl"
                footer={
                    <div className="flex justify-end gap-3 pt-3">
                        <Button
                            label="Volver"
                            className="p-button-text text-gray-600"
                            onClick={() => {
                                setIsConfirmModalVisible(false);
                                setIsPositionModalVisible(true);
                            }}
                        />
                        <Button
                            label="Finalizar"
                            icon="pi pi-check"
                            className="bg-green-600 hover:bg-green-700 text-white border-none px-6 py-2.5 rounded-xl font-bold shadow-md"
                            onClick={() => {
                                setIsConfirmModalVisible(false);
                                setIsExcelModalVisible(true);
                            }}
                        />
                    </div>
                }
            >
                <div className="pt-2 flex flex-col gap-4">
                    <p className="text-sm text-gray-500">
                        Verificá el listado final de postulantes antes de generar la evaluación definitiva.
                    </p>

                    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white max-h-87.5 overflow-y-auto">
                        <DataTable
                            value={selectedCandidates}
                            dataKey="id"
                            className="p-datatable-sm"
                            stripedRows
                            size="small"
                        >
                            <Column field="firstName" header="Nombre" className="text-gray-900 font-medium py-2.5" />
                            <Column field="lastName" header="Apellido" className="text-gray-900 font-medium py-2.5" />
                            <Column field="candidateNumber" header="Número Candidato" className="text-gray-700 py-2.5" />
                        </DataTable>
                    </div>
                </div>
            </Dialog>

            {/* ========================================================================= */}
            {/* --- MODAL 3: EXPORTAR A EXCEL (Basado en wireframe CU25-5) --- */}
            {/* ========================================================================= */}
            <Dialog
                header={
                    <div className="flex items-center gap-2 font-bold text-lg text-gray-900">
                        <i className="pi pi-file-excel text-green-600 text-xl"></i>
                        <span>Confirmación de Generación</span>
                    </div>
                }
                visible={isExcelModalVisible}
                style={{ width: '90vw', maxWidth: '450px' }}
                onHide={() => setIsExcelModalVisible(false)}
                className="p-fluid rounded-2xl"
            >
                <div className="pt-3 pb-2 flex flex-col gap-6 text-center">
                    <p className="text-base text-gray-700 font-medium leading-relaxed">
                        ¿Desea exportar la lista de candidatos con sus claves a un archivo excel?
                    </p>

                    <div className="flex justify-center gap-3 pt-2">
                        <Button
                            label="No"
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 border-none px-6 py-2.5 rounded-xl font-bold shadow-sm transition-all w-32"
                            onClick={() => {
                                setIsExcelModalVisible(false);
                                showSuccess("¡Evaluación generada con éxito!");
                                setSelectedCandidates([]);
                            }}
                        />
                        <Button
                            label="Sí"
                            className="bg-blue-600 hover:bg-blue-700 text-white border-none px-6 py-2.5 rounded-xl font-bold shadow-sm transition-all w-32"
                            onClick={() => {
                                setIsExcelModalVisible(false);
                                showSuccess("¡Evaluación generada y archivo Excel descargado con éxito!");
                                setSelectedCandidates([]);
                            }}
                        />
                    </div>
                </div>
            </Dialog>

        </div>
    );
};

export default GenerateEvaluation;
