const form = document.getElementById('searchForm');
const input = document.getElementById('searchInput');
const button = document.getElementById('searchBtn');
const statusBox = document.getElementById('status');
const results = document.getElementById('results');
const pagination = document.getElementById('pagination');
const prevPage = document.getElementById('prevPage');
const nextPage = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');
const pageSize = 10;
let displayedProducts = [];
let currentPage = 1;

// 使用 textContent 顯示商品文字，避免把來源內容當成 HTML。
function element(tag, text) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  return node;
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  const keyword = input.value.trim();
  if (!keyword || button.disabled) return;
  button.disabled = true;
  renderProducts({products: []});
  statusBox.textContent = '搜尋已送出，正在等待或抓取商品；最多 100 頁，可能需要數分鐘。';
  try {
    // 同一個 FastAPI 提供前端與 API，不需要 Live Server。
    const params = new URLSearchParams({keyword, max_pages: '100'});
    const response = await fetch('/api/products?' + params);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(typeof data.detail === 'string' ? data.detail : '輸入資料不符，請檢查關鍵字。');
    }
    statusBox.textContent = data.count
      ? `取得 ${data.count} 筆商品（第 ${data.pages_fetched} 頁）。抓取時間：${new Date(data.fetched_at).toLocaleString('zh-TW')}。`
      : 'PChome 沒有回傳符合的商品，請換個關鍵字。';
    renderProducts(data);
  } catch (error) {
    statusBox.textContent = '搜尋失敗：' + error.message;
  } finally {
    button.disabled = false;
  }
});

function renderProducts(data) {
  displayedProducts = data.products;
  currentPage = 1;
  renderPage();
}

function renderPage() {
  results.replaceChildren();
  const totalPages = Math.ceil(displayedProducts.length / pageSize);
  pagination.hidden = totalPages === 0;
  prevPage.disabled = currentPage <= 1;
  nextPage.disabled = currentPage >= totalPages;
  const start = (currentPage - 1) * pageSize;
  pageInfo.textContent = totalPages
    ? `第 ${currentPage} / ${totalPages} 頁｜第 ${start + 1}–${Math.min(start + pageSize, displayedProducts.length)} 筆，共 ${displayedProducts.length} 筆`
    : '';
    for (const product of displayedProducts.slice(start, start + pageSize)) {
      const card = element('article');
      card.className = 'product-card';
      if (product.image_url) {
        const image = element('img');
        image.className = 'product-image';
        image.src = product.image_url;
        image.alt = product.name;
        image.loading = 'lazy';
        card.append(image);
      }
      const link = element('a', '前往 PChome 商品頁');
      link.href = product.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      card.append(
        element('h3', product.name),
        element('p', 'NT$ ' + Number(product.price).toLocaleString('zh-TW')),
        element('p', '購物平台：PChome'),
        link,
      );
      results.append(card);
    }
}
prevPage.addEventListener('click', () => {
  if (currentPage <= 1) return;
  currentPage--;
  renderPage();
  results.scrollIntoView({behavior: 'smooth', block: 'start'});
});
nextPage.addEventListener('click', () => {
  if (currentPage * pageSize >= displayedProducts.length) return;
  currentPage++;
  renderPage();
  results.scrollIntoView({behavior: 'smooth', block: 'start'});
});
const historyStatus = document.getElementById('historyStatus');
const historySelect = document.getElementById('historySelect');
async function getJson(url) {
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) throw new Error(typeof data.detail === 'string' ? data.detail : '讀取失敗');
  return data;
}
document.getElementById('historyBtn').addEventListener('click', async () => {
  historyStatus.textContent = '正在讀取 SQLite 資料庫……';
  try {
    const rows = await getJson('/api/history');
    historySelect.replaceChildren();
    for (const row of rows) {
      const option = element('option', `${row.keyword}／${row.count} 筆／${new Date(row.fetched_at).toLocaleString('zh-TW')}`);
      option.value = row.id;
      historySelect.append(option);
    }
    historyStatus.textContent = rows.length ? `已載入最近 ${rows.length} 次搜尋紀錄。` : '目前沒有紀錄，請先搜尋 PChome。';
  } catch (error) { historyStatus.textContent = error.message; }
});
document.getElementById('loadHistoryBtn').addEventListener('click', async () => {
  if (!historySelect.value || button.disabled) return;
  try {
    const data = await getJson('/api/history/' + encodeURIComponent(historySelect.value));
    renderProducts(data);
    statusBox.textContent = `SQLite 歷史資料：${data.keyword}，${data.count} 筆。記錄時間：${new Date(data.fetched_at).toLocaleString('zh-TW')}。此為當時價格，沒有重新抓取 PChome。`;
  } catch (error) { historyStatus.textContent = error.message; }
});
