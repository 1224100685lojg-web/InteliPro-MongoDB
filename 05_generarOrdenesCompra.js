function generarOrdenesCompra() {

  // 1) Obtener la fecha de la última revisión de stock
  var ultima = db.RevisionStock.find().sort({ FechaProceso: -1 }).limit(1).toArray();
  if (ultima.length == 0) return "Primero ejecuta revisarStock()";
  var fechaRevision = ultima[0].FechaProceso;

  // 2) Obtener el último IdOrden para continuar la numeración
  var ultimaOrden = db.ordenesCompra.find().sort({ IdOrden: -1 }).limit(1).toArray();
  var idOrden = 0;
  if (ultimaOrden.length > 0) idOrden = ultimaOrden[0].IdOrden;

  // Aquí se recuerda qué orden se creó para cada tienda + proveedor
  var ordenes = {};

  // 3) Recorrer los productos de esa revisión que NO están en OK
  db.RevisionStock.find({
    $and: [
      { FechaProceso: fechaRevision },
      { Estatus: { $ne: "OK" } }
    ]
  }).forEach(rev => {

    var producto = db.productos.findOne({ IdProducto: rev.IdProducto });
    if (!producto) return;

    // 4) Factor según la clasificación de venta (punto 3)
    var factor;
    if (producto.ClasificacionVenta == "Muy alta")  factor = 3;
    else if (producto.ClasificacionVenta == "Alta") factor = 2.5;
    else if (producto.ClasificacionVenta == "Media") factor = 2;
    else                                            factor = 1.5;

    // 5) Cantidad a pedir = lo que se quiere tener - lo que hay
    var cantidad = Math.ceil(rev.StockMinimo * factor - rev.Existencia);

    // 6) Crear la orden si aún no existe para esta tienda y proveedor
    var clave = rev.IdTienda + "-" + producto.IdProveedor;

    if (!ordenes[clave]) {
      idOrden = idOrden + 1;
      db.ordenesCompra.insertOne({
        IdOrden: idOrden,
        Folio: "OC-" + String(idOrden).padStart(6, "0"),
        Fecha: new Date(),
        Estatus: "Pendiente",
        FechaAtencion: null,
        IdTienda: rev.IdTienda,
        IdProveedor: producto.IdProveedor
      });
      ordenes[clave] = idOrden;
    }

    // 7) Guardar el detalle de la orden
    db.ordenesCompraDetalle.insertOne({
      IdOrden: ordenes[clave],
      IdProducto: rev.IdProducto,
      Cantidad: cantidad,
      EstatusStock: rev.Estatus,
      ClasificacionVenta: producto.ClasificacionVenta
    });

  });

  return idOrden + " es el último IdOrden generado";
}

// Ejecutar
generarOrdenesCompra();