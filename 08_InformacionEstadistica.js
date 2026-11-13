function generarEstadisticas(Periodo, FechaInicio, FechaFin) {

  var fechaProceso = new Date();

  // Si ya se generó este periodo, se borra para no duplicar
  db.estadisticasTienda.deleteMany({ Periodo: Periodo });

  db.tiendas.find().forEach(tienda => {

    // 1) % de comisión según la zona de la tienda
    var ciudad = db.ciudades.findOne({ IdCiudad: tienda.IdCiudad });
    var zona = db.zonas.findOne({ IdZona: ciudad.IdZona });

    var monto = 0;
    var cantidad = 0;
    var impuestoTotal = 0;
    var impuestosPorVenta = [];
    var piezas = {};          // piezas vendidas por producto
    var porCategoria = {};    // monto vendido por categoría

    // 2) Recorrer las ventas de la tienda en el periodo
    db.ventas.find({
      $and: [
        { IdTienda: tienda.IdTienda },
        { Fecha: { $gte: FechaInicio } },
        { Fecha: { $lt: FechaFin } }
      ]
    }).forEach(venta => {

      monto = monto + venta.Total;
      cantidad = cantidad + 1;

      // Impuesto 4.3% de esta venta
      var impuesto = Math.round(venta.Subtotal * 0.043 * 100) / 100;
      impuestoTotal = impuestoTotal + impuesto;
      impuestosPorVenta.push({ IdVenta: venta.IdVenta, Folio: venta.Folio, Impuesto: impuesto });

      // 3) Recorrer los productos de la venta
      db.detalleVentas.find({ IdVenta: venta.IdVenta }).forEach(detalle => {

        // piezas por producto
        if (!piezas[detalle.IdProducto]) piezas[detalle.IdProducto] = 0;
        piezas[detalle.IdProducto] = piezas[detalle.IdProducto] + detalle.Cantidad;

        // monto por categoría
        var producto = db.productos.findOne({ IdProducto: detalle.IdProducto });
        if (!porCategoria[producto.IdCategoria]) porCategoria[producto.IdCategoria] = 0;
        porCategoria[producto.IdCategoria] =
          porCategoria[producto.IdCategoria] + detalle.Cantidad * detalle.PrecioUnitario;
      });
    });

    // 4) Producto más y menos vendido
    var masVendido = null;
    var menosVendido = null;
    var maxPiezas = 0;
    var minPiezas = 0;

    for (var id in piezas) {
      if (masVendido == null || piezas[id] > maxPiezas) {
        masVendido = Number(id);
        maxPiezas = piezas[id];
      }
      if (menosVendido == null || piezas[id] < minPiezas) {
        menosVendido = Number(id);
        minPiezas = piezas[id];
      }
    }

    var nombreMas = null;
    var nombreMenos = null;
    if (masVendido != null) {
      nombreMas = db.productos.findOne({ IdProducto: masVendido }).Nombre;
      nombreMenos = db.productos.findOne({ IdProducto: menosVendido }).Nombre;
    }

    // 5) Monto por categoría con su nombre
    var categorias = [];
    for (var idCat in porCategoria) {
      var cat = db.categorias.findOne({ IdCategoria: Number(idCat) });
      categorias.push({
        IdCategoria: Number(idCat),
        Categoria: cat.Nombre,
        Monto: porCategoria[idCat]
      });
    }

    // 6) Promedio y comisión
    var promedio = 0;
    if (cantidad > 0) promedio = monto / cantidad;

    var comision = monto * zona.PorcentajeComision / 100;

    // 7) Guardar en la colección estadisticasTienda
    db.estadisticasTienda.insertOne({
      Periodo: Periodo,
      FechaInicio: FechaInicio,
      FechaFin: FechaFin,
      FechaProceso: fechaProceso,
      IdTienda: tienda.IdTienda,
      Tienda: tienda.Nombre,
      Zona: zona.Nombre,
      PorcentajeComision: zona.PorcentajeComision,
      MontoVenta: monto,
      MontoComision: comision,
      CantidadVentas: cantidad,
      PromedioVenta: promedio,
      ProductoMasVendido: { IdProducto: masVendido, Nombre: nombreMas, Piezas: maxPiezas },
      ProductoMenosVendido: { IdProducto: menosVendido, Nombre: nombreMenos, Piezas: minPiezas },
      MontoImpuesto: impuestoTotal,
      ImpuestosPorVenta: impuestosPorVenta,
      MontoPorCategoria: categorias
    });

  });
  return "Estadísticas generadas";
}
