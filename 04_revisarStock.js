function revisarStock(usuario) {

  var fechaProceso = new Date();
  var total = 0, ok = 0, reordenar = 0, agotados = 0;

  db.inventario.find({ Periodo: "2025-01" }).forEach(inv => {

    // 1) Buscar el nombre del producto
    var producto = db.productos.findOne({ IdProducto: inv.IdProducto });

    // 2) Calcular la diferencia entre existencia y stock mínimo
    var diferencia = inv.Existencia - inv.StockMinimo;

    // 3) Determinar el estatus
    var estatus;
    if (inv.Existencia <= 0) {
      estatus = "Producto Agotado";
      agotados++;
    } else if (inv.Existencia <= inv.StockMinimo) {
      estatus = "Reordenar, por Agotarse";
      reordenar++;
    } else {
      estatus = "OK";
       ok++;
    }
     total++

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
  print("-".repeat(50));
  print("Revisión de stock - " + fechaProceso.toISOString());
  print("Usuario: " + usuario);
  print("Productos revisados: " + total);
  print("OK: " + ok);
  print("Reordenar, por Agotarse: " + reordenar);
  print("Producto Agotado: " + agotados);
  print("-".repeat(50));

  return "Revisión de stock realizada";
}

// Ejecutar
revisarStock("ana_admin");
