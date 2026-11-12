function actualizarInventario2025() {

  // 1) Buscar las ventas realizadas durante el año 2025
  db.ventas.find({
    $and:[
       {Fecha: { $gte: ISODate("2025-01-01")}}, 
       {Fecha: {$lt: ISODate("2026-01-01")}}
    ]
  }).forEach(venta => {

    // 2) Por cada venta, buscar sus productos vendidos en detalleVentas
    //    (se relacionan por el campo IdVenta)
    db.detalleVentas.find({ IdVenta: venta.IdVenta }).forEach(detalle => {

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
            FechaCorte:    new Date()
        } } ]
      );

    });
  });
  return "Inventario actualizado";
}

// Ejecutar
actualizarInventario2025();
