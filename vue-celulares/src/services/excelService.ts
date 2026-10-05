import * as XLSX from 'xlsx';
import type { MovimientoDetalle, SolicitudDetalle, EstadisticasMensuales } from './estadisticasService';
import { estadisticasService } from './estadisticasService';

class ExcelService {
  exportarEstadisticas(estadisticasMensuales: EstadisticasMensuales[], nombreArchivo: string = 'estadisticas_mensuales.xlsx') {
    // Preparar datos para Excel
  const datosExcel = estadisticasMensuales.map((estadistica:any) => ({
      'Mes': estadistica.mes,
      'Año': estadistica.year,
      'Movimientos': estadistica.movimientos,
      'Solicitudes': estadistica.solicitudes,
      'Total': estadistica.movimientos + estadistica.solicitudes
    }));

    // Agregar totales al final
    const totalMovimientos = estadisticasMensuales.reduce((sum, e) => sum + e.movimientos, 0);
    const totalSolicitudes = estadisticasMensuales.reduce((sum, e) => sum + e.solicitudes, 0);
    
    datosExcel.push({
      'Mes': 'TOTAL',
      'Año': null,
      'Movimientos': totalMovimientos,
      'Solicitudes': totalSolicitudes,
      'Total': totalMovimientos + totalSolicitudes
    });

    this.exportarAExcel([{ nombre: 'Estadísticas', datos: datosExcel }], nombreArchivo);
  }

  exportarMovimientos(movimientos: MovimientoDetalle[], nombreArchivo: string = 'movimientos.xlsx') {
    const datosExcel = movimientos.map(movimiento => ({
      'ID': movimiento.id,
      'Fecha': new Date(movimiento.fecha).toLocaleDateString('es-AR'),
      'Celular Marca': movimiento.celular.marca,
      'Celular Modelo': movimiento.celular.modelo,
      'Número Serie': movimiento.celular.numeroSerie,
      'Empleado Anterior': movimiento.empleadoAnterior 
        ? `${movimiento.empleadoAnterior.nombre} ${movimiento.empleadoAnterior.apellido} (${movimiento.empleadoAnterior.legajo})`
        : 'Nuevo equipo',
      'Empleado Nuevo': `${movimiento.empleadoNuevo.nombre} ${movimiento.empleadoNuevo.apellido} (${movimiento.empleadoNuevo.legajo})`,
      'Motivo': movimiento.motivo
    }));

    this.exportarAExcel([{ nombre: 'Movimientos', datos: datosExcel }], nombreArchivo);
  }

  // Exportar movimientos con el nuevo formato
  exportarMovimientosActualizados(movimientos: any[], nombreArchivo: string = 'movimientos.xlsx') {
    const datosExcel = movimientos.map(movimiento => ({
      'ID': movimiento.id || '',
      'Fecha': movimiento.fecha ? new Date(movimiento.fecha).toLocaleDateString('es-AR') : '',
      'Hora': movimiento.fecha ? new Date(movimiento.fecha).toLocaleTimeString('es-AR') : '',
      'Tipo': movimiento.tipo || '',
      'Código Interno': movimiento.celular?.codigoInterno || '',
      'Número Serie': movimiento.celular?.numeroSerie || '',
      'Marca': movimiento.celular?.marca || '',
      'Modelo': movimiento.celular?.modelo || '',
      'Estado Celular': movimiento.estadoCelular || '',
      'Usuario - Nº Reparto': movimiento.usuario?.numReparto || movimiento.numRepartoUsuario || '',
      'Usuario - Nombre': movimiento.usuario?.nombre || '',
      'Usuario - Apellido': movimiento.usuario?.apellido || '',
      'Descripción': movimiento.descripcion || ''
    }));

    this.exportarAExcel([{ nombre: 'Movimientos', datos: datosExcel }], nombreArchivo);
  }

  exportarSolicitudes(solicitudes: SolicitudDetalle[], nombreArchivo: string = 'solicitudes.xlsx') {
    const datosExcel = solicitudes.map((solicitud:any) => ({
      'ID': solicitud.id,
      'Fecha Solicitud': solicitud.fechaSolicitud ? new Date(solicitud.fechaSolicitud).toLocaleDateString('es-AR') : '',
      'Tipo Solicitud': this.formatearTipoSolicitud(solicitud.tipoSolicitud || solicitud.tipo),
      'Empleado': solicitud.empleado ? `${solicitud.empleado.nombre} ${solicitud.empleado.apellido}` : '',
      'Legajo': solicitud.empleado?.legajo || '',
      'Región': solicitud.empleado ? this.formatearRegion(solicitud.empleado.region) : '',
      'Motivo': solicitud.motivo || '',
      'Estado': this.formatearEstado(solicitud.estado || solicitud.status || '')
    }));

    this.exportarAExcel([{ nombre: 'Solicitudes', datos: datosExcel }], nombreArchivo);
  }

  exportarCompleto(
    estadisticasMensuales: EstadisticasMensuales[],
    movimientos: MovimientoDetalle[],
    solicitudes: SolicitudDetalle[],
    nombreArchivo: string = 'reporte_completo.xlsx'
  ) {
    // Hoja de estadísticas
  const datosEstadisticas = estadisticasMensuales.map((estadistica:any) => ({
      'Mes': estadistica.mes,
      'Año': estadistica.year,
      'Movimientos': estadistica.movimientos,
      'Solicitudes': estadistica.solicitudes,
      'Total': estadistica.movimientos + estadistica.solicitudes
    }));

    // Totales
    const totalMovimientos = estadisticasMensuales.reduce((sum, e) => sum + e.movimientos, 0);
    const totalSolicitudes = estadisticasMensuales.reduce((sum, e) => sum + e.solicitudes, 0);
    
    datosEstadisticas.push({
      'Mes': 'TOTAL',
      'Año': null,
      'Movimientos': totalMovimientos,
      'Solicitudes': totalSolicitudes,
      'Total': totalMovimientos + totalSolicitudes
    });

    // Hoja de movimientos
    const datosMovimientos = movimientos.map(movimiento => ({
      'ID': movimiento.id,
      'Fecha': new Date(movimiento.fecha).toLocaleDateString('es-AR'),
      'Celular Marca': movimiento.celular.marca,
      'Celular Modelo': movimiento.celular.modelo,
      'Número Serie': movimiento.celular.numeroSerie,
      'Empleado Anterior': movimiento.empleadoAnterior 
        ? `${movimiento.empleadoAnterior.nombre} ${movimiento.empleadoAnterior.apellido} (${movimiento.empleadoAnterior.legajo})`
        : 'Nuevo equipo',
      'Empleado Nuevo': `${movimiento.empleadoNuevo.nombre} ${movimiento.empleadoNuevo.apellido} (${movimiento.empleadoNuevo.legajo})`,
      'Motivo': movimiento.motivo
    }));

    // Hoja de solicitudes
    const datosSolicitudes = solicitudes.map((solicitud:any) => ({
      'ID': solicitud.id,
      'Fecha Solicitud': solicitud.fechaSolicitud ? new Date(solicitud.fechaSolicitud).toLocaleDateString('es-AR') : '',
      'Tipo Solicitud': this.formatearTipoSolicitud(solicitud.tipoSolicitud || solicitud.tipo),
      'Empleado': solicitud.empleado ? `${solicitud.empleado.nombre} ${solicitud.empleado.apellido}` : '',
      'Legajo': solicitud.empleado?.legajo || '',
      'Región': solicitud.empleado ? this.formatearRegion(solicitud.empleado.region) : '',
      'Motivo': solicitud.motivo || '',
      'Estado': this.formatearEstado(solicitud.estado || solicitud.status || '')
    }));

    const hojas = [
      { nombre: 'Estadísticas', datos: datosEstadisticas },
      { nombre: 'Movimientos', datos: datosMovimientos },
      { nombre: 'Solicitudes', datos: datosSolicitudes }
    ];

    this.exportarAExcel(hojas, nombreArchivo);
  }

  // Exportar repartos con más roturas
  async exportarEstadisticasCompletas(): Promise<void> {
    try {
      // Obtener todos los datos necesarios
      const datosExportacion = await estadisticasService.obtenerDatosParaExportacion();

      const workbook = XLSX.utils.book_new();

      // Hoja 1: Resumen General
      if (datosExportacion.estadisticasGenerales) {
        const stats = datosExportacion.estadisticasGenerales;
        const resumenData = [
          ['Resumen de Estadísticas'],
          [],
          ['Total Movimientos', stats.totalMovimientos || 0],
          ['Total Solicitudes', stats.totalSolicitudes || 0],
          ['Movimientos Mes Actual', stats.movimientosMesActual || 0],
          ['Solicitudes Mes Actual', stats.solicitudesMesActual || 0],
          ['Última Actualización', new Date().toLocaleString('es-AR')]
        ];
        
        const resumenSheet = XLSX.utils.aoa_to_sheet(resumenData);
        XLSX.utils.book_append_sheet(workbook, resumenSheet, 'Resumen General');
      }

      // Hoja 2: Datos por Región
      if (datosExportacion.todasLasRegiones.length > 0) {
        const regionesData = [
          ['Región', 'Total Usuarios', 'Total Solicitudes', 'Pendientes', 'En Proceso', 'Resueltas', 'Total Celulares Rotos', 'Promedio Roturas']
        ];

        datosExportacion.todasLasRegiones.forEach((region: any) => {
          regionesData.push([
            region.region || 'N/A',
            region.totalUsuarios || 0,
            region.totalSolicitudes || 0,
            region.solicitudesPendientes || 0,
            region.solicitudesEnProceso || 0,
            region.solicitudesResueltas || 0,
            region.totalCelularesRotos || 0,
            region.promedioCelularesRotos || 0
          ]);
        });

        const regionesSheet = XLSX.utils.aoa_to_sheet(regionesData);
        XLSX.utils.book_append_sheet(workbook, regionesSheet, 'Por Región');
      }

      // Hoja 3: Repartos con Más Roturas
      if (datosExportacion.repartosRoturas.length > 0) {
        const repartosData = [
          ['Posición', 'Reparto', 'Región', 'Cantidad Roturas', 'Total Usuarios', 'Porcentaje', 'Urgente']
        ];

        datosExportacion.repartosRoturas.forEach((reparto: any, index: number) => {
          repartosData.push([
            index + 1,
            reparto.reparto,
            reparto.region,
            reparto.cantidadRoturas,
            reparto.totalUsuarios,
            `${reparto.porcentajeRotura.toFixed(2)}%`,
            reparto.urgente ? 'Sí' : 'No'
          ]);
        });

        const repartosSheet = XLSX.utils.aoa_to_sheet(repartosData);
        XLSX.utils.book_append_sheet(workbook, repartosSheet, 'Ranking Roturas');
      }

      // Generar y descargar
      const nombreArchivo = `estadisticas_completas_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, nombreArchivo);
      
      console.log('Exportación de estadísticas completas realizada correctamente');

    } catch (error) {
      console.error('Error al exportar estadísticas completas:', error);
      throw new Error('No se pudieron exportar las estadísticas completas. Inténtelo nuevamente.');
    }
  }

  // Exportar con filtros avanzados
  exportarMovimientosConFiltros(
    movimientos: MovimientoDetalle[], 
    filtros: { fechaDesde?: string; fechaHasta?: string; region?: string },
    nombreArchivo: string = 'movimientos_filtrados.xlsx'
  ) {
    const datosExcel = movimientos.map(movimiento => ({
      'ID': movimiento.id,
      'Fecha': new Date(movimiento.fecha).toLocaleDateString('es-AR'),
      'Celular Marca': movimiento.celular.marca,
      'Celular Modelo': movimiento.celular.modelo,
      'Número Serie': movimiento.celular.numeroSerie,
      'Empleado Anterior': movimiento.empleadoAnterior 
        ? `${movimiento.empleadoAnterior.nombre} ${movimiento.empleadoAnterior.apellido} (${movimiento.empleadoAnterior.legajo})`
        : 'Nuevo equipo',
      'Empleado Nuevo': `${movimiento.empleadoNuevo.nombre} ${movimiento.empleadoNuevo.apellido} (${movimiento.empleadoNuevo.legajo})`,
      'Motivo': movimiento.motivo
    }));

    // Agregar información de filtros al final
    const infoFiltros: any = {
      'ID': '',
      'Fecha': '',
      'Celular Marca': '',
      'Celular Modelo': '',
      'Número Serie': '',
      'Empleado Anterior': '',
      'Empleado Nuevo': 'FILTROS APLICADOS:',
      'Motivo': ''
    };

    if (filtros.fechaDesde || filtros.fechaHasta) {
      datosExcel.push({...infoFiltros, 'Empleado Nuevo': 'Fecha desde:', 'Motivo': filtros.fechaDesde || 'No especificada'});
      datosExcel.push({...infoFiltros, 'Empleado Nuevo': 'Fecha hasta:', 'Motivo': filtros.fechaHasta || 'No especificada'});
    }
    if (filtros.region) {
      datosExcel.push({...infoFiltros, 'Empleado Nuevo': 'Región:', 'Motivo': this.formatearRegion(filtros.region)});
    }

    this.exportarAExcel([{ nombre: 'Movimientos', datos: datosExcel }], nombreArchivo);
  }

  exportarSolicitudesConFiltros(
    solicitudes: SolicitudDetalle[], 
    filtros: { fechaDesde?: string; fechaHasta?: string; region?: string; estado?: string },
    nombreArchivo: string = 'solicitudes_filtradas.xlsx'
  ) {
    const datosExcel = solicitudes.map((solicitud: any) => ({
      'ID': solicitud.id,
      'Fecha Solicitud': solicitud.fechaSolicitud ? new Date(solicitud.fechaSolicitud).toLocaleDateString('es-AR') : '',
      'Tipo Solicitud': this.formatearTipoSolicitud(solicitud.tipoSolicitud || solicitud.tipo),
      'Empleado': solicitud.empleado ? `${solicitud.empleado.nombre} ${solicitud.empleado.apellido}` : '',
      'Legajo': solicitud.empleado?.legajo || '',
      'Región': solicitud.empleado ? this.formatearRegion(solicitud.empleado.region) : '',
      'Motivo': solicitud.motivo || '',
      'Estado': this.formatearEstado(solicitud.estado || solicitud.status || '')
    }));

    // Agregar información de filtros
    const infoFiltros: any = {
      'ID': '',
      'Fecha Solicitud': '',
      'Tipo Solicitud': '',
      'Empleado': '',
      'Legajo': '',
      'Región': '',
      'Motivo': 'FILTROS APLICADOS:',
      'Estado': ''
    };

    if (filtros.fechaDesde || filtros.fechaHasta) {
      datosExcel.push({...infoFiltros, 'Motivo': 'Fecha desde:', 'Estado': filtros.fechaDesde || 'No especificada'});
      datosExcel.push({...infoFiltros, 'Motivo': 'Fecha hasta:', 'Estado': filtros.fechaHasta || 'No especificada'});
    }
    if (filtros.region) {
      datosExcel.push({...infoFiltros, 'Motivo': 'Región:', 'Estado': this.formatearRegion(filtros.region)});
    }
    if (filtros.estado) {
      datosExcel.push({...infoFiltros, 'Motivo': 'Estado:', 'Estado': this.formatearEstado(filtros.estado)});
    }

    this.exportarAExcel([{ nombre: 'Solicitudes', datos: datosExcel }], nombreArchivo);
  }

  // Nueva exportación de órdenes de reparación
  exportarOrdenesReparacion(
    ordenes: any[],
    nombreArchivo: string = 'ordenes_reparacion.xlsx'
  ) {
    const datosOrdenes = ordenes.map(o => ({
      'ID': o.id,
      'Número Orden': o.numeroOrden || ('#' + o.id),
      'Fecha Creación': o.fechaCreacion ? new Date(o.fechaCreacion).toLocaleString('es-AR') : '',
      'Proveedor': o.proveedor?.nombre || '',
      'Diagnóstico': o.diagnostico || '',
      'Costo Estimado': o.costoEstimado ?? '',
      'Costo Final': o.costoFinal ?? '',
      'Total Items': (o.reparacionItems||[]).reduce((acc: number, it: any)=> acc + (it.costoReparacion || 0), 0),
      'Estado': o.estado || '',
      'Fecha Est Entrega': o.fechaEstimadaEntrega ? new Date(o.fechaEstimadaEntrega).toLocaleDateString('es-AR') : '',
      'Fecha Real Entrega': o.fechaRealEntrega ? new Date(o.fechaRealEntrega).toLocaleDateString('es-AR') : '',
      'Observaciones': o.observaciones || '',
      'Cantidad Items': (o.reparacionItems?.length || 0)
    }));

    // Crear hoja de items detallados
    let hojas = [{ nombre: 'Ordenes', datos: datosOrdenes }];

    const itemsDetallados: any[] = [];
    
    ordenes.forEach(orden => {
      if (orden.reparacionItems && orden.reparacionItems.length > 0) {
        // Agregar cada item
        orden.reparacionItems.forEach((item: any) => {
          itemsDetallados.push({
            'Orden': orden.numeroOrden || ('#' + orden.id),
            'Proveedor': orden.proveedor?.nombre || '',
            'Modelo Celular': `${item.celular?.marca || ''} ${item.celular?.modelo || ''}`.trim(),
            'Serie': item.celular?.numeroSerie || '',
            'Motivo': item.motivoReparacion || '',
            'Precio': item.costoReparacion || 0,
            'Observaciones': item.observaciones || ''
          });
        });
        
        // Agregar fila de total de la orden
        const totalOrden = orden.reparacionItems.reduce((acc: number, it: any) => acc + (it.costoReparacion || 0), 0);
        itemsDetallados.push({
          'Orden': `TOTAL ORDEN ${orden.numeroOrden || '#' + orden.id}`,
          'Proveedor': '',
          'Modelo Celular': '',
          'Serie': '',
          'Motivo': '',
          'Precio': totalOrden,
          'Observaciones': `Total de ${orden.reparacionItems.length} items`
        });
        
        // Agregar línea en blanco para separar órdenes
        itemsDetallados.push({
          'Orden': '',
          'Proveedor': '',
          'Modelo Celular': '',
          'Serie': '',
          'Motivo': '',
          'Precio': '',
          'Observaciones': ''
        });
      }
    });

    if (itemsDetallados.length > 0) {
      hojas.push({ nombre: 'Items Detallados', datos: itemsDetallados });
    }

    this.exportarAExcel(hojas, nombreArchivo);
  }

  private exportarAExcel(hojas: { nombre: string; datos: any[] }[], nombreArchivo: string) {
    const workbook = XLSX.utils.book_new();

    hojas.forEach(hoja => {
      const worksheet = XLSX.utils.json_to_sheet(hoja.datos);
      
      // Ajustar ancho de columnas automáticamente
      const columnWidths: { [key: string]: number } = {};
      
      hoja.datos.forEach(row => {
        Object.keys(row).forEach(key => {
          const value = row[key]?.toString() || '';
          const length = value.length;
          if (!columnWidths[key] || columnWidths[key] < length) {
            columnWidths[key] = Math.min(Math.max(length + 2, 10), 50);
          }
        });
      });

      worksheet['!cols'] = Object.keys(columnWidths).map(key => ({ 
        wch: columnWidths[key] 
      }));

      XLSX.utils.book_append_sheet(workbook, worksheet, hoja.nombre);
    });

    // Descargar archivo
    XLSX.writeFile(workbook, nombreArchivo);
  }

  private formatearTipoSolicitud(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'CAMBIO_POR_ROTURA': 'Cambio por rotura',
      'CAMBIO_POR_PERDIDA': 'Cambio por pérdida',
      'SOLICITUD_NUEVO': 'Solicitud nuevo',
      'ACTUALIZACION_EQUIPO': 'Actualización equipo',
      'OTRO': 'Otro'
    };
    return tipos[tipo] || tipo;
  }

  private formatearRegion(region: string): string {
    const regiones: { [key: string]: string } = {
      'CENTRO': 'Centro',
      'NORTE': 'Norte',
      'SUR': 'Sur',
      'OESTE': 'Oeste',
      'ESTE': 'Este'
      
    };
    return regiones[region] || region;
  }

  private formatearEstado(estado: string): string {
    const estados: { [key: string]: string } = {
      'PENDIENTE': 'Pendiente',
      'EN_PROCESO': 'En proceso',
      'APROBADO': 'Aprobado',
      'RECHAZADO': 'Rechazado',
      'COMPLETADO': 'Completado'
    };
    return estados[estado] || estado;
  }

  exportarReportesRoturas(reportes: any[], nombreArchivo: string = 'reportes_roturas.xlsx') {
    this.exportarAExcel([{ nombre: 'Reportes Roturas', datos: reportes }], nombreArchivo);
  }

  // Exportar solicitudes por mes específico
  exportarSolicitudesPorMes(
    solicitudes: any[], 
    mes: number,
    año: number
  ) {
    const datosExcel: any[] = solicitudes.map((solicitud: any) => ({
      'ID': solicitud.id || '',
      'Fecha': solicitud.fecha || '',
      'Solicitante': solicitud.nomSolicitante || '',
      'Usuario/Reparto': solicitud.usuario || '',
      'Región': solicitud.region || '',
      'Tipo Solicitud': (solicitud.tipoSolicitud || '').replace(/_/g, ' '),
      'Motivo': solicitud.motivo || '',
      'Necesita Línea': solicitud.necesitaLinea ? 'Sí' : 'No',
      'Estado': solicitud.estado || 'PENDIENTE',
      'Tiene Denuncia': solicitud.tieneDenunciaAdjunta ? 'Sí' : 'No'
    }));

    // Agregar resumen al final
    const totalSolicitudes = solicitudes.length;
    const porTipo = solicitudes.reduce((acc: any, s: any) => {
      acc[s.tipoSolicitud || 'Sin tipo'] = (acc[s.tipoSolicitud || 'Sin tipo'] || 0) + 1;
      return acc;
    }, {});
    const porEstado = solicitudes.reduce((acc: any, s: any) => {
      acc[s.estado || 'PENDIENTE'] = (acc[s.estado || 'PENDIENTE'] || 0) + 1;
      return acc;
    }, {});

    const filaVacia = { 'ID': '', 'Fecha': '', 'Solicitante': '', 'Usuario/Reparto': '', 'Región': '', 'Tipo Solicitud': '', 'Motivo': '', 'Necesita Línea': '', 'Estado': '', 'Tiene Denuncia': '' };

    // Agregar filas de resumen
    datosExcel.push(filaVacia);
    datosExcel.push({ 'ID': 'RESUMEN', 'Fecha': '', 'Solicitante': '', 'Usuario/Reparto': '', 'Región': '', 'Tipo Solicitud': '', 'Motivo': '', 'Necesita Línea': '', 'Estado': '', 'Tiene Denuncia': '' });
    datosExcel.push({ 'ID': 'Total Solicitudes:', 'Fecha': totalSolicitudes.toString(), 'Solicitante': '', 'Usuario/Reparto': '', 'Región': '', 'Tipo Solicitud': '', 'Motivo': '', 'Necesita Línea': '', 'Estado': '', 'Tiene Denuncia': '' });
    datosExcel.push(filaVacia);
    datosExcel.push({ 'ID': 'Por Tipo:', 'Fecha': '', 'Solicitante': '', 'Usuario/Reparto': '', 'Región': '', 'Tipo Solicitud': '', 'Motivo': '', 'Necesita Línea': '', 'Estado': '', 'Tiene Denuncia': '' });
    Object.entries(porTipo).forEach(([tipo, cantidad]) => {
      datosExcel.push({ 'ID': tipo.replace(/_/g, ' '), 'Fecha': (cantidad as number).toString(), 'Solicitante': '', 'Usuario/Reparto': '', 'Región': '', 'Tipo Solicitud': '', 'Motivo': '', 'Necesita Línea': '', 'Estado': '', 'Tiene Denuncia': '' });
    });
    datosExcel.push(filaVacia);
    datosExcel.push({ 'ID': 'Por Estado:', 'Fecha': '', 'Solicitante': '', 'Usuario/Reparto': '', 'Región': '', 'Tipo Solicitud': '', 'Motivo': '', 'Necesita Línea': '', 'Estado': '', 'Tiene Denuncia': '' });
    Object.entries(porEstado).forEach(([estado, cantidad]) => {
      datosExcel.push({ 'ID': estado, 'Fecha': (cantidad as number).toString(), 'Solicitante': '', 'Usuario/Reparto': '', 'Región': '', 'Tipo Solicitud': '', 'Motivo': '', 'Necesita Línea': '', 'Estado': '', 'Tiene Denuncia': '' });
    });

    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const nombreMes = meses[mes - 1];
    const nombreFinal = `solicitudes_${nombreMes}_${año}.xlsx`;
    
    this.exportarAExcel([{ nombre: `Solicitudes ${nombreMes} ${año}`, datos: datosExcel }], nombreFinal);
  }
}

export const excelService = new ExcelService();
