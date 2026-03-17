import * as XLSX from 'xlsx';

export const exportarAExcel = (votantes, lideres) => {
  // Crear datos para Excel
  const datos = votantes.map(v => {
    const lider = lideres.find(l => l.id === v.liderAsignado);
    return {
      'Nombre': v.nombreCompleto,
      'Documento': v.documento,
      'Teléfono': v.telefono || '-',
      'Dirección': v.direccion || '-',
      'Barrio': v.barrio || '-',
      'Municipio': v.municipio || '-',
      'Mesa': v.mesa || '-',
      'Puesto': v.puesto || '-',
      'Líder': lider ? lider.nombre : '-',
      '¿Ya votó?': v.yaVoto ? 'Sí' : 'No'
    };
  });

  // Crear libro de Excel
  const worksheet = XLSX.utils.json_to_sheet(datos);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Votantes');

  // Ajustar ancho de columnas
  const columnWidths = [
    { wch: 25 }, // Nombre
    { wch: 15 }, // Documento
    { wch: 12 }, // Teléfono
    { wch: 30 }, // Dirección
    { wch: 15 }, // Barrio
    { wch: 15 }, // Municipio
    { wch: 8 },  // Mesa
    { wch: 20 }, // Puesto
    { wch: 20 }, // Líder
    { wch: 10 }  // ¿Ya votó?
  ];
  worksheet['!cols'] = columnWidths;

  // Descargar archivo
  XLSX.writeFile(workbook, `votantes_${new Date().toISOString().split('T')[0]}.xlsx`);
};
