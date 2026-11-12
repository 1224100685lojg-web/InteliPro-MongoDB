function revisarStock(usuario) {

  var fechaProceso = new Date();

  db.inventario.find({ Periodo: "2025-01" }).forEach(inv => {

    // 1) Buscar el nombre del producto
    var producto = db.productos.findOne({ IdProducto: inv.IdProducto });

    // 2) Calcular la diferencia entre existencia y stock mínimo
    var diferencia = inv.Existencia - inv.StockMinimo;

    // 3) Determinar el estatus
    var estatus;
    if (inv.Existencia == 0)                    estatus = "Producto Agotado";
    else if (inv.Existencia <= inv.StockMinimo) estatus = "Reordenar, por Agotarse";
    else                                        estatus = "OK";

    // 4) Guardar en la colección RevisionStock
    db.RevisionStock.insertOne({
      FechaProceso: fechaProceso,
      Usuario: usuario,
      IdTienda: inv.IdTienda,
      IdProducto: inv.IdProducto,
      Producto: producto.Nombre,
      Existencia: inv.Existencia,
      StockMinimo: inv.StockMinimo,
      Diferencia: diferencia,
      Estatus: estatus
    });

  });
  return "Revisión de stock realizada";
}

// Ejecutar
revisarStock("ana_admin");