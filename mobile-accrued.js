/* BIG BROTHER — Accrued Expenses Mobile V1 */
(async function(){
'use strict';
const frame=document.getElementById('expenseAccruedFrame');
const boot=document.getElementById('boot');
const bootCard=document.getElementById('bootCard');
let injected=false;
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function showError(message){bootCard.innerHTML='Could not open Accrued Expenses<div>'+esc(message||'Unknown error')+'</div>'}
function dispatch(el,type){if(!el)return;el.dispatchEvent(new Event(type,{bubbles:true}))}
async function applyAccess(doc,win){try{const api=win.BBExpensesAdapter;if(!api?.rpc)return;const access=await api.rpc('bb_expense_mobile_accrued_access');if(access?.canView!==true){throw new Error('You do not have permission to view Accrued Expenses.')}doc.body.classList.toggle('bb-accrued-readonly',access?.canEdit!==true)}catch(error){showError(error?.message||error);throw error}}
function inject(){let doc,win;try{doc=frame.contentDocument||frame.contentWindow.document;win=frame.contentWindow}catch(_){return}if(!doc?.head||!doc?.body)return;
  if(!doc.getElementById('bb-accrued-mobile-css')){const link=doc.createElement('link');link.id='bb-accrued-mobile-css';link.rel='stylesheet';link.href='mobile-accrued.css?v=20260916-1';doc.head.appendChild(link)}
  const view=doc.getElementById('viewAccruedExpenses');const card=view?.querySelector('.card');const filters=doc.querySelector('.accrued-toolbar');if(!view||!card||!filters)return;
  if(!doc.getElementById('bbAccruedToolbar')){const toolbar=doc.createElement('div');toolbar.id='bbAccruedToolbar';toolbar.className='bb-accrued-mobile-toolbar';toolbar.innerHTML='<div><strong>Accrued Expenses</strong><span>Outstanding unpaid & partial expenses</span></div><button type="button" data-bb-filter>☷ Filters</button><button type="button" data-bb-refresh>↻</button>';card.insertBefore(toolbar,card.firstChild)}
  let backdrop=doc.getElementById('bbAccruedFilterBackdrop');if(!backdrop){backdrop=doc.createElement('div');backdrop.id='bbAccruedFilterBackdrop';backdrop.className='bb-accrued-filter-backdrop';doc.body.appendChild(backdrop)}
  if(!filters.querySelector('.bb-accrued-filter-head')){const h=doc.createElement('div');h.className='bb-accrued-filter-head';h.innerHTML='<div><strong>Filter Accrued Expenses</strong><span>Search, payee, type, status and currency</span></div><button type="button" data-bb-close>×</button>';filters.insertBefore(h,filters.firstChild)}
  if(!filters.querySelector('.bb-accrued-filter-actions')){const a=doc.createElement('div');a.className='bb-accrued-filter-actions';a.innerHTML='<button type="button" data-bb-reset>Reset</button><button type="button" data-bb-done>Done</button>';filters.appendChild(a)}
  const toolbar=doc.getElementById('bbAccruedToolbar');const openFilters=()=>{filters.classList.add('bb-mobile-open');backdrop.classList.add('show')};const closeFilters=()=>{filters.classList.remove('bb-mobile-open');backdrop.classList.remove('show')};
  toolbar.querySelector('[data-bb-filter]').onclick=openFilters;toolbar.querySelector('[data-bb-refresh]').onclick=()=>doc.getElementById('accruedRefreshBtn')?.click();backdrop.onclick=closeFilters;filters.querySelector('[data-bb-close]').onclick=closeFilters;filters.querySelector('[data-bb-done]').onclick=closeFilters;
  filters.querySelector('[data-bb-reset]').onclick=()=>{const ids=['accruedSearch','accruedPayee','accruedType','accruedStatus','accruedCurrency'];ids.forEach(id=>{const el=doc.getElementById(id);if(!el)return;el.value='';dispatch(el,id==='accruedSearch'?'input':'change')});};
  if(!injected){injected=true;applyAccess(doc,win).then(()=>{boot.classList.add('hide');frame.style.display='block'}).catch(()=>{});}else{boot.classList.add('hide');frame.style.display='block'}
}
frame.addEventListener('load',()=>{setTimeout(inject,80);setTimeout(inject,350);setTimeout(inject,900)});
frame.src='index.html?embed=1&view=accrued-expenses&mobileSkin=1&v=20260916-1';
setTimeout(()=>{if(!boot.classList.contains('hide')){try{inject()}catch(_){}}},1800);
})();
