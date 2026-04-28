import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { RadioButton } from 'primereact/radiobutton';
import { Checkbox } from 'primereact/checkbox';

const CreateQuestion = () => {
    const [tipoRespuesta, setTipoRespuesta] = useState('SingleChoice');
    const [opciones, setOpciones] = useState([
        { id: 1, texto: 'Opcion 1', correcta: false },
        { id: 2, texto: 'Opcion 2', correcta: false },
        { id: 3, texto: '', correcta: false }
    ]);

    return (
        <div className="">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Crear Pregunta</h1>

            <div className="flex flex-col gap-6">

                {/* 1. Competencia */}
                <div className="flex flex-col gap-2">
                    <label className="font-bold">Competencia</label>
                    <Dropdown placeholder="Seleccione una competencia" className="w-full" size="small" />
                </div>

                {/* 2. Factor */}
                <div className="flex flex-col gap-2">
                    <label className="font-bold">Factor</label>
                    <Dropdown placeholder="Seleccione un factor" className="w-full" size="small" />
                </div>

                {/* 3. Nombre */}
                <div className="flex flex-col gap-2">
                    <label className="font-bold">Nombre</label>
                    <InputText placeholder="Ingrese el nombre de la pregunta" className="w-full" />
                </div>

                {/* 4. Descripción */}
                <div className="flex flex-col gap-2">
                    <label className="font-bold text-gray-500">Descripción (opcional)</label>
                    <InputTextarea placeholder="Describa la pregunta..." rows={2} className="w-full" />
                </div>

                {/* 5. Pregunta */}
                <div className="flex flex-col gap-2">
                    <label className="font-bold">Pregunta</label>
                    <div className="p-inputgroup flex-1">
                        <InputText placeholder="Ingrese la pregunta" />
                        <Button icon="pi pi-sparkles" label="Generar con IA" severity="secondary" />
                    </div>
                </div>

                {/* 6. Opción de Respuesta (Selector de tipo) */}
                <div className="flex flex-col gap-2">
                    <label className="font-bold">Opción de Respuesta</label>
                    <Dropdown
                        value={tipoRespuesta}
                        options={['SingleChoice', 'MultipleChoice']}
                        onChange={(e) => setTipoRespuesta(e.value)}
                        className="w-full"
                    />
                </div>

                {/* 7. Listado de Opciones Dinámico */}
                <div className="bg-gray-50 p-4 border-round-lg">
                    <p className="text-sm text-orange-600 mb-3 italic">
                        {tipoRespuesta === 'SingleChoice'
                            ? 'Recuerde marcar la opcion que es correcta'
                            : 'Recuerde marcar la/s opcion/es correcta/s'}
                    </p>

                    <div className="flex flex-col gap-3">
                        {opciones.map((opt, index) => (
                            <div key={opt.id} className="flex align-items-center gap-3">
                                <span className="font-bold text-gray-400">{index + 1}.</span>
                                {tipoRespuesta === 'SingleChoice' ? (
                                    <RadioButton name="respuesta" value={opt.id} />
                                ) : (
                                    <Checkbox checked={opt.correcta} />
                                )}
                                <InputText
                                    placeholder={opt.texto || `Ingrese opcion ${index + 1}`}
                                    className="flex-1 border-none shadow-none bg-transparent border-b-1 border-300 border-noround"
                                />
                            </div>
                        ))}
                    </div>

                    <Button label="Agregar" icon="pi pi-plus" text className="mt-3 p-0" />
                </div>

                {/* 8. Acción Final */}
                <div className="pt-4">
                    <Button label="Aceptar" className="w-full md:w-32" />
                </div>

            </div>
        </div>
    );
};

export default CreateQuestion;