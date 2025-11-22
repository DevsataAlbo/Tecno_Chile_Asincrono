// Inicializacion
const gestorProductos = new GestorProductos();
const carrito = new Carrito();

let productoSeleccionado = null;
let modalAgregar = null;

// Elementos del DOM
const elementos = {
    productosGrid: document.getElementById('productos-grid'),
    productosCount: document.getElementById('productos-count'),
    badgeCarrito: document.getElementById('badge-carrito'),
    inputBusqueda: document.getElementById('input-busqueda'),
    selectCategoria: document.getElementById('select-categoria'),
    inputPrecioMin: document.getElementById('input-precio-min'),
    inputPrecioMax: document.getElementById('input-precio-max'),
    btnAplicarFiltros: document.getElementById('btn-aplicar-filtros'),
    btnLimpiarFiltros: document.getElementById('btn-limpiar-filtros'),
    carritoVacio: document.getElementById('carrito-vacio'),
    carritoItems: document.getElementById('carrito-items'),
    carritoTotal: document.getElementById('carrito-total'),
    totalCarrito: document.getElementById('total-carrito'),
    btnFinalizar: document.getElementById('btn-finalizar'),
    btnVaciar: document.getElementById('btn-vaciar'),
    inputCantidad: document.getElementById('input-cantidad'),
    stockDisponible: document.getElementById('stock-disponible'),
    btnConfirmarAgregar: document.getElementById('btn-confirmar-agregar'),
    productoDetalle: document.getElementById('producto-detalle'),
    loadingOverlay: document.getElementById('loading-overlay')
};

// Inicializar aplicacion con carga asincrona
document.addEventListener('DOMContentLoaded', async () => {
    modalAgregar = new bootstrap.Modal(document.getElementById('modalAgregarCarrito'));

    await inicializarAplicacion();
    configurarEventos();
});

// Inicializacion asincrona de la aplicacion
async function inicializarAplicacion() {
    try {
        mostrarCargando(true, 'Cargando productos...');

        // Cargar productos de forma asincrona usando fetch()
        await gestorProductos.cargarProductosDesdeJSON();

        cargarCategorias();
        renderizarProductos();

        mostrarCargando(false);
        mostrarNotificacion('Productos cargados exitosamente', 'success');
    } catch (error) {
        mostrarCargando(false);
        mostrarNotificacion(`Error al cargar productos: ${error.message}`, 'danger');
        console.error(error);
    }
}

// Configurar eventos
const configurarEventos = () => {
    elementos.btnAplicarFiltros.addEventListener('click', aplicarFiltros);
    elementos.btnLimpiarFiltros.addEventListener('click', limpiarFiltros);
    elementos.btnVaciar.addEventListener('click', vaciarCarrito);
    elementos.btnFinalizar.addEventListener('click', finalizarCompra);
    elementos.btnConfirmarAgregar.addEventListener('click', confirmarAgregarCarrito);

    // Filtro en tiempo real para busqueda
    elementos.inputBusqueda.addEventListener('input', () => {
        if (elementos.inputBusqueda.value.length >= 3 || elementos.inputBusqueda.value.length === 0) {
            aplicarFiltros();
        }
    });
};

// Cargar categorias en el select
const cargarCategorias = () => {
    const categorias = gestorProductos.obtenerCategorias();
    elementos.selectCategoria.innerHTML = '<option value="todas">Todas las categorias</option>';

    categorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria;
        option.textContent = categoria;
        elementos.selectCategoria.appendChild(option);
    });
};

// Renderizar productos
const renderizarProductos = (productos = null) => {
    const listaProductos = productos || gestorProductos.obtenerTodos();
    elementos.productosGrid.innerHTML = '';
    elementos.productosCount.textContent = `${listaProductos.length} productos`;

    if (listaProductos.length === 0) {
        elementos.productosGrid.innerHTML = `
            <div class="col-12">
                <div class="alert alert-warning">No se encontraron productos con los filtros aplicados</div>
            </div>
        `;
        return;
    }

    listaProductos.forEach(producto => {
        const col = document.createElement('div');
        col.className = 'col-md-4 col-lg-3 mb-4';

        col.innerHTML = `
            <div class="card h-100 producto-card">
                <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${producto.nombre}</h5>
                    <p class="card-text text-muted small">${producto.descripcion}</p>
                    <div class="mt-auto">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="badge bg-secondary">${producto.categoria}</span>
                            <strong class="text-primary">$${producto.precio.toLocaleString('es-CL')}</strong>
                        </div>
                        <div class="mb-2">
                            <small class="stock-badge ${producto.claseStock}">${producto.mensajeStock}</small>
                        </div>
                        <div class="etiquetas mb-2">
                            ${producto.etiquetas.map(etiqueta => `<span class="badge bg-light text-dark">${etiqueta}</span>`).join(' ')}
                        </div>
                        <button
                            class="btn btn-primary w-100"
                            onclick="abrirModalAgregar(${producto.id})"
                            ${!producto.stockDisponible ? 'disabled' : ''}>
                            ${producto.stockDisponible ? 'Agregar al Carrito' : 'Sin Stock'}
                        </button>
                    </div>
                </div>
            </div>
        `;

        elementos.productosGrid.appendChild(col);
    });
};

// Aplicar filtros
const aplicarFiltros = () => {
    const filtros = {
        categoria: elementos.selectCategoria.value,
        precioMin: elementos.inputPrecioMin.value,
        precioMax: elementos.inputPrecioMax.value,
        textoBusqueda: elementos.inputBusqueda.value
    };

    const productosFiltrados = gestorProductos.filtrar(filtros);
    renderizarProductos(productosFiltrados);
};

// Limpiar filtros
const limpiarFiltros = () => {
    elementos.inputBusqueda.value = '';
    elementos.selectCategoria.value = 'todas';
    elementos.inputPrecioMin.value = '';
    elementos.inputPrecioMax.value = '';
    renderizarProductos();
};

// Abrir modal para agregar al carrito
const abrirModalAgregar = async (id) => {
    productoSeleccionado = gestorProductos.obtenerPorId(id);

    if (!productoSeleccionado) {
        mostrarNotificacion('Error: Producto no encontrado', 'danger');
        return;
    }

    // Verificacion asincrona de disponibilidad
    try {
        mostrarCargando(true, 'Verificando disponibilidad...');
        await productoSeleccionado.verificarDisponibilidad(1);
        mostrarCargando(false);

        elementos.productoDetalle.innerHTML = `
            <div class="text-center mb-3">
                <img src="${productoSeleccionado.imagen}" class="img-fluid" style="max-height: 200px;" alt="${productoSeleccionado.nombre}">
            </div>
            <h5>${productoSeleccionado.nombre}</h5>
            <p class="text-muted">${productoSeleccionado.descripcion}</p>
            <p class="text-primary"><strong>Precio: $${productoSeleccionado.precio.toLocaleString('es-CL')}</strong></p>
        `;

        elementos.inputCantidad.value = 1;
        elementos.inputCantidad.max = productoSeleccionado.stock;
        elementos.stockDisponible.textContent = `Stock disponible: ${productoSeleccionado.stock} unidades`;

        modalAgregar.show();
    } catch (error) {
        mostrarCargando(false);
        mostrarNotificacion(error.message, 'danger');
    }
};

// Confirmar agregar al carrito
const confirmarAgregarCarrito = async () => {
    const cantidad = parseInt(elementos.inputCantidad.value);

    if (!productoSeleccionado) {
        mostrarNotificacion('Error: No hay producto seleccionado', 'danger');
        return;
    }

    if (cantidad <= 0) {
        mostrarNotificacion('La cantidad debe ser mayor a 0', 'warning');
        return;
    }

    try {
        mostrarCargando(true, 'Verificando stock...');

        // Verificacion asincrona antes de agregar
        await productoSeleccionado.verificarDisponibilidad(cantidad);

        carrito.agregar(productoSeleccionado, cantidad);
        actualizarCarrito();
        modalAgregar.hide();

        mostrarCargando(false);
        mostrarNotificacion(`${productoSeleccionado.nombre} agregado al carrito`, 'success');
    } catch (error) {
        mostrarCargando(false);
        mostrarNotificacion(error.message, 'danger');
    }
};

// Actualizar visualizacion del carrito
const actualizarCarrito = () => {
    elementos.badgeCarrito.textContent = carrito.cantidadTotal;

    if (carrito.vacio) {
        elementos.carritoVacio.style.display = 'block';
        elementos.carritoItems.style.display = 'none';
        elementos.carritoTotal.style.display = 'none';
        return;
    }

    elementos.carritoVacio.style.display = 'none';
    elementos.carritoItems.style.display = 'block';
    elementos.carritoTotal.style.display = 'block';

    elementos.carritoItems.innerHTML = carrito.items.map(item => `
        <div class="card mb-2">
            <div class="card-body p-2">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="flex-grow-1">
                        <h6 class="mb-1">${item.producto.nombre}</h6>
                        <small class="text-muted">$${item.producto.precio.toLocaleString('es-CL')} c/u</small>
                    </div>
                    <button class="btn btn-sm btn-danger" onclick="eliminarDelCarrito(${item.producto.id})">
                        X
                    </button>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-2">
                    <div class="input-group input-group-sm" style="max-width: 120px;">
                        <button class="btn btn-outline-secondary" onclick="modificarCantidadCarrito(${item.producto.id}, ${item.cantidad - 1})">-</button>
                        <input type="text" class="form-control text-center" value="${item.cantidad}" readonly>
                        <button class="btn btn-outline-secondary" onclick="modificarCantidadCarrito(${item.producto.id}, ${item.cantidad + 1})" ${item.cantidad >= item.producto.stock ? 'disabled' : ''}>+</button>
                    </div>
                    <strong>$${(item.producto.precio * item.cantidad).toLocaleString('es-CL')}</strong>
                </div>
            </div>
        </div>
    `).join('');

    elementos.totalCarrito.textContent = `$${carrito.total.toLocaleString('es-CL')}`;
};

// Modificar cantidad en el carrito
const modificarCantidadCarrito = (productoId, nuevaCantidad) => {
    const item = carrito.items.find(i => i.producto.id === productoId);

    if (!item) return;

    if (nuevaCantidad <= 0) {
        eliminarDelCarrito(productoId);
        return;
    }

    if (nuevaCantidad > item.producto.stock) {
        mostrarNotificacion(`Solo hay ${item.producto.stock} unidades disponibles`, 'warning');
        return;
    }

    carrito.modificarCantidad(productoId, nuevaCantidad);
    actualizarCarrito();
};

// Eliminar del carrito
const eliminarDelCarrito = (productoId) => {
    if (confirm('¿Desea eliminar este producto del carrito?')) {
        carrito.eliminar(productoId);
        actualizarCarrito();
    }
};

// Vaciar carrito
const vaciarCarrito = () => {
    if (carrito.vacio) {
        mostrarNotificacion('El carrito ya esta vacio', 'info');
        return;
    }

    if (confirm('¿Desea vaciar todo el carrito?')) {
        carrito.limpiar();
        actualizarCarrito();
    }
};

// Finalizar compra con operaciones asincronas
const finalizarCompra = async () => {
    if (carrito.vacio) {
        mostrarNotificacion('El carrito esta vacio', 'warning');
        return;
    }

    const mensaje = `
        RESUMEN DE COMPRA

        Productos: ${carrito.cantidadTotal} unidades
        Total a pagar: $${carrito.total.toLocaleString('es-CL')}

        ¿Desea confirmar la compra?
    `;

    if (!confirm(mensaje)) {
        return;
    }

    try {
        mostrarCargando(true, 'Procesando compra...');

        // Procesar compra de forma asincrona
        const resultado = await carrito.procesarCompra();

        // Guardar cambios en el servidor
        await gestorProductos.guardarEnServidor();

        mostrarCargando(false);
        mostrarNotificacion('Compra realizada con exito. Se ha enviado una notificacion al responsable de inventario.', 'success');

        console.log('Resultado de la compra:', resultado);

        carrito.limpiar();
        actualizarCarrito();
        renderizarProductos();

        // Cerrar offcanvas
        const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('carritoOffcanvas'));
        if (offcanvas) offcanvas.hide();
    } catch (error) {
        mostrarCargando(false);
        mostrarNotificacion(error.mensaje || 'Error al procesar la compra', 'danger');
        console.error('Error en la compra:', error);
    }
};

// Mostrar/ocultar overlay de carga
const mostrarCargando = (mostrar, mensaje = 'Cargando...') => {
    if (mostrar) {
        elementos.loadingOverlay.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-3">${mensaje}</p>
        `;
        elementos.loadingOverlay.style.display = 'flex';
    } else {
        elementos.loadingOverlay.style.display = 'none';
    }
};

// Mostrar notificacion
const mostrarNotificacion = (mensaje, tipo = 'info') => {
    const notificacion = document.createElement('div');
    notificacion.className = `alert alert-${tipo} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
    notificacion.style.zIndex = '9999';
    notificacion.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(notificacion);

    setTimeout(() => {
        notificacion.remove();
    }, 5000);
};
