/* BIG BROTHER — Monthly Expense Mobile V1 */
(async function(){
'use strict';
const frame=document.getElementById('monthlyExpenseFrame');
const boot=document.getElementById('boot');
const bootCard=document.getElementById('bootCard');
let injected=false;
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function showError(message){bootCard.innerHTML='Could not open Monthly Expense<div>'+esc(message||'Unknown error')+'</div>'}
async function applyAccess(doc,win){const api=win.BBExpensesAdapter;if(!api?.rpc)throw new Error('Expenses connection is not ready.');const access=await api.rpc('bb_expense_mobile_monthly_access');if(access?.canView!==true)throw new Error('You do not have permission to view Monthly Expense.');doc.body.classList.add('bb-monthly-mobile')}
function decorateDetailRows(doc){const body=doc.getElementById('detailRows');if(!body)return;const labels=['Expense ID','Date','Type','Category','Description','Payee','Amount USD','Status','Payment Method','Reference'];body.querySelectorAll(':scope>tr').forEach(tr=>{if(tr.querySelector('.detail-empty')||tr.dataset.bbMonthlyReady==='1')return;const cells=Array.from(tr.children);if(cells.length<10)return;tr.dataset.bbMonthlyReady='1';cells.forEach((td,i)=>{td.dataset.bbLabel=labels[i]||''});const summary=doc.createElement('td');summary.className='bb-monthly-card-summary';const amount=cells[6]?.textContent?.trim()||'$0.00';const category=cells[3]?.textContent?.trim()||'Expense';const date=cells[1]?.textContent?.trim()||'';summary.innerHTML='<button type="button" class="bb-monthly-card-toggle"><span><strong>'+esc(amount)+'</strong><small>'+esc(category)+(date?' · '+esc(date):'')+'</small></span><b>⌄</b></button>';tr.insertBefore(summary,tr.firstChild);summary.querySelector('button').onclick=()=>{const willOpen=!tr.classList.contains('bb-expanded');body.querySelectorAll('tr.bb-expanded').forEach(x=>x.classList.remove('bb-expanded'));if(willOpen)tr.classList.add('bb-expanded')};});}
function inject(){let doc,win;try{doc=frame.contentDocument||frame.contentWindow.document;win=frame.contentWindow}catch(_){return}if(!doc?.head||!doc?.body)return;
  if(!doc.getElementById('bb-monthly-mobile-css')){const link=doc.createElement('link');link.id='bb-monthly-mobile-css';link.rel='stylesheet';link.href='mobile-monthly.css?v=20260916-1';doc.head.appendChild(link)}
  const app=doc.querySelector('.app');const firstCard=app?.querySelector('.card');const toolbar=doc.querySelector('.toolbar');const detailRows=doc.getElementById('detailRows');if(!app||!firstCard||!toolbar||!detailRows)return;
  if(!doc.getElementById('bbMonthlyMobileHead')){const h=doc.createElement('div');h.id='bbMonthlyMobileHead';h.className='bb-monthly-mobile-head';h.innerHTML='<div><strong>Monthly Expense</strong><span>Monthly category totals & expense transactions</span></div><button type="button" data-bb-refresh>↻</button>';app.insertBefore(h,app.firstChild);h.querySelector('[data-bb-refresh]').onclick=()=>doc.getElementById('refreshBtn')?.click()}
  const prev=doc.getElementById('prevMonthBtn'),next=doc.getElementById('nextMonthBtn'),refresh=doc.getElementById('refreshBtn');if(prev&&!prev.dataset.bbMobileText){prev.dataset.bbMobileText='1';prev.textContent='‹';prev.title='Previous Month'}if(next&&!next.dataset.bbMobileText){next.dataset.bbMobileText='1';next.textContent='›';next.title='Next Month'}if(refresh&&!refresh.dataset.bbMobileText){refresh.dataset.bbMobileText='1';refresh.textContent='↻';refresh.title='Refresh'}
  decorateDetailRows(doc);if(!detailRows.dataset.bbMobileObserved){detailRows.dataset.bbMobileObserved='1';new win.MutationObserver(()=>decorateDetailRows(doc)).observe(detailRows,{childList:true,subtree:false})}
  if(!injected){injected=true;applyAccess(doc,win).then(()=>{boot.classList.add('hide');frame.style.display='block'}).catch(error=>showError(error?.message||error));}else{boot.classList.add('hide');frame.style.display='block'}
}
frame.addEventListener('load',()=>{setTimeout(inject,80);setTimeout(inject,350);setTimeout(inject,900)});
frame.src='monthly-report.html?embed=1&mobileSkin=1&v=20260916-1';
setTimeout(()=>{if(!boot.classList.contains('hide')){try{inject()}catch(_){}}},1800);
})();
