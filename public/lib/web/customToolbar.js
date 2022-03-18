let sheet = (function () {
  let style = document.createElement('style');
  style.appendChild(document.createTextNode(''));
  document.head.appendChild(style);
  return style.sheet;
})();

function editToolBar() {
  /* Hiding elements */
  removeElement('toolbarSidebar');
  addCSSRule(sheet, '#sidebarContent', 'top: 0 !important');
  addCSSRule(sheet, '#thumbnailView', 'overflow-x: hidden');
  addCSSRule(sheet, '#mainContainer', 'min-width: 250px');

  removeElement('openFile');
  removeElement('print');
  removeElement('download');
  removeElement('viewBookmark');

  removeElement('secondaryOpenFile');
  removeElement('secondaryPrint');
  removeElement('secondaryDownload');
  removeElement('secondaryViewBookmark');
}
function removeElement(elemID) {
  let element = document.getElementById(elemID);
  element.parentNode.removeChild(element);
}
function addCSSRule(sheet, selector, rules, index) {
  if ('insertRule' in sheet) {
    sheet.insertRule(selector + '{' + rules + '}', index);
  } else if ('addRule' in sheet) {
    sheet.addRule(selector, rules, index);
  }
}
window.onload = editToolBar;
