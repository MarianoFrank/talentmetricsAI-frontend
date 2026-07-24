import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { tmApi } from '../../../config/api';

const QuestionList = () => {
    const toast = useRef(null);
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(false);

    // Configurado en 20 registros por página, manteniendo ordenamiento inicial
    const [lazyParams, setLazyParams] = useState({
        first: 0, rows: 20, page: 0, sortField: 'name', sortOrder: 1
    });

    const [competencyId, setCompetencyId] = useState(null);
    const [factorId, setFactorId] = useState(null);
    const [questionName, setQuestionName] = useState('');

    const [competenciasList, setCompetenciasList] = useState([]);
    const [factoresList, setFactoresList] = useState([]);

    useEffect(() => {
        tmApi.get('/api/competencies/select')
            .then(res => setCompetenciasList(res.data))
            .catch(() => showError('No se pudieron cargar las competencias.'));
    }, []);

    const handleCompetencyChange = (e) => {
        const selectedId = e.value;
        setCompetencyId(selectedId);
        setFactorId(null);
        setFactoresList([]);

        if (selectedId) {
            tmApi.get(`/api/factors/select?competencyId=${selectedId}`)
                .then(res => setFactoresList(res.data))
                .catch(() => showError('No se pudieron cargar los factores.'));
        }
    };

    const loadLazyData = async () => {
        setLoading(true);
        const sortDirection = lazyParams.sortOrder === 1 ? 'asc' : 'desc';

        const params = {
            page: lazyParams.page,
            size: lazyParams.rows,
            sort: `${lazyParams.sortField},${sortDirection}`,
            ...(competencyId && { competencyId }),
            ...(factorId && { factorId }),
            ...(questionName && { questionName })
        };

        try {
            const response = await tmApi.get('/api/questions', { params });
            setQuestions(response.data.content);
            setTotalRecords(response.data.totalElements);
        } catch (error) {
            showError('Hubo un error al obtener las preguntas.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLazyData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lazyParams]);

    const showError = (detail) => {
        toast.current.show({ severity: 'error', summary: 'Error', detail, life: 3000 });
    };

    const onPage = (e) => setLazyParams(prev => ({ ...prev, first: e.first, rows: e.rows, page: e.page }));
    const onSort = (e) => setLazyParams(prev => ({ ...prev, sortField: e.sortField, sortOrder: e.sortOrder }));

    const handleBuscar = () => {
        setLazyParams(prev => ({ ...prev, first: 0, page: 0 }));
    };

    // Botones de acción sutiles y refinados al estilo de CreateQuestion / GenerateEvaluation
    const actionBodyTemplate = () => (
        <div className="flex justify-center gap-2">
            <Button
                icon="pi pi-pencil"
                tooltip="Modificar"
                tooltipOptions={{ position: 'top' }}
                className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 h-8 w-8 text-xs font-semibold rounded-md transition-all shadow-none"
            />
            <Button
                icon="pi pi-trash"
                tooltip="Eliminar"
                tooltipOptions={{ position: 'top' }}
                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 h-8 w-8 text-xs font-semibold rounded-md transition-all shadow-none"
            />
        </div>
    );

    return (
        <div className="p-6 max-w-350 mx-auto text-gray-800 bg-[#f8f9fc] min-h-screen">
            <Toast ref={toast} />

            {/* Encabezado */}
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <i className="pi pi-list text-2xl text-blue-600"></i>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Banco de Preguntas</h1>
                </div>

                <Button
                    label="Crear Pregunta"
                    icon="pi pi-plus"
                    className="bg-blue-600 text-white hover:bg-blue-700 border-none px-5 py-2.5 font-semibold rounded-lg shadow-sm transition-transform hover:scale-105"
                    onClick={() => navigate('/questions/new')}
                />
            </div>

            {/* Tarjeta de Filtros */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row gap-5 items-end transition-all">
                <div className="flex flex-col w-full md:w-64">
                    <label className="text-sm font-semibold text-gray-600 mb-1.5 ml-1">Competencia</label>
                    <Dropdown
                        value={competencyId}
                        options={competenciasList}
                        onChange={handleCompetencyChange}
                        optionLabel="nombre"
                        optionValue="id"
                        placeholder="Seleccione competencia"
                        showClear
                        className="w-full border-gray-300 rounded-lg"
                    />
                </div>

                <div className="flex flex-col w-full md:w-64">
                    <label className="text-sm font-semibold text-gray-600 mb-1.5 ml-1">Factor</label>
                    <Dropdown
                        value={factorId}
                        options={factoresList}
                        onChange={(e) => setFactorId(e.value)}
                        optionLabel="nombre"
                        optionValue="id"
                        placeholder="Seleccione un factor"
                        showClear
                        className="w-full border-gray-300 rounded-lg"
                        disabled={!competencyId}
                    />
                </div>

                <div className="flex flex-col flex-1 w-full">
                    <label className="text-sm font-semibold text-gray-600 mb-1.5 ml-1">Nombre de pregunta</label>
                    <InputText
                        value={questionName}
                        onChange={(e) => setQuestionName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
                        placeholder="Ej. Nivel de adaptabilidad..."
                        className="w-full border-gray-300 rounded-lg"
                    />
                </div>

                <Button
                    label="Buscar"
                    icon="pi pi-search"
                    className="w-full md:w-32 bg-blue-600 border-none text-white hover:bg-blue-700 font-semibold h-12 rounded-lg"
                    onClick={handleBuscar}
                />
            </div>

            {/* Tarjeta de la Tabla */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <DataTable
                    value={questions}
                    lazy paginator first={lazyParams.first} rows={lazyParams.rows}
                    totalRecords={totalRecords} onPage={onPage} onSort={onSort}
                    sortField={lazyParams.sortField} sortOrder={lazyParams.sortOrder} loading={loading}
                    emptyMessage="No se encontraron preguntas con estos filtros."
                    className="p-datatable-sm"
                    stripedRows
                    rowHover
                    size="small"
                >
                    <Column field="competencyName" header="Competencia" sortable sortField="factor.competency.name" className="text-gray-900 font-medium py-4" />
                    <Column field="factorName" header="Factor" sortable sortField="factor.name" className="text-gray-700 py-4" />
                    <Column field="questionName" header="Pregunta" sortable sortField="name" className="text-gray-900 font-semibold py-4" />
                    <Column field="updatedAt" header="Última Modif." sortable sortField="updatedAt" className="text-gray-500 text-sm py-4" />
                    <Column header="Acciones" body={actionBodyTemplate} align="center" style={{ width: '130px' }} />
                </DataTable>
            </div>
        </div>
    );
};

export default QuestionList;
