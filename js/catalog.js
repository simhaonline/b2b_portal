'use strict';

showElement(loader, 'flex');

//=====================================================================================================
// Первоначальные данные для работы:
//=====================================================================================================

// Элементы DOM для работы с ними:

var pageSearch = document.getElementById('page-search'),
    zipSelect = document.querySelector('.zip-select'),
    mainHeader = document.getElementById('main-header'),
    mainNav = document.getElementById('main-nav'),
    content = document.getElementById('content'),
    headerContent = document.getElementById('header-content'),
    filtersContainer = document.getElementById('filters-container'),
    filters = document.getElementById('filters'),
    menuFilters = document.getElementById('menu-filters'),
    filtersInfo = document.getElementById('filters-info'),
    gallery = document.getElementById('gallery'),
    galleryNotice = document.getElementById('gallery-notice'),
    fullCardContainer = document.getElementById('full-card-container'),
    fullImgContainer = document.getElementById('full-img-container');

if (pageSearch) {
  var pageSearchInput = document.getElementById('page-search-input'),
      pageSearchInfo = document.getElementById('search-info'),
      clearPageSearchBtn = pageSearch.querySelector('.close.icon');
}
if (zipSelect) {
  var zipFilters = document.getElementById('zip-filters'),
      selectMan = document.getElementById('select-man'),
      selectYears = document.getElementById('select-years'),
      selectModel = document.getElementById('select-model'),
      clearZipFilterBtn = zipFilters.querySelector('.close-btn'),
      oemSearch = document.getElementById('oem-search'),
      oemSearchInput = document.getElementById('oem-search-input'),
      oemDropdown =  document.getElementById('oem-dropdown'),
      oemList = document.getElementById('oem-list'),
      oemNotFound = document.getElementById('oem-not-found'),
      clearOemSearchBtn = oemSearch.querySelector('.clear-search-btn');
}

// Получение шаблонов из HTML:

var minCardTemplate = document.getElementById('min-card-#object_id#'),
    bigCardTemplate = document.getElementById('big-card-#object_id#'),
    fullCardTemplate = document.getElementById('full-card-#object_id#'),
    productCardTemplate = document.getElementById('product-card-#object_id#');

if (mainNav) {
  var mainNavTemplate = mainNav.innerHTML,
      navItemTemplate = mainNav.querySelector('.item').outerHTML;
}
if (zipSelect) {
  var selectmanTemplate = selectMan.innerHTML,
      selectyearsTemplate = selectYears.innerHTML,
      selectmodelTemplate = selectModel.innerHTML,
      selectManufItemTemplate = selectMan.querySelector('.select-option').outerHTML,
      oemListTemplate = oemList.innerHTML;
}
if (menuFilters) {
  var filterTemplate = menuFilters.querySelector('.filter').outerHTML,
      filterItemTemplate = menuFilters.querySelector('.filter-item').outerHTML,
      filterSubitemTemplate = menuFilters.querySelector('.filter-item.subitem').outerHTML;
}
if (filtersInfo) {
  var duplicateFilterTemplate = filtersInfo.innerHTML;
  clearFiltersInfo();
}
if (fullImgContainer) {
  var fullImg = document.getElementById('full-img'),
      fullImgTemplate = fullImg.innerHTML,
      fullCarouselTemplate = fullImg.querySelector('.carousel-gallery').innerHTML;
}

// Динамически изменяемые переменные:

var items,
    view = 'list',
    cardTemplate,
    curItems,
    selectedItems = '',
    itemsForSearch,
    zipFilterData = {},
    pageUrl = pageId;

//=====================================================================================================
// Первоначальное заполнение контента на странице:
//=====================================================================================================

if (view != 'product') {
  convertItems();
}

if (cart) {
  window.addEventListener('focus', updateContent);
  if (view === 'product') {
    getProductInfo(location.search.replace('?',''))
    .then(
      result => {
        items = [result];
        convertItems();
        getCartInfo()
        .then(
          result => {
            showPage();
          },
          error => {
            showPage();
          }
        );
      },
      error => {
        showElement(galleryNotice, 'flex');
        hideElement(loader);
      }
    )
  } else {
    getCartInfo()
    .then(
      result => {
        showPage();
      },
      error => {
        showPage();
      }
    );
  }
} else {
  document.addEventListener('DOMContentLoaded', () => {
    showPage();
  });
}

// Получение данных о конкретном товаре:

function getProductInfo(id) {
  return new Promise((resolve, reject) => {
    sendRequest(`http://80.234.34.212:2000/-aleksa-/TopSports/test/product${id}.txt`)
    .then(
      result => {
        var product = JSON.parse(result);
        // console.log(product);
        resolve(product);
      }
    )
    .catch(error => {
      // console.log(error);
      reject();
    })
  });
}

//=====================================================================================================
// // Преобразование исходных данных:
//=====================================================================================================

// Преобразование:
// - данных о картинках в карточке товара из строки в массив;
// - данных о годах в укороченный формат
// - добавление пробелов
// Сортировка товаров по категориям (чтобы не отражались на сайте вразноброс):

function convertItems() {
  if (pageId == '_lodki') {
    items = items.filter(el => el.lodkimotor == 1);
  }
  if (pageId == '_snegohod') {
    items = items.filter(el => el.snegohod == 1);
  }
  var manuf;
  items.forEach(item => {
    item.images = item.images.toString().split(';');
    item.price_cur = item.price_preorder1 == 0 ? item.price : item.price_preorder;
    item.price_cur1 = item.price_preorder1 == 0 ? item.price1 : item.price_preorder1;
    if (item.manuf) {
      try {
        manuf = JSON.parse(item.manuf);
      } catch(error) {
        item.manuf = 0;
      }
      item.manuf = manuf;
    }
  });
  items.sort(dynamicSort(('catid')));
}

//=====================================================================================================
// Визуальное отображение контента на странице:
//=====================================================================================================

// Настройка каруселей:

var fullCardCarousel = {
  isNav: true,
  durationNav: 400,
  isLoupe: true
};

var fullImgCarousel = {
  durationNav: 400,
};

// Установка ширины малых карточек товаров:

function setMinCardWidth() {
  if (!content.classList.contains('blocks')) {
    return;
  }
  var standartWidth = (18 * parseInt(getComputedStyle(gallery).fontSize, 10)),
      countCards = Math.floor(gallery.clientWidth / standartWidth),
      restGallery = gallery.clientWidth - countCards * standartWidth,
      changeMinCard = restGallery / countCards,
      minCardWidth = 0;
  if (changeMinCard <= 110) {
    minCardWidth = Math.floor(standartWidth + changeMinCard);
  } else {
    countCards = countCards + 1;
    minCardWidth = gallery.clientWidth / countCards;
  }
  var cards = document.querySelectorAll('.min-card');
  cards.forEach(minCard => {
    minCard.style.width = minCardWidth + 'px';
  });
  // for (let i = 0; i < countCards; i++) {
  //   cards[i].style.borderTop = 'none';
  // }
}

// Изменение позиционирования меню фильтров:

function setFiltersPosition() {
  if (window.innerWidth > 767) {
    if (filters.style.position == 'fixed') {
      if (menuFilters.clientHeight >= gallery.clientHeight) {
        filters.style.position = 'static';
        filters.style.top = '0px';
        filters.style.height = 'auto';
      } else {
        setFiltersHeight();
      }
    } else {
      if (menuFilters.clientHeight < gallery.clientHeight) {
        filters.style.position = 'fixed';
        setFiltersHeight();
      }
    }
  }
}

// Установка высоты меню фильтров:

function setFiltersHeight() {
  var scrolled = window.pageYOffset || document.documentElement.scrollTop,
      headerHeight = document.querySelector('.header').clientHeight,
      footerHeight = Math.max((window.innerHeight + scrolled - document.querySelector('.footer').offsetTop) + 20, 0),
      filtersHeight = window.innerHeight - headerHeight - footerHeight;

  filters.style.top = headerHeight + 'px';
  filters.style.maxHeight = filtersHeight + 'px';
}

//=====================================================================================================
// Динамическая смена URL и данных на странице:
//=====================================================================================================

var path;

// Рендеринг страницы при загрузке:

function showPage() {
  hideElement(loader);
  setCardTemplate();
  initPage();
}

// Инициализация первой страницы при открытии сайта:

function initPage() {
  if (website == 'ts_r_zip' && !location.search) {
    window.history.pushState({'path': ['snegohod']},'', '?snegohod');
  }

  if (view === 'product') {
    path = [];
    if (items[0].snegohod || items[0].lodkimotor) {
      if (website == 'ts_com') {
        path.push('o_zip');
      }
      if (items[0].snegohod) {
        path.push('snegohod');
      }
      if (items[0].lodkimotor) {
        path.push('lodkimotor');
      }
      if (items[0].acc) {
        path.push('acc');
      }
      if (items[0].zip) {
        path.push('zip');
      }
    } else {
      if (website == 'ts_com') {
        path.push('o_ek');
      }
      catId.forEach(key => {
        if (items[0].catid == catId[key]) {
          path.push(key);
        }
      });
    }
  } else {
    path = location.search.split('?').map(el => {
      if (el == '') {
        return pageId;
      } else {
        return el;
      }
    });
  }
  renderContent();
}

// Изменение URL без перезагрузки страницы:

window.addEventListener('popstate', (event) => openPage(event));

function openPage(event) {
  event.preventDefault();
  if (event.type == 'popstate') {
    if (event.state) {
      path = event.state.path;
    } else {
      return;
    }
  } else {
    var oldPath = path,
        newUrl = event.currentTarget.dataset.href.split('?');
    path = Array.from(document.querySelector('.header-menu').querySelectorAll('.active'))
      .filter(element => element.dataset.level < event.currentTarget.dataset.level)
      .map(element => element.dataset.href);
    path = path.concat(newUrl);

    if (path.length === oldPath.length && JSON.stringify(oldPath) === JSON.stringify(path)) {
      return;
    }

    var urlPath = path
      .map(element => {
        if (element == pageId) {
          return location.href.split('?')[0];
        } else {
          return '?' + element;
        }
      })
      .join('');

    window.history.pushState({'path': path},'', urlPath);
  }
  renderContent();
}

// Изменение контента страницы:

function renderContent() {
  changePageTitle();
  toggleMenuItems();
  createDinamicLinks();
  createMainNav();

  if (cart) {
    cartId = document.querySelector('.topmenu-item.active').dataset.id;
    checkCartRelevance();
    changeHeaderCart();
  }
  curItems = items;
  if (path[path.length - 1] == 'cart') {
    renderCart();
  } else if (view === 'product') {
    renderProductPage();
  } else {
    renderGallery();
  }
  setPaddingToBody();
  setDocumentScroll(0);
}

// Скрытие неактуальных частей страницы:

function changeContent(block) {
  window.removeEventListener('scroll', scrollGallery);
  window.removeEventListener('resize', scrollGallery);
  window.removeEventListener('resize', setMinCardWidth);
  window.removeEventListener('scroll', setFiltersPosition);
  window.removeEventListener('resize', setFiltersPosition);

  if (block === 'cart') {
    showElement(mainHeader);
    hideElement(headerContent);
    hideElement(content);
    hideElement(filtersContainer);
    hideElement(gallery);
    hideElement(galleryNotice);
  } else {
    showElement(content, 'flex');
    if (block === 'gallery') {
      window.addEventListener('scroll', scrollGallery);
      window.addEventListener('resize', scrollGallery);
      window.addEventListener('resize', setMinCardWidth);
      window.addEventListener('scroll', setFiltersPosition);
      window.addEventListener('resize', setFiltersPosition);
      hideElement(mainHeader);
      showElement(headerContent);
      if (cart) {
        hideElement(cartContent);
      }
      if (zipSelect) {
        if (path[path.length - 1] == 'zip') {
          showElement(zipSelect);
        } else {
          hideElement(zipSelect);
        }
      }
    }
  }
}

// Обновление данных страницы при возвращении на неё:

function updateContent() {
  cartId = document.querySelector('.topmenu-item.active').dataset.id;
  getCartInfo()
  .then(
    result => {
      // console.log('обновляю корзину');
      changeHeaderCart();
      if (path[path.length - 1] == 'cart') {
        renderCart();
      } else {
        var cards;
        if (view === 'list') {
          cards = document.querySelectorAll('.big-card');
        }
        if (view === 'blocks') {
          cards = document.querySelectorAll('.min-card');
        }
        cards.forEach(card => checkCart(card));
      }
    },
    error => {
      return;
    }
  );
}

// Изменение заголовка страницы:

function changePageTitle() {
  var title = '',
      curTitle = document.querySelector(`[data-href="${path[path.length - 1]}"]`);
  if (view === 'product') {
    title += items[0].title;
  } else if (curTitle) {
    title += curTitle.dataset.title;
  }
  document.title = 'ТОП СПОРТС - ' + title;
  var pageTitle = document.getElementById('page-title');
  if (pageTitle) {
    pageTitle.textContent = title;
  }
}

// Изменение активных разделов меню:

function toggleMenuItems() {
  document.querySelectorAll('.header-menu .active').forEach(item => item.classList.remove('active'));
  path.forEach(key => {
    var curTitle = document.querySelector(`[data-href="${key}"]`);
    if (curTitle) {
      curTitle.classList.add('active');
    }
  });
}

// Добавление ссылок в разделы меню:

function createDinamicLinks() {
  document.querySelectorAll('.dinamic').forEach(item => {
    var curTitle = document.querySelector(`.header-menu .active[data-level="${item.dataset.level - 1}"]`);
    if (curTitle) {
      item.href = curTitle.href + '?' + item.dataset.href;
    }
  });
}

// Изменение хлебных крошек:

function createMainNav() {
  var list = '',
      curTitle,
      newItem;

  path.forEach(item => {
    curTitle = document.querySelector(`[data-href="${item}"]`);
    if (curTitle) {
      newItem = navItemTemplate
      .replace('#href#', curTitle.href)
      .replace('#dataHref#', item)
      .replace('#level#', curTitle.dataset.level)
      .replace('#title#', curTitle.dataset.title);
      list += newItem;
    }
  });
  if (view === 'product') {
    newItem = navItemTemplate
      .replace('#href#', '#')
      .replace('#title#', items[0].title);
      list += newItem;
  }
  mainNav.innerHTML = mainNavTemplate.replace(navItemTemplate, list);
}

// Создание контента страницы товара:

function renderProductPage() {
  gallery.innerHTML = createCard(items[0]);
  var card = document.querySelector('.product-card');
  if (cart) {
    checkAction(card);
    checkCart(card);
  }
  renderCarousel(card.querySelector('.carousel'))
  .then(
    result => {
      card.style.opacity = '1';
    }
  )
}

// Создание контента галереи:

function renderGallery() {
  var local = location.search,
      pageFilter;
  if (location.search && location.search.indexOf('=') >= 0) {
    local = location.search.split('?');
    pageFilter = local.pop();
    local = local.join('?');
  }
  pageUrl = local ? pageId + local : pageId;
  changeContent('gallery');

  path.forEach(key => {
    if (key != pageId) {
      curItems = curItems.filter(item => item[key] == 1);
    }
  });
  prepareForSearch(curItems);
  clearAllSearch();

  if (zipSelect) {
    initZipFilter('man');
    initOemSearch();
  }
  initFilters(dataFilters);
  if (pageFilter) {
    setFilterOnPage(pageFilter);
  }
  checkFiltersPosition();
  clearFiltersInfo();
  checkFilters();
  setMinCardWidth();
  showElement(gallery, 'flex');
}

// Добавление фильтра из поисковой строки:

function setFilterOnPage(filter) {
  var key, value;
  removeInfo('filters');
  removeAllFilters();
  menuFilters.querySelectorAll('.filter-item').forEach(el => {
    key = el.dataset.key;
    value = el.dataset.value;
    var filterData = filter.toLowerCase().split('=');
    if (key.toLowerCase() === filterData[0] && value.toLowerCase() === filterData[1]) {
      saveFilter(key, value);
    }
  });;
}

// Сброс данных поиска :

function clearSearchResult() {
  selectedItems = '';
  checkFilters();
}

// Очистка всех видов поиска:

function clearAllSearch() {
  selectedItems = '';
  clearPageSearch();
  clearZipFilters();
  clearOemSearch();
}

//=====================================================================================================
//  Функции для создания фильтров каталога:
//=====================================================================================================

// Отображение фильтров на странице:

function initFilters(dataFilters) {
  var data = JSON.parse(JSON.stringify(dataFilters)),
      isExsist = false;

  for (let item of data) {
    for (let k in item.items) {
      isExsist = curItems.find(card => {
        if (card[item.key] == k || card[k] == 1) {
          return true;
        }
      });
      if (!isExsist) {
        delete item.items[k];
      }
      if (typeof item.items[k] == 'object') {
        for (let kk in item.items[k]) {
          isExsist = curItems.find(card => {
            if (card[item.key] == k && card.subcat == item.items[k][kk]) {
              return true;
            }
          });
          if (!isExsist) {
            delete item.items[k][kk];
          }
        }
      }
    }
  }
  menuFilters.innerHTML = createFilters(data);
  showElement(filtersContainer);
  addTooltips('color');
}

// Создание меню фильтров:

function createFilters(data) {
  return data.map(el => {
    if (document.body.id === '_ekip' && !location.search) {
      if (el.key == 'cat') {
        return;
      }
      if (el.key == 'brand') {
        el.isOpen = 'true';
      }
    }
    if (!isEmptyObj(el.items)) {
      return createFilter(el);
    }
  }).join('');
}

// Создание одного фильтра:

function createFilter(data) {
  var curTitle,
      isHidden,
      newItem = filterTemplate,
      newSubItem,
      list = '',
      subList;

  for (let k in data.items) {
    subList = '';
    isHidden = 'hidden';

    if (typeof data.items[k] === 'object') {
      for (let kk in data.items[k]) {
        if (data.items[k][kk] !== '') {
          isHidden = '';
          newSubItem = filterSubitemTemplate
          .replace('#key#', data.key)
          .replace('#subkey#', k)
          .replace('#value#', data.items[k][kk])
          .replace('#title#', data.items[k][kk])
          subList += newSubItem;
        }
      }
    }

    if ((data.items[k] == 1) || (data.key == 'cat')) {
      curTitle = k;
    } else {
      curTitle = data.items[k];
    }

    if (curTitle == 'SpyOptic') {
      curTitle = 'Spy Optic';
    }
    if (curTitle == 'TroyLeeDesigns') {
      curTitle = 'Troy Lee Designs';
    }
    if (curTitle == 'KingDolphin') {
      curTitle = 'King Dolphin';
    }

    newSubItem = filterItemTemplate
      .replace(filterSubitemTemplate, subList)
      .replace('#key#', data.key)
      .replace('#value#', k)
      .replace('#title#', curTitle)
      .replace('#isHidden#', isHidden);
    list += newSubItem;
  }

  newItem = newItem
    .replace(filterItemTemplate, list)
    .replace('#key#', data.key)
    .replace('#isOpen#', data.isOpen && window.innerWidth >= 767 ? 'default-open' : 'close')
    .replace('#title#', data.title);
  return newItem;
}

//=====================================================================================================
//  Функции для работы с фильтрами каталога:
//=====================================================================================================

// Свернуть/развернуть фильтр:

function toggleFilter(event) {
  var curFilter;
  if (event.target.closest('.filter-title')) {
    curFilter = event.currentTarget;
    if (curFilter.classList.contains('close')) {
      curFilter.classList.remove('close');
      saveFilterPosition(curFilter.id, 'open');
    } else {
      curFilter.classList.add('close');
      saveFilterPosition(curFilter.id, 'close');
    }
  }
}

// Свернуть/развернуть подфильтр:

function toggleFilterItem(event) {
  var filterItem = event.currentTarget.closest('.filter-item');
  if (filterItem.classList.contains('disabled')) {
    return;
  }
  filterItem.classList.toggle('close');
}

// Выбор значения фильтра:

function selectFilterValue(event) {
  event.stopPropagation();
  var curEl;
  if (event.currentTarget.classList.contains('result')) {
    if (!event.target.classList.contains('close')) {
      return;
    }
    curEl = menuFilters.querySelector(`[data-key="${event.currentTarget.dataset.key}"][data-value="${event.currentTarget.dataset.value}"]`);
  } else {
    if (!event.target.closest('.filter-item-title') || event.currentTarget.classList.contains('disabled')) {
      return;
    }
    curEl = event.currentTarget;
  }
  getDocumentScroll();
  clearAllSearch();
  var key = curEl.dataset.key,
      value = curEl.dataset.value,
      subkey = curEl.dataset.subkey;

  if (curEl.classList.contains('checked')) {
    curEl.classList.remove('checked');
    curEl.classList.add('close');
    curEl.querySelectorAll('.filter-item.checked').forEach(subItem => subItem.classList.remove('checked'));
    removeFilter(key, value, subkey);
    if (!subkey) {
      deleteDuplicate(key, value);
    }
  } else {
    curEl.classList.add('checked');
    curEl.classList.remove('close');
    var filterItem = curEl.closest('.filter-item.item');
    if (filterItem) {
      filterItem.classList.add('checked');
    }
    saveFilter(key, value, subkey);
    if (!subkey) {
      createDuplicate(key, value, curEl.querySelector('.item-title').textContent);
    }
  }
  var info = getInfo('filters')[pageUrl];
  if (info && isEmptyObj(info)) {
    selectedItems = '';
  } else {
    selectCards(info);
  }
  showCards();
  toggleToActualFilters(event.currentTarget);

  if (window.innerWidth >= 767) {
    if (filters.style.position === 'static') {
      setDocumentScroll();
    }
  } else {
    setDocumentScroll();
  }
}

// Добавление фильтра в информацию о выбранных фильтрах:

function createDuplicate(key, value, title) {
  var newEl = duplicateFilterTemplate;
  newEl = newEl
    .replace('#key#', key)
    .replace('#value#', value)
    .replace('#title#', title);
  filtersInfo.insertAdjacentHTML('beforeend', newEl);
  setPaddingToBody();
}

// Удаление фильтра из информации о выбранных фильтрах:

function deleteDuplicate(key, value) {
  filtersInfo.querySelector(`[data-key="${key}"][data-value="${value}"]`).remove();
  setPaddingToBody();
}

// Добавление данных в хранилище о выбранных фильтрах:

function saveFilter(key, value, subkey) {
  var info = getInfo('filters');
  if (!info[pageUrl]) {
    info[pageUrl] = {};
  }
  if (!info[pageUrl][key]) {
    info[pageUrl][key] = {};
  }
  if (subkey) {
    if (!info[pageUrl][key][subkey]) {
      info[pageUrl][key][subkey] = {};
    }
    if (!info[pageUrl][key][subkey][value]) {
      info[pageUrl][key][subkey][value] = {};
    }
  } else {
    if (!info[pageUrl][key][value]) {
      info[pageUrl][key][value] = {};
    }
  }
  saveInfo('filters', info);
}

// Удаление данных из хранилища о выбранных фильтрах:

function removeFilter(key, value, subkey) {
  var info = getInfo('filters');
  if (!subkey) {
    delete info[pageUrl][key][value];
    if (isEmptyObj(info[pageUrl][key])) {
      delete info[pageUrl][key];
    }
  } else {
    delete info[pageUrl][key][subkey][value];
    if (info[pageUrl][key][subkey] && isEmptyObj(info[pageUrl][key][subkey])) {
      info[pageUrl][key][subkey] = {};
    }
  }
  saveInfo('filters', info);
}

// Удаление данных из хранилища обо всех фильтрах:

function removeAllFilters() {
  var info = getInfo('filters');
  info[pageUrl] = {};
  saveInfo(`filters`, info);
}

// Сохранение данных в хранилище о состоянии фильтров (открыт/закрыт):

function saveFilterPosition(key, value) {
  var info = getInfo('positions', 'sessionStorage');
  if (!info[pageUrl]) {
    info[pageUrl] = {};
  }
  if (value) {
    info[pageUrl][key] = value;
  }
  saveInfo('positions', info, 'sessionStorage');
}

// Удаление данных из хранилища обо всех состояниях фильтров (открыт/закрыт):

function removeAllFilterPosition() {
  var info = getInfo('positions', 'sessionStorage');
  info[pageUrl] = {};
  saveInfo(`positions`, info, 'sessionStorage');
}

// Отбор карточек фильтром каталога:

function selectCards(info) {
  if (!info) {
    return;
  }
  var isFound;

  selectedItems = curItems.filter(card => {
    for (let k in info) {
      isFound = false;
      for (let kk in info[k]) {
        if (info[k][kk] && !isEmptyObj(info[k][kk])) {
          for (let kkk in info[k][kk]) {
            if (card.cat == kk && card.subcat == kkk) {
              isFound = true;
            }
          }
        } else {
          if (card[k] == kk || card[kk] == 1) {
            isFound = true;
          }
        }
      }
      if (!isFound) {
        return false;
      }
    }
    return true;
  });
}

// Блокировка лишних фильтров:

function toggleToActualFilters(filter) {
  var curItemsArray = curItems;
  if (selectedItems !== '') {
    curItemsArray = selectedItems;
  }
  var curFilters = menuFilters.querySelectorAll(`.filter-item.item.checked[data-key="${filter.dataset.key}"]`),
      checked = menuFilters.querySelectorAll(`.filter-item.item.checked`),
      filterItems;

  if (checked.length == 0) {
    menuFilters.querySelectorAll(`.filter-item.item`).forEach(item => {
      item.classList.remove('disabled');
    });
    return;
  }

  if (curFilters.length != 0) {
    filterItems = menuFilters.querySelectorAll(`.filter-item.item:not([data-key="${filter.dataset.key}"])`);
  } else {
    filterItems = menuFilters.querySelectorAll(`.filter-item.item`);
  }

  var key, value, isExsist, isFound;
  filterItems.forEach(item => {
    isExsist = false;
    key = item.dataset.key;
    value = item.dataset.value;

    if (checked.length == 1 && key == checked[0].dataset.key) {
      item.classList.remove('disabled');
    } else {
      console.log(item);
      isExsist = curItemsArray.find(card => {
        if (card[key] == value || card[value] == 1) {
          item.classList.remove('disabled');
          return true;
        }
      });
      if (!isExsist) {
        item.classList.add('disabled');
        item.classList.add('close');
        if (item.classList.contains('checked')) {
          item.classList.remove('checked');
          deleteDuplicate(item.dataset.key, item.dataset.value);
          item.querySelectorAll('.subitem').forEach(subitem => {
            subitem.classList.remove('checked');
          });
          removeFilter(item.dataset.key, item.dataset.value);
        }
      }
      item.querySelectorAll('.subitem').forEach(subitem => {
        isFound = false;
        isFound = curItemsArray.find(card => {
          if (card.cat == value && card.subcat == subitem.dataset.value) {
            return true;
          }
        });
        if (!isFound) {
          subitem.classList.add('disabled');
        } else {
          subitem.classList.remove('disabled');
        }
      });
    }
  });
}

// Очистка фильтров каталога:

function clearFilters() {
  if (!menuFilters.querySelector('.checked')) {
    return;
  }
  getDocumentScroll();
  removeAllFilters();
  removeAllFilterPosition();
  clearFiltersInfo();

  menuFilters.querySelectorAll('.filter-item').forEach(el => {
    el.classList.remove('checked', 'disabled');
    if (el.classList.contains('default-open')) {
      el.classList.remove('close');
    } else {
      el.classList.add('close');
    }
  });

  if (isSearch) {
    return;
  }
  selectedItems = '';
  showCards();
  setDocumentScroll();
}

// Очистка информации о выбранных фильтрах:

function clearFiltersInfo() {
  filtersInfo.innerHTML = '';
}

// Проверка сохраненных положений фильтров:

function checkFiltersPosition() {
  var info = getInfo('positions', 'sessionStorage')[pageUrl],
      curEl;
  if (info) {
    for (let key in info) {
      curEl = document.getElementById(key);
      if (curEl) {
        if (info[key] == 'close') {
          curEl.classList.add('close');
        } else {
          curEl.classList.remove('close');
        }
      }
    }
  }
}

// Проверка сохраненных значений фильтров:

function checkFilters() {
  var info = getInfo('filters')[pageUrl];
  if (info && !isEmptyObj(info)){
    checkFilterExist(info);
    selectFilters(info);
  }
  showCards();
}

// Удаление сохраненных фильтров, если их больше нет на странице:

function checkFilterExist(info) {
  var curEl;
  for (let k in info) {
    for (let kk in info[k]) {
      curEl = menuFilters.querySelector(`[data-key="${k}"][data-value="${kk}"]`);
      if (!curEl) {
        delete info[k][kk];
      }
      for (let kkk in info[k][kk]) {
        curEl = menuFilters.querySelector(`[data-subkey="${kk}"][data-value="${kkk}"]`);
        if (!curEl) {
          delete info[k][kk][kkk];
        }
        if (isEmptyObj(info[k][kk])) {
          delete info[k][kk];
        }
      }
      if (isEmptyObj(info[k])) {
        delete info[k];
      }
    }
  }
}

// Визуальное отображение сохраненных фильтров:

function selectFilters(info) {
  var filters = {},
      filterItem;
  for (let k in info) {
    filters[k] = {};
    filterItem = document.getElementById(`filter-${k}`);
    if (filterItem) {
      filterItem.classList.remove('close');
    }
    for (let kk in info[k]) {
      filters[k][kk] = {};
      selectCards(filters);
      changeFilterClass(k, kk);
      for (let kkk in info[k][kk]) {
        filters[k][kk][kkk] = {};
        selectCards(filters);
        changeFilterClass(k, kkk, kk);
      }
    }
  }
}

// Изменение классов сохраненных фильтров:

function changeFilterClass(key, value, subkey) {
  var curEl;
  if (subkey) {
    curEl = menuFilters.querySelector(`[data-subkey="${subkey}"][data-value="${value}"]`);
  } else {
    curEl = menuFilters.querySelector(`[data-key="${key}"][data-value="${value}"]`);
    createDuplicate(key, value, curEl.querySelector('.item-title').textContent);
  }
  if (curEl) {
    curEl.classList.add('checked');
    var filterItem = curEl.closest('.filter-item');
    if (filterItem) {
      filterItem.classList.remove('close');
    }
    toggleToActualFilters(curEl);
  }
}

//=====================================================================================================
//  Функции для создания фильтров запчастей и поиска по запчастям:
//=====================================================================================================

// Запуск создания фильтров запчастей:

function initZipFilter(filter) {
  createZipFilterData(filter);
  if (zipFilterData[filter].length === 0) {
    if (filter == 'years') {
      initZipFilter('model');
    }
    return;
  }
  createZipFilters(filter);
  unlockZipFilter(filter);
}

// Подготовка данных для фильтров запчастей:

function createZipFilterData(filter) {
  var curItemsArray = curItems;
  if (filter != 'man' && filter != 'oem') {
    curItemsArray = selectedItems;
  }
  zipFilterData[filter] = [];

  curItemsArray.forEach(item => {
    if (item.manuf) {
      for (let k in item.manuf[filter]) {
        if (filter == 'man' || filter == 'oem') {
          if (zipFilterData[filter].indexOf(k.trim()) === -1) {
            zipFilterData[filter].push(k);
          }
        } else {
          for (let kk in item.manuf[filter][k]) {
            if (kk == selectMan.value && zipFilterData[filter].indexOf(k.trim()) === -1) {
              zipFilterData[filter].push(k);
            }
          }
        }
      }
    }
  });
  zipFilterData[filter].sort();
}

// Создание фильтров запчастей:

function createZipFilters(filter) {
  var curSelect = document.getElementById(`select-${filter}`);
  curSelect.innerHTML = createZipFilter(window[`select${filter}Template`], filter);
}

// Создание одного фильтра запчастей:

function createZipFilter(template, filter) {
  var list = '', newItem;
  zipFilterData[filter].forEach(item => {
    newItem = selectManufItemTemplate
      .replace(/#item#/gi, item)
    list += newItem;
  });
  return template.replace(selectManufItemTemplate, list);
}

// Создание подсказок в поиске по OEM:

function initOemSearch() {
  createZipFilterData('oem');
  var list = '', newItem;
  zipFilterData.oem.forEach(item => {
    newItem = oemListTemplate
      .replace(/#item#/gi, item)
    list += newItem;
  });
  oemList.innerHTML = list;
}

//=====================================================================================================
//  Функции для работы с фильтрами запчастей и поиском по запчастям:
//=====================================================================================================

// Отбор карточек фильтром запчастей:

function selectCardsZipFilter(event) {
  if (isSearch) {
    clearPageSearch();
    clearOemSearch();
  }
  var filter = event.currentTarget.dataset.filter,
      isFound;
  selectedItems = curItems.filter(item => {
    if (item.manuf) {
      isFound = false;
      for (let k in item.manuf.man) {
        if (k == selectMan.value) {
          isFound = true;
        }
      }
      if (filter != 'man' && isFound && zipFilterData.years.length != 0) {
        isFound = false;
        for (let k in item.manuf.years) {
          if (k == selectYears.value) {
            for (let kk in item.manuf.years[k]) {
              if (kk == selectMan.value) {
                isFound = true;
              }
            }
          }
        }
      }
      if (filter == 'model' && isFound && zipFilterData.model.length != 0) {
        isFound = false;
        for (let k in item.manuf.model) {
          if (k == selectModel.value) {
            for (let kk in item.manuf.model[k]) {
              if (kk == selectMan.value) {
                isFound = true;
              }
            }
          }
        }
      }
      if (isFound) {
        return true;
      }
    }
  });
  showCards();
  isSearch = true;

  if (filter == 'man') {
    clearZipFilterBtn.classList.add('active');
    lockZipFilter('years');
    lockZipFilter('model');
    initZipFilter('years');
  } else if (filter == 'years') {
    lockZipFilter('model');
    initZipFilter('model');
  }
}

// Блокировка фильтров запчастей:

function lockZipFilter(filter) {
  var curSelect = document.getElementById(`select-${filter}`);
  if (curSelect) {
    curSelect.value = 'default';
    curSelect.setAttribute('disabled', 'disabled');
  }
}

// Разблокировка фильтров запчастей:

function unlockZipFilter(filter) {
  var curSelect = document.getElementById(`select-${filter}`);
  if (curSelect) {
    curSelect.removeAttribute('disabled');
  }
}

// Очистка фильтров запчастей:

function startClearZipFilters(btn) {
  if (btn.classList.contains('active')) {
    clearSearchResult();
    clearZipFilters();
  }
}

function clearZipFilters() {
  if (!zipSelect) {
    return;
  }
  isSearch = false;
  clearZipFilterBtn.classList.remove('active');
  selectMan.value = 'default';
  lockZipFilter('years');
  lockZipFilter('model');
}

// Отображение текущего списка OEM:

function showOemList() {
  var oemToFind = oemSearchInput.value.trim();
  if (oemToFind == '') {
    closeOemHints();
    return;
  }
  showElement(oemDropdown);

  var regExpSearch = RegExp(oemToFind, 'i'),
      allOem = Array.from(document.querySelectorAll('#oem-list .oem'));

  allOem.forEach(el => hideElement(el));
  var curOemList = allOem.filter(el => el.dataset.oem.search(regExpSearch) >= 0);

  if (curOemList.length > 0) {
    showElement(oemList);
    hideElement(oemNotFound);
    curOemList.forEach(el => showElement(el));
  } else {
    oemList.style.display = 'none';
    oemNotFound.style.display = 'block';
  }
}

// Выбор OEM из списка:

function selectOem(event) {
  oemSearchInput.value = event.currentTarget.dataset.oem;
  findOem();
}

// Поиск по OEM:

function findOem() {
  event.preventDefault();
  if (isSearch) {
    clearPageSearch();
    clearZipFilters();
  }
  var oemToFind = oemSearchInput.value.trim();
  if (oemToFind == '') {
    return;
  }
  oemSearchInput.dataset.value = oemSearchInput.value;
  selectCardsOemSearch(oemToFind);
  showCards();
  isSearch = true;
  showElement(clearOemSearchBtn);
}

// Отбор карточек по OEM:

function selectCardsOemSearch(oem) {
  selectedItems = curItems.filter(item => {
    if (item.manuf) {
      for (let k in item.manuf.oem) {
        if (k == oem) {
          return true;
        }
      }
    }
  });
}

// Запуск очиски поиска по OEM:

function startClearOemSearch() {
  clearSearchResult();
  clearOemSearch();
}

// Очистка поиска по OEM:

function clearOemSearch() {
  if (!zipSelect) {
    return;
  }
  isSearch = false;
  closeOemHints();
  hideElement(clearOemSearchBtn);
  oemSearchInput.value = '';
  oemSearchInput.dataset.value = '';
}

// Удаление значения из поиска OEM при его фокусе и скрытие подсказок:

function onFocusOemInput(input) {
  onFocusInput(input);
  closeOemHints();
}

// Скрытие подсказок поиска OEM:

function closeOemHints() {
  hideElement(oemDropdown);
  hideElement(oemList);
  hideElement(oemNotFound);
}

function onBlurOemInput(input) {
  setTimeout(() => {
    onBlurInput(input);
    closeOemHints();
  }, 100);
}

//=====================================================================================================
//  Функции для создания галереи:
//=====================================================================================================

// Создание карточек товаров из массива:

var countItems = 0,
    countItemsTo = 0,
    itemsToLoad;

function loadCards(cards) {
	if (cards){
    countItems = 0;
    itemsToLoad = cards;
	}
	else {
    countItems = countItemsTo;
  }

  var incr;
  if (window.innerWidth > 2000) {
    if (view === 'list') {
      incr = 30;
    } else {
      incr = 60;
    }
  } else if (window.innerWidth < 1080) {
    if (view === 'list') {
      incr = 10;
    } else {
      incr = 20;
    }
  } else {
    if (view === 'list') {
      incr = 20;
    } else {
      incr = 40;
    }
  }
  countItemsTo = countItems + incr;
  if (countItemsTo > itemsToLoad.length) {
    countItemsTo = itemsToLoad.length;
  }

  var list = '', card;
  for (let i = countItems; i < countItemsTo; i++) {
    card = createCard(itemsToLoad[i]);
    list += card;
  }

  if (countItems === 0) {
    gallery.innerHTML = list;
  } else {
    gallery.insertAdjacentHTML('beforeend', list);
  }
  setFiltersPosition();
  setMinCardWidth();

  if (view === 'list') {
    document.querySelectorAll('.big-card').forEach(card => {
      renderCarousel(card.querySelector('.carousel'));
      if (cart) {
        checkAction(card);
        checkCart(card);
      }
    });
  }
  if (view === 'blocks') {
    document.querySelectorAll('.min-card').forEach(card => {
      if (cart) {
        checkAction(card);
        checkCart(card);
      }
    });
  }
}

// Создание одной карточки товара :

function createCard(data) {
  var newCard = cardTemplate.outerHTML,
      isManuf = data.manuf && Object.keys(data.manuf.man).length > 1 ? true : false,
      template,
      list;

  if (cardTemplate != minCardTemplate) {
    template = cardTemplate.querySelector('.carousel-gallery').innerHTML;
    list = createCarousel(template, data);
    newCard = newCard.replace(template, list);

    template = cardTemplate.querySelector('.card-sizes').innerHTML;
    list = createSizes(template, data);
    newCard = newCard.replace(template, list);

    template = cardTemplate.querySelector('.card-options').innerHTML;
    list = createOptions(template, data, isManuf);
    newCard = newCard.replace(template, list);

    if (isManuf) {
      template = cardTemplate.querySelector('.manuf-row').outerHTML;
      list = createManufTable(template, data.manuf);
      newCard = newCard.replace(template, list);
    }
  }

  newCard = newCard
  .replace('#images#', `http://b2b.topsports.ru/c/productpage/${data.images[0]}.jpg`)
  .replace('#isAction#', data.actiontitle ? '' : 'hidden')
  .replace('#isOldPrice#', data.price_preorder1 > 0 ? '' : 'hidden')
  .replace('#isBorder#', data.price_preorder1 > 0 ? '' : 'borderNone')
  .replace('#markup#', ((data.price_user1 - data.price_cur1) / data.price_cur1 * 100).toFixed(0))
  .replace('#isManuf#', isManuf ? '' : 'displayNone')
  .replace('#isDesc#', data.desc ? '' : 'displayNone')
  newCard = createElByTemplate(newCard, data);
  return newCard;
}

// Создание карусели:

function createCarousel(template, data, isFull = false) {
  var list = '', newEl;
  for (let i = 0; i < data.images.length; i++) {
    newEl = template;
    if (isFull && window.innerWidth > 400) {
      newEl = newEl.replace('#image#', `http://b2b.topsports.ru/c/source/${data.images[i]}.jpg`);
    } else {
      newEl = newEl.replace('#image#', `http://b2b.topsports.ru/c/productpage/${data.images[i]}.jpg`);
    }
    newEl = newEl.replace('#full-image#', `http://b2b.topsports.ru/c/source/${data.images[i]}.jpg`);
    list += newEl;
  }
  return list;
}

// Создание информации о размерах:

function createSizes(template, data) {
  var list = '', newEl;
  if (data.sizes && data.sizes != 0) {
    for (let key in data.sizes) {
      createSize(data.sizes[key]);
    }
  } else {
    createSize(data);
  }
  function createSize(sizeInfo) {
    newEl = template
    .replace('#isClick#', sizeInfo.size ? '' : 'click')
    .replace('#isFree#', sizeInfo.free_qty > 0 ? '' : 'displayNone')
    .replace('#isWait#', sizeInfo.wait_qty > 0 ? '' : 'displayNone')
    .replace('#isWarehouse#', sizeInfo.warehouse_qty > 0 ? '' : 'displayNone');
    newEl = createElByTemplate(newEl, sizeInfo);
    list += newEl;
  }
  return list;
}

// Создание описания опций в карточке товара:

function createOptions(template, data, isManuf) {
  var list = '', newEl;
  if (data.options && data.options != 0) {
    var option;
    for (let key in data.options) {
      option = data.options[key];
      if (key == 32) {
        option = convertYears(data.options[key]);
      } else {
        option = option
          .replace(/\,/gi, ', ')
          .replace(/\//gi, '/ ')
      }
      if ((key == 7 || key == 31 || key == 32 || key == 33) && isManuf) {
        continue;
      } else {
        newEl = template
          .replace('#optitle#', optnames[key])
          .replace('#option#', option);
        list += newEl;
      }
    }
  }
  return list;
}

// Создание таблицы с данными о производителе:

function createManufTable(template, data) {
  var list = '',
      subList,
      newEl,
      subTemplate = cardTemplate.querySelector('.manuf-row').innerHTML,
      titles = Array.from(document.getElementById('manuf-headers').querySelectorAll('div')).map(element => element.dataset.title),
      newCell,
      cell;

  for (let item in data.man) {
    newEl = template;
    subList = '';

    for (let k of titles) {
      newCell = subTemplate;
      cell = [];
      for (let kk in data[k]) {
        if (kk == item) {
          cell.push(kk);
        } else {
          for (let kkk in data[k][kk]) {
            if (kkk == item) {
              cell.push(kk);
            }
          }
        }
      }
      if (cell.length == 0) {
        cell.push('&ndash;');
        cell = cell.join(', ');
      } else {
        cell = cell.join(', ');
        if (k == 'years') {
          cell = convertYears(cell);
        }
      }
      newCell = newCell
        .replace('#cat#', k)
        .replace('#info#', cell);
      subList += newCell;
    }
    newEl = newEl.replace(subTemplate, subList);
    list += newEl;
  }
  return list;
}

// Проверка загруженности всех изображений карусели и отображение карусели:

function renderCarousel(carousel, curImg = 0) {
  return new Promise((resolve, reject) => {
    var imgs = carousel.querySelectorAll('img');

    imgs.forEach((img, index) => {
      if (index === imgs.length - 1) {
        img.addEventListener('load', () => {
          setTimeout(() => render(carousel), 100);
        });
        img.addEventListener('error', () => {
          img.parentElement.remove();
          setTimeout(() => render(carousel), 100);
        });
      } else {
        img.addEventListener('error', () => {
          img.parentElement.remove();
        });
      }
    });

    function render(carousel) {
      if (carousel.querySelectorAll('img').length === 0) {
        carousel.querySelector('.carousel-gallery').insertAdjacentHTML('beforeend', '<div class="carousel-item"><img src="../img/no_img.jpg"></div>');
        startCarouselInit(carousel, curImg);
      }
      startCarouselInit(carousel, curImg);
      resolve('карусель готова');
    }
  });
}

// Проверка наличия акции на товар:

function findDiscount(id) {
  if (!discounts) {
    return 0;
  }
  var discount = discounts.find(item => {
    if (item.diart) {
      for (let key of item.diart) {
        return key == id ? true : false;
      }
    }
  });
  if (!discount) {
    discount = discounts.find(item => !item.diart && checkCondition(item.dcondition));
  }
  if (!discount) {
    return 0;
  }
  var relevance = true;
  if (discount.ddatestart && discount.ddateend) {
    relevance = checkDate(discount.ddatestart, discount.ddateend)
  }
  if (relevance) {
    return discount;
  }
}

// Проверка условия скидки:

function checkCondition(condition) {
  if (condition.razdel == cartId) {
    return true;
  }
  return false;
}

// Добавление информации об акции в карточку товара:

function checkAction(card) {
  var action = findDiscount(card.dataset.id);
  if (!action || !action.dtitle) {
    return;
  }
  card.dataset.actionId = action.did;
  card.querySelector('.card-action').classList.remove('hidden');

  var title = card.querySelector('.action-title');
  // title.textContent = action.dtitle;
  title.style.backgroundColor = action.dcolor;

  var date = card.querySelector('.action-date');
  if (date && action.ddateend) {
    date.querySelector('span').textContent = action.ddateend;
    date.style.display = 'block';
  }

  var desc = card.querySelector('.action-desc');
  if (desc) {
    desc.querySelector('.text').textContent = action.ddesc;
    showElement(desc);
  }
}

//=====================================================================================================
//  Функции для работы с карточками товаров:
//=====================================================================================================

// Отображение карточек на странице:

function showCards() {
  if (selectedItems === '') {
    showElement(gallery, 'flex');
    hideElement(galleryNotice);
    loadCards(curItems);
  } else {
    if (selectedItems.length == 0) {
      showElement(galleryNotice, 'flex');
      hideElement(gallery);
      setFiltersPosition();
    } else {
      showElement(gallery, 'flex');
      hideElement(galleryNotice);
      loadCards(selectedItems);
    }
  }
}

// Добавление новых карточек при скролле страницы:

function scrollGallery() {
  var scrolled = window.pageYOffset || document.documentElement.scrollTop;
  if (scrolled * 2 + window.innerHeight >= document.body.clientHeight) {
    loadCards();
  }
}

// Переключение вида отображения карточек на странице:

function toggleView(event, newView) {
  if (view != newView) {
    document.querySelector(`.view-${view}`).classList.remove('active');
    event.currentTarget.classList.add('active');
    content.classList.remove(`${view}`);
    content.classList.add(`${newView}`);
    view = newView;
    setCardTemplate();
    gallery.style.opacity = '0'
    showCards();
    gallery.style.opacity = '1'
  }
}

function setCardTemplate() {
  if (view === 'list') {
    cardTemplate = bigCardTemplate;
  }
  if (view === 'blocks') {
    cardTemplate = minCardTemplate;
  }
  if (view === 'product') {
    cardTemplate = productCardTemplate;
  }
}

// Раскрытие в полный размер большой карточки:

function openBigCard(event) {
  var curCard = event.currentTarget.closest('.big-card');
  curCard.classList.toggle('open');
  if (curCard.classList.contains('open')) {
    event.currentTarget.setAttribute('tooltip', 'Свернуть');
  } else {
    event.currentTarget.setAttribute('tooltip', 'Раскрыть');
  }
  setFiltersPosition();
}

// Сворачивание большой карточки:

function closeBigCard(event) {
  var curCard = event.currentTarget.closest('.big-card');
  if (window.innerWidth < 767) {
    if (!(event.target.classList.contains('toggle-btn') || event.target.closest('.carousel') || event.target.closest('.card-size') || event.target.classList.contains('dealer-button'))) {
      curCard.classList.remove('open');
      curCard.querySelector('.toggle-btn').setAttribute('tooltip', 'Раскрыть');
      setFiltersPosition();
    }
  }
}

// Отображение полной карточки товара:

function showFullCard(id) {
  event.preventDefault();
  showElement(loader, 'flex');
  cardTemplate = fullCardTemplate;
  fullCardContainer.innerHTML = createCard(items.find(item => item.object_id == id));

  if (cart) {
    var curCard = document.querySelector('.full-card');
    checkAction(curCard);
    checkCart(curCard);
  }

  var curCarousel = fullCardContainer.querySelector('.carousel');
  setCardTemplate();
  renderCarousel(curCarousel)
  .then(
    result => {
      if (curCarousel.querySelector('img').src.indexOf('/no_img.jpg') === -1) {
        curCarousel.querySelector('.carousel-gallery-wrap').addEventListener('click', (event) => showFullImg(event, id));
        curCarousel.querySelector('.maximize').addEventListener('click', (event) => showFullImg(event, id));
      }
    }
  );
  hideElement(loader);
  openPopUp(fullCardContainer, 'flex');
}

// Скрытие полной карточки товара:

function closeFullCard(event) {
  if (event.target.closest('.full-card') && !event.target.classList.contains('close-btn')) {
    return;
  }
  closePopUp(fullCardContainer);
}

// Отображение картинки полного размера на экране:

function showFullImg(event, id) {
  if (event.target.classList.contains('control')) {
    return;
  }
  if (fullCardContainer && (!fullCardContainer.style.display || fullCardContainer.style.display === 'none')) {
    getDocumentScroll();
  }
  hideElement(fullImgContainer);
  showElement(loader, 'flex');
  fullImg.style.opacity = 0;

  var card = curItems.find(item => item.object_id == id),
      list = createCarousel(fullCarouselTemplate, card, true);
  fullImg.innerHTML = fullImgTemplate.replace(fullCarouselTemplate, list);

  var curCarousel = fullImgContainer.querySelector('.carousel'),
      curImg = event.currentTarget.closest('.carousel').dataset.img;

  renderCarousel(curCarousel, curImg)
  .then(
    result => {
      fullImg.style.opacity = 1;
      hideElement(loader);
      showElement(fullImgContainer);
    }
  );
  document.body.classList.add('no-scroll');
}

// Скрытие картинки полного размера:

function closeFullImg(event) {
  if (event.target.classList.contains('control')) {
    return;
  }
  hideElement(fullImgContainer);
  if (!fullCardContainer.style.display || fullCardContainer.style.display === 'none') {
    document.body.classList.remove('no-scroll');
    setDocumentScroll();
  }
}

//=====================================================================================================
//  Сортировка карточек товаров:
//=====================================================================================================

// document.querySelectorAll('.activate.select').forEach(el => new DropDown(el));
// document.querySelectorAll('.activate.checkbox').forEach(el => new DropDown(el));

// Сортировка карточек товаров на странице:

var gallerySort = document.getElementById('gallery-sort');
if (gallerySort) {
  new DropDown(gallerySort);
  gallerySort.addEventListener('onchange', sortItems);
}

function sortItems() {
  var prop = this.dataset.value;
  curItems.sort(dynamicSort(prop));
  if (selectedItems !== '') {
    selectedItems.sort(dynamicSort(prop));
  }
  showCards();
}

// Сортировка массива объектов по указанному значению:

function dynamicSort(prop) {
  var sortOrder = 1,
      result;
  if (prop[0] === "-") {
      sortOrder = -1;
      prop = prop.substr(1);
  }
  if (prop == 'price1') {
    return function (a, b) {
      result = a[prop] - b[prop];
      return result * sortOrder;
    }
  } else {
    return function (a, b) {
      result = (a[prop] < b[prop]) ? -1 : (a[prop] > b[prop]) ? 1 : 0;
      return result * sortOrder;
    }
  }
}

//=====================================================================================================
// Поиск на странице:
//=====================================================================================================

// Подготовка данных для поиска на странице:

function prepareForSearch(data) {
  itemsForSearch = JSON.parse(JSON.stringify(data)).map(el => {
    delete el.desc;
    return {object_id: el.object_id, value: convertToString(el)};
  });
}

// Конвертация всей вложенности свойств объекта в строку:

function convertToString(obj) {
  var objProps = '';
  crossObj(obj);
  return objProps;

  function crossObj(obj) {
    var prop;
    for (let k in obj) {
      prop = obj[k];
      if (typeof prop === 'string') {
        objProps += prop + ',';
      } else if (typeof prop === 'object') {
        crossObj(prop);
      }
    }
  }
}

// Поиск совпадений с введенным текстом:

function findOnPage(event) {
  event.preventDefault();
  if (isSearch) {
    clearZipFilters();
    clearOemSearch();
  }
  var textToFind = pageSearchInput.value.trim();
  if (textToFind == '') {
    return;
  }
  var regExpSearch = new RegExp(textToFind, 'i');
  selectedItems = [];
  itemsForSearch
    .filter(el => el.value.search(regExpSearch) >= 0)
    .forEach(el => selectedItems.push(curItems.find(item => item.object_id == el.object_id)));
  showCards();
  isSearch = true;
  document.getElementById('search-text').textContent = '"' + textToFind + '"';
  document.getElementById('search-count').textContent = selectedItems.length;
  hideElement(filtersInfo);
  showElement(clearPageSearchBtn);
  showElement(pageSearchInfo, 'flex');
}

// Очистка поиска по странице:

function startClearPageSearch() {
  clearSearchResult();
  clearPageSearch();
}

function clearPageSearch() {
  if (!pageSearch) {
    return;
  }
  isSearch = false;
  pageSearch.classList.remove('open');
  hideElement(clearPageSearchBtn);
  hideElement(pageSearchInfo);
  showElement(filtersInfo, 'flex');
  pageSearchInput.value = '';
}
