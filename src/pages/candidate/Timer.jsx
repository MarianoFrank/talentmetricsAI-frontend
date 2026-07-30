import React, { useState, useEffect } from 'react';
import { Tag } from 'primereact/tag';

export default function Timer({ startedAt, durationMinutes, onTimeUp }) {
    const [timeLeft, setTimeLeft] = useState('--:--');
    const [isCritical, setIsCritical] = useState(false);

    useEffect(() => {
        if (!startedAt || !durationMinutes) return;

        // Convertimos el string que manda Spring Boot a una fecha de Javascript
        const startTime = new Date(startedAt).getTime();
        // Le sumamos los minutos del examen convertidos a milisegundos
        const endTime = startTime + durationMinutes * 60 * 1000;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const difference = endTime - now;

            if (difference <= 0) {
                clearInterval(interval);
                setTimeLeft('00:00');
                if (onTimeUp) onTimeUp(); // Dispara la función cuando se acaba el tiempo
            } else {
                // Matemática pura para sacar minutos y segundos
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);

                // Si faltan 5 minutos o menos, lo marcamos como crítico para pintarlo de rojo
                setIsCritical(minutes < 5);

                // Formateamos a MM:SS rellenando con ceros (ej: 09:05)
                setTimeLeft(
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                );
            }
        }, 1000);

        // Limpiamos el intervalo si el componente se desmonta
        return () => clearInterval(interval);
    }, [startedAt, durationMinutes, onTimeUp]);

    return (
        <Tag
            severity={isCritical ? 'danger' : 'info'}
            icon="pi pi-clock"
            value={timeLeft}
            style={{ fontSize: '1rem', padding: '0.4rem 0.8rem' }}
        />
    );
}
