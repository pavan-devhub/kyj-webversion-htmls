// KYJ screen pages: the stage drawer on small screens, ← / → to move through the journey,
// and the sidebar scrolled to the current screen.
(() => {
  const app = document.querySelector('.app')
  if (!app) return

  const menuButton = app.querySelector('.topbar__menu')

  function setNavOpen(open) {
    app.classList.toggle('nav-open', open)
    menuButton.setAttribute('aria-expanded', String(open))
  }

  menuButton.addEventListener('click', () => setNavOpen(!app.classList.contains('nav-open')))
  app.querySelector('.scrim').addEventListener('click', () => setNavOpen(false))

  // The top bar's previous / next buttons: links, or disabled spans at either end
  const [prev, next] = app.querySelectorAll('.topbar__nav > *')

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setNavOpen(false)
      return
    }
    // ← / → are ignored while typing or with modifier keys
    const tag = (event.target.tagName || '').toLowerCase()
    if (tag === 'input' || tag === 'textarea' || event.metaKey || event.ctrlKey || event.altKey) return
    const target = event.key === 'ArrowLeft' ? prev : event.key === 'ArrowRight' ? next : null
    if (target?.href) window.location.href = target.href
  })

  // Centre the current screen's link in the sidebar list, scrolling only the list (never the page)
  const list = app.querySelector('.sidebar__nav')
  const active = list?.querySelector('.nav-link.is-active')
  if (active) {
    const top = active.getBoundingClientRect().top - list.getBoundingClientRect().top + list.scrollTop
    list.scrollTop = Math.max(0, top - list.clientHeight / 2 + active.offsetHeight / 2)
  }
})()
