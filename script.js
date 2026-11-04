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

// Seletor de modelo: troca a porta dos links de Relatórios gerenciais
// (Modelo André = 3007, Modelo Lincoln = 3005).
;(function () {
  var KEY = 'painel-fiscal-modelo'

  document.addEventListener('DOMContentLoaded', function () {
    var picker = document.getElementById('model-picker')
    if (!picker) return
    var options = picker.querySelectorAll('.unit-option')
    var links = picker.parentNode.querySelectorAll('.link-item[data-host]')

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

// Seções criadas pelo usuário: título, subtítulo, ícone e links, salvos no
// localStorage deste navegador. Roda antes da ordem dos cards para que as
// seções salvas já façam parte da ordem ao abrir a página.
;(function () {
  var KEY = 'painel-fiscal-secoes'
  var DEFAULT_ICON = '📁'
  var DEFAULT_LINK_ICON = '🔗'
  var EMOJIS = [
    '📁', '📄', '🧾', '📊', '📈', '💰', '💳', '🏦', '🏛️', '🏭', '🏪', '📦',
    '🚚', '🛒', '🧮', '🔍', '🌐', '🔗', '📧', '📅', '⚙️', '🖥️', '🔑', '⭐'
  ]
  var PENCIL =
    '<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M11.2 2.3a1.6 1.6 0 0 1 2.3 2.3L5.6 12.5 2.5 13.5l1-3.1z"/></svg>'

  var grid = document.querySelector('.main-content')
  if (!grid) return
  var anchor = grid.querySelector('.full-section')

  function load() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY))
      return Array.isArray(v) ? v : []
    } catch (e) {
      return []
    }
  }
  var sections = load()
  function persist() {
    try {
      if (sections.length) localStorage.setItem(KEY, JSON.stringify(sections))
      else localStorage.removeItem(KEY)
      return true
    } catch (e) {
      return false
    }
  }

  // Aceita "serverad:3003" ou "www.site.com.br" (completa com http://),
  // mas só deixa sair links http/https.
  function normalizeUrl(value) {
    var v = value.trim()
    if (!v) return ''
    if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(v)) v = 'http://' + v
    try {
      var u = new URL(v)
      if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
      return u.href
    } catch (e) {
      return null
    }
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag)
    if (cls) n.className = cls
    if (text != null) n.textContent = text
    return n
  }

  // Monta (ou atualiza) o card com a mesma estrutura dos cards fixos.
  function fillCard(card, sec) {
    card.querySelector('.card-icon').textContent = sec.icon || DEFAULT_ICON
    var title = card.querySelector('.card-title')
    title.textContent = ''
    title.appendChild(document.createTextNode(sec.title))
    if (sec.subtitle) title.appendChild(el('span', null, sec.subtitle))
    card
      .querySelector('.card-edit')
      .setAttribute('aria-label', 'Editar seção ' + sec.title)

    var list = card.querySelector('.link-list')
    list.textContent = ''
    sec.links.forEach(function (l) {
      var a = el('a', 'link-item')
      a.href = l.url
      a.target = '_blank'
      a.rel = 'noopener'
      a.appendChild(el('span', 'link-emoji', l.icon || DEFAULT_LINK_ICON))
      a.appendChild(document.createTextNode(' ' + l.name + ' '))
      a.appendChild(el('span', 'link-arrow', '↗'))
      list.appendChild(a)
    })
  }
  function buildCard(sec) {
    var card = el('div', 'card card-custom')
    card.setAttribute('data-card', 'custom-' + sec.id)
    var header = el('div', 'card-header')
    header.appendChild(el('div', 'card-icon'))
    header.appendChild(el('div', 'card-title'))
    var edit = el('button', 'card-edit')
    edit.type = 'button'
    edit.title = 'Editar seção'
    edit.innerHTML = PENCIL
    edit.setAttribute('data-edit', sec.id)
    header.appendChild(edit)
    card.appendChild(header)
    card.appendChild(el('div', 'link-list'))
    fillCard(card, sec)
    return card
  }
  function cardOf(id) {
    return grid.querySelector('[data-card="custom-' + id + '"]')
  }

  sections.forEach(function (sec) {
    grid.insertBefore(buildCard(sec), anchor)
  })

  // ---------- Formulário ----------
  var dialog = document.getElementById('section-dialog')
  var form = document.getElementById('section-form')
  var addBtn = document.getElementById('section-add')
  if (!dialog || !form || !addBtn || !dialog.showModal) {
    if (addBtn) addBtn.hidden = true
    return
  }
  var heading = document.getElementById('section-dialog-title')
  var rows = document.getElementById('link-rows')
  var errorBox = document.getElementById('section-error')
  var deleteBtn = document.getElementById('section-delete')
  var picker = document.getElementById('emoji-picker')
  var editingId = null
  var opener = null
  var iconTarget = form.elements.icon

  EMOJIS.forEach(function (e) {
    var b = el('button', 'emoji-chip', e)
    b.type = 'button'
    b.setAttribute('aria-label', 'Usar ícone ' + e)
    picker.appendChild(b)
  })
  // O ícone clicado vai para o último campo de ícone selecionado.
  form.addEventListener('focusin', function (e) {
    if (e.target.classList.contains('icon-input')) iconTarget = e.target
  })
  picker.addEventListener('click', function (e) {
    var chip = e.target.closest('.emoji-chip')
    if (!chip || !iconTarget) return
    iconTarget.value = chip.textContent
    iconTarget.focus()
  })

  function addRow(link) {
    link = link || {}
    var row = el('div', 'link-row')
    var icon = el('input', 'icon-input')
    icon.name = 'link-icon'
    icon.maxLength = 8
    icon.placeholder = DEFAULT_LINK_ICON
    icon.value = link.icon || ''
    icon.setAttribute('aria-label', 'Ícone do link')
    var name = el('input')
    name.name = 'link-name'
    name.maxLength = 60
    name.placeholder = 'Nome do link'
    name.value = link.name || ''
    name.setAttribute('aria-label', 'Nome do link')
    var url = el('input')
    url.name = 'link-url'
    url.type = 'text'
    url.inputMode = 'url'
    url.autocapitalize = 'none'
    url.spellcheck = false
    url.placeholder = 'http://serverad:3003/'
    url.value = link.url || ''
    url.setAttribute('aria-label', 'Endereço do link')
    var del = el('button', 'link-row-remove', '✕')
    del.type = 'button'
    del.title = 'Remover link'
    del.setAttribute('aria-label', 'Remover link')
    row.appendChild(icon)
    row.appendChild(name)
    row.appendChild(url)
    row.appendChild(del)
    rows.appendChild(row)
    return row
  }
  rows.addEventListener('click', function (e) {
    var del = e.target.closest('.link-row-remove')
    if (!del) return
    var row = del.closest('.link-row')
    var next = row.nextElementSibling || row.previousElementSibling
    row.remove()
    if (!rows.children.length) addRow()
    ;(next || rows.firstElementChild).querySelector('input[name="link-name"]').focus()
  })
  document.getElementById('link-add').addEventListener('click', function () {
    addRow().querySelector('input[name="link-name"]').focus()
  })

  function showError(msg, field) {
    errorBox.textContent = msg
    if (field) {
      field.setAttribute('aria-invalid', 'true')
      field.focus()
    }
  }
  function clearErrors() {
    errorBox.textContent = ''
    Array.prototype.forEach.call(form.querySelectorAll('[aria-invalid]'), function (f) {
      f.removeAttribute('aria-invalid')
    })
  }

  function open(sec, trigger) {
    opener = trigger || null
    editingId = sec ? sec.id : null
    heading.textContent = sec ? 'Editar seção' : 'Nova seção'
    form.reset()
    clearErrors()
    form.elements.icon.value = sec ? sec.icon : ''
    form.elements.title.value = sec ? sec.title : ''
    form.elements.subtitle.value = sec ? sec.subtitle : ''
    rows.textContent = ''
    ;(sec ? sec.links : [null]).forEach(addRow)
    deleteBtn.hidden = !sec
    disarmDelete()
    iconTarget = form.elements.icon
    dialog.showModal()
    form.elements.title.focus()
  }

  function read() {
    clearErrors()
    var title = form.elements.title.value.trim()
    if (!title) return showError('Dê um título para a seção.', form.elements.title)
    var links = []
    var rowEls = Array.prototype.slice.call(rows.children)
    for (var i = 0; i < rowEls.length; i++) {
      var r = rowEls[i]
      var nameEl = r.querySelector('[name="link-name"]')
      var urlEl = r.querySelector('[name="link-url"]')
      var name = nameEl.value.trim()
      var rawUrl = urlEl.value.trim()
      if (!name && !rawUrl) continue // linha vazia: ignora
      if (!name) return showError('Falta o nome do link ' + (i + 1) + '.', nameEl)
      var url = normalizeUrl(rawUrl)
      if (!url)
        return showError(
          rawUrl
            ? 'O endereço do link "' + name + '" não é válido. Use algo como http://serverad:3003/ ou https://site.com.br'
            : 'Falta o endereço do link "' + name + '".',
          urlEl
        )
      links.push({
        name: name,
        url: url,
        icon: r.querySelector('[name="link-icon"]').value.trim()
      })
    }
    if (!links.length)
      return showError(
        'Adicione pelo menos um link.',
        rows.querySelector('[name="link-name"]')
      )
    return {
      title: title,
      subtitle: form.elements.subtitle.value.trim(),
      icon: form.elements.icon.value.trim(),
      links: links
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault()
    var data = read()
    if (!data) return
    var card
    if (editingId) {
      var sec = sections.filter(function (s) {
        return s.id === editingId
      })[0]
      data.id = editingId
      sections[sections.indexOf(sec)] = data
      card = cardOf(editingId)
      fillCard(card, data)
      window.PainelOrdem.rename(card)
    } else {
      data.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
      sections.push(data)
      card = buildCard(data)
      window.PainelOrdem.add(card)
    }
    if (!persist())
      return showError('Não foi possível salvar neste navegador (armazenamento bloqueado ou cheio).')
    opener = null
    dialog.close()
    highlight(card)
  })

  // Excluir pede um segundo clique, sem caixa de confirmação do navegador.
  var armTimer = null
  function disarmDelete() {
    clearTimeout(armTimer)
    deleteBtn.classList.remove('is-armed')
    deleteBtn.textContent = 'Excluir seção'
  }
  deleteBtn.addEventListener('click', function () {
    if (!deleteBtn.classList.contains('is-armed')) {
      deleteBtn.classList.add('is-armed')
      deleteBtn.textContent = 'Clique de novo para excluir'
      armTimer = setTimeout(disarmDelete, 4000)
      return
    }
    var card = cardOf(editingId)
    sections = sections.filter(function (s) {
      return s.id !== editingId
    })
    persist()
    opener = null
    dialog.close()
    if (card) window.PainelOrdem.remove(card)
    addBtn.focus()
  })

  Array.prototype.forEach.call(form.querySelectorAll('[data-close]'), function (b) {
    b.addEventListener('click', function () {
      dialog.close()
    })
  })
  dialog.addEventListener('close', function () {
    disarmDelete()
    if (opener && document.contains(opener)) opener.focus()
    opener = null
  })

  function highlight(card) {
    card.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    card.classList.remove('is-new')
    void card.offsetWidth
    card.classList.add('is-new')
    setTimeout(function () {
      card.classList.remove('is-new')
    }, 1600)
  }

  addBtn.addEventListener('click', function () {
    open(null, addBtn)
  })
  grid.addEventListener('click', function (e) {
    var edit = e.target.closest('.card-edit')
    if (!edit) return
    var id = edit.getAttribute('data-edit')
    var sec = sections.filter(function (s) {
      return s.id === id
    })[0]
    if (sec) open(sec, edit)
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
  function addHandle(card) {
    var header = card.querySelector('.card-header')
    if (!header) return
    var btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'drag-handle'
    btn.title = 'Arraste para mudar a posição (ou use as setas do teclado)'
    btn.setAttribute('aria-label', 'Mover card ' + titleOf(card))
    btn.innerHTML = GRIP
    header.appendChild(btn)
  }
  cards().forEach(addHandle)

  var saved = load()
  if (saved) apply(resolve(saved))
  updateResetBtn()

  // Usado pelas seções criadas pelo usuário (entram no fim da ordem padrão).
  window.PainelOrdem = {
    add: function (card) {
      grid.insertBefore(card, anchor)
      addHandle(card)
      defaultOrder.push(idOf(card))
      save()
    },
    remove: function (card) {
      var i = defaultOrder.indexOf(idOf(card))
      if (i >= 0) defaultOrder.splice(i, 1)
      flip(function () {
        card.remove()
      }, card)
      save()
    },
    rename: function (card) {
      var h = card.querySelector('.drag-handle')
      if (h) h.setAttribute('aria-label', 'Mover card ' + titleOf(card))
    }
  }

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
