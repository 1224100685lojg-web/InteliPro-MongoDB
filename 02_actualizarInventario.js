function actualizarInventario2025() {

  var fechaProceso = new Date();
  var ventas = 0, detalles = 0;

  // 1) Buscar las ventas realizadas durante el año 2025
  db.ventas.find({
    $and:[
       {Fecha: { $gte: ISODate("2025-01-01")}}, 
       {Fecha: {$lt: ISODate("2026-01-01")}}
    ]
  }).forEach(venta => {
     ventas++;

    // 2) Por cada venta, buscar sus productos vendidos en detalleVentas
    //    (se relacionan por el campo IdVenta)
    db.detalleVentas.find({ IdVenta: venta.IdVenta }).forEach(detalle => {
       detalles++;

      // 3) Actualizar el inventario de la tienda y el producto vendido,
      //    tomando como base el registro del periodo "2025-01"
      db.inventario.updateOne(
        { IdTienda: venta.IdTienda, IdProducto: detalle.IdProducto, Periodo: "2025-01" },
        [ { $project: {
            IdTienda: 1,
            IdProducto: 1,
            Periodo: 1,
            StockMinimo: 1,
            // Se resta a la existencia la cantidad vendida
            Existencia:    { $subtract: ["$Existencia", detalle.Cantidad] },
            // Se suma la cantidad vendida al acumulado de ventas
            CantidadVenta: { $add: ["$CantidadVenta", detalle.Cantidad] },
            // Se guarda la fecha en que se hizo la actualización
            FechaCorte:fechaProceso
        } } ]
      );

    });
  });
  print("-".repeat(50));
  print("Actualización de inventario 2025 - " + fechaProceso.toISOString());
  print("Ventas procesadas: " + ventas);
  print("Productos vendidos procesados: " + detalles);
  print("-".repeat(50));

  return "Inventario actualizado";
}

// Ejecutar
actualizarInventario2025();
