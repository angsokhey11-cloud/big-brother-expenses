/* BIG BROTHER — Expense History Mobile V1.1 */
(async function(){
'use strict';
const frame=document.getElementById('expenseHistoryFrame');
const boot=document.getElementById('boot');
const bootCard=document.getElementById('bootCard');
let injected=false;
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function showError(message){bootCard.innerHTML='Could not open Expense History<div>'+esc(message||'Unknown error')+'</div>'}
function dispatch(el,type){if(!el)return;el.dispatchEvent(new Event(type,{bubbles:true}))}
async function applyAccess(doc,win){const api=win.BBExpensesAdapter;if(!api?.rpc)throw new Error('Expenses connection is not ready.');const access=await api.rpc('bb_expense_mobile_history_access');if(access?.canView!==true)throw new Error('You do not have permission to view Expense History.');doc.body.classList.add('bb-expense-history-mobile')}
function compactRows(doc){const body=doc.getElementById('historyRows');if(!body)return;Array.from(body.children).forEach(tr=>{if(tr.dataset.bbExpenseCollapse==='1')return;const cells=Array.from(tr.children).filter(el=>el.tagName==='TD');if(cells.length<13)return;tr.dataset.bbExpenseCollapse='1';tr.classList.add('bb-expense-card');const amount=String(cells[7]?.textContent||'-').trim();const type=String(cells[2]?.textContent||'Expense').trim();const head=doc.createElement('button');head.type='button';head.className='bb-expense-card-head';head.setAttribute('aria-expanded','false');head.innerHTML='<strong class="bb-expense-head-amount">'+esc(amount)+'</strong><span class="bb-expense-head-type">'+esc(type)+'</span><span class="bb-expense-head-chevron">⌄</span>';head.addEventListener('click',()=>{const opening=!tr.classList.contains('bb-expanded');body.querySelectorAll('tr.bb-expanded').forEach(other=>{if(other!==tr){other.classList.remove('bb-expanded');const h=other.querySelector('.bb-expense-card-head');if(h)h.setAttribute('aria-expanded','false')}});tr.classList.toggle('bb-expanded',opening);head.setAttribute('aria-expanded',opening?'true':'false')});tr.insertBefore(head,tr.firstChild)});if(!body.dataset.bbCollapseWatch){body.dataset.bbCollapseWatch='1';new MutationObserver(()=>compactRows(doc)).observe(body,{childList:true,subtree:false})}}
function inject(){let doc,win;try{doc=frame.contentDocument||frame.contentWindow.document;win=frame.contentWindow}catch(_){return}if(!doc?.head||!doc?.body)return;
  if(!doc.getElementById('bb-expense-history-mobile-css')){const link=doc.createElement('link');link.id='bb-expense-history-mobile-css';link.rel='stylesheet';link.href='mobile-history.css?v=20260916-2';doc.head.appendChild(link)}
  const view=doc.getElementById('viewExpenseHistory');const card=view?.querySelector('.card');const filters=doc.querySelector('.history-toolbar');if(!view||!card||!filters)return;
  if(!doc.getElementById('bbExpenseHistoryToolbar')){const toolbar=doc.createElement('div');toolbar.id='bbExpenseHistoryToolbar';toolbar.className='bb-expense-history-toolbar';toolbar.innerHTML='<div><strong>Expense History</strong><span>Fully paid and cleared expenses</span></div><button type="button" data-bb-filter>☷ Filters</button><button type="button" data-bb-refresh>↻</button>';card.insertBefore(toolbar,card.firstChild)}
  let backdrop=doc.getElementById('bbExpenseHistoryFilterBackdrop');if(!backdrop){backdrop=doc.createElement('div');backdrop.id='bbExpenseHistoryFilterBackdrop';backdrop.className='bb-expense-history-filter-backdrop';doc.body.appendChild(backdrop)}
  if(!filters.querySelector('.bb-expense-history-filter-head')){const h=doc.createElement('div');h.className='bb-expense-history-filter-head';h.innerHTML='<div><strong>Filter Expense History</strong><span>Search, type, currency and date range</span></div><button type="button" data-bb-close>×</button>';filters.insertBefore(h,filters.firstChild)}
  if(!filters.querySelector('.bb-expense-history-filter-actions')){const a=doc.createElement('div');a.className='bb-expense-history-filter-actions';a.innerHTML='<button type="button" data-bb-reset>Reset</button><button type="button" data-bb-done>Done</button>';filters.appendChild(a)}
  const toolbar=doc.getElementById('bbExpenseHistoryToolbar');const openFilters=()=>{filters.classList.add('bb-mobile-open');backdrop.classList.add('show')};const closeFilters=()=>{filters.classList.remove('bb-mobile-open');backdrop.classList.remove('show')};
  toolbar.querySelector('[data-bb-filter]').onclick=openFilters;toolbar.querySelector('[data-bb-refresh]').onclick=()=>doc.getElementById('historyRefreshBtn')?.click();backdrop.onclick=closeFilters;filters.querySelector('[data-bb-close]').onclick=closeFilters;filters.querySelector('[data-bb-done]').onclick=closeFilters;
  filters.querySelector('[data-bb-reset]').onclick=()=>{[['historySearch','input'],['historyType','change'],['historyCurrency','change'],['historyFrom','change'],['historyTo','change']].forEach(([id,type])=>{const el=doc.getElementById(id);if(!el)return;el.value='';dispatch(el,type)});};
  compactRows(doc);
  if(!injected){injected=true;applyAccess(doc,win).then(()=>{compactRows(doc);boot.classList.add('hide');frame.style.display='block'}).catch(error=>showError(error?.message||error));}else{boot.classList.add('hide');frame.style.display='block'}
}
frame.addEventListener('load',()=>{setTimeout(inject,80);setTimeout(inject,350);setTimeout(inject,900)});
frame.src='index.html?embed=1&view=expense-history&mobileSkin=1&v=20260916-2';
setTimeout(()=>{if(!boot.classList.contains('hide')){try{inject()}catch(_){}}},1800);
})();
