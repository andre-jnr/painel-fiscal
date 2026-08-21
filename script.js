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
