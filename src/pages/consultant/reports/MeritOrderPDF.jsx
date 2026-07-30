import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// ==========================================
// ESTILOS DEL PDF
// ==========================================
const styles = StyleSheet.create({
    page: { padding: 30, fontFamily: 'Helvetica' },
    title: { fontSize: 20, color: '#1f2937', fontWeight: 'bold' },
    subtitle: { fontSize: 12, color: '#4b5563', marginTop: 4 },

    // 👇 Agregamos este estilo para la info de emisión
    emitidoPor: { fontSize: 10, color: '#6b7280', marginTop: 8, marginBottom: 20 },

    sectionTitleGreen: { fontSize: 14, color: '#1f2937', fontWeight: 'bold', marginBottom: 10, marginTop: 10 },
    sectionTitleRed: { fontSize: 14, color: '#1f2937', fontWeight: 'bold', marginBottom: 10, marginTop: 25 },

    table: { display: 'flex', width: 'auto', borderStyle: 'solid', borderWidth: 1, borderColor: '#e5e7eb', borderBottomWidth: 0 },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', minHeight: 24, alignItems: 'center' },
    tableHeaderRow: { backgroundColor: '#f9fafb', fontWeight: 'bold' },
    tableCell: { padding: 5, fontSize: 10, color: '#374151' },

    colCandidatoA: { width: '30%', borderRightWidth: 1, borderRightColor: '#e5e7eb' },
    colDocA: { width: '25%', borderRightWidth: 1, borderRightColor: '#e5e7eb' },
    colNroA: { width: '15%', borderRightWidth: 1, borderRightColor: '#e5e7eb', textAlign: 'center' },
    colPuntajeA: { width: '15%', borderRightWidth: 1, borderRightColor: '#e5e7eb', textAlign: 'center', color: '#16a34a' },
    colAccesosA: { width: '15%', textAlign: 'center' },

    colCandidatoR: { width: '35%', borderRightWidth: 1, borderRightColor: '#e5e7eb' },
    colDocR: { width: '25%', borderRightWidth: 1, borderRightColor: '#e5e7eb' },
    colEstadoR: { width: '25%', borderRightWidth: 1, borderRightColor: '#e5e7eb', textAlign: 'center' },
    colPuntajeR: { width: '15%', textAlign: 'center' }
});

const traduccionesEstado = {
    'COMPLETED': 'Completado',
    'IN_PROGRESS': 'En Progreso',
    'ACTIVE': 'No iniciado',
    'INCOMPLETE': 'Incompleto',
    'NOT_ANSWERED': 'No Respondido'
};
// ==========================================
// COMPONENTE DOCUMENTO
// ==========================================
const MeritOrderPDF = ({ reportData }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <Text style={styles.title}>Reporte: Orden de Mérito</Text>
            <Text style={styles.subtitle}>{reportData.companyName} - {reportData.positionName}</Text>

            {/* 👇 La info de emisión ahora está acá arriba */}
            <Text style={styles.emitidoPor}>
                Emitido por: {reportData.printedBy} | Fecha: {new Date(reportData.printedAt).toLocaleString('es-AR')}
            </Text>

            {/* TABLA: APROBADOS */}
            <Text style={styles.sectionTitleGreen}>Candidatos en Orden de Mérito</Text>
            <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeaderRow]}>
                    <Text style={[styles.tableCell, styles.colCandidatoA]}>Candidato</Text>
                    <Text style={[styles.tableCell, styles.colDocA]}>Documento</Text>
                    <Text style={[styles.tableCell, styles.colNroA]}>Nº Candidato</Text>
                    <Text style={[styles.tableCell, styles.colPuntajeA, { color: '#374151' }]}>Puntaje</Text>
                    <Text style={[styles.tableCell, styles.colAccesosA]}>Accesos</Text>
                </View>
                {reportData.approvedCandidates.length === 0 ? (
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, { width: '100%', textAlign: 'center', color: '#9ca3af' }]}>No hay candidatos aprobados.</Text>
                    </View>
                ) : (
                    reportData.approvedCandidates.map((c, i) => (
                        <View style={styles.tableRow} key={i}>
                            <Text style={[styles.tableCell, styles.colCandidatoA]}>{c.lastName}, {c.firstName}</Text>
                            <Text style={[styles.tableCell, styles.colDocA]}>{c.docType} {c.docNumber}</Text>
                            <Text style={[styles.tableCell, styles.colNroA]}>{c.candidateNumber}</Text>
                            <Text style={[styles.tableCell, styles.colPuntajeA]}>{c.score != null ? c.score.toFixed(2) : '-'}</Text>
                            <Text style={[styles.tableCell, styles.colAccesosA]}>{c.accessCount}</Text>
                        </View>
                    ))
                )}
            </View>

            {/* TABLA: RECHAZADOS / INCOMPLETOS */}
            <Text style={styles.sectionTitleRed}>Candidatos Fuera de Orden o Incompletos</Text>
            <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeaderRow]}>
                    <Text style={[styles.tableCell, styles.colCandidatoR]}>Candidato</Text>
                    <Text style={[styles.tableCell, styles.colDocR]}>Documento</Text>
                    <Text style={[styles.tableCell, styles.colEstadoR]}>Estado</Text>
                    <Text style={[styles.tableCell, styles.colPuntajeR]}>Puntaje</Text>
                </View>
                {reportData.rejectedOrIncompleteCandidates.length === 0 ? (
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, { width: '100%', textAlign: 'center', color: '#9ca3af' }]}>No hay candidatos en esta sección.</Text>
                    </View>
                ) : (
                    reportData.rejectedOrIncompleteCandidates.map((c, i) => (
                        <View style={styles.tableRow} key={i}>
                            <Text style={[styles.tableCell, styles.colCandidatoR]}>{c.lastName}, {c.firstName}</Text>
                            <Text style={[styles.tableCell, styles.colDocR]}>{c.docType} {c.docNumber}</Text>
                            <Text style={[styles.tableCell, styles.colEstadoR]}>{traduccionesEstado[c.state] || c.state}</Text>
                            <Text style={[styles.tableCell, styles.colPuntajeR]}>{c.score != null ? c.score.toFixed(2) : '-'}</Text>
                        </View>
                    ))
                )}
            </View>
        </Page>
    </Document>
);

export default MeritOrderPDF;
