import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { tmApi } from '../../../config/api';
import { useAppToast } from '../../../context/ToastContext.jsx';

// 🚀 Ahora importamos la función 'pdf' para generar on-demand
import { pdf } from '@react-pdf/renderer';
import MeritOrderPDF from './MeritOrderPDF';

const MeritOrderReport = () => {
    const { id: positionId } = useParams();
    const [searchParams] = useSearchParams();
    const evaluationId = searchParams.get('evaluationId');

    const { showError, showSuccess } = useAppToast();
    const navigate = useNavigate();

    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Estado para mostrar el spinner del botón de descarga
    const [isPdfGenerating, setIsPdfGenerating] = useState(false);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const endpoint = evaluationId
                    ? `/api/reports/merit-order/positions/${positionId}?evaluationId=${evaluationId}`
                    : `/api/reports/merit-order/positions/${positionId}`;

                const response = await tmApi.get(endpoint);
                setReportData(response.data);
            } catch (error) {
                showError('Error al generar el orden de mérito. Verifique que la evaluación sea correcta.');
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [positionId, evaluationId]);

    // 👇 Función mágica para generar el PDF al hacer clic
    const handleGeneratePdf = async () => {
        setIsPdfGenerating(true);
        try {
            const doc = <MeritOrderPDF reportData={reportData} />;
            const blob = await pdf(doc).toBlob();
            const url = URL.createObjectURL(blob);

            const safeName = reportData.positionName.replace(/[^a-z0-9]/gi, '_');
            const link = document.createElement('a');
            link.href = url;
            link.download = `Orden_Merito_${safeName}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);

            showSuccess('PDF descargado correctamente.');
        } catch (error) {
            showError('Hubo un error al crear el archivo PDF.');
        } finally {
            setIsPdfGenerating(false);
        }
    };

    const candidatoTemplate = (rowData) => `${rowData.lastName}, ${rowData.firstName}`;
    const documentoTemplate = (rowData) => `${rowData.docType} ${rowData.docNumber}`;
    const scoreTemplate = (rowData) => rowData.score != null ? rowData.score.toFixed(2) : '-';

    const estadoTemplate = (rowData) => {
        // Diccionario de colores
        const badges = {
            'COMPLETED': 'bg-green-100 text-green-800',
            'INCOMPLETE': 'bg-yellow-100 text-yellow-800',
            'NOT_ANSWERED': 'bg-red-100 text-red-800',
            'IN_PROGRESS': 'bg-blue-100 text-blue-800',
            'ACTIVE': 'bg-gray-100 text-gray-800'
        };

        // Diccionario de textos (Tu switch de Java traído a JS)
        const traducciones = {
            'COMPLETED': 'Completado',
            'IN_PROGRESS': 'En Progreso',
            'ACTIVE': 'No iniciado',
            'INCOMPLETE': 'Incompleto',
            'NOT_ANSWERED': 'No Respondido'
        };

        const colorClass = badges[rowData.state] || 'bg-gray-100 text-gray-800';
        const textoVisible = traducciones[rowData.state] || rowData.state;

        return <span className={`px-2 py-1 border-round text-sm font-medium ${colorClass}`}>{textoVisible}</span>;
    };

    if (loading) return <div className="p-4 text-center">Generando reporte...</div>;
    if (!reportData) return null;

    return (
        <div className="w-full flex flex-column gap-4 pb-8">
            <div className="flex flex-column sm:flex-row sm:align-items-start justify-content-between gap-3 mb-4">
                <div className="flex align-items-start gap-3">
                    <Button icon="pi pi-arrow-left" rounded text severity="secondary" aria-label="Volver" onClick={() => navigate(-1)} className="mt-1" />
                    <div>
                        <h1 className="m-0 text-2xl font-bold text-color">Reporte: Orden de Mérito</h1>
                        <p className="m-0 mt-1 text-base text-color-secondary">
                            {reportData.companyName} - {reportData.positionName}
                        </p>

                        <div className="flex align-items-center gap-2 mt-2 text-sm text-500">
                            <i className="pi pi-user" />
                            <span>Emitido por: <strong>{reportData.printedBy}</strong></span>
                            <i className="pi pi-circle-fill text-xs mx-1" style={{ fontSize: '0.4rem' }} />
                            <i className="pi pi-calendar" />
                            <span>{new Date(reportData.printedAt).toLocaleString('es-AR')}</span>
                        </div>
                    </div>
                </div>

                {/* 🚀 Botón atado a la función asíncrona */}
                <Button
                    label={isPdfGenerating ? 'Preparando...' : 'Descargar PDF'}
                    icon={isPdfGenerating ? 'pi pi-spin pi-spinner' : 'pi pi-file-pdf'}
                    severity="secondary"
                    onClick={handleGeneratePdf}
                    disabled={isPdfGenerating}
                    className="w-full sm:w-auto"
                />
            </div>

            {/* TABLA WEB: APROBADOS */}
            <div className="surface-card border-1 surface-border border-round overflow-hidden flex flex-column">
                <div className="p-3 border-bottom-1 surface-border">
                    <h2 className="m-0 text-lg font-bold text-green-400">
                        <i className="pi pi-check-circle mr-2"></i>Candidatos en Orden de Mérito
                    </h2>
                </div>
                <DataTable
                    value={reportData.approvedCandidates}
                    emptyMessage="No hay candidatos aprobados."
                    size="small"
                    stripedRows
                    sortField="score"
                    sortOrder={-1}
                >
                    <Column header="Candidato" body={candidatoTemplate} sortable sortField="lastName" />
                    <Column header="Documento" body={documentoTemplate} />
                    <Column header="Nº Candidato" field="candidateNumber" align="center" sortable />
                    <Column header="Puntaje" body={scoreTemplate} align="center" sortable sortField="score" className="font-bold text-green-500" />
                    <Column header="Accesos" field="accessCount" align="center" sortable />
                </DataTable>
            </div>

            {/* TABLA WEB: RECHAZADOS / INCOMPLETOS */}
            <div className="surface-card border-1 surface-border border-round overflow-hidden flex flex-column mt-4">
                <div className="p-3 border-bottom-1 surface-border">
                    <h2 className="m-0 text-lg font-bold text-red-400">
                        <i className="pi pi-times-circle mr-2"></i>Candidatos Fuera de Orden o Incompletos
                    </h2>
                </div>
                <DataTable
                    value={reportData.rejectedOrIncompleteCandidates}
                    emptyMessage="No hay candidatos en esta sección."
                    size="small"
                    stripedRows
                    sortField="score"
                    sortOrder={-1}
                >
                    <Column header="Candidato" body={candidatoTemplate} sortable sortField="lastName" />
                    <Column header="Documento" body={documentoTemplate} />
                    <Column header="Estado" body={estadoTemplate} align="center" sortable sortField="state" />
                    <Column header="Puntaje" body={scoreTemplate} align="center" sortable sortField="score" />
                </DataTable>
            </div>

            {/* Borramos el footer anterior porque ya lo acomodamos arriba */}
        </div>
    );
};

export default MeritOrderReport;
