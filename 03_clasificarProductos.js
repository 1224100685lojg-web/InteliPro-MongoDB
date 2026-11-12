function clasificarProductos() {

  db.productos.find().forEach(producto => {

    // 1) Sumar las piezas vendidas de este producto en 2025
    var piezas = 0;

    db.ventas.find({
      $and: [
        { Fecha: { $gte: ISODate("2025-01-01") } },
        { Fecha: { $lt:  ISODate("2026-01-01") } }
      ]
    }).forEach(venta => {

      db.detalleVentas.find({ IdVenta: venta.IdVenta, IdProducto: producto.IdProducto })
        .forEach(detalle => {
          piezas = piezas + detalle.Cantidad;
        });

    });

    // 2) Determinar la clasificación
    var clasificacion;
    if (piezas > 200)      clasificacion = "Muy alta";
    else if (piezas > 150) clasificacion = "Alta";
    else if (piezas > 100) clasificacion = "Media";
    else                   clasificacion = "Baja";

    // 3) Guardar en la colección productos
    db.productos.updateOne(
      { IdProducto: producto.IdProducto },
      [ { $project: {
          IdProducto: 1,
          Nombre: 1,
          PrecioCompra: 1,
          PrecioVenta: 1,
          Activo: 1,
          IdCategoria: 1,
          IdProveedor: 1,
          PiezasVendidas2025: { $add: [piezas, 0] },
          ClasificacionVenta: clasificacion
      } } ]
    );

  });
  return "Productos clasificados";
}

// Ejecutar
clasificarProductos();