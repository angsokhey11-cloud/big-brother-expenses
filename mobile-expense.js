/* BIG BROTHER — Expense Recorder Mobile Wrapper V2 */
(function(){
'use strict';

const frame=document.getElementById('expenseFrame');
const boot=document.getElementById('boot');
const bootCard=document.getElementById('bootCard');

function esc(value){
  return String(value==null?'':value).replace(/[&<>"']/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c];
  });
}

function showError(message){
  if(!bootCard)return;
  bootCard.innerHTML='Could not open Expense Recorder<div>'+esc(message||'Unknown error')+'</div>';
}

function collapseNote(doc){
  if(doc.getElementById('bbExpenseNoteDetails'))return;
  const note=doc.getElementById('note');
  if(!note)return;
  const field=note.closest('.field');
  if(!field)return;

  const details=doc.createElement('details');
  details.id='bbExpenseNoteDetails';
  details.className='bb-expense-note-details';
  const summary=doc.createElement('summary');
  summary.innerHTML='📝 Note <span>Optional</span>';
  field.parentNode.insertBefore(details,field);
  details.appendChild(summary);
  details.appendChild(field);
}

function markStickyActions(doc){
  const form=doc.getElementById('expenseForm');
  if(!form)return;
  const save=doc.getElementById('saveBtn');
  const clear=doc.getElementById('clearBtn');
  if(!save||!clear)return;
  const actions=save.closest('.actions');
  if(actions&&actions.contains(clear))actions.classList.add('bb-expense-sticky-actions');
}

function inject(){
  let doc,win;
  try{
    doc=frame.contentDocument||frame.contentWindow.document;
    win=frame.contentWindow;
  }catch(error){
    showError(error.message);
    return false;
  }

  if(!doc||!doc.head||!doc.body)return false;

  if(!doc.getElementById('bb-expense-mobile-css')){
    const link=doc.createElement('link');
    link.id='bb-expense-mobile-css';
    link.rel='stylesheet';
    link.href='mobile-expense.css?v=20260916-1';
    doc.head.appendChild(link);
  }

  const form=doc.getElementById('expenseForm');
  const view=doc.getElementById('viewAddExpense');
  if(!form||!view)return false;

  doc.documentElement.classList.add('bb-expense-mobile');
  doc.body.classList.add('bb-expense-mobile-body');

  collapseNote(doc);
  markStickyActions(doc);

  const addCategory=doc.getElementById('addCategoryBtn');
  if(addCategory) addCategory.textContent='+ New';
  const addPayee=doc.getElementById('addPayeeBtn');
  if(addPayee) addPayee.textContent='+ New';

  boot.classList.add('hide');
  frame.style.display='block';

  if(!doc.body.dataset.bbExpenseMobileWatch){
    doc.body.dataset.bbExpenseMobileWatch='1';
    new win.MutationObserver(function(){
      collapseNote(doc);
      markStickyActions(doc);
    }).observe(doc.body,{childList:true,subtree:true});
  }

  return true;
}

function scheduleInject(){
  [60,180,450,900,1600,2600,4200].forEach(function(ms){
    setTimeout(function(){
      try{ inject(); }catch(error){ console.error('Expense Mobile inject:',error); }
    },ms);
  });
}

frame.addEventListener('load',scheduleInject);
frame.addEventListener('error',function(){showError('Could not load the live Expenses engine.')});

frame.src='index.html?embed=1&view=add-expense&mobileSkin=1&v=20260920-iosdecimal1';
scheduleInject();

setTimeout(function(){
  if(!boot.classList.contains('hide')){
    const ok=inject();
    if(!ok){
      const doc=frame.contentDocument;
      const text=(doc&&doc.body&&doc.body.innerText||'').trim();
      if(text&&/error|denied|expired|failed|sign in/i.test(text)) showError(text.slice(0,280));
    }
  }
},6500);

})();
