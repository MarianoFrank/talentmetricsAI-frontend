import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- Importamos useNavigate
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { InputNumber } from 'primereact/inputnumber';
import { Dialog } from 'primereact/dialog';
import { tmApi } from '../../../config/api';

const CreateQuestion = () => {
    const toast = useRef(null);
    const navigate = useNavigate(); // <-- Inicializamos el hook

    // --- ESTADOS DEL FORMULARIO ---
    const [competencyId, setCompetencyId] = useState(null);
    const [factorId, setFactorId] = useState(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [text, setText] = useState('');
    const [type, setType] = useState('SINGLE_CHOICE');

    // --- ESTADOS PARA LAS OPCIONES ---
    const [options, setOptions] = useState([]);
    const [newOptionText, setNewOptionText] = useState('');

    // --- ESTADOS PARA LA INTELIGENCIA ARTIFICIAL ---
    const [isAiModalVisible, setIsAiModalVisible] = useState(false);
    const [extraContext, setExtraContext] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // --- REFERENCIAS PARA DRAG AND DROP ---
    const dragItem = useRef();
    const dragOverItem = useRef();

    // --- ESTADOS DE LAS LISTAS ---
    const [competenciasList, setCompetenciasList] = useState([]);
    const [factoresList, setFactoresList] = useState([]);

    const questionTypes = [
        { label: 'SingleChoice', value: 'SINGLE_CHOICE' },
        { label: 'MultipleChoice', value: 'MULTIPLE_CHOICE' }
    ];

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

    // --- LÓGICA DE LAS OPCIONES ---
    const handleAddOption = () => {
        if (!newOptionText.trim()) return;

        setOptions([...options, { text: newOptionText, weight: 0 }]);
        setNewOptionText('');
    };

    const handleRemoveOption = (indexToRemove) => {
        setOptions(options.filter((_, idx) => idx !== indexToRemove));
    };

    const handleWeightChange = (index, newWeight) => {
        const updatedOptions = [...options];
        updatedOptions[index].weight = newWeight;
        setOptions(updatedOptions);
    };

    const handleOptionTextChange = (index, newText) => {
        const updatedOptions = [...options];
        updatedOptions[index].text = newText;
        setOptions(updatedOptions);
    };

    // --- LÓGICA DE DRAG AND DROP ---
    const handleDragStart = (e, index) => { dragItem.current = index; };
    const handleDragEnter = (e, index) => { dragOverItem.current = index; };

    const handleDragEnd = () => {
        if (dragItem.current !== undefined && dragOverItem.current !== undefined) {
            const newOptions = [...options];
            const draggedItemContent = newOptions[dragItem.current];
            newOptions.splice(dragItem.current, 1);
            newOptions.splice(dragOverItem.current, 0, draggedItemContent);
            setOptions(newOptions);
        }
        dragItem.current = null;
        dragOverItem.current = null;
    };

    // --- LÓGICA DE GUARDADO MANUAL ---
    const handleSubmit = async () => {
        if (!factorId) return showError('Debes seleccionar un factor.');
        if (!name.trim()) return showError('El nombre es obligatorio.');
        if (!text.trim()) return showError('La pregunta es obligatoria.');
        if (options.length < 2) return showError('Debes agregar al menos 2 opciones de respuesta.');

        const payload = {
            factorId, name, description, text, type,
            options: options.map((opt, idx) => ({
                displayOrder: idx + 1,
                weight: opt.weight || 0,
                text: opt.text
            }))
        };

        try {
            await tmApi.post('/api/questions', payload);
            showSuccess('¡Pregunta creada con éxito!');

            // Un toquecito de UX: Volvemos a la lista después de guardar con éxito (tras una leve pausa para que vea el cartel verde)
            setTimeout(() => navigate(-1), 1500);
            resetForm();
        } catch (error) {
            console.error(error);
            showError('Hubo un error al guardar la pregunta.');
        }
    };

    const resetForm = () => {
        setName(''); setDescription(''); setText(''); setOptions([]); setNewOptionText('');
    };

    // --- LÓGICA DE IA ---
    const handleGenerateWithAI = async () => {
        const comp = competenciasList.find(c => c.id === competencyId);
        const fact = factoresList.find(f => f.id === factorId);

        if (!comp || !fact) {
            return showError("Seleccioná una competencia y un factor primero.");
        }

        setIsGenerating(true);
        try {
            const payload = {
                competencyName: comp.nombre,
                factorName: fact.nombre,
                questionName: name, // Mandamos lo que haya (vacío o no)
                description: description, // Mandamos lo que haya (vacío o no)
                extraContext: extraContext
            };

            const response = await tmApi.post('/api/ai/generate-question', payload);


            if (response.data.questionName) setName(response.data.questionName);
            if (response.data.description) setDescription(response.data.description);
            if (response.data.type) setType(response.data.type); // Te setea SINGLE_CHOICE o MULTIPLE_CHOICE automático

            setText(response.data.text);
            setOptions(response.data.options);

            showSuccess("¡Pregunta y opciones generadas con éxito!");
            setIsAiModalVisible(false);
            setExtraContext('');

        } catch (error) {
            console.error(error);
            showError("Hubo un error al conectar con la Inteligencia Artificial.");
        } finally {
            setIsGenerating(false);
        }
    };

    const showError = (detail) => toast.current.show({ severity: 'error', summary: 'Error', detail, life: 3000 });
    const showSuccess = (detail) => toast.current.show({ severity: 'success', summary: 'Éxito', detail, life: 3000 });

    const aiModalFooter = (
        <div className="flex justify-end gap-3 mt-4">
            <Button
                label="Cancelar"
                icon="pi pi-times"
                onClick={() => setIsAiModalVisible(false)}
                className="p-button-text text-gray-600"
                disabled={isGenerating}
            />
            <Button
                label={isGenerating ? "Generando..." : "Generar IA"}
                icon="pi pi-sparkles"
                loading={isGenerating} // <-- Esta es la magia nativa de PrimeReact
                onClick={handleGenerateWithAI}
                className="bg-blue-600 hover:bg-blue-700 text-white border-none"
                autoFocus
            />
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto p-8 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-800 relative">
            <Toast ref={toast} />

            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-8">Crear Pregunta</h1>

            {/* Fila 1: Competencia y Factor */}
            <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="flex flex-col flex-1">
                    <label className="text-sm font-semibold text-gray-600 mb-2">Competencia</label>
                    <Dropdown value={competencyId} options={competenciasList} onChange={handleCompetencyChange} optionLabel="nombre" optionValue="id" placeholder="Seleccione una competencia" className="w-full" />
                </div>
                <div className="flex flex-col flex-1">
                    <label className="text-sm font-semibold text-gray-600 mb-2">Factor</label>
                    <Dropdown value={factorId} options={factoresList} onChange={(e) => setFactorId(e.value)} optionLabel="nombre" optionValue="id" placeholder="Seleccione un factor" disabled={!competencyId} className="w-full" />
                </div>
            </div>

            <div className="flex flex-col mb-6">
                <label className="text-sm font-semibold text-gray-600 mb-2">Nombre</label>
                <InputText value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Resolución problema N+1" className="w-full" />
            </div>

            <div className="flex flex-col mb-6">
                <label className="text-sm font-semibold text-gray-600 mb-2">Descripción (opcional)</label>
                <InputTextarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describa el objetivo de la pregunta..." rows={3} className="w-full resize-none" autoResize />
            </div>

            <div className="flex flex-col mb-6">
                <label className="text-sm font-semibold text-gray-600 mb-2">Pregunta</label>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <InputTextarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Ingrese la pregunta detallada..."
                        className="w-full flex-1 resize-none"
                        autoResize
                        rows={2}
                    />
                    <Button
                        label="Generar con IA"
                        icon="pi pi-sparkles"
                        className="bg-blue-600 hover:bg-blue-700 text-white border-none whitespace-nowrap px-5 shadow-sm transition-transform hover:scale-105 h-12"
                        onClick={() => {
                            if (!competencyId || !factorId) {
                                showError("Elegí una competencia y un factor primero para darle contexto a la IA.");
                            } else {
                                setIsAiModalVisible(true);
                            }
                        }}
                    />
                </div>
            </div>

            <div className="flex flex-col mb-6">
                <label className="text-sm font-semibold text-gray-600 mb-2">Tipo de Respuesta</label>
                <Dropdown value={type} options={questionTypes} onChange={(e) => setType(e.value)} placeholder="Seleccione un tipo" className="w-full md:w-1/2" />
            </div>

            {/* --- SECCIÓN DE OPCIONES DRAG & DROP --- */}
            <div className="mb-8">
                <label className="text-sm font-semibold text-gray-600 mb-3 block">Lista de Opciones (Arrastrá para ordenar)</label>

                <div className="flex flex-col gap-3 mb-4">
                    {options.map((opt, index) => (
                        <div key={index} draggable onDragStart={(e) => handleDragStart(e, index)} onDragEnter={(e) => handleDragEnter(e, index)} onDragEnd={handleDragEnd} onDragOver={(e) => e.preventDefault()} className="flex items-start gap-3 bg-gray-50 border border-gray-200 p-3 rounded-xl cursor-move hover:bg-gray-100 hover:shadow-sm transition-all">

                            <i className="pi pi-bars text-gray-400 cursor-grab active:cursor-grabbing text-lg mt-3"></i>
                            <span className="font-bold text-gray-500 w-6 text-center mt-2">{index + 1}.</span>

                            <InputTextarea
                                value={opt.text}
                                onChange={(e) => handleOptionTextChange(index, e.target.value)}
                                className="flex-1 font-medium text-gray-800 bg-transparent border-transparent hover:border-gray-300 focus:border-blue-500 shadow-none p-2 resize-none"
                                autoResize
                                rows={1}
                            />

                            <div className="flex items-center gap-4 mt-1">
                                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                                    <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Peso</label>
                                    <InputNumber value={opt.weight} onValueChange={(e) => handleWeightChange(index, e.value)} className="w-16 h-8" inputClassName="text-center w-full p-1 text-sm font-bold text-blue-600" />
                                </div>
                                <Button icon="pi pi-trash" className="p-button-rounded p-button-text p-button-danger hover:bg-red-50" onClick={() => handleRemoveOption(index)} tooltip="Eliminar" tooltipOptions={{ position: 'top' }} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 p-1 mt-4">
                    <InputTextarea
                        value={newOptionText}
                        onChange={(e) => setNewOptionText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleAddOption();
                            }
                        }}
                        placeholder={`Escribí la opción ${options.length + 1} y presioná Enter (Shift+Enter para salto de línea)...`}
                        className="flex-1 border-dashed border-2 border-gray-300 focus:border-blue-500 focus:ring-0 rounded-xl px-4 py-3 resize-none"
                        autoResize
                        rows={1}
                    />
                    <Button label="Agregar Opción" icon="pi pi-plus" className="bg-blue-600 hover:bg-blue-700 text-white border-none px-6 py-3 rounded-xl shadow-sm h-12" onClick={handleAddOption} />
                </div>
            </div>

            {/* --- FOOTER CON BOTONES CANCELAR Y GUARDAR --- */}
            <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-6 border-t border-gray-100 mt-8">
                {/* BOTÓN CANCELAR */}
                <Button
                    label="Cancelar"
                    icon="pi pi-times"
                    className="p-button-text text-gray-600 hover:bg-gray-50 px-6 py-3 text-lg font-semibold transition-all w-full sm:w-auto"
                    onClick={() => navigate('/questions')} // <-- Volvemos a la lista de preguntas
                />

                {/* BOTÓN GUARDAR */}
                <Button
                    label="Guardar Pregunta"
                    icon="pi pi-check"
                    className="bg-blue-600 hover:bg-blue-700 text-white border-none px-10 py-3 text-lg font-bold shadow-md hover:shadow-lg transition-all w-full sm:w-auto"
                    onClick={handleSubmit}
                />
            </div>

            {/* --- MODAL PARA EL CONTEXTO EXTRA --- */}
            <Dialog
                header={
                    <div className="flex items-center gap-2">
                        <i className="pi pi-sparkles text-blue-600 text-xl"></i>
                        <span className="font-bold text-xl">Generar con Inteligencia Artificial</span>
                    </div>
                }
                visible={isAiModalVisible}
                style={{ width: '90vw', maxWidth: '600px' }}
                footer={aiModalFooter}
                onHide={() => !isGenerating && setIsAiModalVisible(false)}
                className="p-fluid rounded-xl"
            >
                <div className="m-0 pt-2">
                    <p className="text-gray-600 mb-4 text-sm">
                        La IA utilizará la <span className="font-semibold text-gray-800">Competencia</span>, el <span className="font-semibold text-gray-800">Factor</span>, el <span className="font-semibold text-gray-800">Nombre</span> y la <span className="font-semibold text-gray-800">Descripción</span> que completaste para generar la pregunta. Si lo deseás, agregá un contexto extra para refinar las opciones de respuesta.
                    </p>

                    <label className="text-sm font-semibold text-gray-800 mb-2 block">Contexto / Aclaraciones para la IA (Opcional)</label>
                    <InputTextarea
                        value={extraContext}
                        onChange={(e) => setExtraContext(e.target.value)}
                        rows={5}
                        placeholder="Ej: Las opciones incorrectas deben penalizar a quienes elijan FetchType.EAGER. El perfil buscado es Semi-Senior..."
                        className="w-full rounded-xl border-gray-300 focus:border-blue-500 resize-none p-3 shadow-sm"
                        disabled={isGenerating}
                    />
                </div>
            </Dialog>

        </div>
    );
};

export default CreateQuestion;
