import urllib.parse
import datetime as dt
from datetime import datetime
from decimal import Decimal
import pandas as pd
from sqlalchemy import create_engine
from pymongo import MongoClient

# ---------- Conexión a SQL Server ----------
servidor = 'LAPTOP-OBIL9N6D\SQLEXPRESS'
base_datos = 'InteliProSQL'

params = (
    'DRIVER={ODBC Driver 17 for SQL Server};'
    f'SERVER={servidor};'
    f'DATABASE={base_datos};'
    'UID=sa;'
    'PWD=SQLServer25#123;'
    'TrustServerCertificate=yes;'
)

params_codificados = urllib.parse.quote_plus(params)
url_conexion = f"mssql+pyodbc:///?odbc_connect={params_codificados}"
engine = create_engine(url_conexion)

# ---------- Conexión a MongoDB ----------
uri = "mongodb+srv://patricioxortegax_db_user:5EsNlgs3ZkH9ziZX@intelipro.zp7qjqe.mongodb.net/?retryWrites=true&w=majority&appName=mongosh+2.12.0"

cliente = MongoClient(uri)
db = cliente['InteliProMongo']

# Año anterior al actual
anio_anterior = datetime.now().year - 1
print('Ventas del año:', anio_anterior)


def convertir(valor):
    """Convierte un valor de SQL Server a un tipo que Mongo sí acepta."""
    if isinstance(valor, Decimal):
        return float(valor)
    if hasattr(valor, 'to_pydatetime'):          # pandas Timestamp
        return valor.to_pydatetime()
    if isinstance(valor, dt.date) and not isinstance(valor, dt.datetime):
        return dt.datetime.combine(valor, dt.time.min)
    return valor


def copiar(query, coleccion):
    # Leer de SQL Server
    df = pd.read_sql(query, engine)

    # Cambiar los vacíos (NaN / NaT) por None para que Mongo guarde null
    df = df.astype(object).where(df.notnull(), None)

    # Convertir a lista de diccionarios y limpiar tipos
    documentos = df.to_dict('records')
    for doc in documentos:
        for clave, valor in doc.items():
            doc[clave] = convertir(valor)

    # Borrar lo anterior para poder correr el script varias veces
    db[coleccion].delete_many({})

    if len(documentos) > 0:
        db[coleccion].insert_many(documentos)
        print(coleccion, ':', len(documentos), 'documentos')
    else:
        print(coleccion, ': sin datos')


# ---------- Tablas completas ----------
copiar('SELECT * FROM Zona', 'zonas')
copiar('SELECT * FROM Ciudad', 'ciudades')
copiar('SELECT * FROM Tienda', 'tiendas')
copiar('SELECT * FROM Puesto', 'puestos')
copiar('SELECT * FROM Empleado', 'empleados')
copiar('SELECT * FROM EmpleadoTelefono', 'empleadoTelefonos')
copiar('SELECT * FROM Proveedor', 'proveedores')
copiar('SELECT * FROM ProveedorTelefono', 'proveedorTelefonos')
copiar('SELECT * FROM Categoria', 'categorias')
copiar('SELECT * FROM Campana', 'campanas')
copiar('SELECT * FROM FormaPago', 'formasPago')

# ---------- Solo activos ----------
copiar('SELECT * FROM Cliente WHERE Activo = 1', 'clientes')
copiar('SELECT * FROM ClienteTelefono '
       'WHERE IdCliente IN (SELECT IdCliente FROM Cliente WHERE Activo = 1)',
       'clienteTelefonos')

copiar('SELECT * FROM Producto WHERE Activo = 1', 'productos')
copiar('SELECT * FROM CampanaProducto '
       'WHERE IdProducto IN (SELECT IdProducto FROM Producto WHERE Activo = 1)',
       'campanaProductos')

# ---------- Solo año anterior ----------
copiar(f'SELECT * FROM Venta WHERE YEAR(Fecha) = {anio_anterior}', 'ventas')
copiar('SELECT * FROM DetalleVenta '
       f'WHERE IdVenta IN (SELECT IdVenta FROM Venta WHERE YEAR(Fecha) = {anio_anterior})',
       'detalleVentas')

# ---------- Inventario (REQ 2: situación al inicio de 2025, solo productos activos) ----------
copiar(f"SELECT * FROM Inventario "
       f"WHERE Periodo = '{anio_anterior}-01' "
       f"AND IdProducto IN (SELECT IdProducto FROM Producto WHERE Activo = 1)",
       'inventario')

# ---------- Órdenes de compra (REQ 5) ----------
copiar('SELECT * FROM OrdenCompra', 'ordenesCompra')
copiar('SELECT * FROM OrdenCompraDetalle', 'ordenesCompraDetalle')

# ---------- Encuestas (REQ 7) ----------
copiar('SELECT * FROM EncuestaVenta '
       f'WHERE IdVenta IN (SELECT IdVenta FROM Venta WHERE YEAR(Fecha) = {anio_anterior})',
       'encuestasVenta')
copiar('SELECT * FROM EncuestaVendedor '
       f'WHERE IdVenta IN (SELECT IdVenta FROM Venta WHERE YEAR(Fecha) = {anio_anterior})',
       'encuestasVendedor')
# Tienda (Fisica / Linea): IdCliente = null cuando la evaluación es anónima
copiar(f'SELECT * FROM EncuestaTienda WHERE YEAR(Fecha) = {anio_anterior}',
       'encuestasTienda')

cliente.close()
print('Listo')