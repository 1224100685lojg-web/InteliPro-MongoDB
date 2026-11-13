function productosSinMovimiento(FechaInicio, FechaFin) {

  var informe = [];

  db.productos.find().forEach(producto => {

    // 1) Ver si el producto se vendió en el periodo
    var vendido = false;

    db.ventas.find({
      $and: [
        { Fecha: { $gte: FechaInicio } },
        { Fecha: { $lt: FechaFin } }
      ]
    }).forEach(venta => {
      if (db.detalleVentas.findOne({ IdVenta: venta.IdVenta, IdProducto: producto.IdProducto })) {
        vendido = true;
      }
    });

    // 2) Si no se vendió, buscar categoría, proveedor y campañas
    if (!vendido) {

      var categoria = db.categorias.findOne({ IdCategoria: producto.IdCategoria });
      var proveedor = db.proveedores.findOne({ IdProveedor: producto.IdProveedor });

      var campanas = [];
      db.campanaProductos.find({ IdProducto: producto.IdProducto }).forEach(cp => {
        var campana = db.campanas.findOne({ IdCampana: cp.IdCampana });
        campanas.push({ IdCampana: campana.IdCampana, Nombre: campana.Nombre, Medio: campana.Medio });
      });

      informe.push({
        FechaInicio: FechaInicio,
        FechaFin: FechaFin,
        IdProducto: producto.IdProducto,
        Producto: producto.Nombre,
        Categoria: categoria.Nombre,
        Proveedor: proveedor.NombreComercial,
        Campanas: campanas
      });
    }

  });

  // 3) Mostrar el informe
  printjson(informe);
  return informe.length + " productos sin movimiento";
}
