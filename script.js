function toggleMenu() {
  var m = document.getElementById('mobile-menu')
  var icon = document.getElementById('hicon')
  var open = m.classList.toggle('open')
  icon.textContent = open ? '✕' : '☰'
}

function copiar(id, fbId, btn) {
  var el = document.getElementById(id)
  el.select()
  el.setSelectionRange(0, 99999)
  try {
    navigator.clipboard.writeText(el.value).catch(function () {
      document.execCommand('copy')
    })
  } catch (e) {
    document.execCommand('copy')
  }
  btn.textContent = '✓ Copiado'
  btn.classList.add('copied')
  var fb = document.getElementById(fbId)
  if (fb) fb.classList.add('show')
  setTimeout(function () {
    btn.textContent = 'Copiar'
    btn.classList.remove('copied')
    if (fb) fb.classList.remove('show')
  }, 2000)
}

function handleResize() {
  var nd = document.getElementById('nav-desktop')
  var mm = document.getElementById('mobile-menu')
  var hbtn = document.getElementById('hbtn')
  var icon = document.getElementById('hicon')
  if (window.innerWidth > 640) {
    nd.style.display = 'flex'
    hbtn.style.display = 'none'
    mm.classList.remove('open')
    icon.textContent = '☰'
  } else {
    nd.style.display = 'none'
    hbtn.style.display = 'flex'
  }
}

handleResize()
window.addEventListener('resize', handleResize)
