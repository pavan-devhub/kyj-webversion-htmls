// KYJ home (the launcher): search and stage filters over the stage list, "/" to search, and
// the journey wheel's entrance. The page holds every stage and screen card; a search or a
// filter shows the matching ones, as the React page did. Stages and screens: data/screens.js.
(() => {
  const home = document.querySelector('.home')
  const data = window.KYJ_DATA
  if (!home || !data) return

  const { stages, screens } = data

  // "EPM & Onboarding" → ['epm', 'onboarding'], "KYJ-1" → ['kyj', '1'], "05" → ['5'].
  // "and" is dropped so "epm and onboarding" still finds "EPM & Onboarding".
  const tokenize = (str) =>
    String(str)
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word && word !== 'and')
      .map((word) => word.replace(/^0+(?=\d)/, ''))

  // Numbers match a whole word, bar a letter suffix ("8" finds 8 and 8a, not 18);
  // words match anywhere in a word ("house" finds Packhouse)
  function tokenMatches(token, words) {
    if (/^\d/.test(token)) {
      return words.some((word) => word.startsWith(token) && /^[a-z]*$/.test(word.slice(token.length)))
    }
    return words.some((word) => word.includes(token))
  }
  const matchesAll = (tokens, words) => tokens.every((token) => tokenMatches(token, words))

  const stageWords = new Map(stages.map((stage) => [stage.id, tokenize(stage.name)]))

  // A screen is found by its file number, its title, its stage ("stage 1" or "farm ready") and "badge"
  const screenWords = new Map(
    screens.map((screen) => [
      screen.id,
      [
        ...tokenize(`${screen.id} ${screen.label} ${screen.title} stage ${screen.stage}`),
        ...stageWords.get(screen.stage),
        ...(screen.badge ? ['badge'] : []),
      ],
    ]),
  )

  // Reads the search box: "stage 1" → that stage; a file number ("8a", "18", "13a.html") → that
  // screen; anything else → every screen whose words match ("farm ready", "epm qr landing").
  // `stage` is the section Enter scrolls to when the query names a stage; otherwise it's the
  // first result.
  function parseSearch(query) {
    const tokens = tokenize(query.replace(/\.html?\b/gi, ' '))
    if (tokens.length === 0) return null

    const stageNumber = tokens.join(' ').match(/^stage ?(\d+)$/)
    if (stageNumber) {
      const stage = Number(stageNumber[1])
      return { test: (screen) => screen.stage === stage, stage }
    }

    const file = tokens.length === 1 && screens.find((s) => s.id === tokens[0] || s.label === tokens[0])
    if (file) return { test: (screen) => screen === file }

    return {
      test: (screen) => matchesAll(tokens, screenWords.get(screen.id)),
      stage: stages.find((stage) => matchesAll(tokens, stageWords.get(stage.id)))?.id,
    }
  }

  function matches(screen, filter, search) {
    if (filter === 'badge' && !screen.badge) return false
    if (filter !== 'all' && filter !== 'badge' && filter !== String(screen.stage)) return false
    return !search || search.test(screen)
  }

  // Scrolls down to the #stage-<stage> section if it's showing, else to the first result
  // (or the "no match" note)
  function showResults(stage) {
    const target =
      document.getElementById(`stage-${stage}`) ?? document.querySelector('#screens .journey-stage, #screens .empty')
    target?.scrollIntoView({ block: 'start' })
  }

  const input = home.querySelector('.screens-hero .search input')
  const filterButtons = [...home.querySelectorAll('.filters .filter')]
  const journey = home.querySelector('#screens .journey')
  const noMatch = home.querySelector('#screens > .home-container')
  const screenById = new Map(screens.map((screen) => [screen.id, screen]))

  // Each stage section with all of its cards, in page order. Showing a subset puts just those
  // back in the list, so the cards' alternating colours and row balance (data-count) follow
  // what's shown.
  const groups = [...journey.children].map((item) => {
    const list = item.querySelector('.journey-stage__cards')
    return {
      item,
      stage: item.querySelector('.journey-stage').dataset.stage,
      list,
      cards: [...list.children],
      button: item.querySelector('.journey-btn'),
    }
  })

  let query = ''
  let filter = 'all'

  function render() {
    const search = parseSearch(query)
    const shown = groups.filter((group) => {
      const cards = group.cards.filter((card) => matches(screenById.get(card.dataset.screen), filter, search))
      group.list.replaceChildren(...cards)
      group.list.dataset.count = cards.length
      return cards.length > 0
    })
    journey.replaceChildren(...shown.map((group) => group.item))
    shown.forEach((group, i) => {
      const next = shown[i + 1]
      group.button.textContent = next ? 'Next Stage' : 'Back to Top'
      group.button.setAttribute('href', next ? `#stage-${next.stage}` : '#screens')
    })
    journey.hidden = shown.length === 0
    noMatch.hidden = shown.length > 0

    for (const button of filterButtons) {
      const active = button.dataset.filter === filter
      button.classList.toggle('is-active', active)
      button.setAttribute('aria-pressed', String(active))
    }
  }

  // The search and the stage buttons each pick what's listed, so using one resets the other:
  // a search looks through every stage, and a stage button shows that whole stage
  function changeQuery(value) {
    query = value
    if (value.trim()) filter = 'all'
    render()
  }

  function changeFilter(value) {
    filter = value
    query = ''
    input.value = ''
    render()
    showResults(value)
  }

  input.addEventListener('input', () => changeQuery(input.value))
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      input.value = ''
      changeQuery('')
      input.blur()
    } else if (event.key === 'Enter' && !event.isComposing) {
      event.preventDefault()
      showResults(parseSearch(query)?.stage)
      // on touch screens, put the keyboard away so the results are in view
      if (window.matchMedia('(pointer: coarse)').matches) input.blur()
    }
  })

  for (const button of filterButtons) {
    button.addEventListener('click', () => changeFilter(button.dataset.filter))
  }

  // "/" focuses the search box from anywhere on the page
  document.addEventListener('keydown', (event) => {
    if (event.key === '/' && document.activeElement !== input) {
      event.preventDefault()
      input.focus()
    }
  })

  // The journey wheel's petals fly in (and then turn) once the wheel is first seen
  const wheel = home.querySelector('.journey-wheel')
  if (wheel) {
    if (!('IntersectionObserver' in window)) {
      wheel.classList.add('is-in-view')
    } else {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            wheel.classList.add('is-in-view')
            observer.disconnect()
          }
        },
        { threshold: 0.35 },
      )
      observer.observe(wheel)
    }
  }
})()
