let stockData = [];
let editMode = false;
let editId = null;

const el = {
    tabelDashboard: document.querySelector('#tabel-barang tbody'),
    tabelAll: document.querySelector('#tabel-all tbody'),
    totalStok: document.getElementById('total-stok'),
    hampirHabis: document.getElementById('hampir-habis'),
    stokAman: document.getElementById('stok-aman'),
    modal: document.getElementById('modal'),
    form: document.getElementById('form'),
    modalTitle: document.getElementById('modal-title'),
    btnText: document.getElementById('btn-text'),
    inputNama: document.getElementById('nama'),
    inputStok: document.getElementById('stok'),
    inputHarga: document.getElementById('harga'),
    editIdInput: document.getElementById('edit-id')
};

// Format Rupiah
function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Get Badge Status
function getStockBadge(stok) {
    if (stok >= 50) return '<span class="badge badge-success">✅ Aman</span>';
    if (stok >= 10) return '<span class="badge badge-warning">⚠️ Sedang</span>';
    return '<span class="badge badge-danger">🔴 Habis</span>';
}

// Create Table Row
function createTableRow(item, tbody) {
    const row = tbody.insertRow();
    row.innerHTML = `
        <td><strong>#${item.id}</strong></td>
        <td>${item.nama}</td>
        <td><strong>${item.stok}</strong></td>
        <td>${formatRupiah(item.hargaBeli)}</td>
        <td>${getStockBadge(item.stok)}</td>
        <td>
            <div class="action-btns">
                <button class="btn btn-success btn-sm edit-btn" onclick="editItem(${item.id})">
                    ✏️ Edit
                </button>
                <button class="btn btn-danger btn-sm delete-btn" onclick="deleteItem(${item.id})">
                    🗑️ Hapus
                </button>
            </div>
        </td>
    `;
}

// Render Table
function renderTable() {
    let totalStok = 0;
    el.tabelDashboard.innerHTML = '';
    el.tabelAll.innerHTML = '';

    if (stockData.length === 0) {
        const emptyMsg = `
            <tr>
                <td colspan="6" class="empty-state">
                    <div class="empty-icon">📦</div>
                    <p><strong>Belum ada data barang</strong></p>
                    <p>Klik "Tambah Barang" untuk mulai</p>
                </td>
            </tr>
        `;
        el.tabelDashboard.innerHTML = emptyMsg;
        el.tabelAll.innerHTML = emptyMsg;
    } else {
        // Dashboard - Top 5
        stockData.slice(0, 5).forEach(item => {
            createTableRow(item, el.tabelDashboard);
        });
        
        // All items
        stockData.forEach(item => {
            totalStok += item.stok;
            createTableRow(item, el.tabelAll);
        });
    }

    // Update stats
    el.totalStok.textContent = totalStok.toLocaleString('id-ID');
    el.hampirHabis.textContent = stockData.filter(i => i.stok < 10).length;
    
    const stokAmanCount = stockData.filter(i => i.stok >= 10).length;
    const persentase = stockData.length > 0 ? ((stokAmanCount / stockData.length) * 100).toFixed(0) : 0;
    el.stokAman.textContent = persentase + '%';
}

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        const page = e.currentTarget.dataset.page;
        
        // Update active nav
        document.querySelectorAll('.nav-item').forEach(nav => {
            nav.classList.remove('active');
        });
        e.currentTarget.classList.add('active');
        
        // Show page
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(page).classList.add('active');
        
        renderTable();
    });
});

// Open Modal - Add
document.getElementById('btn-tambah').addEventListener('click', () => {
    editMode = false;
    editId = null;
    el.modalTitle.textContent = 'Tambah Barang Baru';
    el.btnText.textContent = 'Simpan';
    el.form.reset();
    el.modal.classList.add('active');
});

// Close Modal
document.getElementById('close').addEventListener('click', closeModal);
el.modal.addEventListener('click', (e) => {
    if (e.target === el.modal) closeModal();
});

function closeModal() {
    el.modal.classList.remove('active');
    el.form.reset();
    editMode = false;
    editId = null;
}

// Form Submit - CREATE or UPDATE
el.form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nama = el.inputNama.value.trim();
    const stok = parseInt(el.inputStok.value);
    const hargaBeli = parseInt(el.inputHarga.value);
    
    if (!nama || isNaN(stok) || isNaN(hargaBeli) || stok < 0 || hargaBeli < 0) {
        alert('❌ Mohon isi semua data dengan benar!');
        return;
    }

    if (editMode && editId !== null) {
        // UPDATE
        const item = stockData.find(i => i.id === editId);
        if (item) {
            item.nama = nama;
            item.stok = stok;
            item.hargaBeli = hargaBeli;
            alert(`✅ Barang '${nama}' berhasil diupdate!`);
        }
    } else {
        // CREATE
        const newId = stockData.length > 0 ? Math.max(...stockData.map(d => d.id)) + 1 : 101;
        stockData.push({ id: newId, nama, stok, hargaBeli });
        alert(`✅ Barang '${nama}' berhasil ditambahkan!`);
    }
    
    renderTable();
    closeModal();
});

// EDIT Function
function editItem(id) {
    const item = stockData.find(i => i.id === id);
    if (!item) return;
    
    editMode = true;
    editId = id;
    
    el.modalTitle.textContent = 'Edit Barang';
    el.btnText.textContent = 'Update';
    el.inputNama.value = item.nama;
    el.inputStok.value = item.stok;
    el.inputHarga.value = item.hargaBeli;
    
    el.modal.classList.add('active');
}

// DELETE Function
function deleteItem(id) {
    const item = stockData.find(i => i.id === id);
    if (!item) return;
    
    if (confirm(`🗑️ Yakin ingin menghapus barang '${item.nama}'?`)) {
        stockData = stockData.filter(i => i.id !== id);
        renderTable();
        alert('✅ Barang berhasil dihapus!');
    }
}

// DELETE ALL
document.getElementById('btn-hapus').addEventListener('click', () => {
    if (stockData.length === 0) {
        alert('ℹ️ Stok sudah kosong!');
        return;
    }
    
    if (confirm('⚠️ PERINGATAN: Yakin ingin menghapus SEMUA data?')) {
        if (confirm('🚨 KONFIRMASI TERAKHIR: Tekan OK untuk menghapus.')) {
            stockData = [];
            renderTable();
            alert('✅ Semua data berhasil dihapus!');
        }
    }
});

// DOWNLOAD CSV
document.getElementById('btn-download').addEventListener('click', () => {
    if (stockData.length === 0) {
        alert('ℹ️ Tidak ada data untuk di-download.');
        return;
    }
    
    const header = 'ID,Nama Barang,Stok,Harga Beli\n';
    const rows = stockData.map(item => 
        `${item.id},${item.nama},${item.stok},${item.hargaBeli}`
    ).join('\n');
    const csvContent = header + rows;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data_stok_AEFE_' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('✅ Data berhasil di-download!');
});

// PRINT
document.getElementById('btn-print').addEventListener('click', () => {
    if (stockData.length === 0) {
        alert('ℹ️ Tidak ada data untuk dicetak.');
        return;
    }
    window.print();
});

// Initial Render
renderTable();