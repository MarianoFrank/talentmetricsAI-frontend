import React from 'react';
import { RadioButton } from 'primereact/radiobutton';
import { Checkbox } from 'primereact/checkbox';
import { Divider } from 'primereact/divider';

export default function QuestionBlock({ block, answers, onSelectOption }) {
    if (!block || !block.questionItems) return null;

    return (
        <div className="flex flex-column gap-5">
            {block.questionItems.map((item, index) => {
                const isMultiple = item.multiple;

                // 🛡️ CORRECCIÓN: Usamos item.id en lugar de item.questionItemId
                const currentAnswer = answers[item.id] || (isMultiple ? [] : null);

                const handleCheckboxChange = (optionId) => {
                    let updatedSelection = Array.isArray(currentAnswer) ? [...currentAnswer] : [];

                    if (updatedSelection.includes(optionId)) {
                        updatedSelection = updatedSelection.filter(id => id !== optionId);
                    } else {
                        updatedSelection.push(optionId);
                    }

                    onSelectOption(item.id, updatedSelection); // 👈 Actualizado
                };

                const handleRadioChange = (optionId) => {
                    onSelectOption(item.id, optionId); // 👈 Actualizado
                };

                return (
                    // 🛡️ CORRECCIÓN: key={item.id}
                    <div key={item.id} className="flex flex-column gap-3">
                        <div className="flex align-items-start gap-2">
                            <span className="font-bold text-primary text-lg">{index + 1}.</span>
                            <div>
                                <h3 className="m-0 text-lg font-medium text-color line-height-3">
                                    {item.text}
                                </h3>
                                <span className="text-xs text-color-secondary font-semibold">
                                    {isMultiple ? '☑ Selección múltiple (Podés marcar varias)' : '🔘 Selección única'}
                                </span>
                            </div>
                        </div>

                        {/* Opciones de respuesta */}
                        <div className="flex flex-column gap-2 pl-4">
                            {item.optionItems && item.optionItems.map((optItem) => {

                                const optionId = optItem.id;
                                const optionText = optItem.text;
                                const inputId = `opt-${optItem.id}`;

                                return (

                                    <div key={optItem.id} className="flex align-items-center gap-3 p-2 hover:surface-hover border-round cursor-pointer">
                                        {isMultiple ? (
                                            <Checkbox
                                                inputId={inputId}
                                                name={`question-${item.id}`}
                                                value={optionId}
                                                checked={Array.isArray(currentAnswer) && currentAnswer.includes(optionId)}
                                                onChange={() => handleCheckboxChange(optionId)}
                                            />
                                        ) : (
                                            <RadioButton
                                                inputId={inputId}
                                                name={`question-${item.id}`}
                                                value={optionId}
                                                checked={currentAnswer === optionId}
                                                onChange={() => handleRadioChange(optionId)}
                                            />
                                        )}
                                        <label htmlFor={inputId} className="text-color text-sm cursor-pointer w-full select-none">
                                            {optionText}
                                        </label>
                                    </div>
                                );
                            })}
                        </div>

                        {index < block.questionItems.length - 1 && <Divider className="my-2" />}
                    </div>
                );
            })}
        </div>
    );
}
