import jsPDF from 'jspdf';
import type { Solicitud } from './solicitudService';
import { formatearCargo } from '@/utils/empleadosSolicitud';

// Funciones helper para formatear enums
const formatearTipoSolicitud = (tipo: string): string => {
  switch (tipo) {
    case 'CAMBIO_POR_ROTURA':
      return 'Cambio por rotura';
    case 'NUEVO_EQUIPO':
      return 'Equipo nuevo';
    default:
      return tipo?.replace(/_/g, ' ') || 'N/A';
  }
};

const formatearRegion = (region: string): string => {
  switch (region) {
    case 'LA_PLATA':
      return 'La Plata';
    default:
      return region?.replace(/_/g, ' ') || 'N/A';
  }
};

const formatearEstado = (estado: string): string => {
  switch (estado) {
    case 'EN_PROCESO':
      return 'En proceso';
    default:
      return estado?.replace(/_/g, ' ') || 'Pendiente';
  }
};

export const generarPDFSolicitud = async (solicitud: Solicitud) => {
  try {
    // Crear nueva instancia de jsPDF con configuración optimizada
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Configuración de colores y fuentes mejorados
    const colorPrimario: [number, number, number] = [30, 58, 138];
    const colorSecundario: [number, number, number] = [55, 65, 81];
    const colorTexto: [number, number, number] = [17, 24, 39];
    const colorFondo: [number, number, number] = [249, 250, 251];
    const colorBorde: [number, number, number] = [209, 213, 219];
    
    // Configuración de página y márgenes
    const pageHeight = 297; // A4 height in mm
    const pageWidth = 210; // A4 width in mm
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    const footerHeight = 20;
    const maxContentHeight = pageHeight - footerHeight - 10;
    
    // Función para verificar si necesitamos nueva página
    const checkPageBreak = (currentY: number, requiredHeight: number): number => {
      if (currentY + requiredHeight > maxContentHeight) {
        doc.addPage();
        addHeader();
        return 45; // Reset Y position after header
      }
      return currentY;
    };
    
    // Función para agregar header consistente
    const addHeader = () => {
      // Fondo del header con gradiente simulado
      doc.setFillColor(...colorPrimario);
      doc.rect(0, 0, pageWidth, 30, 'F');
      
      // Línea decorativa inferior
      doc.setFillColor(79, 70, 229);
      doc.rect(0, 28, pageWidth, 2, 'F');
      
      // Título principal
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('SOLICITUD DE CELULAR', margin, 18);
      
      // Información de la empresa
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Sistema de Gestión de Celulares', 120, 14);
      doc.text('Departamento de Sistemas', 120, 22);
    };
    
    // Configurar fuente por defecto
    doc.setFont('helvetica');
    
    // Agregar header inicial
    addHeader();
    
    // === INFORMACIÓN PRINCIPAL ===
    doc.setTextColor(...colorTexto);
    let yPos = 40;
    
    // ID y Estado en una caja destacada (más compacta)
    yPos = checkPageBreak(yPos, 18);
    doc.setFillColor(...colorFondo);
    doc.rect(margin, yPos - 5, contentWidth, 16, 'F');
    doc.setDrawColor(...colorBorde);
    doc.rect(margin, yPos - 5, contentWidth, 16);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('SOLICITUD #' + solicitud.id, margin + 5, yPos + 3);
    
    // Estado con color y marco (más compacto)
    const estadoColor = getEstadoColor(solicitud.estado || 'PENDIENTE');
    const estadoTexto = formatearEstado(solicitud.estado || 'PENDIENTE');
    
    doc.setFillColor(...estadoColor);
    doc.roundedRect(140, yPos - 3, 30, 10, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(estadoTexto, 142, yPos + 2);
    
    doc.setTextColor(...colorTexto);
    yPos += 25;
    
    // === DATOS DEL SOLICITANTE ===
    yPos = checkPageBreak(yPos, 61);
    doc.setFillColor(239, 246, 255);
    doc.rect(margin, yPos - 3, contentWidth, 56, 'F');
    doc.setDrawColor(191, 219, 254);
    doc.rect(margin, yPos - 3, contentWidth, 56);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text('DATOS DEL SOLICITANTE', margin + 5, yPos + 5);

    doc.setTextColor(...colorTexto);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPos += 12;

    const filas: [string, string, string, string][] = [
      ['Solicitante:', solicitud.nomSolicitante || 'N/A', 'Cargo:', solicitud.cargoSolicitante ? formatearCargo(solicitud.cargoSolicitante) : 'N/A'],
      ['Fecha carga:', solicitud.fecha || 'N/A', 'Fecha incidencia:', solicitud.fechaIncidencia || 'N/A'],
      ['Usuario:', solicitud.usuario || 'N/A', 'Legajo:', solicitud.legajo || 'N/A'],
      ['Región:', formatearRegion(solicitud.region || ''), '', '']
    ];
    filas.forEach(([etiquetaIzq, valorIzq, etiquetaDer, valorDer]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(etiquetaIzq, margin + 5, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(valorIzq, margin + 35, yPos);
      if (etiquetaDer) {
        doc.setFont('helvetica', 'bold');
        doc.text(etiquetaDer, 110, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(valorDer, 145, yPos);
      }
      yPos += 8;
    });

    yPos += 12;

    // === DETALLES DE LA SOLICITUD ===
    yPos = checkPageBreak(yPos, 35);
    doc.setFillColor(240, 253, 244);
    doc.rect(margin, yPos - 3, contentWidth, 30, 'F');
    doc.setDrawColor(187, 247, 208);
    doc.rect(margin, yPos - 3, contentWidth, 30);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(21, 128, 61);
    doc.text('DETALLES DE LA SOLICITUD', margin + 5, yPos + 5);
    
    doc.setTextColor(...colorTexto);
    doc.setFontSize(10);
    yPos += 12;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Tipo:', margin + 5, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(formatearTipoSolicitud(solicitud.tipoSolicitud || ''), margin + 25, yPos);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Necesita línea:', 110, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(solicitud.necesitaLinea ? 'Sí' : 'No', 145, yPos);
    
    yPos += 20;
    
    // === MOTIVO ===
    const motivoBase = solicitud.motivo || 'Sin descripción proporcionada';
    const motivo = solicitud.observacion ? `${motivoBase}\n\nObservación: ${solicitud.observacion}` : motivoBase;
    const motivoLineas = doc.splitTextToSize(motivo, contentWidth - 20);
    const motivoHeight = Math.max(25, (motivoLineas.length * 5) + 15);
    
    yPos = checkPageBreak(yPos, motivoHeight);
    doc.setFillColor(255, 251, 235);
    doc.rect(margin, yPos - 3, contentWidth, motivoHeight, 'F');
    doc.setDrawColor(253, 230, 138);
    doc.rect(margin, yPos - 3, contentWidth, motivoHeight);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 83, 9);
    doc.text('DESCRIPCIÓN / MOTIVO:', margin + 5, yPos + 5);
    
    doc.setTextColor(...colorTexto);
    doc.setFont('helvetica', 'normal');
    doc.text(motivoLineas, margin + 5, yPos + 12);
    
    yPos += motivoHeight + 5;
    
    // === SECCIÓN PARA USO DE SISTEMAS ===
    // Línea separadora elegante
    yPos = checkPageBreak(yPos, 60);
    doc.setDrawColor(...colorPrimario);
    doc.setLineWidth(1);
    doc.line(margin, yPos, margin + contentWidth, yPos);
    yPos += 5;
    
    doc.setFillColor(254, 242, 242);
    doc.rect(margin, yPos - 3, contentWidth, 55, 'F');
    doc.setDrawColor(254, 202, 202);
    doc.rect(margin, yPos - 3, contentWidth, 55);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(185, 28, 28);
    doc.text('PARA USO EXCLUSIVO DEL DEPARTAMENTO DE SISTEMAS', margin + 5, yPos + 5);
    
    doc.setTextColor(...colorTexto);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    yPos += 12;
    
    // Campos en formato más compacto y organizado
    doc.text('Reparto responsable:', margin + 5, yPos);
    doc.setDrawColor(...colorSecundario);
    doc.line(margin + 45, yPos + 1, margin + contentWidth - 5, yPos + 1);
    yPos += 9;
    
    doc.text('Celular entregado (Marca/Modelo):', margin + 5, yPos);
    doc.line(margin + 70, yPos + 1, margin + contentWidth - 5, yPos + 1);
    yPos += 9;
    
    doc.text('Número de serie:', margin + 5, yPos);
    doc.line(margin + 35, yPos + 1, 120, yPos + 1);
    
    doc.text('Fecha entrega:', 125, yPos);
    doc.line(150, yPos + 1, margin + contentWidth - 5, yPos + 1);
    yPos += 9;
    
    doc.text('Estado del equipo:', margin + 5, yPos);
    doc.line(margin + 40, yPos + 1, 120, yPos + 1);
    
    doc.text('Observaciones:', 125, yPos);
    doc.line(155, yPos + 1, margin + contentWidth - 5, yPos + 1);
    
    yPos += 18;
    
    // === FIRMAS ===
    yPos = checkPageBreak(yPos, 25);
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, yPos - 3, contentWidth, 20, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(margin, yPos - 3, contentWidth, 20);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('FIRMAS Y AUTORIZACIONES:', margin + 5, yPos + 3);
    yPos += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    // Firmas en dos columnas
    doc.text('Firma supervisor:', margin + 5, yPos);
    doc.line(margin + 30, yPos + 1, margin + 80, yPos + 1);
    
    doc.text('Firma solicitante:', margin + 90, yPos);
    doc.line(margin + 120, yPos + 1, margin + contentWidth - 5, yPos + 1);
    
    yPos += 15;
    
    // === FOOTER DINÁMICO ===
    const addFooter = (currentPage: number, totalPages: number) => {
      const footerY = pageHeight - 15;
      
      doc.setFillColor(...colorPrimario);
      doc.rect(0, footerY, pageWidth, 15, 'F');
      
      const fechaGeneracion = new Date().toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.text(`Generado: ${fechaGeneracion}`, margin, footerY + 8);
      doc.text('Sistema de Gestión de Celulares v2.0', 100, footerY + 8);
      doc.text(`Pág. ${currentPage}/${totalPages}`, pageWidth - 30, footerY + 8);
    };
    
    // Calcular páginas totales y agregar footers
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addFooter(i, totalPages);
    }
    
    // Descargar el PDF con nombre mejorado
    const nombreArchivo = `Solicitud_${solicitud.id}_${solicitud.nomSolicitante?.replace(/\s+/g, '_') || 'Usuario'}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(nombreArchivo);
    
  } catch (error) {
    console.error('Error al generar PDF:', error);
    throw new Error('No se pudo generar el PDF');
  }
};

// Función helper para colores de estado mejorados
const getEstadoColor = (estado: string): [number, number, number] => {
  switch (estado) {
    case 'PENDIENTE':
      return [245, 158, 11]; // Amber-500
    case 'EN_PROCESO':
      return [59, 130, 246]; // Blue-500
    case 'RESUELTA':
      return [34, 197, 94]; // Green-500
    default:
      return [107, 114, 128]; // Gray-500
  }
};

// Función para preview del PDF (opcional)
export const previsualizarPDF = async (solicitud: Solicitud) => {
  try {
    // Reutilizar la misma lógica pero sin guardar el archivo
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Usar el mismo código de generación que arriba
    // (Por simplicidad, se podría refactorizar en una función común)
    
    // Abrir en nueva ventana para preview
    const pdfData = doc.output('datauristring');
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head><title>Preview - Solicitud ${solicitud.id}</title></head>
          <body style="margin:0;">
            <iframe width="100%" height="100%" src="${pdfData}"></iframe>
          </body>
        </html>
      `);
    }
    
    return pdfData;
  } catch (error) {
    console.error('Error al previsualizar PDF:', error);
    throw error;
  }
};

// Exportar servicio para compatibilidad
export const pdfService = {
  generarPDFSolicitud,
  previsualizarPDF
};

export default pdfService;
