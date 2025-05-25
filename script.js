let searching = false;
let found = [];
let current = 1;
let end = 1000;
let start = 0;
let stats = { checked: 0, found: 0, rate: 0 };

function randId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const len = parseInt(document.getElementById('length-dropdown').querySelector('.dropdown-trigger').getAttribute('data-value')) || 7;
    let result = '';
    for (let i = 0; i < len; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function setupDropdowns() {
    const dropdowns = document.querySelectorAll('.select-dropdown');
    
    dropdowns.forEach(dd => {
        const selected = dd.querySelector('.dropdown-trigger');
        const options = dd.querySelector('.dropdown-menu');
        const opts = dd.querySelectorAll('.menu-item');

        selected.addEventListener('click', (e) => {
            e.stopPropagation();
            
            dropdowns.forEach(d => {
                if (d !== dd) {
                    d.querySelector('.dropdown-trigger').classList.remove('active');
                    d.querySelector('.dropdown-menu').classList.remove('show');
                }
            });
            
            const active = selected.classList.contains('active');
            if (active) {
                selected.classList.remove('active');
                options.classList.remove('show');
            } else {
                selected.classList.add('active');
                options.classList.add('show');
            }
        });

        opts.forEach(opt => {
            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                
                const val = opt.getAttribute('data-value');
                const txt = opt.textContent;
                
                selected.setAttribute('data-value', val);
                selected.querySelector('span').textContent = txt;
                
                opts.forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                
                selected.classList.remove('active');
                options.classList.remove('show');
            });
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.select-dropdown')) {
            dropdowns.forEach(dd => {
                dd.querySelector('.dropdown-trigger').classList.remove('active');
                dd.querySelector('.dropdown-menu').classList.remove('show');
            });
        }
    });
}

function getDelay() {
    const dd = document.getElementById('delay-dropdown');
    const sel = dd.querySelector('.dropdown-trigger');
    return parseInt(sel.getAttribute('data-value')) || 100;
}

function updateBar(curr, total, foundCount) {
    const fill = document.getElementById('progress-fill');
    const currEl = document.getElementById('progress-current');
    const totalEl = document.getElementById('progress-total');
    const countEl = document.getElementById('results-count');
    
    const pct = (curr / total) * 100;
    fill.style.width = `${pct}%`;
    currEl.textContent = curr;
    totalEl.textContent = total;
    countEl.textContent = `${foundCount} found`;
    
    const elapsed = (Date.now() - start) / 1000;
    stats.rate = Math.round(curr / elapsed);
}

function updateCount() {
    const btn = document.querySelector('.export-button');
    
    if (found.length > 0) {
        btn.style.display = 'flex';
    } else {
        btn.style.display = 'none';
    }
}

function addLog(id, success, url = null) {
    const container = document.getElementById('log-container');
    const noRes = container.querySelector('.empty-state');
    
    if (noRes) {
        noRes.remove();
    }
    
    const entry = document.createElement('div');
    entry.className = `log-entry ${success ? 'success' : 'error'}`;
    
    if (success) {
        entry.innerHTML = `
            <div class="log-icon success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <div class="log-content">
                <div class="log-header">
                    <span class="log-title">Space Selfie Found!</span>
                    <span class="log-id">ID: ${id}</span>
                </div>
                <div class="log-details">
                    <span class="log-url">${url}</span>
                    <div class="log-actions">
                        <button onclick="copy('${url}')" title="Copy URL">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button onclick="download('${url}', '${id}')" title="Download">
                            <i class="fas fa-download"></i>
                        </button>
                        <button onclick="window.open('${url}', '_blank')" title="Open">
                            <i class="fas fa-external-link-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        found.push({ id, url, timestamp: Date.now() });
    } else {
        entry.innerHTML = `
            <div class="log-icon error-icon">
                <i class="fas fa-times-circle"></i>
            </div>
            <div class="log-content">
                <div class="log-header">
                    <span class="log-title">404 - Not Found</span>
                    <span class="log-id">ID: ${id}</span>
                </div>
                <div class="log-details">
                    <span class="log-url">${url}</span>
                </div>
            </div>
        `;
    }
    
    container.appendChild(entry);
    container.scrollTop = container.scrollHeight;
    updateCount();
}

async function checkImg(id) {
    const url = `https://space.crunchlabs.com/selfie/${id}`;
    
    try {
        return new Promise((resolve) => {
            const img = new Image();
            const timeout = setTimeout(() => {
                console.log(`Timeout: ${id}`);
                resolve(false);
            }, 3000);
            
            img.onload = () => {
                clearTimeout(timeout);
                console.log(`Found: ${id}`);
                resolve(true);
            };
            
            img.onerror = () => {
                clearTimeout(timeout);
                console.log(`404: ${id}`);
                resolve(false);
            };
            
            img.crossOrigin = 'anonymous';
            img.src = url;
        });
    } catch (err) {
        console.error(`Error ${id}:`, err);
        return false;
    }
}

async function scan() {
    try {
        const scansDD = document.getElementById('scans-dropdown');
        const total = parseInt(scansDD.querySelector('.dropdown-trigger').getAttribute('data-value')) || 1000;
        const delay = getDelay();
        
        let checked = 0;
        let foundCount = 0;
        start = Date.now();
        
        document.getElementById('progress-bar').style.display = 'block';
        
        console.log(`Starting: ${total} scans, ${delay}ms delay`);
        
        for (let i = 0; i < total && searching; i++) {
            checked++;
            const id = randId();
            
            const url = `https://space.crunchlabs.com/selfie/${id}`;
            const exists = await checkImg(id);
            
            if (exists) {
                foundCount++;
            }
            
            updateBar(checked, total, foundCount);
            addLog(id, exists, url);
            
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        const msg = `Done: ${checked} scanned, ${foundCount} found`;
        console.log(msg);
        notify(msg);
        
    } catch (err) {
        console.error('Scan error:', err);
        notify('Scan error');
    } finally {
        searching = false;
        const btn = document.querySelector('.primary-btn');
        btn.innerHTML = '<i class="fas fa-play"></i> Search';
        btn.disabled = false;
    }
}

function search() {
    try {
        if (searching) {
            searching = false;
            const btn = document.querySelector('.primary-btn');
            btn.innerHTML = '<i class="fas fa-play"></i> Search';
            btn.disabled = false;
            notify('Stopped');
            return;
        }
        
        searching = true;
        stats = { checked: 0, found: 0, rate: 0 };
        
        const btn = document.querySelector('.primary-btn');
        btn.innerHTML = '<i class="fas fa-stop"></i> Stop';
        
        notify('Starting...');
        scan().catch(err => {
            console.error('Search error:', err);
            notify('Error occurred');
            searching = false;
            btn.innerHTML = '<i class="fas fa-play"></i> Search';
            btn.disabled = false;
        });
    } catch (err) {
        console.error('Start error:', err);
        notify('Failed to start');
    }
}

function lucky() {
    try {
        const scansDD = document.getElementById('scans-dropdown');
        const lengthDD = document.getElementById('length-dropdown');
        
        const scanOpts = [100, 500, 1000, 2000, 5000];
        const lenOpts = [5, 6, 7, 8, 10];
        
        const randScan = scanOpts[Math.floor(Math.random() * scanOpts.length)];
        const randLen = lenOpts[Math.floor(Math.random() * lenOpts.length)];
        
        const scansSel = scansDD.querySelector('.dropdown-trigger');
        scansSel.setAttribute('data-value', randScan);
        scansSel.querySelector('span').textContent = randScan;
        
        const lenSel = lengthDD.querySelector('.dropdown-trigger');
        lenSel.setAttribute('data-value', randLen);
        lenSel.querySelector('span').textContent = randLen;
        
        notify(`Lucky: ${randScan} scans, ${randLen} chars`);
    } catch (err) {
        console.error('Lucky error:', err);
        notify('Lucky failed');
    }
}

function clear() {
    const container = document.getElementById('log-container');
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-satellite"></i>
            <p>Preparing for world domination</p>
        </div>
    `;
    found = [];
    updateCount();
    
    document.getElementById('progress-bar').style.display = 'none';
}

function exportData() {
    if (found.length === 0) return;
    
    const data = {
        timestamp: new Date().toISOString(),
        total: found.length,
        stats: stats,
        images: found.map(img => ({
            id: img.id,
            url: img.url,
            found_at: new Date(img.timestamp).toISOString()
        }))
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crunchlabs-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function copy(text) {
    navigator.clipboard.writeText(text).then(() => {
        notify('Copied!');
    });
}

function download(url, id) {
    const a = document.createElement('a');
    a.href = url;
    a.download = `selfie-${id}.jpg`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function notify(msg) {
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.textContent = msg;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notif);
        }, 300);
    }, 2000);
}

document.addEventListener('DOMContentLoaded', function() {
    setupDropdowns();
    
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.value < 1) this.value = 1;
            if (this.value > 10000) this.value = 10000;
        });
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && searching) {
            search();
        }
    });
    
    updateCount();
});

// just junk
function startSearch() { search(); }
function generateRandomRange() { lucky(); }
function clearResults() { clear(); }
function exportResults() { exportData(); }
function copyToClipboard(text) { copy(text); }
function downloadImage(url, id) { download(url, id); } 
