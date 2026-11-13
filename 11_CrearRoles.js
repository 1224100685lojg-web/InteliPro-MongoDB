const p = (col, acciones) => ({
  resource: { db: "InteliProMongo", collection: col },
  actions: acciones
});
const lectura = (...cols) => cols.map(c => p(c, ["find"]));
const crud = (...cols) => cols.map(c => p(c, ["find", "insert", "update", "remove"]));

// Vista pública: oculta costo y proveedor
db.createView("productosPublicos", "productos", [
  { $project: { PrecioCompra: 0, IdProveedor: 0 } }
]);

db.createRole({
  role: "gerenteTienda",
  privileges: [
    ...lectura("zonas","ciudades","tiendas","puestos","empleados","empleadoTelefonos",
               "clientes","clienteTelefonos","productos","categorias","proveedores",
               "proveedorTelefonos","ventas","detalleVentas","inventario","formasPago",
               "campanas","campanaProductos","encuestasVenta","encuestasVendedor",
               "encuestasTienda","estadisticasTienda"),
    p("revisionInventario", ["find", "insert"]),
    p("ordenesCompra", ["find", "insert", "update"]),
    p("ordenesCompraDetalle", ["find", "insert", "update"])
  ],
  roles: []
});

db.createRole({
  role: "vendedor",
  privileges: [
    ...lectura("tiendas","ciudades","clientes","productos","categorias","formasPago",
               "campanas","campanaProductos","encuestasTienda"),
    p("ventas", ["find", "insert"]),
    p("detalleVentas", ["find", "insert"]),
    p("inventario", ["find", "update"]),
    p("contadores", ["find", "update"])
  ],
  roles: []
});

db.createRole({
  role: "administrativo",
  privileges: [
    ...crud("tiendas","empleados","empleadoTelefonos","clientes","clienteTelefonos",
            "productos","proveedores","proveedorTelefonos","campanas","campanaProductos"),
    ...lectura("zonas","ciudades","puestos","categorias","formasPago","ventas",
               "detalleVentas","encuestasVenta","encuestasVendedor","encuestasTienda"),
    p("inventario", ["find", "update"]),
    p("revisionInventario", ["find", "insert"]),
    p("ordenesCompra", ["find", "insert", "update"]),
    p("ordenesCompraDetalle", ["find", "insert", "update"]),
    p("estadisticasTienda", ["find", "insert"]),
    p("contadores", ["find", "update"])
  ],
  roles: []
});

db.createRole({
  role: "cliente",
  privileges: [
    ...lectura("productosPublicos","clientes","formasPago","tiendas"),
    p("ventas", ["find", "insert"]),
    p("detalleVentas", ["find", "insert"]),
    p("encuestasVenta", ["insert"]),
    p("encuestasVendedor", ["insert"]),
    p("encuestasTienda", ["insert"]),
    p("contadores", ["find", "update"])
  ],
  roles: []
});
