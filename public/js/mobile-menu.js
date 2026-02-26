// Mobile menu toggle functionality
function initMobileMenu(){
  const toggle = document.querySelector('.menu-toggle')
  const nav = document.querySelector('.site-nav')
  if(!toggle || !nav) return
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open')
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false')
  })
}

// Set current year in footer
const yearElem = document.getElementById('year')
if(yearElem) {
  yearElem.textContent = new Date().getFullYear()
}

initMobileMenu()

