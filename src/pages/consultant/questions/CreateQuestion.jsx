import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useMountEffect } from 'primereact/hooks';
import { tmApi } from '../../../config/api';
import { useAppToast } from '../../../context/ToastContext.jsx';

const CreateQuestion = () => {
    const { showSuccess, showError } = useAppToast();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        competencyId: null,
        factorId: null,
        name: '',
        description: '',
        text: '',
        type: 'SINGLE_CHOICE',
        options: []
    });

    const [newOptionText, setNewOptionText] = useState('');

    const [isAiModalVisible, setIsAiModalVisible] = useState(false);
    const [extraContext, setExtraContext] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const [competenciasList, setCompetenciasList] = useState([]);
    const [factoresList, setFactoresList] = useState([]);

    const questionTypes = [
        { label: 'SingleChoice', value: 'SINGLE_CHOICE' },
        { label: 'MultipleChoice', value: 'MULTIPLE_CHOICE' }
    ];

    useMountEffect(() => {
        tmApi.get('/api/competencies/select')
            .then(res => setCompetenciasList(res.data))
            .catch(() => showError('No se pudieron cargar las competencias.'));
    });

    const handleCompetencyChange = (e) => {
        const selectedId = e.value;
        setFormData(prev => ({ ...prev, competencyId: selectedId, factorId: null }));
        setFactoresList([]);

        if (selectedId) {
            tmApi.get(`/api/factors/select?competencyId=${selectedId}`)
                .then(res => setFactoresList(res.data))
                .catch(() => showError('No se pudieron cargar los factores.'));
        }
    };

    // --- MANEJO DE OPCIONES ---
    const handleAddOption = () => {
        if (!newOptionText.trim()) return;
        setFormData(prev => ({
            ...prev,
            options: [...prev.options, { text: newOptionText, weight: 0 }]
        }));
        setNewOptionText('');
    };

    const handleRemoveOption = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            options: prev.options.filter((_, idx) => idx !== indexToRemove)
        }));
    };

    const handleWeightChange = (index, newWeight) => {
        setFormData(prev => {
            const updatedOptions = [...prev.options];
            updatedOptions[index].weight = newWeight;
            return { ...prev, options: updatedOptions };
        });
    };

    const handleOptionTextChange = (index, newText) => {
        setFormData(prev => {
            const updatedOptions = [...prev.options];
            updatedOptions[index].text = newText;
            return { ...prev, options: updatedOptions };
        });
    };

    // --- GUARDADO MANUAL ---
    const handleSubmit = async () => {
        if (!formData.factorId) return showError('Debes seleccionar un factor.');
        if (!formData.name.trim()) return showError('El nombre es obligatorio.');
        if (!formData.text.trim()) return showError('La pregunta es obligatoria.');
        if (formData.options.length < 2) return showError('Debes agregar al menos 2 opciones de respuesta.');

        const payload = {
            factorId: formData.factorId,
            name: formData.name,
            description: formData.description,
            text: formData.text,
            type: formData.type,
            options: formData.options.map((opt, idx) => ({
                displayOrder: idx + 1,
                weight: opt.weight || 0,
                text: opt.text
            }))
        };

        try {
            await tmApi.post('/api/questions', payload);
            showSuccess('¡Pregunta creada con éxito!');
            setTimeout(() => navigate(-1), 1500);
        } catch (error) {
            showError('Hubo un error al guardar la pregunta.');
        }
    };

    // --- GENERACIÓN CON IA ---
    const handleGenerateWithAI = async () => {
        const comp = competenciasList.find(c => c.id === formData.competencyId);
        const fact = factoresList.find(f => f.id === formData.factorId);

        if (!comp || !fact) return showError("Seleccioná una competencia y un factor primero.");

        setIsGenerating(true);
        try {
            const payload = {
                competencyName: comp.nombre,
                factorName: fact.nombre,
                questionName: formData.name,
                description: formData.description,
                extraContext: extraContext
            };

            const response = await tmApi.post('/api/ai/generate-question', payload);

            setFormData(prev => ({
                ...prev,
                name: response.data.questionName || prev.name,
                description: response.data.description || prev.description,
                type: response.data.type || prev.type,
                text: response.data.text,
                options: response.data.options
            }));

            showSuccess("¡Pregunta generada con éxito!");
            setIsAiModalVisible(false);
            setExtraContext('');
        } catch (error) {
            showError("Hubo un error al conectar con la Inteligencia Artificial.");
        } finally {
            setIsGenerating(false);
        }
    };

    const aiModalFooter = (
        <div className="flex justify-content-end gap-2 pt-3 border-top-1 surface-border mt-3">
            <Button label="Cancelar" icon="pi pi-times" severity="secondary" text onClick={() => setIsAiModalVisible(false)} disabled={isGenerating} />
            <Button label={isGenerating ? "Generando..." : "Generar IA"} icon="pi pi-sparkles" loading={isGenerating} onClick={handleGenerateWithAI} autoFocus />
        </div>
    );

    return (
        <div className="w-full flex flex-column gap-4 pb-8">

            <div className="flex align-items-center gap-3 mb-2">
                <i className="pi pi-plus-circle text-3xl text-primary"></i>
                <div>
                    <h1 className="m-0 text-2xl font-bold text-color">Crear Pregunta</h1>
                    <p className="m-0 mt-1 text-sm text-color-secondary">Añadí un nuevo escenario al banco de evaluación</p>
                </div>
            </div>

            {/* Formulario Principal */}
            <div className="surface-card border-1 surface-border border-round p-5 flex flex-column gap-4">

                <div className="formgrid grid">
                    <div className="field col-12 md:col-6 flex flex-column gap-2">
                        <label className="font-semibold text-sm text-color-secondary">Competencia</label>
                        <Dropdown value={formData.competencyId} options={competenciasList} onChange={handleCompetencyChange} optionLabel="nombre" optionValue="id" placeholder="Seleccione una competencia" className="w-full" />
                    </div>
                    <div className="field col-12 md:col-6 flex flex-column gap-2">
                        <label className="font-semibold text-sm text-color-secondary">Factor</label>
                        <Dropdown value={formData.factorId} options={factoresList} onChange={(e) => setFormData(prev => ({ ...prev, factorId: e.value }))} optionLabel="nombre" optionValue="id" placeholder="Seleccione un factor" disabled={!formData.competencyId} className="w-full" />
                    </div>
                </div>

                <div className="flex flex-column gap-2">
                    <label className="font-semibold text-sm text-color-secondary">Nombre de la pregunta</label>
                    <InputText value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Ej. Resolución problema N+1" className="w-full" />
                </div>

                <div className="flex flex-column gap-2">
                    <label className="font-semibold text-sm text-color-secondary">Descripción (opcional)</label>
                    <InputTextarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Describa el objetivo de la pregunta..." rows={2} className="w-full resize-none" autoResize />
                </div>

                <div className="flex flex-column gap-2">
                    <label className="font-semibold text-sm text-color-secondary">Texto de la Pregunta</label>
                    <div className="flex flex-column sm:flex-row gap-3 align-items-start">
                        <InputTextarea value={formData.text} onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))} placeholder="Ingrese la pregunta detallada..." className="w-full flex-1 resize-none" autoResize rows={2} />
                        <Button label="Asistir con IA" icon="pi pi-sparkles" severity="info" outlined className="white-space-nowrap" onClick={() => { (!formData.competencyId || !formData.factorId) ? showError("Elegí una competencia y un factor primero.") : setIsAiModalVisible(true) }} />
                    </div>
                </div>

                <div className="flex flex-column gap-2 mb-2">
                    <label className="font-semibold text-sm text-color-secondary">Tipo de Respuesta</label>
                    <Dropdown value={formData.type} options={questionTypes} onChange={(e) => setFormData(prev => ({ ...prev, type: e.value }))} placeholder="Seleccione un tipo" className="w-full md:w-20rem" />
                </div>


                {/* --- ZONA DE OPCIONES REFACTORIZADA ESTÉTICAMENTE --- */}
                <div className="flex flex-column gap-3">
                    <label className="font-semibold text-sm text-color-secondary">Opciones de Respuesta (Arrastrá de las rayitas para ordenar)</label>

                    {/* Todo va adentro del mismo contenedor con borde para que se vea como una sola pieza */}
                    <div className="border-1 surface-border border-round overflow-hidden flex flex-column">
                        <DataTable
                            showHeaders={false}
                            className="shadow-none border-none"
                            value={formData.options}
                            reorderableRows
                            onRowReorder={(e) => setFormData(prev => ({ ...prev, options: e.value }))}
                            emptyMessage={<div className="p-4 text-center text-color-secondary">Todavía no agregaste ninguna opción.</div>}
                            className="p-datatable-sm" // ACHICAMOS LAS FILAS ACÁ

                        >
                            <Column rowReorder style={{ width: '3rem', textAlign: 'center' }} />

                            <Column body={(rowData, props) => <span className="font-medium text-color-secondary">{props.rowIndex + 1}.</span>} style={{ width: '3rem' }} />

                            <Column body={(rowData, props) => (
                                // Le devolvimos el borde al Input para que se entienda que es un campo
                                <InputText
                                    value={rowData.text}
                                    onChange={(e) => handleOptionTextChange(props.rowIndex, e.target.value)}
                                    className="w-full"
                                    placeholder="Escribí la opción..."
                                />
                            )} />

                            <Column body={(rowData, props) => (
                                <div className="flex align-items-center justify-content-end gap-2">
                                    <span className="text-xs text-color-secondary font-semibold uppercase tracking-wider">Peso</span>
                                    <InputNumber
                                        value={rowData.weight}
                                        onValueChange={(e) => handleWeightChange(props.rowIndex, e.value)}
                                        showButtons
                                        buttonLayout="horizontal"
                                        decrementButtonClassName="surface-border p-button-text p-button-plain z-0"
                                        incrementButtonClassName="surface-border p-button-text p-button-plain"
                                        incrementButtonIcon="pi pi-plus"
                                        decrementButtonIcon="pi pi-minus"
                                        inputClassName="w-3rem text-center"
                                        min={0}
                                        max={10}
                                    />
                                </div>
                            )} style={{ width: '16rem' }} />

                            <Column body={(rowData, props) => (
                                <Button icon="pi pi-trash" severity="danger" text rounded aria-label="Eliminar" onClick={() => handleRemoveOption(props.rowIndex)} />
                            )} style={{ width: '4rem', textAlign: 'center' }} />
                        </DataTable>

                        {/* Input para agregar nuevas opciones integrado abajo de la tabla */}
                        <div className="surface-ground p-3 surface-border flex flex-column sm:flex-row align-items-center gap-3">
                            <InputText
                                value={newOptionText}
                                onChange={(e) => setNewOptionText(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddOption(); } }}
                                placeholder={`Escribí la opción ${formData.options.length + 1} y presioná Enter...`}
                                className="flex-1 w-full"
                            />
                            <Button label="Agregar" icon="pi pi-plus" severity="secondary" outlined onClick={handleAddOption} className="w-full sm:w-auto" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-content-end gap-3 border-top-1 surface-border pt-4 mt-2">
                    <Button label="Cancelar" icon="pi pi-times" severity="secondary" text onClick={() => navigate('/questions')} />
                    <Button label="Guardar Pregunta" icon="pi pi-check" onClick={handleSubmit} />
                </div>
            </div>

            {/* Modal IA */}
            <Dialog header={<div className="flex align-items-center gap-2"><i className="pi pi-sparkles text-primary text-xl"></i><span>Generar con IA</span></div>} visible={isAiModalVisible} breakpoints={{ '960px': '75vw', '640px': '95vw' }} style={{ width: '45vw' }} footer={aiModalFooter} onHide={() => !isGenerating && setIsAiModalVisible(false)}>
                <div className="pt-2 flex flex-column gap-3">
                    <p className="text-color-secondary text-sm m-0 line-height-3">
                        La IA utilizará el contexto previo (Competencia, Factor, Nombre y Descripción) para proponer una pregunta estructurada.
                    </p>
                    <div className="flex flex-column gap-2">
                        <label className="text-sm font-semibold text-color">Instrucciones Adicionales (Opcional)</label>
                        <InputTextarea value={extraContext} onChange={(e) => setExtraContext(e.target.value)} rows={4} placeholder="Ej: Asegurate de que haya una sola respuesta correcta y penalice la mala práctica..." className="w-full resize-none" disabled={isGenerating} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default CreateQuestion;
