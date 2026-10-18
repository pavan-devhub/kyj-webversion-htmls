// FEED site navbar: the Services mega menu, the notifications panel, the mobile drawer and
// hiding while the page scrolls down. The markup is the FEED navbar as its React component
// renders it, with each menu already in the page (hidden); this does what the component did.
// data-nav / data-page on a control say what it does.
(() => {
  const nav = document.querySelector('.fw-nav-root')
  if (!nav) return

  const feedSiteUrl = window.KYJ_CONFIG?.feedSiteUrl || ''
  const root = document.documentElement.dataset.root || ''

  const overlay = document.querySelector('.fw-services-overlay')
  const servicesButton = nav.querySelector('.fw-nav-btn[data-nav="services"]')
  const servicesItem = servicesButton.closest('.fw-nav-item')
  const dropdown = servicesItem.querySelector('.fw-services-dropdown')

  const bellWrap = nav.querySelector('.nb-wrap')
  const bellButton = bellWrap.querySelector('.nb-bell')
  const bellPanel = bellWrap.querySelector('.nb-panel')

  const burger = nav.querySelector('.fw-hamburger')
  const backdrop = document.querySelector('.fw-mobile-backdrop')
  const panel = document.querySelector('.fw-mobile-panel')
  const mobileServicesButton = panel.querySelector('.fw-mobile-nav-btn[data-nav="services"]')
  const mobileServicesItem = mobileServicesButton.closest('.fw-mobile-nav-item')
  const submenu = mobileServicesItem.querySelector('.fw-mobile-submenu')

  let servicesOpen = false
  let mobileOpen = false
  let bellOpen = false

  // Pages are named the FEED app's way: 'kyj' is the KYJ home, the rest are FEED pages.
  function navigate(page) {
    if (page === 'kyj' || (page === 'home' && !feedSiteUrl)) window.location.href = `${root}index.html`
    else if (feedSiteUrl) window.location.href = feedSiteUrl
  }

  function scrollToAboutUs() {
    const el = document.getElementById('about-us')
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 100
      window.scrollTo({ top: y, behavior: 'smooth' })
    } else {
      navigate('home')
    }
  }

  // The services mega menu and the mobile drawer both sit over a full-screen backdrop, so the
  // page behind them is locked in place while either is open. The reserved scrollbar gutter
  // stops the page (and the fixed navbar) from jumping sideways when the scrollbar disappears.
  function lockScroll() {
    const locked = servicesOpen || mobileOpen
    document.documentElement.style.scrollbarGutter = locked ? 'stable' : ''
    document.body.style.overflow = locked ? 'hidden' : ''
  }

  function setServicesOpen(open) {
    servicesOpen = open
    servicesItem.classList.toggle('open', open)
    servicesButton.setAttribute('aria-expanded', String(open))
    dropdown.hidden = !open
    overlay.hidden = !open
    lockScroll()
  }

  function setMobileOpen(open) {
    mobileOpen = open
    backdrop.hidden = !open
    panel.hidden = !open
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu')
    burger.setAttribute('aria-expanded', String(open))
    burger.querySelector('[data-icon="open"]').toggleAttribute('hidden', open)
    burger.querySelector('[data-icon="close"]').toggleAttribute('hidden', !open)
    lockScroll()
  }

  function setMobileServicesOpen(open) {
    mobileServicesItem.classList.toggle('open', open)
    mobileServicesButton.setAttribute('aria-expanded', String(open))
    submenu.hidden = !open
  }

  function setBellOpen(open) {
    bellOpen = open
    bellButton.setAttribute('aria-expanded', String(open))
    bellPanel.hidden = !open
  }

  servicesButton.addEventListener('click', () => setServicesOpen(!servicesOpen))
  overlay.addEventListener('click', () => setServicesOpen(false))
  bellButton.addEventListener('click', () => setBellOpen(!bellOpen))
  burger.addEventListener('click', () => setMobileOpen(!mobileOpen))
  backdrop.addEventListener('click', () => setMobileOpen(false))
  panel.querySelector('.fw-mobile-close').addEventListener('click', () => setMobileOpen(false))
  mobileServicesButton.addEventListener('click', () => setMobileServicesOpen(submenu.hidden))

  nav.querySelector('.fw-nav-btn[data-nav="about"]').addEventListener('click', scrollToAboutUs)
  panel.querySelector('.fw-mobile-nav-btn[data-nav="about"]').addEventListener('click', () => {
    setMobileOpen(false)
    scrollToAboutUs()
  })

  // Anything with a data-page goes to that page; the menu it's in closes first. Services
  // tiles without one are not live yet and do nothing.
  document.addEventListener('click', (event) => {
    const target = event.target.closest('[data-page]')
    if (!target || target.disabled) return
    if (dropdown.contains(target)) setServicesOpen(false)
    if (panel.contains(target)) setMobileOpen(false)
    if (bellPanel.contains(target)) setBellOpen(false)
    navigate(target.dataset.page)
  })

  document.addEventListener('mousedown', (event) => {
    if (servicesOpen && !servicesItem.contains(event.target)) setServicesOpen(false)
    if (bellOpen && !bellWrap.contains(event.target)) setBellOpen(false)
  })

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return
    if (servicesOpen) setServicesOpen(false)
    if (mobileOpen) setMobileOpen(false)
    if (bellOpen) setBellOpen(false)
  })

  window.addEventListener('resize', () => {
    if (mobileOpen && window.innerWidth > 1024) setMobileOpen(false)
  })

  // Hide on scroll down, show on scroll up - but never while the services menu is open, or
  // the menu would be carried off-screen with it. Only scrolls over 10px count, to avoid jitter.
  let lastScrollY = 0
  window.addEventListener(
    'scroll',
    () => {
      const y = window.scrollY
      const delta = y - lastScrollY
      if (delta > 10 && y > 80 && !servicesOpen) nav.classList.add('fw-nav-hidden')
      else if (delta < -10) nav.classList.remove('fw-nav-hidden')
      lastScrollY = y
    },
    { passive: true },
  )
})()
