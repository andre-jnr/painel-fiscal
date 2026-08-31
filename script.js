;(function () {
  var root = document.documentElement
  var KEY = 'painel-fiscal-theme'

  function systemPrefersDark() {
    return (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    )
  }

  function isDark() {
    var t = root.getAttribute('data-theme')
    if (t === 'dark') return true
    if (t === 'light') return false
    return systemPrefersDark()
  }

  function refreshIcon() {
    var btn = document.getElementById('theme-toggle')
    if (btn) {
      btn.textContent = isDark() ? '☀️' : '🌙'
      btn.setAttribute(
        'aria-pressed',
        root.getAttribute('data-theme') === 'dark' ? 'true' : 'false'
      )
    }
  }

  var animTimer = null
  function animateThemeChange() {
    // Liga transições suaves só durante a troca, sem afetar hover/carregamento.
    root.classList.add('theme-changing')
    if (animTimer) clearTimeout(animTimer)
    animTimer = setTimeout(function () {
      root.classList.remove('theme-changing')
      animTimer = null
    }, 550)
  }

  document.addEventListener('DOMContentLoaded', function () {
    refreshIcon()
    var btn = document.getElementById('theme-toggle')
    if (!btn) return
    btn.addEventListener('click', function () {
      var next = isDark() ? 'light' : 'dark'
      animateThemeChange()
      root.setAttribute('data-theme', next)
      try {
        localStorage.setItem(KEY, next)
      } catch (e) {}
      refreshIcon()
    })
  })

  // Acompanha mudanças do sistema enquanto o usuário não escolheu manualmente.
  if (window.matchMedia) {
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', function () {
        var t = root.getAttribute('data-theme')
        if (t !== 'dark' && t !== 'light') refreshIcon()
      })
  }
})()

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
