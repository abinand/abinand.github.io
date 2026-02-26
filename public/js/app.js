/* Simple SPA router and portfolio scaffold
   - Each portfolio section maps to a distinct path (e.g. /data, /graphics)
   - Add/extend the "PORTFOLIOS" object to add sections and cards
   - Note: GitHub Pages may need a 404 -> index.html fallback for deep links; alternatively use hash routing.
*/

const PORTFOLIOS = {
  '/data': {
    title: 'Data Portfolio',
    description: 'Projects focused on data analysis, dashboards and visualizations.',
    projects: [
      { title: 'Hypothesis Testing', 
        desc: 'Demonstration of A/B testing to evaluate the performance of a landing page to increase conversions',
        url: 'https://github.com/abinand/ecom-ab-hyptest',
        img: './public/images/hypothesis-testing.png' },
      { title: 'Board Game Popularity', 
        desc: 'Exploratory data analysis on how complexity of board games have evolved and how that affects their popularity', 
        url: 'https://github.com/abinand/bgg-eda-popularity',
        img: './public/images/bgg-popularity.png' },
      { title: 'Board Game Mechanics', 
        desc: 'An extension of the analysis on board games based on specific game mechanics',
        url: 'https://github.com/abinand/bgg-mechanics',
        img: './public/images/bgg-mechanics.png'},
    ]
  },
  '/graphics': {
    title: 'Graphics Gallery',
    description: 'Projects focused on creative coding, shaders and real-time 3D graphics',
    projects: [
      {
        title: 'Memory Game',
        desc: 'Classic puzzle game to test your memory by uncovering pairs of hand-drawn matching tiles.',
        url: 'https://abinand.itch.io/mem',
        img: './public/images/mem-cover.png' },
      {
        title: 'Escape the Fall Game',
        desc: 'Infinite side-scrolling game with projectile motion, procedural path generation built with the Universal Render Pipeline in Unity',
        url: 'https://play.unity.com/en/games/bbcf50d0-2cc0-4957-9b5c-345bb65a9293/drowning-frog',
        img: './public/images/drowning-frog.webp' },
      {
        title: 'Normal Map Fragment Shader',
        desc: 'Demonstration of diffuse lighting on a normal map texture built with three.js and WebGL fragment shader',
        url: './projects/normalMapLights',
        img: './public/images/normal-map-lights.png' },
      {
        title: 'Simple Unity Animations',
        desc: 'Unity animation scripts for translation, rotation, scaling and event handling.',
        url: 'https://play.unity.com/en/games/6fed0807-0add-42a8-911a-c58b906abf39/cage-factory',
        img: './public/images/cage-factory.webp' },
      {
        title: 'Three JS Animation',
        desc: 'A simple three.js animation that can be applied on a background canvas in a web page.',
        url: './projects/cubesAnimation',
        img: './public/images/cubes-animation.png' },
      { 
        title: 'Jet Fighter Micro Game', 
        desc: 'A simple game built with Unity featuring rigidbody physics, collision detection, audio, and particle effects', 
        url: 'https://play.unity.com/en/games/fd00ad67-d91a-462b-9855-74042c3a8e6a/jet-fighter',
        img: './public/images/jet-fighter.webp' },
      {
        title: 'Quaternion Interpolation',
        desc: 'A JavaScript implemenation of spherical linear interpolation between quanternions for animating rotations',
        url: './projects/quaternions',
        img: './public/images/quaternion.png' },
      {
        title: 'Tesselation',
        desc: 'A bare-bones WebGL demonstration of geometry subdivision in computer graphics.',
        url: './projects/tesselateAndTwist',
        img: './public/images/tesselate.png' }
    ]
  }
}

const portfolioRoot = document.getElementById('portfolio-root')

function createCard(project){
  const article = document.createElement('article')
  article.className = 'card'
  if(project.img){
    const img = document.createElement('img')
    img.src = project.img
    img.alt = project.title
    article.appendChild(img)
  }
  const h3 = document.createElement('h3')
  h3.textContent = project.title
  article.appendChild(h3)
  const p = document.createElement('p')
  p.textContent = project.desc
  article.appendChild(p)

  // optional CTA button linking to project-specific page
  if(project.url){
    const actions = document.createElement('div')
    actions.className = 'card-actions'

    const a = document.createElement('a')
    a.className = 'card-cta'
    a.href = project.url
    // open external links in new tab
    if(/^https?:\/\//.test(project.url)){
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
    }
    a.textContent = 'View project'

    actions.appendChild(a)
    article.appendChild(actions)
  }

  return article
}

function renderSection(path, data){
  const section = document.createElement('section')
  section.className = 'portfolio-section'
  section.dataset.route = path
  section.id = `section-${path.replace('/', '') || 'home'}`

  const h2 = document.createElement('h2')
  h2.textContent = data.title
  section.appendChild(h2)

  const desc = document.createElement('p')
  desc.textContent = data.description
  section.appendChild(desc)

  const grid = document.createElement('div')
  grid.className = 'grid'
  data.projects.forEach(p => grid.appendChild(createCard(p)))
  section.appendChild(grid)

  return section
}

function mountSections(){
  if(!portfolioRoot) return
  portfolioRoot.innerHTML = ''
  Object.keys(PORTFOLIOS).forEach(path => {
    const section = renderSection(path, PORTFOLIOS[path])
    section.classList.add('hidden')
    portfolioRoot.appendChild(section)
  })
}

function getRouteFromLocation(){
  // Prefer hash if present (helps GitHub Pages fallback); else use the last pathname segment
  const hash = location.hash.replace(/^#/, '')
  if(hash){
    return hash.startsWith('/') ? hash : '/' + hash
  }
  const pathname = location.pathname.replace(/\/index.html$/,'')
  const trimmed = pathname.replace(/\/+$/,'')
  const parts = trimmed.split('/')
  const last = parts[parts.length - 1]
  if(!last) return '/'
  return '/' + last
}

function showRoute(route){
  // hide hero if viewing a portfolio page
  const hero = document.getElementById('hero')
  if(route === '/' || route === '/home'){
    hero.classList.remove('hidden')
  } else {
    hero.classList.add('hidden')
  }

  const sections = document.querySelectorAll('[data-route]')
  sections.forEach(el => {
    if(el.dataset.route === route){
      el.classList.remove('hidden')
      // update document title
      const title = PORTFOLIOS[route]?.title || 'Portfolio'
      document.title = `${title} — Freelance Portfolio`
    } else {
      el.classList.add('hidden')
    }
  })

  // close mobile nav if it's open (e.g., hashchange/popstate)
  const nav = document.querySelector('.site-nav')
  const toggle = document.querySelector('.menu-toggle')
  if(nav && nav.classList.contains('open')){
    nav.classList.remove('open')
    if(toggle) toggle.setAttribute('aria-expanded','false')
  }
}

function navigate(to, opts = { push: true }){
  const route = to.startsWith('/') ? to : '/' + to
  // Use hash-based routing so URLs (e.g. https://site/#/data) are directly shareable on static hosts
  if(opts.push){
    location.hash = route
  } else {
    // Replace without adding history entry
    location.replace(window.location.pathname + '#'+ route)
  }
  showRoute(route)
}

// Bind nav links
function bindLinks(){
  document.querySelectorAll('a[data-link]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault()
      const href = a.getAttribute('href')
      // determine route portion: supports '/path', '#/path' or 'path'
      const route = href.startsWith('/') ? href : (href.startsWith('#') ? href.replace('#','') : href)
      navigate(route)
      // close mobile menu after navigating (if open)
      const nav = document.querySelector('.site-nav')
      const toggle = document.querySelector('.menu-toggle')
      if(nav && nav.classList.contains('open')){
        nav.classList.remove('open')
        if(toggle) toggle.setAttribute('aria-expanded','false')
      }
    })
  })
}

// Handle back/forward (supports both hashchange and popstate just in case)
window.addEventListener('hashchange', () => {
  const route = getRouteFromLocation()
  showRoute(route)
})
window.addEventListener('popstate', () => {
  const route = getRouteFromLocation()
  showRoute(route)
})

// Initialize
mountSections()
bindLinks()
// On first load, pick appropriate route
const initial = getRouteFromLocation()
showRoute(initial)

// Expose simple API to add sections programmatically
window.FreelancePortfolio = {
  addSection(path, data){
    PORTFOLIOS[path] = data
    mountSections()
    bindLinks()
  },
  go(path){ navigate(path) }
}
