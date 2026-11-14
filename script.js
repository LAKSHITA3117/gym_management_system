const TOTAL_SLOTS = 40;
const RATE_FIRST_HOUR = 30;
const RATE_EXTRA_HOUR = 20;
const STORAGE_KEY = 'parkease_sessions_v1';
let sessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let revenue = Number(localStorage.getItem('parkease_revenue_v1') || 0);
const $ = id => document.getElementById(id);
const money = n => '₹' + Number(n).toLocaleString('en-IN');
const save = () => { localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions)); localStorage.setItem('parkease_revenue_v1', String(revenue)); };
const activeSessions = () => sessions.filter(s => s.status === 'Parked');
const occupiedSlots = () => activeSessions().map(s => s.slot);
const availableSlots = () => Array.from({length:TOTAL_SLOTS},(_,i)=>`A${String(i+1).padStart(2,'0')}`).filter(s=>!occupiedSlots().includes(s));
const fmt = date => new Date(date).toLocaleString([], {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
function toast(message){$('toast').textContent=message;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),2600)}
function renderSlots(target, limit=TOTAL_SLOTS, filter='all'){
  const occupied = occupiedSlots();
  const slots = Array.from({length:TOTAL_SLOTS},(_,i)=>`A${String(i+1).padStart(2,'0')}`).slice(0,limit).filter(s=>filter==='all'||(filter==='occupied'?occupied.includes(s):!occupied.includes(s)));
  $(target).innerHTML = slots.map(slot=>{const s=activeSessions().find(x=>x.slot===slot);return `<div class="slot ${s?'occupied':''}" title="${s?`Parked: ${s.plate}`:'Available'}">${slot}<small>${s?'Occupied':'Available'}</small></div>`}).join('');
}
function renderDashboard(){
  const occupied=activeSessions().length, available=TOTAL_SLOTS-occupied, pct=Math.round(occupied/TOTAL_SLOTS*100);
  $('total-slots').textContent=TOTAL_SLOTS;$('available-slots').textContent=available;$('occupied-slots').textContent=occupied;$('revenue').textContent=money(revenue);
  $('occupancy-percent').textContent=pct+'%';$('ring').style.background=`conic-gradient(var(--purple) ${pct}%,#eff0f6 ${pct}%)`;
  $('legend-available').textContent=available;$('legend-occupied').textContent=occupied;
  renderSlots('mini-slots',20);
  const recent=[...sessions].sort((a,b)=>b.entryAt-a.entryAt).slice(0,4);
  $('recent-activity').innerHTML=recent.length?recent.map(s=>`<div class="activity"><div class="activity-icon">${s.status==='Parked'?'↗':'↙'}</div><div><b>${s.plate} · ${s.status==='Parked'?'Entry':'Exit'}</b><small>${s.owner} · ${fmt(s.entryAt)}</small></div></div>`).join(''):'<div class="empty">No vehicle activity yet. Record an entry to get started.</div>';
}
function renderVehicles(){
 const q=$('vehicle-search').value.toLowerCase();
 const rows=[...sessions].sort((a,b)=>b.entryAt-a.entryAt).filter(s=>s.plate.toLowerCase().includes(q)||s.owner.toLowerCase().includes(q));
 $('vehicle-rows').innerHTML=rows.length?rows.map(s=>`<tr><td>${s.plate}<br><small class="muted">${s.type}</small></td><td>${s.owner}</td><td>${s.slot}</td><td>${fmt(s.entryAt)}</td><td><span class="status ${s.status==='Parked'?'in':'out'}">${s.status}</span></td><td>${s.status==='Parked'?`<button class="small-action" data-checkout="${s.id}">Check out</button>`:`<span class="muted">${money(s.fee)}</span>`}</td></tr>`).join(''):'<tr><td colspan="6" class="empty">No matching vehicle records.</td></tr>';
}
function renderReports(){
 $('report-sessions').textContent=sessions.length;$('report-completed').textContent=sessions.filter(s=>s.status==='Completed').length;$('report-revenue').textContent=money(revenue);
}
function refresh(){renderDashboard();renderVehicles();renderReports();renderSlots('all-slots',TOTAL_SLOTS,$('slot-filter').value)}
function openModal(){
 const slots=availableSlots();
 if(!slots.length){toast('Sorry, all parking slots are occupied.');return}
 $('slot-choice').innerHTML=slots.map(s=>`<option>${s}</option>`).join('');
 $('entry-modal').classList.remove('hidden');$('plate').focus();
}
function closeModal(){$('entry-modal').classList.add('hidden');$('entry-form').reset()}
function checkout(id){
 const s=sessions.find(x=>x.id===id);if(!s||s.status!=='Parked')return;
 const hours=Math.max(1,Math.ceil((Date.now()-s.entryAt)/3600000));
 const fee=hours<=1?RATE_FIRST_HOUR:RATE_FIRST_HOUR+(hours-1)*RATE_EXTRA_HOUR;
 s.status='Completed';s.exitAt=Date.now();s.fee=fee;revenue+=fee;save();refresh();toast(`Vehicle checked out. Parking fee: ${money(fee)}`);
}
document.querySelectorAll('.nav-item').forEach(btn=>btn.addEventListener('click',()=>showView(btn.dataset.view)));
document.querySelectorAll('[data-goto]').forEach(btn=>btn.addEventListener('click',()=>showView(btn.dataset.goto)));
function showView(name){document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));$(name+'-view').classList.remove('hidden');document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===name));$('page-title').textContent=name[0].toUpperCase()+name.slice(1);refresh()}
$('quick-entry').addEventListener('click',openModal);$('add-vehicle').addEventListener('click',openModal);$('close-modal').addEventListener('click',closeModal);
$('entry-modal').addEventListener('click',e=>{if(e.target===$('entry-modal'))closeModal()});
$('entry-form').addEventListener('submit',e=>{
 e.preventDefault();const plate=$('plate').value.trim().toUpperCase(),owner=$('owner').value.trim(),slot=$('slot-choice').value;
 if(sessions.some(s=>s.plate===plate&&s.status==='Parked')){toast('This vehicle is already parked.');return}
 if(occupiedSlots().includes(slot)){toast('That slot is no longer available. Please choose another.');return}
 sessions.push({id:Date.now().toString(),plate,owner,type:$('vehicle-type').value,slot,entryAt:Date.now(),status:'Parked',fee:0});
 save();closeModal();refresh();toast(`${plate} assigned to slot ${slot}.`);
});
$('vehicle-rows').addEventListener('click',e=>{const btn=e.target.closest('[data-checkout]');if(btn)checkout(btn.dataset.checkout)});
$('vehicle-search').addEventListener('input',renderVehicles);
$('slot-filter').addEventListener('change',()=>renderSlots('all-slots',TOTAL_SLOTS,$('slot-filter').value));
$('export-csv').addEventListener('click',()=>{
 const header=['Plate','Owner','Type','Slot','Entry time','Exit time','Status','Fee'];
 const rows=sessions.map(s=>[s.plate,s.owner,s.type,s.slot,new Date(s.entryAt).toISOString(),s.exitAt?new Date(s.exitAt).toISOString():'',s.status,s.fee]);
 const csv=[header,...rows].map(r=>r.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(',')).join('\n');
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='parking-report.csv';a.click();URL.revokeObjectURL(a.href);toast('Report exported.');
});
$('today').textContent=new Date().toLocaleDateString([], {weekday:'short',month:'short',day:'numeric',year:'numeric'});
refresh();
