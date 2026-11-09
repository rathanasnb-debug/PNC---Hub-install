/* ===== Helpers: storage with in-memory fallback, escaping, dates ===== */
const mem={};
const S={get(k,d){try{const v=localStorage.getItem(k);if(v!=null)return JSON.parse(v)}catch(e){}return k in mem?mem[k]:d},
 set(k,v){mem[k]=v;try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const plus=n=>{const d=new Date();d.setDate(d.getDate()+n);return iso(d)};
const TODAY=iso(new Date());
const toast=m=>{$('#toast').innerHTML=`<div class="toast">${esc(m)}</div>`;setTimeout(()=>$('#toast').innerHTML='',2200)};
const modal=h=>$('#modal').innerHTML=`<div class="mb" onclick="if(event.target==this)closeM()"><div class="md">${h}<p><button class="btn g" onclick="closeM()">Close</button></p></div></div>`;
const closeM=()=>$('#modal').innerHTML='';
const notify=t=>{const n=S.get('notes',[]);n.unshift(t);S.set('notes',n.slice(0,20))};

/* ===== Seed (demo) data ===== */
const days=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],times=['16:30','17:00','17:30','18:00'],spots=['Room A1','Room B2','Lab C1','Courtyard'],leaders=['Sok Dara','Chan Sreyneang','Vann Rithy','Lim Sophea','Kong Vibol','Heng Malis','Pich Sambath','Nguon Rina'];
const CL=[['Robotic Club','Tech','🤖'],['Library Club','Academic','📚'],['Music Club','Arts','🎵'],['Web Development Club','Tech','💻'],['Public Speaking Club','Academic','🎤'],['Promoting Integrity & Dignity Club','Community','🤝'],['Aerobic Club','Wellness','🏃'],['Films and Media Club','Arts','🎬'],['Gender Awareness Club','Community','⚖️'],['Sport Club','Wellness','⚽'],['Culinary Club','Lifestyle','🍳'],['IT Awareness Club','Tech','🛡️'],['Photography Club','Arts','📷'],['Fashion Design Club','Arts','👗'],['Student Association','Community','🎓'],['Yoga Club','Wellness','🧘']]
 .map((c,i)=>({id:i,name:c[0],cat:c[1],ico:c[2],leader:leaders[i%8]+' (demo)',when:days[i%6]+' '+times[i%4],loc:spots[i%4],desc:`Student-run ${c[0].replace(' Club','')} activities for PNC students. Demo description: confirm real details with the club leader.`}));
const ROOMS=[{id:1,name:'Box Room A1',no:'A1',cap:4,loc:'Ground floor',eq:'Table, chairs, whiteboard',ico:'📦'},{id:2,name:'Meeting Room B1',no:'B1',cap:12,loc:'1st floor',eq:'Projector, tables, chairs, whiteboard',ico:'🖥️'},{id:3,name:'Meeting Room C2',no:'C2',cap:8,loc:'2nd floor',eq:'Projector, whiteboard, chairs',ico:'🗣️'},{id:4,name:'Box Room A2',no:'A2',cap:3,loc:'Ground floor',eq:'Table, chairs',ico:'📦'}];
const RENT0=[{id:1,name:'Student Room near PNC',price:60,loc:'Phnom Penh – Sen Sok',bed:1,bath:1,fac:['Wi-Fi','Electricity','Water'],owner:'Ms. Sophal (demo)',tel:'012 000 001',st:'Available'},{id:2,name:'Shared House for 3',price:150,loc:'Phnom Penh – Toul Kork',bed:3,bath:2,fac:['Wi-Fi','Kitchen','Parking','Water'],owner:'Mr. Dara (demo)',tel:'012 000 002',st:'Available'},{id:3,name:'Cozy Studio',price:90,loc:'Phnom Penh – Sen Sok',bed:1,bath:1,fac:['Wi-Fi','Electricity'],owner:'Ms. Lina (demo)',tel:'012 000 003',st:'Rented'},{id:4,name:'Budget Room',price:45,loc:'Phnom Penh – Russey Keo',bed:1,bath:1,fac:['Water','Electricity'],owner:'Mr. Vuthy (demo)',tel:'012 000 004',st:'Available'}];
const EV0=[{id:1,title:'Welcome Week 2026–2027',date:plus(2),time:'09:00',place:'Main Hall',type:'Event',desc:'Orientation for First-Year students (demo content).'},{id:2,title:'IT Awareness Workshop',date:plus(5),time:'14:00',place:'Lab C1',type:'Workshop',desc:'Online safety basics, hosted by the IT Awareness Club.'},{id:3,title:'Web Dev Club Hack Night',date:plus(8),time:'17:30',place:'Room B2',type:'Club',desc:'Build a mini site together in vanilla HTML, CSS and JS.'},{id:4,title:'Mid-term Exam Period',date:plus(20),time:'08:00',place:'All classrooms',type:'Important date',desc:'Placeholder date – confirm with the academic office.'}];
const AN0=[{id:1,title:'Welcome to the new academic year',by:'Administration',txt:'Demo announcement. Check this hub for events, rooms and clubs.'},{id:2,title:'Room booking rules',by:'Teachers',txt:'Book rooms early. Requests are reviewed by a teacher or administrator.'}];

/* ===== Session / state ===== */
let user=S.get('user',null),editId=null,Q='';
const NAV=[['dash','🏠','Dashboard'],['clubs','🎯','Student Clubs'],['schedule','🗓️','Study Schedule'],['rentals','🏘️','Rental Houses'],['rooms','🚪','Meeting Rooms'],['info','ℹ️','PNC Information'],['events','📣','Announcements & Events'],['profile','👤','My Profile']];
const isStaff=()=>user&&user.role!=='student',isAdmin=()=>user&&user.role==='admin';
const data=(k,d)=>S.get(k,d);
const routeFromHash=()=>{const r=(location.hash||'#dash').slice(1);return NAV.some(n=>n[0]===r)?r:'dash'};
let currentRoute=routeFromHash(),routeTrail=[],skipRouteHistory=false;

/* ===== Auth ===== */
function loginView(){return `<div class="login"><form class="card f" style="display:grid" onsubmit="doLogin(event)">
<h2 class="grad" style="font-size:24px">PNC Student & Teacher Hub</h2><p class="mute" style="margin:0">Academic year 2026–2027 · demo login/register (data stays in your browser)</p>
<label>Full name<input id="ln" required minlength="2"></label><label>Email<input id="le" type="email" required></label>
<label>Role<select id="lr" onchange="$('#ly').parentNode.style.display=this.value=='student'?'':'none'"><option value="student">Student</option><option value="teacher">Teacher</option><option value="admin">Administrator</option></select></label>
<label>Year<select id="ly"><option>First-Year</option><option>Second-Year</option></select></label>
<button class="btn o">Enter the Hub</button></form></div>`}
function doLogin(e){e.preventDefault();const r=$('#lr').value;user={name:$('#ln').value.trim(),email:$('#le').value.trim(),role:r,year:r=='student'?$('#ly').value:'—',phone:'',id:(r=='student'?'PNC-26-':r=='teacher'?'T-':'A-')+(100+Math.floor(Math.random()*900))};S.set('user',user);location.hash='dash';render()}
function logout(){S.set('user',null);user=null;render()}

/* ===== Shell & routing ===== */
function render(){
 const root=$('#root');if(!user){root.innerHTML=loginView();return}
 const route=routeFromHash(),n=S.get('notes',[]);
 root.innerHTML=`<div class="app"><aside class="side" id="side"><div class="logo"><i>PN</i><div>PNC Hub<br><small class="mute">STUDENT & TEACHER · 2026–2027</small></div></div>
 ${NAV.map(x=>`<a class="nav ${x[0]==route?'on':''}" href="#${x[0]}" onclick="$('#side').classList.remove('open')">${x[1]} ${x[2]}</a>`).join('')}
 <button class="nav" onclick="toggleTheme()">🌓 Settings: Theme</button><button class="nav" onclick="logout()">🚪 Logout</button></aside>
 <div class="main"><div class="top"><button class="ib burger" onclick="$('#side').classList.toggle('open')">☰</button>
 <input aria-label="Search clubs" placeholder="⌕  Search clubs…" onkeydown="if(event.key=='Enter'){Q=this.value;location.hash='clubs';render()}">
 <button class="ib" onclick="$('#nm').hidden=!$('#nm').hidden">🔔${n.length?`<span class="badge">${n.length}</span>`:''}</button>
 <a class="ib profile-link" href="#profile" aria-label="Open profile"><img src="assets/images/profile-photo.jpg" alt=""></a></div>
 <div class="menu" id="nm" hidden>${n.length?n.map(t=>`<div>${esc(t)}</div>`).join('')+'<button class="btn g s" onclick="S.set(\'notes\',[]);render()">Clear</button>':'<div class="mute">No notifications</div>'}</div>
 <div class="content" id="view"></div></div></div>`;
 $('#view').innerHTML=(route==='dash'?'':'<button class="btn g page-back" onclick="goBack()" aria-label="Go back to previous page">← Back</button>')+V[route]();if(A[route])A[route]();
}
function goBack(){const route=routeTrail.pop()||'dash';if(route===currentRoute)return;skipRouteHistory=true;location.hash=route}
function toggleTheme(){const d=document.documentElement,dark=d.getAttribute('data-theme')==='dark';const next=dark?'light':'dark';d.setAttribute('data-theme',next);S.set('theme',next)}
const savedTheme=S.get('theme',null);if(savedTheme)document.documentElement.setAttribute('data-theme',savedTheme);
window.addEventListener('hashchange',()=>{const next=routeFromHash();if(skipRouteHistory)skipRouteHistory=false;else if(next!==currentRoute)routeTrail.push(currentRoute);currentRoute=next;render()});

/* ===== Views ===== */
const V={},A={};

/* ===== Dashboard chart helpers: all values are calculated from demo data ===== */
function getWeekStart(){
 const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d;
}
function getWeeklyStudyHours(){
 const start=getWeekStart(),labels=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
 const rows=labels.map((label,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);return {label,date:iso(d),hours:0};});
 data('tasks',[]).forEach(t=>{
   const row=rows.find(x=>x.date===t.date);
   if(row&&t.start&&t.end){const [sh,sm]=t.start.split(':').map(Number),[eh,em]=t.end.split(':').map(Number);
     const mins=(eh*60+em)-(sh*60+sm);if(mins>0)row.hours+=mins/60;}
 });
 return rows;
}
function weeklyStudySvg(){
 const rows=getWeeklyStudyHours(),max=Math.max(2,...rows.map(x=>x.hours)),w=620,h=220,left=34,right=12,top=15,bottom=34,plotH=150,plotW=w-left-right;
 const bars=rows.map((r,i)=>{const bh=(r.hours/max)*plotH,x=left+i*(plotW/7)+13,y=top+plotH-bh;
   return `<rect x="${x}" y="${y}" width="42" height="${Math.max(3,bh)}" rx="7" fill="${r.hours?'#2386c8':'#dce8f3'}"><title>${r.label}: ${r.hours.toFixed(1)} study hours</title></rect>
   <text x="${x+21}" y="${top+plotH+23}" text-anchor="middle" font-size="11" fill="#8290a5">${r.label}</text>
   ${r.hours?`<text x="${x+21}" y="${Math.max(11,y-7)}" text-anchor="middle" font-size="10" fill="#1769aa">${r.hours.toFixed(1)}h</text>`:''}`;
 }).join('');
 const grid=[0,.25,.5,.75,1].map(v=>{const y=top+plotH-v*plotH;return `<line x1="${left}" y1="${y}" x2="${w-right}" y2="${y}" stroke="#e9eef5" stroke-dasharray="3 5"/><text x="${left-8}" y="${y+4}" text-anchor="end" font-size="10" fill="#8290a5">${(max*v).toFixed(0)}</text>`}).join('');
 return `<svg class="study-chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Study hours by day for the current week">${grid}${bars}</svg>`;
}
function cohortDonut(){
 const first=250,second=250,total=first+second,pct=total?first/total*100:0;
 return `<div class="donut-layout"><div class="donut" style="background:conic-gradient(#1769aa 0 ${pct}%,#ff8742 ${pct}% 100%)" role="img" aria-label="Student year distribution: ${first} first-year and ${second} second-year sample students"><div class="donut-center"><strong>${total}</strong><span>sample students</span></div></div>
 <div class="legend"><div class="legend-item"><i class="legend-dot" style="background:#1769aa"></i>First-Year <b>${first}</b></div><div class="legend-item"><i class="legend-dot" style="background:#ff8742"></i>Second-Year <b>${second}</b></div><div class="legend-item"><i class="legend-dot" style="background:#dce4ee"></i>Split <b>50/50</b></div></div></div>`;
}
function clubCategoryChart(){
 const cats=['Tech','Arts','Wellness','Community','Academic','Lifestyle'];
 const counts=cats.map(c=>({name:c,count:CL.filter(x=>x.cat===c).length}));
 const max=Math.max(1,...counts.map(x=>x.count));
 return `<div class="category-list">${counts.map(x=>`<div class="category-row"><span class="cat-name">${x.name}</span><div class="category-track"><div class="category-fill" style="width:${x.count/max*100}%"></div></div><strong>${x.count}</strong></div>`).join('')}</div>`;
}
function bookingSummary(){
 const bookings=data('bookings',[]),statuses=[['Approved','#16a36a'],['Pending','#f59e0b'],['Rejected','#dc5260']];
 const total=bookings.length;
 return total?`<div class="category-list">${statuses.map(([s,c])=>{const n=bookings.filter(x=>x.st===s).length;return `<div class="category-row"><span class="cat-name">${s}</span><div class="category-track"><div class="category-fill" style="width:${n/total*100}%;background:${c}"></div></div><strong>${n}</strong></div>`}).join('')}</div><p class="mute" style="font-size:10px;margin:13px 0 0">Based on ${total} saved demo booking request${total===1?'':'s'}.</p>`:`<div class="empty-chart">No room booking requests yet.<br>Booking activity will appear here.</div>`;
}

V.dash=()=>{
 const b=data('bookings',[]),tasks=data('tasks',[]),sc=tasks.filter(t=>t.date===TODAY),
 ev=data('events',EV0).filter(e=>e.date>=TODAY).sort((a,b)=>a.date>b.date?1:-1),
 pending=b.filter(x=>x.st==='Pending').length,weekHours=getWeeklyStudyHours().reduce((s,x)=>s+x.hours,0),
 st=[['👥','Total Students','500+','Demo population'],['🎓','First-Year','250+','Sample cohort'],['🎓','Second-Year','250+','Sample cohort'],['🎯','Student Clubs',CL.length,'Available club groups']];
 return `<section class="dashboard-hero"><div class="hero-inner"><div><span class="hero-pill">✦ ACADEMIC YEAR 2026–2027</span><h1>Welcome back, ${esc(user.name)}!</h1><p>Your PNC learning and campus activity overview.</p></div><div class="hero-date"><b>${new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</b><br>${user.role[0].toUpperCase()+user.role.slice(1)} account · ${esc(user.year)}</div></div></section>
 <div class="dash-stats">${st.map(s=>`<div class="dash-stat"><div class="stat-top"><span class="stat-label">${s[1]}</span><span class="stat-icon">${s[0]}</span></div><strong>${s[2]}</strong><small>${s[3]}</small></div>`).join('')}</div>
 <p class="mute" style="font-size:10px;margin:-5px 0 17px">Student totals are demonstration placeholders, not official PNC statistics.</p>
 <div class="analytics-grid"><section class="chart-card"><div class="chart-heading"><div><h3>Weekly study activity</h3><p>Study hours scheduled from Monday to Sunday</p></div><span class="chart-note">${weekHours.toFixed(1)} hrs this week</span></div>${weeklyStudySvg()}</section>
 <section class="chart-card"><div class="chart-heading"><div><h3>Student year distribution</h3><p>Illustrative First-Year and Second-Year split</p></div><span class="chart-note">Sample data</span></div>${cohortDonut()}</section></div>
 <div class="analytics-grid equal"><section class="chart-card"><div class="chart-heading"><div><h3>Clubs by category</h3><p>Number of clubs in each interest area</p></div><span class="chart-note">${CL.length} total clubs</span></div>${clubCategoryChart()}</section>
 <section class="chart-card"><div class="chart-heading"><div><h3>Room booking requests</h3><p>Current request status overview</p></div><span class="chart-note">${b.length} total</span></div>${bookingSummary()}</section></div>
 <div class="dashboard-lower"><section class="chart-card"><div class="chart-heading"><div><h3>Today’s study schedule</h3><p>Your planned learning activities</p></div><a href="#schedule" class="btn s g">View schedule</a></div>
 ${sc.length?`<div class="dashboard-list">${sc.sort((a,b)=>a.start.localeCompare(b.start)).map(t=>`<div class="dashboard-list-item"><span><b>${esc(t.subject)}</b><small>📍 ${esc(t.location||'Location not set')}</small></span><span class="tag ${t.done?'ok':'w'}">${t.done?'Completed':esc(t.start)+' – '+esc(t.end)}</span></div>`).join('')}</div>`:'<div class="empty-chart">No study tasks scheduled for today.<br><a href="#schedule">Add a study task</a> to plan your day.</div>'}</section>
 <section class="chart-card"><div class="chart-heading"><div><h3>Quick actions</h3><p>Jump to the tools you use most</p></div></div><div class="quick-actions"><a href="#schedule" class="btn">＋ Study task</a><a href="#rooms" class="btn o">Book a room</a><a href="#clubs" class="btn g">Explore clubs</a><a href="#rentals" class="btn g">Find housing</a></div>
 <div class="chart-heading" style="margin-top:8px"><div><h3>Latest announcements</h3><p>Updates from your school community</p></div><a href="#events" class="chart-note">See all</a></div>
 <div class="dashboard-list">${data('ann',AN0).slice(0,3).map(a=>`<div class="dashboard-list-item"><span><b>${esc(a.title)}</b><small>${esc(a.txt)}</small></span></div>`).join('')}</div>
 <div style="margin-top:15px"><div class="row"><b style="font-size:12px">Upcoming activities</b><span class="tag">${ev.length} upcoming</span></div>${ev.slice(0,3).map(e=>`<div class="dashboard-list-item"><span><b>${esc(e.title)}</b><small>📅 ${esc(e.date)} · ${esc(e.time)} · ${esc(e.place)}</small></span><span class="tag">${esc(e.type)}</span></div>`).join('')||'<p class="mute" style="font-size:11px">No upcoming activities.</p>'}</div>
 ${isStaff()?`<p style="margin:14px 0 0"><span class="tag ${pending?'w':'ok'}">${pending} pending room request${pending===1?'':'s'}</span> <a href="#rooms" class="chart-note">Review requests</a></p>`:''}</section></div>`;
};

V.clubs=()=>`<div class="row"><h2>Student Clubs</h2><div style="display:flex;gap:8px"><input id="cq" value="${esc(Q)}" placeholder="Search clubs" oninput="Q=this.value;fillClubs()" style="padding:8px;border-radius:10px;border:1px solid var(--line);background:var(--card)"><select id="cc" onchange="fillClubs()" style="padding:8px;border-radius:10px;background:var(--card);border:1px solid var(--line)"><option value="">All categories</option>${[...new Set(CL.map(c=>c.cat))].map(c=>`<option>${c}</option>`).join('')}</select></div></div><br><div class="grid" id="cl"></div>`;
A.clubs=()=>fillClubs();
function fillClubs(){const j=data('joins',{}),cat=$('#cc').value,q=Q.toLowerCase();
 $('#cl').innerHTML=CL.filter(c=>(!cat||c.cat==cat)&&c.name.toLowerCase().includes(q)).map(c=>`<div class="card"><div class="ico">${c.ico}</div><h3>${c.name}</h3><span class="tag">${c.cat}</span><p class="mute">👤 ${c.leader}<br>🕔 ${c.when}<br>📍 ${c.loc}</p><button class="btn s g" onclick="clubInfo(${c.id})">Details</button> <button class="btn s ${j[c.id]?'g':''}" onclick="joinClub(${c.id})">${j[c.id]?'Request sent ✓':'Join Club'}</button></div>`).join('')||'<p class="mute">No clubs found.</p>'}
function clubInfo(i){const c=CL[i];modal(`<h2>${c.ico} ${c.name}</h2><p>${c.desc}</p><p>👤 ${c.leader}<br>🕔 ${c.when}<br>📍 ${c.loc}</p>`)}
function joinClub(i){const j=data('joins',{});if(j[i])return toast('Request already sent');j[i]='pending';S.set('joins',j);notify('Join request sent: '+CL[i].name);toast('Join request submitted');fillClubs()}

V.schedule=()=>{const t=data('tasks',[]).find(x=>x.id==editId)||{};
 return `<h2>Daily Study Schedule</h2><form class="card f" onsubmit="saveTask(event)"><label>Subject<input id="ts" required value="${esc(t.subject)}"></label><label>Date<input id="td" type="date" required value="${t.date||TODAY}"></label><label>Start<input id="t1" type="time" required value="${t.start||'18:00'}"></label><label>End<input id="t2" type="time" required value="${t.end||'19:00'}"></label><label>Location<input id="tl" value="${esc(t.loc)}"></label><label>Notes<input id="tn" value="${esc(t.notes)}"></label><button class="btn">${editId?'Update task':'Add task'}</button></form><br><div class="card"><h3>This Week</h3><div class="week" id="wk"></div></div><br><div class="card"><h3>Today & Upcoming</h3><div id="tl2"></div></div>`};
A.schedule=()=>{const ts=data('tasks',[]),now=new Date(),mon=new Date(now);mon.setDate(now.getDate()-((now.getDay()+6)%7));
 $('#wk').innerHTML=days.concat('Sunday').map((d,i)=>{const dt=new Date(mon);dt.setDate(mon.getDate()+i);const k=iso(dt);return `<div class="day ${k==TODAY?'today':''}"><b>${d.slice(0,3)}</b> <small class="mute">${k.slice(5)}</small>${ts.filter(t=>t.date==k).sort((a,b)=>a.start>b.start?1:-1).map(t=>`<div class="task ${t.done?'done':''}">${t.start} ${esc(t.subject)}</div>`).join('')}</div>`}).join('');
 $('#tl2').innerHTML=ts.filter(t=>t.date>=TODAY).sort((a,b)=>(a.date+a.start>b.date+b.start)?1:-1).map(t=>`<div class="row" style="padding:8px 0;border-bottom:1px solid var(--line)"><span class="${t.done?'mute':''}">${t.date==TODAY?'<span class="tag w">Today</span> ':''}${t.date} ${t.start}–${t.end} <b>${esc(t.subject)}</b> ${esc(t.loc)} <small class="mute">${esc(t.notes)}</small></span><span><button class="btn s g" onclick="doneTask(${t.id})">${t.done?'Undo':'Done'}</button> <button class="btn s g" onclick="editId=${t.id};render()">Edit</button> <button class="btn s r" onclick="delTask(${t.id})">Delete</button></span></div>`).join('')||'<p class="mute">No upcoming tasks.</p>'};
function saveTask(e){e.preventDefault();if($('#t2').value<=$('#t1').value)return toast('End time must be after start time');const ts=data('tasks',[]),o={subject:$('#ts').value.trim(),date:$('#td').value,start:$('#t1').value,end:$('#t2').value,loc:$('#tl').value,notes:$('#tn').value};
 if(editId){Object.assign(ts.find(x=>x.id==editId),o);editId=null}else ts.push({...o,id:Date.now(),done:false});S.set('tasks',ts);toast('Task saved');render()}
function doneTask(i){const ts=data('tasks',[]),t=ts.find(x=>x.id==i);t.done=!t.done;S.set('tasks',ts);render()}
function delTask(i){S.set('tasks',data('tasks',[]).filter(x=>x.id!=i));render()}

let RQ='',RP=999;
V.rentals=()=>`<h2>Student Rental Houses</h2><div class="warn">⚠️ Always verify the property and the owner in person before paying any deposit. PNC does not guarantee listings.</div>
<div class="row"><div style="display:flex;gap:8px;flex-wrap:wrap"><input placeholder="Search location/name" oninput="RQ=this.value;fillRent()" style="padding:8px;border-radius:10px;border:1px solid var(--line);background:var(--card)"><select onchange="RP=+this.value;fillRent()" style="padding:8px;border-radius:10px;background:var(--card);border:1px solid var(--line)"><option value="999">Any price</option><option value="60">Up to $60</option><option value="100">Up to $100</option><option value="200">Up to $200</option></select></div><button class="btn o" onclick="rentForm()">+ Add listing</button></div><br><div class="grid" id="rl"></div>`;
A.rentals=()=>fillRent();
function fillRent(){$('#rl').innerHTML=data('rent',RENT0).filter(r=>r.price<=RP&&(r.name+r.loc).toLowerCase().includes(RQ.toLowerCase())).map(r=>`<div class="card"><div class="ico">🏠</div><h3>${esc(r.name)}</h3><span class="tag ${r.st=='Available'?'ok':'no'}">${r.st}</span><p><b style="font-size:20px">$${r.price}</b>/month<br><span class="mute">📍 ${esc(r.loc)} · 🛏 ${r.bed} · 🛁 ${r.bath}</span></p><button class="btn s g" onclick="rentInfo(${r.id})">View Details</button> <button class="btn s" onclick="rentInfo(${r.id},1)">Contact Owner</button>${isAdmin()?` <button class="btn s r" onclick="delRent(${r.id})">Delete</button>`:''}</div>`).join('')||'<p class="mute">No listings match.</p>'}
function rentInfo(i,c){const r=data('rent',RENT0).find(x=>x.id==i);modal(`<h2>${esc(r.name)}</h2><p>💵 $${r.price}/month · 📍 ${esc(r.loc)}<br>🛏 ${r.bed} bedrooms · 🛁 ${r.bath} bathrooms</p><p>Facilities: ${r.fac.map(f=>`<span class="tag">${esc(f)}</span>`).join(' ')}</p><p class="${c?'':'mute'}">📞 Owner: <b>${esc(r.owner)}</b> · ${esc(r.tel)}</p><div class="warn">Verify property and owner before paying a deposit.</div>`)}
function delRent(i){S.set('rent',data('rent',RENT0).filter(r=>r.id!=i));fillRent()}
function rentForm(){modal(`<h2>New listing</h2><form class="f" onsubmit="addRent(event)"><label>Name<input id="rn" required></label><label>Price (USD/month)<input id="rp" type="number" min="1" required></label><label>Location<input id="rlo" required></label><label>Bedrooms<input id="rb" type="number" min="1" value="1"></label><label>Bathrooms<input id="rba" type="number" min="1" value="1"></label><label>Facilities (comma separated)<input id="rf" value="Wi-Fi, Water"></label><label>Owner contact name<input id="ro" required></label><label>Phone<input id="rt" required pattern="[0-9 +]{8,}"></label><label>Status<select id="rs"><option>Available</option><option>Rented</option></select></label><button class="btn">Submit listing</button></form>`)}
function addRent(e){e.preventDefault();const l=data('rent',RENT0);l.unshift({id:Date.now(),name:$('#rn').value,price:+$('#rp').value,loc:$('#rlo').value,bed:$('#rb').value,bath:$('#rba').value,fac:$('#rf').value.split(',').map(s=>s.trim()).filter(Boolean),owner:$('#ro').value,tel:$('#rt').value,st:$('#rs').value});S.set('rent',l);closeM();toast('Listing added');fillRent()}

V.rooms=()=>`<h2>Meeting & Box Rooms</h2><div class="grid">${ROOMS.map(r=>`<div class="card"><div class="ico">${r.ico}</div><h3>${r.name}</h3><p class="mute">Room ${r.no} · 👥 ${r.cap} · 📍 ${r.loc}<br>🧰 ${r.eq}</p><button class="btn s o" onclick="bookForm(${r.id})">Book This Room</button></div>`).join('')}</div><br>
<div class="card"><h3>Booking Requests</h3><div id="bk"></div></div>`;
A.rooms=()=>{const b=data('bookings',[]);$('#bk').innerHTML=b.map(x=>`<div class="row" style="padding:8px 0;border-bottom:1px solid var(--line)"><span><b>${esc(ROOMS.find(r=>r.id==x.room).name)}</b> · ${x.date} ${x.start}–${x.end} · ${x.n} people<br><small class="mute">${esc(x.purpose)} — ${esc(x.by)}</small></span><span><span class="tag ${x.st=='Approved'?'ok':x.st=='Rejected'?'no':'w'}">${x.st}</span>${isStaff()&&x.st=='Pending'?` <button class="btn s" onclick="setBk(${x.id},'Approved')">Approve</button> <button class="btn s r" onclick="setBk(${x.id},'Rejected')">Reject</button>`:''}</span></div>`).join('')||'<p class="mute">No requests yet.</p>'};
function bookForm(id){modal(`<h2>Book a room</h2><form class="f" onsubmit="saveBk(event)"><label>Room<select id="br">${ROOMS.map(r=>`<option value="${r.id}" ${r.id==id?'selected':''}>${r.name} (max ${r.cap})</option>`).join('')}</select></label><label>Date<input id="bd" type="date" min="${TODAY}" required value="${TODAY}"></label><label>Start<input id="bs" type="time" required></label><label>End<input id="be" type="time" required></label><label>Purpose<input id="bp" required></label><label>Participants<input id="bn" type="number" min="1" required></label><button class="btn">Submit request</button></form>`)}
function saveBk(e){e.preventDefault();const b=data('bookings',[]),x={id:Date.now(),room:+$('#br').value,date:$('#bd').value,start:$('#bs').value,end:$('#be').value,purpose:$('#bp').value,n:+$('#bn').value,by:user.name,st:'Pending'},rm=ROOMS.find(r=>r.id==x.room);
 if(x.end<=x.start)return toast('End time must be after start');if(x.n>rm.cap)return toast('Room capacity is '+rm.cap);
 if(b.some(o=>o.room==x.room&&o.date==x.date&&o.st!='Rejected'&&o.start<x.end&&o.end>x.start))return toast('Conflict: room already booked for that time');
 b.unshift(x);S.set('bookings',b);notify('Booking requested: '+rm.name+' '+x.date);closeM();toast('Request submitted');render()}
function setBk(i,s){const b=data('bookings',[]);b.find(x=>x.id==i).st=s;S.set('bookings',b);notify('Booking '+s.toLowerCase());render()}

V.info=()=>`<h2>PNC Information</h2><div class="warn">Demonstration content – confirm all details with the official PNC website or office. No official policies or statistics are claimed here.</div><div class="g2">
${[['About PNC','Passerelles Numériques Cambodia (PNC) is a school that trains young people in information technology. Confirm the latest description with PNC.'],['Educational Programs','Students study IT subjects over several years, including First-Year and Second-Year levels (demo summary).'],['Student Life','Clubs, events, workshops and teamwork activities happen alongside classes.'],['Learning Environment','Classrooms, labs, meeting rooms and box rooms. See the Meeting Rooms page.'],['Student Support','Ask your teachers or the administration office for academic and personal support (demo).'],['Contact & Links','Contact details: to be confirmed. Please use the official PNC website for verified information.']].map(x=>`<div class="card"><h3>${x[0]}</h3><p class="mute">${x[1]}</p></div>`).join('')}</div>`;

V.events=()=>`<div class="row"><h2>Announcements & Events</h2>${isStaff()?'<button class="btn o" onclick="evForm()">+ Add</button>':''}</div><br><div class="g2"><div class="card"><h3>Announcements</h3>${data('ann',AN0).map(a=>`<p><b>${esc(a.title)}</b> <small class="mute">by ${esc(a.by)}</small><br>${esc(a.txt)}${isAdmin()?` <button class="btn s r" onclick="delAn(${a.id})">×</button>`:''}</p>`).join('')}</div><div class="card"><h3>Events</h3>${data('events',EV0).sort((a,b)=>a.date>b.date?1:-1).map(e=>`<div class="row" style="padding:6px 0"><span>📅 ${e.date} <b>${esc(e.title)}</b> <span class="tag">${esc(e.type)}</span></span><span><button class="btn s g" onclick="evInfo(${e.id})">Details</button>${isAdmin()?` <button class="btn s r" onclick="delEv(${e.id})">×</button>`:''}</span></div>`).join('')}</div></div>`;
function evInfo(i){const e=data('events',EV0).find(x=>x.id==i);modal(`<h2>${esc(e.title)}</h2><p>📅 ${e.date} · 🕒 ${e.time} · 📍 ${esc(e.place)}</p><p>${esc(e.desc)}</p>`)}
function evForm(){modal(`<h2>Add announcement or event</h2><form class="f" onsubmit="addEv(event)"><label>Kind<select id="ek"><option value="a">Announcement</option><option value="e">Event</option></select></label><label>Title<input id="et" required></label><label>Date<input id="ed" type="date" value="${TODAY}"></label><label>Time<input id="eh" type="time" value="09:00"></label><label>Place<input id="ep"></label><label>Type<select id="ey"><option>Event</option><option>Workshop</option><option>Club</option><option>Important date</option></select></label><label>Description<textarea id="ex" required></textarea></label><button class="btn">Publish</button></form>`)}
function addEv(e){e.preventDefault();if($('#ek').value=='a'){const a=data('ann',AN0);a.unshift({id:Date.now(),title:$('#et').value,by:user.name,txt:$('#ex').value});S.set('ann',a)}else{const v=data('events',EV0);v.push({id:Date.now(),title:$('#et').value,date:$('#ed').value,time:$('#eh').value,place:$('#ep').value,type:$('#ey').value,desc:$('#ex').value});S.set('events',v)}notify('Published: '+$('#et').value);closeM();toast('Published');render()}
function delAn(i){S.set('ann',data('ann',AN0).filter(a=>a.id!=i));render()}
function delEv(i){S.set('events',data('events',EV0).filter(a=>a.id!=i));render()}

V.profile=()=>`<h2>My Profile</h2><div class="g2"><form class="card f" onsubmit="saveProf(event)"><div class="profile-heading"><img class="profile-photo" src="assets/images/profile-photo.jpg" alt="Profile photo of ${esc(user.name)}"><div><h3>${esc(user.name)}</h3><span class="tag">${esc(user.role)}</span></div></div><label>Full name<input id="pn" value="${esc(user.name)}" required></label><label>ID<input value="${esc(user.id)}" disabled></label><label>Email<input id="pe" type="email" value="${esc(user.email)}" required></label><label>Phone<input id="pp" value="${esc(user.phone)}"></label><label>Role<input value="${user.role}" disabled></label><label>Academic year<input value="2026–2027 · ${esc(user.year)}" disabled></label><button class="btn">Save profile</button></form>
<form class="card f" onsubmit="event.preventDefault();toast('Password updated (demo only)');this.reset()"><h3>Change password</h3><label>Current<input type="password" required></label><label>New<input type="password" minlength="6" required></label><button class="btn">Update</button><button type="button" class="btn g" onclick="toggleTheme()">Toggle dark/light</button><button type="button" class="btn g" onclick="if(confirm('Reset all demo data?')){['tasks','joins','rent','bookings','events','ann','notes'].forEach(k=>{delete mem[k];try{localStorage.removeItem(k)}catch(e){}});render()}">Reset demo data</button><button type="button" class="btn r" onclick="logout()">Logout</button></form></div>`;
function saveProf(e){e.preventDefault();Object.assign(user,{name:$('#pn').value,email:$('#pe').value,phone:$('#pp').value});S.set('user',user);toast('Profile saved');render()}
render();
