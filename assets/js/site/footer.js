// FEED site footer: the back-to-top button.
(() => {
  for (const button of document.querySelectorAll('.new-footer .scroll-top-btn')) {
    button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }))
  }
})()
