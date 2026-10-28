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

// Ordem dos cards: o usuário arrasta pela alça e a ordem fica salva
// no localStorage deste navegador até mudar de novo ou restaurar o padrão.
// Roda direto (o script fica no fim do <body>) para aplicar a ordem salva
// antes da primeira pintura, sem "pular" os cards.
;(function () {
  var KEY = 'painel-fiscal-ordem'
  var EASE = 'cubic-bezier(0.23, 1, 0.32, 1)'
  var grid = document.querySelector('.main-content')
  if (!grid) return
  var anchor = grid.querySelector('.full-section') // cards ficam antes das seções fixas
  var resetBtn = document.getElementById('layout-reset')
  var status = document.getElementById('layout-status')
  var reduceMotion =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  function cards() {
    return Array.prototype.slice.call(grid.querySelectorAll(':scope > .card'))
  }
  function idOf(card) {
    return card.getAttribute('data-card')
  }
  function titleOf(card) {
    var t = card.querySelector('.card-title')
    return t ? t.firstChild.textContent.trim() : idOf(card)
  }

  var defaultOrder = cards().map(idOf)

  function currentOrder() {
    return cards().map(idOf)
  }
  function isDefault(order) {
    return order.join() === defaultOrder.join()
  }

  function load() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY))
      return Array.isArray(v) ? v : null
    } catch (e) {
      return null
    }
  }
  function save() {
    var order = currentOrder()
    try {
      if (isDefault(order)) localStorage.removeItem(KEY)
      else localStorage.setItem(KEY, JSON.stringify(order))
    } catch (e) {}
    updateResetBtn()
  }
  function updateResetBtn() {
    if (resetBtn) resetBtn.hidden = isDefault(currentOrder())
  }

  // Ordem salva + cards novos (que ainda não existiam quando a ordem foi
  // salva) entram na posição padrão deles; cards removidos são ignorados.
  function resolve(saved) {
    var order = saved.filter(function (x, i) {
      return defaultOrder.indexOf(x) >= 0 && saved.indexOf(x) === i
    })
    defaultOrder.forEach(function (x, i) {
      if (order.indexOf(x) < 0) order.splice(Math.min(i, order.length), 0, x)
    })
    return order
  }
  function apply(order) {
    var byId = {}
    cards().forEach(function (c) {
      byId[idOf(c)] = c
    })
    order.forEach(function (x) {
      grid.insertBefore(byId[x], anchor)
    })
  }

  // FLIP: mede onde cada card estava, muda o DOM e anima do lugar antigo
  // para o novo. Mede a posição visual atual, então pode ser interrompido.
  function flip(mutate, except) {
    var els = cards().filter(function (c) {
      return c !== except
    })
    var first = els.map(function (c) {
      return c.getBoundingClientRect()
    })
    mutate()
    if (reduceMotion) return
    els.forEach(function (c, i) {
      var last = c.getBoundingClientRect()
      var dx = first[i].left - last.left
      var dy = first[i].top - last.top
      if (!dx && !dy) return
      c.style.transition = 'none'
      c.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)'
      c.getBoundingClientRect()
      c.style.transition = 'transform 220ms ' + EASE
      c.style.transform = ''
      c.addEventListener('transitionend', function done(ev) {
        if (ev.propertyName !== 'transform') return
        c.style.transition = ''
        c.removeEventListener('transitionend', done)
      })
    })
  }

  // Alça em cada card
  var GRIP =
    '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" fill="currentColor">' +
    '<circle cx="4.5" cy="2.5" r="1.3"/><circle cx="9.5" cy="2.5" r="1.3"/>' +
    '<circle cx="4.5" cy="7" r="1.3"/><circle cx="9.5" cy="7" r="1.3"/>' +
    '<circle cx="4.5" cy="11.5" r="1.3"/><circle cx="9.5" cy="11.5" r="1.3"/></svg>'
  cards().forEach(function (card) {
    var header = card.querySelector('.card-header')
    if (!header) return
    var btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'drag-handle'
    btn.title = 'Arraste para mudar a posição (ou use as setas do teclado)'
    btn.setAttribute('aria-label', 'Mover card ' + titleOf(card))
    btn.innerHTML = GRIP
    header.appendChild(btn)
  })

  var saved = load()
  if (saved) apply(resolve(saved))
  updateResetBtn()

  // ---------- Arrastar com mouse ou dedo ----------
  var drag = null

  function layoutRect(el) {
    // Posição de layout (sem transform), para a animação FLIP não confundir o alvo.
    var g = grid.getBoundingClientRect()
    return {
      left: g.left + el.offsetLeft,
      top: g.top + el.offsetTop,
      right: g.left + el.offsetLeft + el.offsetWidth,
      bottom: g.top + el.offsetTop + el.offsetHeight
    }
  }

  function reorderUnderPointer() {
    var x = drag.x
    var y = drag.y
    var targets = cards().filter(function (c) {
      return c !== drag.card
    })
    for (var i = 0; i < targets.length; i++) {
      var t = targets[i]
      var r = layoutRect(t)
      if (x < r.left || x > r.right || y < r.top || y > r.bottom) continue
      // Evita trocar de volta com o mesmo card enquanto o ponteiro não sair dele.
      if (t === drag.last) return
      drag.last = t
      var list = Array.prototype.slice.call(grid.children)
      var before = list.indexOf(drag.ph) < list.indexOf(t) ? t.nextSibling : t
      flip(function () {
        grid.insertBefore(drag.ph, before)
      }, drag.card)
      return
    }
    drag.last = null
  }

  function follow() {
    drag.card.style.transform =
      'translate(' +
      (drag.x - drag.offX - drag.left0) +
      'px, ' +
      (drag.y - drag.offY - drag.top0) +
      'px) scale(1.02)'
  }

  // Rola a página sozinho quando o card chega perto da borda da tela.
  function autoScroll() {
    if (!drag || drag.dropping) return
    var edge = 80
    var h = window.innerHeight
    var speed = 0
    if (drag.y < edge) speed = -Math.ceil((edge - drag.y) / 6)
    else if (drag.y > h - edge) speed = Math.ceil((drag.y - (h - edge)) / 6)
    if (speed) {
      var before = window.scrollY
      window.scrollBy(0, speed)
      if (window.scrollY !== before) reorderUnderPointer()
    }
    drag.raf = requestAnimationFrame(autoScroll)
  }

  grid.addEventListener('pointerdown', function (e) {
    var handle = e.target.closest('.drag-handle')
    if (!handle || drag || e.button !== 0) return
    e.preventDefault()
    var card = handle.closest('.card')
    var r = card.getBoundingClientRect()

    var ph = document.createElement('div')
    ph.className = 'card-placeholder'
    ph.style.minHeight = r.height + 'px'
    grid.insertBefore(ph, card)

    card.classList.add('is-dragging')
    card.style.width = r.width + 'px'
    card.style.height = r.height + 'px'
    card.style.left = r.left + 'px'
    card.style.top = r.top + 'px'
    document.documentElement.classList.add('is-sorting')

    drag = {
      card: card,
      ph: ph,
      handle: handle,
      pointerId: e.pointerId,
      left0: r.left,
      top0: r.top,
      offX: e.clientX - r.left,
      offY: e.clientY - r.top,
      x: e.clientX,
      y: e.clientY,
      last: null,
      dropping: false
    }
    handle.setPointerCapture(e.pointerId)
    follow()
    drag.raf = requestAnimationFrame(autoScroll)
  })

  grid.addEventListener('pointermove', function (e) {
    if (!drag || drag.dropping || e.pointerId !== drag.pointerId) return
    drag.x = e.clientX
    drag.y = e.clientY
    follow()
    reorderUnderPointer()
  })

  function drop(e) {
    if (!drag || drag.dropping || e.pointerId !== drag.pointerId) return
    drag.dropping = true
    cancelAnimationFrame(drag.raf)
    var d = drag
    var target = d.ph.getBoundingClientRect()

    function finish() {
      if (d.finished) return
      d.finished = true
      grid.replaceChild(d.card, d.ph)
      d.card.classList.remove('is-dragging')
      ;['width', 'height', 'left', 'top', 'transform', 'transition'].forEach(
        function (p) {
          d.card.style[p] = ''
        }
      )
      document.documentElement.classList.remove('is-sorting')
      drag = null
      save()
      announce(d.card)
    }

    if (reduceMotion) return finish()
    // Assenta o card no espaço reservado, partindo de onde ele está agora.
    d.card.style.transition = 'transform 200ms ' + EASE
    d.card.style.transform =
      'translate(' +
      (target.left - d.left0) +
      'px, ' +
      (target.top - d.top0) +
      'px) scale(1)'
    d.card.addEventListener('transitionend', finish, { once: true })
    setTimeout(finish, 260) // garantia caso o transitionend não dispare
  }
  grid.addEventListener('pointerup', drop)
  grid.addEventListener('pointercancel', drop)

  // ---------- Teclado: setas movem o card com a alça focada ----------
  grid.addEventListener('keydown', function (e) {
    var handle = e.target.closest && e.target.closest('.drag-handle')
    if (!handle || drag) return
    var dir = { ArrowUp: -1, ArrowLeft: -1, ArrowDown: 1, ArrowRight: 1 }[e.key]
    if (!dir) return
    e.preventDefault()
    var card = handle.closest('.card')
    var list = cards()
    var i = list.indexOf(card)
    var other = list[i + dir]
    if (!other) return
    flip(function () {
      grid.insertBefore(card, dir < 0 ? other : other.nextSibling)
    })
    handle.focus()
    save()
    announce(card)
  })

  function announce(card) {
    if (!status) return
    var pos = cards().indexOf(card) + 1
    status.textContent =
      titleOf(card) + ': posição ' + pos + ' de ' + cards().length
  }

  // ---------- Restaurar padrão ----------
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      flip(function () {
        apply(defaultOrder)
      })
      save()
      if (status) status.textContent = 'Ordem padrão restaurada'
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
