// Checklist do fechamento fiscal: uma lista por competência (mês),
// salva no localStorage deste navegador.
;(function () {
  var KEY = 'painel-fiscal-checklist'
  var root = document.getElementById('checklist')
  if (!root) return
  var monthInput = document.getElementById('ck-month')
  var items = Array.prototype.slice.call(root.querySelectorAll('.ck-item'))
  var ringFill = root.querySelector('.ck-ring-fill')
  var ringLabel = root.querySelector('.ck-ring-label')
  var countEl = document.getElementById('ck-count')
  var percentEl = document.getElementById('ck-percent')
  var statusEl = document.getElementById('ck-status')
  var banner = document.getElementById('ck-complete')
  var bannerMonth = document.getElementById('ck-complete-month')
  var resetBtn = document.getElementById('ck-reset')
  var CIRC = 2 * Math.PI * 27
  var reduceMotion =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Minimizar: o checklist recolhe e fica só o indicador no cabeçalho.
  var MIN_KEY = 'painel-fiscal-checklist-min'
  var MINI_CIRC = 2 * Math.PI * 16
  var html = document.documentElement
  var wrap = document.getElementById('ck-wrap')
  var mini = document.getElementById('ck-mini')
  var miniFill = mini.querySelector('.ck-mini-fill')
  var miniCount = document.getElementById('ck-mini-count')
  var minimizeBtn = document.getElementById('ck-minimize')

  function syncMinimized() {
    var min = html.classList.contains('ck-min')
    // Fora do Tab e do leitor de tela o que está escondido.
    wrap.inert = min
    mini.tabIndex = min ? 0 : -1
    mini.setAttribute('aria-hidden', min ? 'false' : 'true')
    mini.setAttribute('aria-expanded', min ? 'false' : 'true')
    minimizeBtn.setAttribute('aria-expanded', min ? 'false' : 'true')
  }
  function setMinimized(min) {
    if (html.classList.contains('ck-min') === min) return
    // overflow escondido só durante a animação, para não cortar a sombra.
    wrap.classList.add('is-animating')
    clearTimeout(wrap._t)
    wrap._t = setTimeout(function () {
      wrap.classList.remove('is-animating')
    }, 550)
    html.classList.toggle('ck-min', min)
    // Guarda a escolha junto com o mês atual: no mês seguinte o checklist
    // reabre sozinho (ver script no <head> do index.html).
    var d = new Date()
    var mes = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2)
    try {
      localStorage.setItem(MIN_KEY, JSON.stringify({ mes: mes, min: min }))
    } catch (e) {}
    syncMinimized()
    if (min) {
      mini.classList.remove('is-arriving')
      void mini.offsetWidth
      mini.classList.add('is-arriving')
      setTimeout(function () {
        mini.classList.remove('is-arriving')
      }, 1300)
      mini.focus({ preventScroll: true })
    } else {
      minimizeBtn.focus({ preventScroll: true })
    }
  }
  minimizeBtn.addEventListener('click', function () {
    setMinimized(true)
  })
  mini.addEventListener('click', function () {
    setMinimized(false)
  })
  syncMinimized()

  function loadAll() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY))
      return v && typeof v === 'object' ? v : {}
    } catch (e) {
      return {}
    }
  }
  function saveAll(all) {
    try {
      localStorage.setItem(KEY, JSON.stringify(all))
    } catch (e) {}
  }
  var all = loadAll()

  // Competência padrão: mês anterior (é o mês que está sendo fechado).
  function previousMonth() {
    var d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - 1)
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2)
  }
  function monthName(ym) {
    var p = ym.split('-')
    return new Date(+p[0], +p[1] - 1, 1).toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric'
    })
  }
  function stamp(ts) {
    var d = new Date(ts)
    return (
      'Concluído em ' +
      d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) +
      ' às ' +
      d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    )
  }

  var month = previousMonth()
  monthInput.value = month
  function state() {
    return all[month] || {}
  }
  function doneCount() {
    var s = state()
    return items.filter(function (li) {
      return s[li.getAttribute('data-item')]
    }).length
  }

  function render(opts) {
    var s = state()
    items.forEach(function (li) {
      var ts = s[li.getAttribute('data-item')]
      li.querySelector('.ck-toggle').setAttribute('aria-checked', ts ? 'true' : 'false')
      li.querySelector('.ck-done-at').textContent = ts ? stamp(ts) : ''
    })
    var done = doneCount()
    var total = items.length
    var pct = Math.round((done / total) * 100)
    ringFill.style.strokeDashoffset = CIRC * (1 - done / total)
    countEl.textContent = done + '/' + total
    percentEl.textContent = pct + '%'
    var complete = done === total
    root.classList.toggle('is-complete', complete)
    banner.hidden = !complete
    bannerMonth.textContent = monthName(month)
    resetBtn.hidden = done === 0
    statusEl.textContent = complete
      ? 'Tudo conferido em ' + monthName(month) + '.'
      : done === 0
        ? 'Nenhuma etapa concluída em ' + monthName(month) + '.'
        : 'Faltam ' + (total - done) + (total - done === 1 ? ' etapa' : ' etapas') + ' para fechar ' + monthName(month) + '.'
    // Indicador compacto no cabeçalho (checklist minimizado)
    miniFill.style.strokeDashoffset = MINI_CIRC * (1 - done / total)
    miniCount.textContent = complete ? '✓' : done + '/' + total
    mini.classList.toggle('is-complete', complete)
    var miniLabel =
      'Abrir checklist do fechamento: ' +
      (complete
        ? 'tudo concluído'
        : done + ' de ' + total + ' etapas, faltam ' + (total - done))
    mini.setAttribute('aria-label', miniLabel)
    mini.title = miniLabel
    if (opts && opts.bump) {
      ringLabel.classList.remove('is-bump')
      void ringLabel.offsetWidth
      ringLabel.classList.add('is-bump')
    }
  }

  function sparks(li) {
    if (reduceMotion) return
    var box = li.querySelector('.ck-box')
    var colors = ['#d4af37', '#f1d27a', '#34c77b', '#5aa9ff']
    for (var i = 0; i < 8; i++) {
      var s = document.createElement('span')
      s.className = 'ck-spark'
      s.style.setProperty('--a', i * 45 + 'deg')
      s.style.background = colors[i % colors.length]
      box.appendChild(s)
      setTimeout(s.remove.bind(s), 700)
    }
    li.classList.remove('is-popping')
    void li.offsetWidth
    li.classList.add('is-popping')
    setTimeout(function () {
      li.classList.remove('is-popping')
    }, 650)
  }

  root.addEventListener('click', function (e) {
    var btn = e.target.closest('.ck-toggle')
    if (!btn) return
    var li = btn.closest('.ck-item')
    var id = li.getAttribute('data-item')
    var wasComplete = doneCount() === items.length
    var s = (all[month] = all[month] || {})
    if (s[id]) {
      delete s[id]
      if (!Object.keys(s).length) delete all[month]
    } else {
      s[id] = Date.now()
      sparks(li)
      if (navigator.vibrate) navigator.vibrate(8)
    }
    saveAll(all)
    disarmReset()
    render({ bump: true })
    if (!wasComplete && doneCount() === items.length) celebrate()
  })

  monthInput.addEventListener('change', function () {
    if (!/^\d{4}-\d{2}$/.test(monthInput.value)) {
      monthInput.value = month
      return
    }
    month = monthInput.value
    disarmReset()
    render()
  })

  // Reiniciar pede um segundo clique (sem caixa de confirmação do navegador).
  var armTimer = null
  function disarmReset() {
    clearTimeout(armTimer)
    resetBtn.classList.remove('is-armed')
    resetBtn.textContent = '↺ Reiniciar checklist'
  }
  resetBtn.addEventListener('click', function () {
    if (!resetBtn.classList.contains('is-armed')) {
      resetBtn.classList.add('is-armed')
      resetBtn.textContent = 'Clique de novo para desmarcar tudo'
      armTimer = setTimeout(disarmReset, 4000)
      return
    }
    delete all[month]
    saveAll(all)
    disarmReset()
    render({ bump: true })
  })

  // ---------- Comemoração ----------
  function celebrate() {
    banner.classList.remove('is-entering')
    void banner.offsetWidth
    banner.classList.add('is-entering')
    setTimeout(function () {
      banner.classList.remove('is-entering')
    }, 2000)
    if (navigator.vibrate) navigator.vibrate([12, 60, 12, 60, 24])
    if (!reduceMotion) confetti()
  }

  function confetti() {
    var canvas = document.createElement('canvas')
    canvas.className = 'ck-confetti'
    document.body.appendChild(canvas)
    var ctx = canvas.getContext('2d')
    var dpr = window.devicePixelRatio || 1
    var W = window.innerWidth
    var H = window.innerHeight
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.scale(dpr, dpr)

    // Sai do anel de progresso, que é onde o olho está.
    var r = root.querySelector('.ck-progress').getBoundingClientRect()
    var ox = r.left + r.width / 2
    var oy = r.top + r.height / 2
    var colors = ['#d4af37', '#f1d27a', '#ffffff', '#1a4a7a', '#34c77b', '#5aa9ff']
    var parts = []
    function burst(x, y, n, spread) {
      for (var i = 0; i < n; i++) {
        var ang = -Math.PI / 2 + (Math.random() - 0.5) * spread
        var speed = 7 + Math.random() * 9
        parts.push({
          x: x,
          y: y,
          vx: Math.cos(ang) * speed,
          vy: Math.sin(ang) * speed,
          w: 6 + Math.random() * 6,
          h: 3 + Math.random() * 5,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.35,
          tilt: Math.random() * Math.PI,
          color: colors[(Math.random() * colors.length) | 0],
          life: 0
        })
      }
    }
    burst(ox, oy, 90, Math.PI * 1.3)
    setTimeout(function () {
      burst(W * 0.15, H, 45, 0.9)
      burst(W * 0.85, H, 45, 0.9)
    }, 180)

    var start = performance.now()
    function frame(now) {
      ctx.clearRect(0, 0, W, H)
      var t = now - start
      parts.forEach(function (p) {
        p.life++
        p.vy += 0.28 // gravidade
        p.vx *= 0.985 // resistência do ar
        p.vy *= 0.985
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vr
        p.tilt += 0.12
        var fade = t > 2200 ? Math.max(0, 1 - (t - 2200) / 800) : 1
        ctx.save()
        ctx.globalAlpha = fade
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.scale(1, Math.abs(Math.cos(p.tilt))) // papel girando
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      })
      if (t < 3000) requestAnimationFrame(frame)
      else canvas.remove()
    }
    requestAnimationFrame(frame)
  }

  render()
})()
