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
