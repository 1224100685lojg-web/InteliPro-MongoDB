function realizarVenta(Canal, IdTienda, IdEmpleado, IdCliente, IdFormaPago, productos) {

  // Validación
  if (productos.length == 0) {
    return "Error: no hay productos";
  }

  // Revisar productos y existencia, y calcular subtotal
  var subtotal = 0;
  var j = 0;

  while (j < productos.length) {
    var producto = db.productos.findOne({ IdProducto: productos[j].IdProducto });
    if (producto == null) {
      return "Error: el producto " + productos[j].IdProducto + " no existe";
    }

    var inv = db.inventario.findOne({ IdTienda: IdTienda, IdProducto: productos[j].IdProducto });
    if (inv == null || inv.Existencia < productos[j].Cantidad) {
      return "Error: existencia insuficiente de " + producto.Nombre;
    }

    subtotal = subtotal + productos[j].Cantidad * producto.PrecioVenta;
    j++;
  }

  var impuesto = subtotal * 0.043;
  var total = subtotal + impuesto;
  var idVenta = db.ventas.countDocuments() + 1;

  db.ventas.insertOne({
    IdVenta: idVenta, Fecha: new Date(), Canal: Canal,
    Subtotal: subtotal, Impuesto: impuesto, Total: total,
    IdTienda: IdTienda, IdEmpleado: IdEmpleado,
    IdCliente: IdCliente, IdFormaPago: IdFormaPago
  });

  j = 0;
  while (j < productos.length) {
    var prod = db.productos.findOne({ IdProducto: productos[j].IdProducto });

    db.detalleVentas.insertOne({
      IdVenta: idVenta,
      IdProducto: productos[j].IdProducto,
      Cantidad: productos[j].Cantidad,
      PrecioUnitario: prod.PrecioVenta
    });

    db.inventario.updateOne(
      { IdTienda: IdTienda, IdProducto: productos[j].IdProducto },
      { $inc: { Existencia: -productos[j].Cantidad, CantidadVenta: productos[j].Cantidad } }
    );
    j++;
  }
	print("-".repeat(50));
	print("Venta: " + idVenta);
	print("Subtotal: $" + subtotal);
	print("Impuesto: $" + impuesto.toFixed(2));
	print("Total: $" + total.toFixed(2));
	print("");
	print("-".repeat(50));
  	return "Venta registrada con número " + idVenta;
}