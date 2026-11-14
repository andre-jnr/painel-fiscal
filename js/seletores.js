// Seletor de unidade: troca o servidor dos links de Sistemas internos.
;(function () {
  var KEY = 'painel-fiscal-unidade'

  document.addEventListener('DOMContentLoaded', function () {
    var picker = document.getElementById('unit-picker')
    if (!picker) return
    var options = picker.querySelectorAll('.unit-option')
    var links = picker.parentNode.querySelectorAll('.link-item[data-port]')

    function select(server) {
      var found = false
      options.forEach(function (opt) {
        var on = opt.getAttribute('data-server') === server
        if (on) found = true
        opt.setAttribute('aria-checked', on ? 'true' : 'false')
      })
      if (!found) return false
      links.forEach(function (a) {
        a.href = 'http://' + server + ':' + a.getAttribute('data-port') + '/'
      })
      return true
    }

    var saved = null
    try {
      saved = localStorage.getItem(KEY)
    } catch (e) {}
    if (saved) select(saved)

    options.forEach(function (opt) {
      opt.addEventListener('click', function () {
        var server = opt.getAttribute('data-server')
        if (select(server)) {
          try {
            localStorage.setItem(KEY, server)
          } catch (e) {}
        }
      })
    })
  })
})()

// Seletor de modelo: troca a porta dos links de Relatórios gerenciais
// (Modelo André = 3007, Modelo Lincoln = 3005).
;(function () {
  var KEY = 'painel-fiscal-modelo'

  document.addEventListener('DOMContentLoaded', function () {
    var picker = document.getElementById('model-picker')
    if (!picker) return
    var options = picker.querySelectorAll('.unit-option')
    var links = picker.parentNode.querySelectorAll('.link-item[data-host]')
    // Links que só existem num modelo (ex.: Relatório geral, só no André)
    var onlyLinks = picker.parentNode.querySelectorAll(
      '.link-item[data-only-model]'
    )

    function select(port) {
      var found = false
      options.forEach(function (opt) {
        var on = opt.getAttribute('data-port') === port
        if (on) found = true
        opt.setAttribute('aria-checked', on ? 'true' : 'false')
      })
      if (!found) return false
      links.forEach(function (a) {
        a.href =
          'http://' +
          a.getAttribute('data-host') +
          ':' +
          port +
          a.getAttribute('data-path')
      })
      onlyLinks.forEach(function (a) {
        a.hidden = a.getAttribute('data-only-model') !== port
      })
      return true
    }

    var saved = null
    try {
      saved = localStorage.getItem(KEY)
    } catch (e) {}
    if (saved) select(saved)

    options.forEach(function (opt) {
      opt.addEventListener('click', function () {
        var port = opt.getAttribute('data-port')
        if (select(port)) {
          try {
            localStorage.setItem(KEY, port)
          } catch (e) {}
        }
      })
    })
  })
})()
