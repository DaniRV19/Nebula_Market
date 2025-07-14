// app.js

// Estado
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
let productos = [];
let usuario = null;
let paginaActual = 1;
const productosPorPagina = 9;

// Elementos DOM
const productsSection = document.getElementById("productsSection");
const favoritesGrid = document.getElementById("favoritesGrid");
const favoritesSection = document.getElementById("favoritesSection");
const favoritesCount = document.getElementById("favoritesCount");
const cartOverlay = document.getElementById("cartOverlay");
const cart = document.getElementById("cart");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");
const pagination = document.getElementById("pagination");
const searchInput = document.getElementById("searchInput");
const toggleFavoritesBtn = document.getElementById("toggleFavorites");

// Datos ficticios
function generarProductos() {
  const categorias = ["Tecnología", "Hogar", "Moda", "Juguetes", "Deportes"];
  for (let i = 1; i <= 50; i++) {
    productos.push({
      id: i,
      nombre: `Producto ${i}`,
      precio: parseFloat((Math.random() * 100).toFixed(2)),
      categoria: categorias[i % categorias.length],
      imagen: `https://picsum.photos/seed/${i}/300/200`
    });
  }
}

generarProductos();

function renderProductos(productosFiltrados) {
  productsSection.innerHTML = "";
  const inicio = (paginaActual - 1) * productosPorPagina;
  const fin = inicio + productosPorPagina;
  const pagina = productosFiltrados.slice(inicio, fin);

  pagina.forEach(p => {
    const isFav = favoritos.includes(p.id);
    const card = document.createElement("div");
    card.className = "bg-white p-4 rounded-lg shadow hover:shadow-lg transition";
    card.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre}" class="w-full h-48 object-cover rounded mb-2" />
      <h3 class="text-lg font-semibold text-pink-600">${p.nombre}</h3>
      <p class="text-gray-600 mb-2">$${p.precio.toFixed(2)}</p>
      <div class="flex justify-between items-center">
        <button onclick="agregarAlCarrito(${p.id})" class="bg-pink-600 text-white px-3 py-1 rounded hover:bg-pink-700">Agregar</button>
        <button onclick="toggleFavorito(${p.id})" class="text-xl">${isFav ? "❤️" : "🤍"}</button>
      </div>
    `;
    productsSection.appendChild(card);
  });

  renderPaginacion(productosFiltrados.length);
}

function renderPaginacion(total) {
  pagination.innerHTML = "";
  const totalPaginas = Math.ceil(total / productosPorPagina);

  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = `px-3 py-1 rounded ${i === paginaActual ? "bg-pink-600 text-white" : "bg-white text-pink-600 border border-pink-600"}`;
    btn.onclick = () => {
      paginaActual = i;
      aplicarBusqueda();
    };
    pagination.appendChild(btn);
  }
}

function aplicarBusqueda() {
  const termino = searchInput.value.toLowerCase();
  const filtrados = productos.filter(p => p.nombre.toLowerCase().includes(termino));
  renderProductos(filtrados);
}

searchInput.addEventListener("input", aplicarBusqueda);

function agregarAlCarrito(id) {
  const producto = productos.find(p => p.id === id);
  carrito.push(producto);
  actualizarCarrito();
}

// Pagar
document.getElementById("checkout").addEventListener("click", () => {
  if (carrito.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }

  if (!usuario) {
    alert("Debes iniciar sesión para realizar la compra.");
    return;
  }

  const confirmacion = confirm("¿Deseas confirmar la compra?");
  if (confirmacion) {
    alert("¡Compra realizada con éxito! 🎉");
    carrito = [];
    localStorage.removeItem("carrito");
    actualizarCarrito();
    cartOverlay.classList.remove("open");
    cart.classList.remove("open");
  }
});


function actualizarCarrito() {
  cartItems.innerHTML = "";
  let total = 0;
  carrito.forEach((p, i) => {
    total += p.precio;
    const item = document.createElement("div");
    item.className = "flex justify-between items-center gap-2";
    item.innerHTML = `
      <span class="text-sm">${p.nombre}</span>
      <span class="text-sm">$${p.precio.toFixed(2)}</span>
      <button onclick="eliminarDelCarrito(${i})" class="text-red-600 text-lg">&times;</button>
    `;
    cartItems.appendChild(item);
  });
  cartTotal.textContent = `$${total.toFixed(2)}`;
  cartCount.textContent = carrito.length;
  cartCount.classList.toggle("hidden", carrito.length === 0);
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

function eliminarDelCarrito(index) {
  carrito.splice(index, 1);
  actualizarCarrito();
}

function toggleFavorito(id) {
  const index = favoritos.indexOf(id);
  if (index > -1) {
    favoritos.splice(index, 1);
  } else {
    favoritos.push(id);
  }
  localStorage.setItem("favoritos", JSON.stringify(favoritos));
  actualizarFavoritos();
  aplicarBusqueda();
}

function actualizarFavoritos() {
  favoritesCount.textContent = favoritos.length;
  favoritesCount.classList.toggle("hidden", favoritos.length === 0);

  favoritesGrid.innerHTML = "";
  const favProductos = productos.filter(p => favoritos.includes(p.id));
  favProductos.forEach(p => {
    const card = document.createElement("div");
    card.className = "bg-white p-4 rounded-lg shadow hover:shadow-lg transition";
    card.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre}" class="w-full h-48 object-cover rounded mb-2" />
      <h3 class="text-lg font-semibold text-pink-600">${p.nombre}</h3>
      <p class="text-gray-600 mb-2">$${p.precio.toFixed(2)}</p>
      <button onclick="toggleFavorito(${p.id})" class="text-xl">❤️</button>
    `;
    favoritesGrid.appendChild(card);
  });
  favoritesSection.classList.remove("hidden");
}

document.getElementById("toggleCart").addEventListener("click", () => {
  cartOverlay.classList.toggle("open");
  cart.classList.toggle("open");
});
document.getElementById("cartCloseBtn").addEventListener("click", () => {
  cartOverlay.classList.remove("open");
  cart.classList.remove("open");
});
toggleFavoritesBtn.addEventListener("click", () => {
  if (favoritesSection.classList.contains("hidden")) {
    actualizarFavoritos();
  } else {
    favoritesSection.classList.add("hidden");
  }
});

// Login simple
const loginModal = document.getElementById("loginModal");
const loginBtn = document.getElementById("loginBtn");
const closeLoginModal = document.getElementById("closeLoginModal");
const loginForm = document.getElementById("loginForm");

loginBtn.onclick = () => loginModal.classList.remove("hidden");
closeLoginModal.onclick = () => loginModal.classList.add("hidden");

loginForm.onsubmit = e => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  if (username && password) {
    usuario = username;
    loginModal.classList.add("hidden");
    alert(`Bienvenido, ${usuario}`);
  }
};

actualizarCarrito();
actualizarFavoritos();
aplicarBusqueda();
