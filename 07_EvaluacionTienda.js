function evaluarTienda(IdTienda, IdCliente, Tipo, criterios, vendedor, compra) {

  var fecha = new Date();

  // 1) Evaluación de la tienda (IdCliente null = anónima)
  db.encuestasTienda.insertOne({
    IdTienda: IdTienda,
    IdCliente: IdCliente,
    Tipo: Tipo,                  // Fisica | Linea
    Fecha: fecha,
    ...criterios                 // Precio, Calidad, Garantia, etc.
  });

  // 2) Evaluación del vendedor (opcional)
  if (vendedor) {
    db.encuestasVendedor.insertOne({
      IdVenta: vendedor.IdVenta,
      Tipo: vendedor.Tipo,       // Fisica | Telefono
      Fecha: fecha,
      TratoVendedor: vendedor.TratoVendedor,
      Asesoria: vendedor.Asesoria,
      Amabilidad: vendedor.Amabilidad,
      TiempoRespuesta: vendedor.TiempoRespuesta
    });
  }

  // 3) Evaluación del proceso de compra (opcional)
  if (compra) {
    db.encuestasVenta.insertOne({
      IdVenta: compra.IdVenta,
      Tipo: compra.Tipo,         // Fisica | Linea
      Fecha: fecha,
      SatisfaccionProdu: compra.SatisfaccionProdu,
      TiempoCobro: compra.TiempoCobro,
      TiempoEntrega: compra.TiempoEntrega,
      EstadoPaquete: compra.EstadoPaquete,
      FacilidadPago: compra.FacilidadPago
    });
  }

  return "Evaluación registrada";
}

// Ejecutar (evaluación en línea con vendedor y proceso de compra)
evaluarTienda(1, 5, "Linea",
  { Precio: 4, Calidad: 5, SeguridadEntrega: 4, Garantia: 5, Reputacion: 5,
    RapidezEnvio: 3, Devolucion: 4, Soporte: 4, Atencion: 5, FormasPago: 5 },
  { IdVenta: 10, Tipo: "Telefono", Amabilidad: 5, TiempoRespuesta: 4 },
  { IdVenta: 10, Tipo: "Linea", TiempoEntrega: 3, EstadoPaquete: "Bueno", FacilidadPago: 5 }
);

// Ejecutar (evaluación anónima, solo tienda)
evaluarTienda(1, null, "Fisica",
  { Surtido: 4, Limpieza: 5, Atencion: 4, TiempoEspera: 3, Precio: 4 },
  null, null
);
