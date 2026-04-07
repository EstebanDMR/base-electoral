import ExcelJS from 'exceljs';

export const generarExcelBlob = async (votantes, lideres) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Votantes');

  worksheet.columns = [
    { header: 'Nombre', key: 'nombre', width: 25 },
    { header: 'Documento', key: 'documento', width: 15 },
    { header: 'Teléfono', key: 'telefono', width: 12 },
    { header: 'Dirección', key: 'direccion', width: 30 },
    { header: 'Barrio', key: 'barrio', width: 15 },
    { header: 'Municipio', key: 'municipio', width: 15 },
    { header: 'Mesa', key: 'mesa', width: 8 },
    { header: 'Puesto', key: 'puesto', width: 20 },
    { header: 'Líder', key: 'lider', width: 20 },
    { header: '¿Ya votó?', key: 'yaVoto', width: 10 }
  ];

  votantes.forEach(v => {
    const lider = lideres.find(l => l.id === v.liderAsignado);
    worksheet.addRow({
      nombre: v.nombreCompleto,
      documento: v.documento,
      telefono: v.telefono || '-',
      direccion: v.direccion || '-',
      barrio: v.barrio || '-',
      municipio: v.municipio || '-',
      mesa: v.mesa || '-',
      puesto: v.puesto || '-',
      lider: lider ? lider.nombre : '-',
      yaVoto: v.yaVoto ? 'Sí' : 'No'
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};
