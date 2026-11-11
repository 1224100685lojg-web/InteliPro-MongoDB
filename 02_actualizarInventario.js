function actualizarInventario2025() {
  db.Venta.find({
    $and[
       {Fecha: { $gte: ISODate("2025-01-01")}}, 
       {Fecha: {$lt: ISODate("2026-01-01")}}
    ]
  }).forEach(venta => {

    db.DetalleVenta.find({ IdVenta: venta.IdVenta }).forEach(detalle => {

      db.Inventario.updateOne(
        { IdTienda: venta.IdTienda, IdProducto: detalle.IdProducto, Periodo: "2025-01" },
        [ { $project: {
            IdTienda: 1,
            IdProducto: 1,
            Periodo: 1,
            StockMinimo: 1,
            Existencia:    { $subtract: ["$Existencia", detalle.Cantidad] },
            CantidadVenta: { $add: ["$CantidadVenta", detalle.Cantidad] },
            FechaCorte:    new Date()
        } } ]
      );

    });
  });
  return "Inventario actualizado";
}

// Ejecutar
actualizarInventario2025();