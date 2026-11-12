function clasificarClientes() {

  db.clientes.find().forEach(cliente => {

    // 1) Contar compras y sumar el importe de este cliente en 2025
    var compras = 0;
    var importe = 0;

    db.ventas.find({
      $and: [
        { IdCliente: cliente.IdCliente },
        { Fecha: { $gte: ISODate("2025-01-01") } },
        { Fecha: { $lt:  ISODate("2026-01-01") } }
      ]
    }).forEach(venta => {
      compras = compras + 1;
      importe = importe + venta.Total;
    });

    // 2) Determinar el nivel
    var nivel;
    if (compras >= 12 && importe >= 50000)      nivel = "VIP";
    else if (compras >= 8 || importe >= 25000)  nivel = "Preferente";
    else if (compras >= 4 || importe >= 10000)  nivel = "Frecuente";
    else                                        nivel = "Básico";

    // 3) Guardar en la colección clientes
    db.clientes.updateOne(
      { IdCliente: cliente.IdCliente },
      [ { $addFields: {
          ComprasAnio:  compras,
          ImporteAnio:  importe,
          NivelCliente: nivel
      } } ]
    );

  });
  return "Clientes clasificados";
}