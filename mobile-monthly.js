/* BIG BROTHER — Monthly Expense Mobile V2.2 */
(function(){
  'use strict';

  const $ = id => document.getElementById(id);
  const state = {
    loading:false,
    accessChecked:false,
    report:null,
    records:[]
  };

  function clean(value){
    return String(value == null ? '' : value).trim();
  }

  function num(value){
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  function esc(value){
    return clean(value)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/\"/g,'&quot;')
      .replace(/'/g,'&#039;');
  }

  function money(value){
    return new Intl.NumberFormat('en-US',{
      style:'currency',
      currency:'USD',
      minimumFractionDigits:2,
      maximumFractionDigits:2
    }).format(num(value));
  }

  function dateDisplay(value){
    const raw = clean(value);
    const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return match ? (match[3]+'/'+match[2]+'/'+match[1]) : (raw || '-');
  }

  function currentPhnomPenhMonth(){
    const parts = new Intl.DateTimeFormat('en-US',{
      timeZone:'Asia/Phnom_Penh',
      year:'numeric',
      month:'2-digit'
    }).formatToParts(new Date());
    let year='';
    let month='';
    parts.forEach(part=>{
      if(part.type==='year') year=part.value;
      if(part.type==='month') month=part.value;
    });
    return year+'-'+month;
  }

  function parseMonthValue(){
    const match = clean($('reportMonth').value).match(/^(\d{4})-(\d{2})$/);
    return match ? {year:Number(match[1]),month:Number(match[2])} : null;
  }

  function typeIcon(expenseType){
    switch(clean(expenseType)){
      case 'OPERATING EXPENSE': return '🏢';
      case 'NON-OPERATING EXPENSE': return '📉';
      case 'CAPITAL EXPENSE': return '🏗️';
      default: return '💸';
    }
  }

  function setError(message){
    const text = clean(message);
    $('errorBox').hidden = !text;
    $('errorBox').textContent = text;
  }

  function setLoading(isLoading){
    state.loading = !!isLoading;
    $('loadingBox').hidden = !isLoading;
    ['prevMonthBtn','nextMonthBtn','refreshBtn','topRefreshBtn','reportMonth','showZeroCategories']
      .forEach(id=>{
        const el=$(id);
        if(el) el.disabled=!!isLoading;
      });
  }

  function closeCategorySheet(){
    $('categorySheet').hidden = true;
    document.body.classList.remove('sheet-open');
  }

  function categoryRows(section,category){
    const type = clean(section.expenseType).toUpperCase();
    const id = clean(category.categoryId);
    const name = clean(category.category).toLowerCase();

    return state.records.filter(row=>{
      const rowType = clean(row.expenseType).toUpperCase();
      const rowId = clean(row.categoryId);
      const nameMatch = rowType===type && clean(row.category).toLowerCase()===name;
      if(id) return rowId===id || (!rowId && nameMatch);
      return nameMatch;
    });
  }

  function statusClass(status){
    const value=clean(status).toUpperCase();
    return ['PAID','UNPAID','POSTED','PARTIAL'].includes(value) ? value : 'OTHER';
  }

  function renderTransaction(row){
    const status=clean(row.status).toUpperCase() || '-';
    return [
      '<tr>',
        '<td class="date-cell">',esc(dateDisplay(row.expenseDate)),'</td>',
        '<td class="description-cell" title="',esc(row.description || '-'),'">',esc(row.description || '-'),'</td>',
        '<td class="category-cell" title="',esc(row.category || '-'),'">',esc(row.category || '-'),'</td>',
        '<td class="amount-cell">',money(row.amountUSD),'</td>',
        '<td class="status-cell"><span class="status ',statusClass(status),'">',esc(status),'</span></td>',
        '<td class="payment-cell" title="',esc(row.paymentMethod || '-'),'">',esc(row.paymentMethod || '-'),'</td>',
      '</tr>'
    ].join('');
  }

  function openCategorySheet(section,category){
    const rows=categoryRows(section,category);
    $('categoryTitle').textContent=clean(category.category) || 'Category Expenses';
    $('categoryMeta').textContent=[
      clean(section.expenseTypeLabel) || clean(section.expenseType),
      rows.length+' expense'+(rows.length===1?'':'s'),
      money(category.amountUSD)
    ].filter(Boolean).join(' · ');

    $('categoryList').innerHTML=rows.length
      ? [
          '<div class="transaction-table-wrap">',
            '<table class="transaction-table">',
              '<colgroup>',
                '<col class="col-date">',
                '<col class="col-description">',
                '<col class="col-category">',
                '<col class="col-amount">',
                '<col class="col-status">',
                '<col class="col-payment">',
              '</colgroup>',
              '<thead><tr>',
                '<th>Date</th>',
                '<th>Description</th>',
                '<th>Category</th>',
                '<th>Amount</th>',
                '<th>Status</th>',
                '<th>Payment</th>',
              '</tr></thead>',
              '<tbody>',rows.map(renderTransaction).join(''),'</tbody>',
            '</table>',
          '</div>'
        ].join('')
      : '<div class="empty-sheet">No expense transactions found for this category in the selected month.</div>';

    $('categorySheet').hidden=false;
    document.body.classList.add('sheet-open');
  }

  function bindCategoryButtons(){
    $('reportSections').querySelectorAll('[data-section-index][data-category-index]').forEach(button=>{
      button.addEventListener('click',()=>{
        const sectionIndex=Number(button.dataset.sectionIndex);
        const categoryIndex=Number(button.dataset.categoryIndex);
        const section=state.report?.sections?.[sectionIndex];
        const category=section?.categories?.[categoryIndex];
        if(section && category) openCategorySheet(section,category);
      });
    });
  }

  function renderSections(sections){
    const rows=Array.isArray(sections) ? sections : [];

    $('reportSections').innerHTML=rows.map((section,sectionIndex)=>{
      const categories=Array.isArray(section.categories) ? section.categories : [];
      const categoryHtml=categories.length
        ? categories.map((category,categoryIndex)=>{
            const count=num(category.recordCount);
            return [
              '<article class="category-row">',
                '<div class="category-main">',
                  '<strong>',esc(category.category),'</strong>',
                  '<span>',count,' record',count===1?'':'s','</span>',
                '</div>',
                '<div class="category-side">',
                  '<strong>',money(category.amountUSD),'</strong>',
                  '<button type="button" class="view-btn" data-section-index="',sectionIndex,'" data-category-index="',categoryIndex,'"',count>0?'':' disabled','>View Expenses</button>',
                '</div>',
              '</article>'
            ].join('');
          }).join('')
        : '<div class="empty-type">No expense activity for this type in the selected month.</div>';

      return [
        '<section class="type-section">',
          '<header class="type-head">',
            '<strong>',typeIcon(section.expenseType),' ',esc(section.expenseTypeLabel),'</strong>',
            '<span>',money(section.totalAmountUSD),'</span>',
          '</header>',
          '<div class="category-list">',categoryHtml,'</div>',
          '<footer class="type-total">',
            '<span>Total ',esc(section.expenseTypeLabel),' · ',num(section.recordCount),' record',num(section.recordCount)===1?'':'s','</span>',
            '<strong>',money(section.totalAmountUSD),'</strong>',
          '</footer>',
        '</section>'
      ].join('');
    }).join('');

    bindCategoryButtons();
  }

  function renderReport(report){
    state.report=report || {};
    state.records=Array.isArray(report?.records) ? report.records : [];
    const totals=report?.totals || {};

    $('operatingTotal').textContent=money(totals.operatingExpenseUSD);
    $('nonOperatingTotal').textContent=money(totals.nonOperatingExpenseUSD);
    $('capitalTotal').textContent=money(totals.capitalExpenseUSD);
    $('monthlyTotal').textContent=money(totals.totalMonthlyExpenseUSD);
    $('grandTotal').textContent=money(totals.totalMonthlyExpenseUSD);
    $('recordCount').textContent=String(num(totals.recordCount));

    renderSections(report?.sections);

    const quality=report?.dataQuality || {};
    $('reportMeta').textContent=
      clean(report?.periodLabel)+
      ' · Generated '+clean(report?.generatedAt)+
      ' · '+String(num(totals.recordCount))+' expense record(s)'+
      (num(quality.unclassifiedRecordCount)>0
        ? ' · ⚠ '+quality.unclassifiedRecordCount+' unclassified record(s) worth '+money(quality.unclassifiedAmountUSD)
        : ' · Data Quality: OK');

    $('kpiGrid').hidden=false;
    $('grandTotalCard').hidden=false;
  }

  function clearReport(){
    state.report=null;
    state.records=[];
    $('reportSections').innerHTML='';
    $('reportMeta').textContent='';
    $('kpiGrid').hidden=true;
    $('grandTotalCard').hidden=true;
    closeCategorySheet();
  }

  async function ensureAccess(){
    if(state.accessChecked) return;
    if(!window.BBExpensesAdapter || typeof window.BBExpensesAdapter.rpc!=='function'){
      throw new Error('Expenses Supabase Adapter is not available.');
    }
    const access=await window.BBExpensesAdapter.rpc('bb_expense_mobile_monthly_access');
    if(access?.canView!==true){
      throw new Error('You do not have permission to view Monthly Expense.');
    }
    state.accessChecked=true;
  }

  async function loadReport(){
    if(state.loading) return;
    const selected=parseMonthValue();
    if(!selected){
      setError('Please choose a valid report month.');
      return;
    }

    setLoading(true);
    setError('');
    closeCategorySheet();

    try{
      await ensureAccess();
      const report=await window.BBExpensesAdapter.rpc('bb_expense_monthly_report',{
        p_year:selected.year,
        p_month:selected.month,
        p_include_zero_categories:$('showZeroCategories').checked
      });

      if(!report || report.success!==true){
        throw new Error('Monthly Expense Report returned an invalid response.');
      }

      renderReport(report);
    }catch(error){
      console.error(error);
      clearReport();
      setError(clean(error?.message || error) || 'Could not load Monthly Expense Report.');
    }finally{
      setLoading(false);
    }
  }

  function shiftMonth(offset){
    const selected=parseMonthValue();
    if(!selected) return;
    const date=new Date(selected.year,selected.month-1+offset,1);
    $('reportMonth').value=date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0');
    loadReport();
  }

  $('prevMonthBtn').addEventListener('click',()=>shiftMonth(-1));
  $('nextMonthBtn').addEventListener('click',()=>shiftMonth(1));
  $('refreshBtn').addEventListener('click',loadReport);
  $('topRefreshBtn').addEventListener('click',loadReport);
  $('reportMonth').addEventListener('change',loadReport);
  $('showZeroCategories').addEventListener('change',loadReport);
  $('categoryCloseBtn').addEventListener('click',closeCategorySheet);
  $('categorySheet').addEventListener('click',event=>{
    if(event.target===$('categorySheet')) closeCategorySheet();
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape') closeCategorySheet();
  });

  $('reportMonth').value=currentPhnomPenhMonth();
  loadReport();
})();
