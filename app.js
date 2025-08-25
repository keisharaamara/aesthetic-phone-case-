// Simple store data
const PRODUCTS = [
  {id:1, name:"Clear Case Minimal", price:99000, compareAt:129000, model:"iPhone 13", img:"./assets/p1.svg"},
  {id:2, name:"Pastel Flower", price:109000, compareAt:149000, model:"iPhone 14", img:"./assets/p2.svg"},
  {id:3, name:"Holo Glitter", price:119000, compareAt:159000, model:"Samsung S23", img:"./assets/p3.svg"},
  {id:4, name:"Matte Frost", price:89000, compareAt:119000, model:"iPhone 15", img:"./assets/p4.svg"},
  {id:5, name:"Aurora Wave", price:129000, compareAt:169000, model:"Samsung A54", img:"./assets/p5.svg"},
  {id:6, name:"Cotton Candy", price:115000, compareAt:149000, model:"Vivo V29", img:"./assets/p6.svg"},
];

const TESTI = [
  {name:"Amel", rating:5, text:"Barangnya lucu banget, kualitas mantul!", when:"2 hari lalu"},
  {name:"Dimas", rating:4, text:"Pengemasan rapi, casing pas di HP.", when:"1 minggu lalu"},
  {name:"Salsa", rating:5, text:"Warna real, dapet bonus stiker juga 😍", when:"3 minggu lalu"},
  {name:"Raka", rating:4, text:"Respon cepat, recommended!", when:"kemarin"},
];

// Utilities
const rp = n => new Intl.NumberFormat('id-ID', {style:'currency', currency:'IDR', maximumFractionDigits:0}).format(n);
const $ = s => document.querySelector(s);

// State
let cart = JSON.parse(localStorage.getItem('cart-apc')||'[]');
const saveCart = () => localStorage.setItem('cart-apc', JSON.stringify(cart));

// Slider
let current = 0;
const slides = document.getElementById('slides');
const dots = document.getElementById('dots');

function renderDots(){
  dots.innerHTML = '';
  [...slides.children].forEach((_,i)=>{
    const b = document.createElement('button');
    b.className = i===current ? 'active' : '';
    b.addEventListener('click', ()=>goto(i));
    dots.appendChild(b);
  });
}
function goto(i){
  current = (i+slides.children.length)%slides.children.length;
  slides.style.transform = `translateX(-${current*100}%)`;
  renderDots();
}
$('#prevSlide').addEventListener('click', ()=>goto(current-1));
$('#nextSlide').addEventListener('click', ()=>goto(current+1));
setInterval(()=>goto(current+1), 5000);
renderDots();

// Year
document.getElementById('year').textContent = new Date().getFullYear();

// Render Products
function renderProducts(list=PRODUCTS){
  const grid = document.getElementById('productGrid');
  grid.innerHTML='';
  list.forEach(p=>{
    const el = document.createElement('article');
    el.className='card';
    el.innerHTML = `
      <img src="${p.img}" alt="${p.name} untuk ${p.model}"/>
      <div class="p">
        <h3>${p.name}</h3>
        <p class="muted">${p.model}</p>
        <div class="price">
          <strong>${rp(p.price)}</strong>
          <s>${rp(p.compareAt)}</s>
        </div>
        <button class="btn full" data-id="${p.id}">Tambahkan ke Keranjang</button>
      </div>`;
    grid.appendChild(el);
  });
  grid.querySelectorAll('button[data-id]').forEach(btn=>btn.addEventListener('click', addToCart));
}
renderProducts();

// Filters
const searchInput = document.getElementById('searchInput');
const modelFilter = document.getElementById('modelFilter');
function applyFilters(){
  const q = (searchInput.value||'').toLowerCase();
  const m = modelFilter.value;
  renderProducts(PRODUCTS.filter(p => 
    (!m || p.model===m) &&
    (p.name.toLowerCase().includes(q) || p.model.toLowerCase().includes(q))
  ));
}
searchInput.addEventListener('input', applyFilters);
modelFilter.addEventListener('change', applyFilters);

// Cart
function updateBadge(){
  document.getElementById('cartCount').textContent = cart.reduce((a,b)=>a+b.qty,0);
}
function addToCart(e){
  const id = Number(e.currentTarget.dataset.id);
  const found = cart.find(i=>i.id===id);
  if(found){ found.qty += 1; }
  else{
    const p = PRODUCTS.find(p=>p.id===id);
    cart.push({id:p.id, name:p.name, price:p.price, img:p.img, qty:1});
  }
  saveCart(); updateBadge(); renderCart();
}
function removeFromCart(id){
  cart = cart.filter(i=>i.id!==id);
  saveCart(); updateBadge(); renderCart();
}
function changeQty(id, delta){
  const it = cart.find(i=>i.id===id);
  if(!it) return;
  it.qty = Math.max(1, it.qty + delta);
  saveCart(); updateBadge(); renderCart();
}
function total(){
  return cart.reduce((s,i)=>s + i.price*i.qty, 0);
}
function renderCart(){
  const wrap = document.getElementById('cartItems');
  wrap.innerHTML = '';
  if(cart.length===0){
    wrap.innerHTML = '<p>Keranjang kosong. Yuk belanja dulu ✨</p>';
  }else{
    cart.forEach(i=>{
      const row = document.createElement('div');
      row.className = 'cart-row';
      row.innerHTML = `
        <img src="${i.img}" alt="${i.name}"/>
        <div>
          <strong>${i.name}</strong>
          <div class="muted">${rp(i.price)}</div>
          <div class="qty">
            <button aria-label="kurangi" data-q="${i.id}" data-d="-1">-</button>
            <span>${i.qty}</span>
            <button aria-label="tambah" data-q="${i.id}" data-d="1">+</button>
          </div>
        </div>
        <div style="display:grid;gap:6px;justify-items:end">
          <strong>${rp(i.price*i.qty)}</strong>
          <button data-del="${i.id}" aria-label="hapus">Hapus</button>
        </div>`;
      wrap.appendChild(row);
    });
  }
  document.getElementById('cartTotal').textContent = rp(total());
  // bind qty & delete
  wrap.querySelectorAll('button[data-q]').forEach(b=>b.addEventListener('click', e=>{
    changeQty(Number(e.currentTarget.dataset.q), Number(e.currentTarget.dataset.d));
  }));
  wrap.querySelectorAll('button[data-del]').forEach(b=>b.addEventListener('click', e=>{
    removeFromCart(Number(e.currentTarget.dataset.del));
  }));
}
renderCart();
updateBadge();

// Drawer
const drawer = document.getElementById('cartDrawer');
const openCartBtn = document.getElementById('openCartBtn');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartBackdrop = document.getElementById('cartBackdrop');
function openDrawer(){ drawer.setAttribute('aria-hidden','false'); }
function closeDrawer(){ drawer.setAttribute('aria-hidden','true'); }
openCartBtn.addEventListener('click', openDrawer);
closeCartBtn.addEventListener('click', closeDrawer);
cartBackdrop.addEventListener('click', closeDrawer);

// Checkout
const modal = document.getElementById('checkoutModal');
const checkoutBtn = document.getElementById('checkoutBtn');
const closeCheckout = document.getElementById('closeCheckout');
const checkoutBackdrop = document.getElementById('checkoutBackdrop');
checkoutBtn.addEventListener('click', ()=>{
  if(cart.length===0){ alert('Keranjang masih kosong.'); return;}
  modal.setAttribute('aria-hidden','false');
});
function closeModal(){ modal.setAttribute('aria-hidden','true'); }
closeCheckout.addEventListener('click', closeModal);
checkoutBackdrop.addEventListener('click', closeModal);

document.getElementById('checkoutForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  // Demo: show summary
  const data = Object.fromEntries(new FormData(e.currentTarget).entries());
  const summary = `Pesanan dibuat!\n\nNama: ${data.nama}\nHP: ${data.phone}\nPembayaran: ${data.pembayaran}\nTotal: ${rp(total())}\n\nDetail keranjang: ${cart.map(i=>i.name+' x'+i.qty).join(', ')}`;
  alert(summary);
  // Clear cart
  cart = []; saveCart(); updateBadge(); renderCart(); closeModal(); closeDrawer();
});

// Testimoni
function renderTesti(){
  const w = document.getElementById('testiWrap');
  const star = n => '★'.repeat(n)+'☆'.repeat(5-n);
  TESTI.forEach(t=>{
    const d = document.createElement('div');
    d.className = 'testi';
    d.innerHTML = `
      <div class="stars">${star(t.rating)}</div>
      <p>${t.text}</p>
      <div class="muted">— ${t.name} • ${t.when}</div>
    `;
    w.appendChild(d);
  });
}
renderTesti();
