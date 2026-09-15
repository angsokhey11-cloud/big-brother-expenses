/* BIG BROTHER — Monthly Expense Mobile V1.3 */
(function(){
'use strict';
const frame=document.getElementById('monthlyExpenseFrame');
const boot=document.getElementById('boot');
const bootCard=document.getElementById('bootCard');
let shown=false;
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function showError(message){bootCard.innerHTML='Could not open Monthly Expense<div>'+esc(message||'The live report did not finish loading.')+'</div>'}
function decorateCategories(doc){
  const box=doc.getElementById('reportSections');
  if(!box)return;
  box.querySelectorAll('.category-table tbody tr:not(.total-row)').forEach(row=>{
    const cells=Array.from(row.children);
    const btn=row.querySelector('.category-view-btn,[data-view-category]');
    if(cells.length<4||!btn)return;
    btn.classList.add('bb-view-category-expenses');
    btn.textContent='View Expenses';
    if(btn.parentElement!==cells[0])cells[0].appendChild(btn);
    row.classList.add('bb-mobile-category-row');
  });
}
function reveal(doc){
  doc.body.classList.add('bb-monthly-mobile');
  boot.classList.add('hide');
  frame.style.display='block';
  shown=true;
}
function inject(){
  let doc,win;
  try{doc=frame.contentDocument||frame.contentWindow.document;win=frame.contentWindow}catch(_){return false}
  if(!doc?.head||!doc?.body)return false;
  if(!doc.getElementById('bb-monthly-mobile-css')){
    const link=doc.createElement('link');
    link.id='bb-monthly-mobile-css';
    link.rel='stylesheet';
    link.href='mobile-monthly.css?v=20260916-4';
    doc.head.appendChild(link);
  }
  const app=doc.querySelector('.app');
  const toolbar=doc.querySelector('.toolbar');
  const reportSections=doc.getElementById('reportSections');
  if(!app||!toolbar||!reportSections)return false;
  doc.body.classList.add('bb-monthly-mobile');
  const detailSource=doc.querySelector('.report-detail-source');
  if(detailSource)detailSource.classList.add('bb-monthly-detail-source');
  if(!doc.getElementById('bbMonthlyMobileHead')){
    const h=doc.createElement('div');
    h.id='bbMonthlyMobileHead';
    h.className='bb-monthly-mobile-head';
    h.innerHTML='<div><strong>Monthly Expense</strong><span>Category totals · tap View Expenses to drill down</span></div><button type="button" data-bb-refresh>↻</button>';
    app.insertBefore(h,app.firstChild);
    h.querySelector('[data-bb-refresh]').onclick=()=>doc.getElementById('refreshBtn')?.click();
  }
  const prev=doc.getElementById('prevMonthBtn');
  const next=doc.getElementById('nextMonthBtn');
  const refresh=doc.getElementById('refreshBtn');
  if(prev&&!prev.dataset.bbMobileText){prev.dataset.bbMobileText='1';prev.textContent='‹';prev.title='Previous Month'}
  if(next&&!next.dataset.bbMobileText){next.dataset.bbMobileText='1';next.textContent='›';next.title='Next Month'}
  if(refresh&&!refresh.dataset.bbMobileText){refresh.dataset.bbMobileText='1';refresh.textContent='↻';refresh.title='Refresh'}
  decorateCategories(doc);
  if(!reportSections.dataset.bbMobileObserved){
    reportSections.dataset.bbMobileObserved='1';
    new win.MutationObserver(()=>decorateCategories(doc)).observe(reportSections,{childList:true,subtree:true});
  }
  reveal(doc);
  return true;
}
function retrySeries(){[60,180,420,800,1400,2400,4000].forEach(ms=>setTimeout(()=>{try{inject()}catch(_){}},ms))}
frame.addEventListener('load',retrySeries);
frame.src='monthly-report.html?embed=1&mobileSkin=1&v=20260916-4';
retrySeries();
setTimeout(()=>{
  if(shown)return;
  try{
    const doc=frame.contentDocument||frame.contentWindow.document;
    const innerError=doc?.getElementById('errorBox');
    showError(innerError&&!innerError.hidden&&innerError.textContent.trim()?innerError.textContent.trim():'The Monthly Expense engine did not finish loading.');
  }catch(_){showError('The Monthly Expense engine did not finish loading.')}
},6500);
})();
