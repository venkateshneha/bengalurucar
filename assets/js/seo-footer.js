// assets/js/seo-footer.js
// Loads the SEO keyword links (managed from the admin panel) and renders
// them into the footer keyword block on every page. If the container
// isn't on the page, or the request fails, it simply does nothing.

(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var container = document.getElementById('seoKeywordsFooter');
    if (!container) return;

    fetch('/api/seo-links')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data.ok || !data.links || !data.links.length) {
          container.style.display = 'none';
          return;
        }
        var html = data.links.map(function (link) {
          var safeLabel = String(link.label || '').replace(/[&<>"']/g, function (c) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
          });
          var safeUrl = String(link.url || '').replace(/"/g, '&quot;');
          return '<a href="' + safeUrl + '">' + safeLabel + '</a>';
        }).join('');
        container.innerHTML = html;
      })
      .catch(function () {
        container.style.display = 'none';
      });
  });
})();
