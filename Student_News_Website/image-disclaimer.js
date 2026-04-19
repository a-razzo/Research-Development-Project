(function () {
  function wrapImage(img) {
    if (!img || img.parentElement == null) {
      return;
    }

    if (img.closest('.ai-disclaimer-wrap')) {
      return;
    }

    const wrapper = document.createElement('span');
    const existingClasses = img.className ? String(img.className).trim() : '';

    wrapper.className = existingClasses
      ? 'ai-disclaimer-wrap ' + existingClasses
      : 'ai-disclaimer-wrap';

    const label = document.createElement('span');
    label.className = 'ai-disclaimer-label';
    label.textContent = 'This Image is AI Generated';

    img.parentElement.insertBefore(wrapper, img);
    wrapper.appendChild(img);
    wrapper.appendChild(label);
  }

  function applyDisclaimers(root) {
    const scope = root || document;
    scope.querySelectorAll('img').forEach(wrapImage);
  }

  function startObserver() {
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (!(node instanceof Element)) {
            return;
          }

          if (node.tagName === 'IMG') {
            wrapImage(node);
            return;
          }

          if (node.querySelectorAll) {
            applyDisclaimers(node);
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      applyDisclaimers(document);
      startObserver();
    });
    return;
  }

  applyDisclaimers(document);
  startObserver();
})();
