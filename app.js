// Monta serviços, equipe, galeria, antes/depois, horário e a agenda de demonstração.
// Cada página só estiliza as classes; o comportamento é o mesmo nas três direções.
(function () {
  const D = window.NINJAS
  const $ = (s, r = document) => r.querySelector(s)
  const $$ = (s, r = document) => [...r.querySelectorAll(s)]
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
  const brl = v => (v == null ? 'Sob avaliação' : 'R$ ' + v)
  const hhmm = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0')
  const SEM = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
  const MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  const iniciais = n => n.split(' ').map(p => p[0]).slice(0, 2).join('')
  const pro = id => D.equipe.find(p => p.id === id)

  // ---------- blocos fixos ----------
  $$('[data-servicos]').forEach(el => {
    el.innerHTML = '<ul class="svc">' + D.servicos.map(s => `
      <li><span class="svc-nome">${esc(s.nome)}${s.desc ? `<small>${esc(s.desc)}</small>` : ''}</span>
      <span class="svc-min">${s.min} min</span><span class="svc-preco">${brl(s.preco)}</span>
      <button type="button" class="svc-agendar" data-agendar="${s.id}">Agendar</button></li>`).join('') + '</ul>'
  })
  $$('[data-equipe]').forEach(el => {
    el.innerHTML = D.equipe.map(p => `
      <article class="eq-card"><span class="eq-mono">${iniciais(p.nome)}</span>
      <h3>${esc(p.nome)}</h3><p class="eq-papel">${esc(p.papel)}</p><p>${esc(p.texto)}</p></article>`).join('')
  })
  $$('[data-galeria]').forEach(el => {
    el.innerHTML = D.galeria.map(([f, t]) => `<figure class="gal-item"><img src="fotos/${f}" alt="${esc(t)}" loading="lazy"><figcaption>${esc(t)}</figcaption></figure>`).join('')
  })
  $$('[data-antes-depois]').forEach(el => {
    el.innerHTML = D.antesDepois.map(([a, d, t]) => `
      <figure class="ad-item"><div class="ad" style="--x:50%">
        <img src="fotos/${a}" alt="Antes: ${esc(t)}" loading="lazy">
        <img class="ad-depois" src="fotos/${d}" alt="Depois: ${esc(t)}" loading="lazy">
        <span class="ad-tag ad-tag-a">Antes</span><span class="ad-tag ad-tag-d">Depois</span>
        <span class="ad-linha"></span>
        <input type="range" min="0" max="100" value="50" aria-label="Comparar antes e depois: ${esc(t)}">
      </div><figcaption>${esc(t)}</figcaption></figure>`).join('')
    $$('input', el).forEach(i => i.addEventListener('input', () => i.parentElement.style.setProperty('--x', i.value + '%')))
    // arrasta em qualquer ponto da foto (o range nativo no iPhone so responde na bolinha);
    // sem reduced-motion, a linha varre sozinha e volta a varrer 2,5s depois que a pessoa solta
    const auto = !matchMedia('(prefers-reduced-motion: reduce)').matches
    $$('.ad', el).forEach((ad, k) => {
      const inp = $('input', ad); let vis = false, mexendo = false, arrasto = false, t0 = null, x = 50, volta
      const por = v => { x = Math.max(0, Math.min(100, v)); ad.style.setProperty('--x', x.toFixed(1) + '%'); inp.value = x }
      const mexeu = () => { mexendo = true; t0 = null; clearTimeout(volta); volta = setTimeout(() => { mexendo = false }, 2500) }
      const mover = e => { const r = ad.getBoundingClientRect(); por((e.clientX - r.left) / r.width * 100) }
      ad.addEventListener('pointerdown', e => { arrasto = true; ad.setPointerCapture(e.pointerId); mexeu(); mover(e) })
      ad.addEventListener('pointermove', e => { if (arrasto) { mexeu(); mover(e) } })
      ad.addEventListener('pointerup', () => { arrasto = false })
      ad.addEventListener('pointercancel', () => { arrasto = false })
      inp.addEventListener('input', mexeu)
      if (!auto) return
      new IntersectionObserver(([e]) => { vis = e.isIntersecting }).observe(ad)
      const passo = t => {
        if (vis && !mexendo) {
          // retoma do ponto onde a pessoa deixou a linha
          if (t0 === null) t0 = t - 1400 * Math.asin(Math.max(-1, Math.min(1, (x - 50) / 38))) - (x === 50 && k ? k * 900 : 0)
          por(50 + 38 * Math.sin((t - t0) / 1400))
        }
        requestAnimationFrame(passo)
      }
      requestAnimationFrame(passo)
    })
  })
  $$('[data-horario]').forEach(el => {
    el.innerHTML = D.horario.map(([d, h]) => `<div><dt>${d}</dt><dd>${h}</dd></div>`).join('')
  })
  $$('[data-zap]').forEach(a => { a.href = D.marca.whatsapp; a.target = '_blank'; a.rel = 'noopener' })
  $$('[data-mapa]').forEach(a => { a.href = D.marca.mapa; a.target = '_blank'; a.rel = 'noopener' })
  $$('[data-mapa-embed]').forEach(f => { f.src = D.marca.mapaEmbed })
  $$('[data-ano]').forEach(e => { e.textContent = new Date().getFullYear() })

  // ---------- agenda ----------
  const raiz = $('#agenda-app')
  if (!raiz) return
  const PASSOS = ['Serviço', 'Profissional', 'Dia e horário', 'Seus dados']
  const st = { passo: 0, svc: null, pro: null, dia: 0, hora: null, nome: '', whats: '' }

  const dias = (() => {
    const out = [], d = new Date()
    d.setHours(0, 0, 0, 0)
    while (out.length < 12) { if (D.expediente[d.getDay()]) out.push(new Date(d)); d.setDate(d.getDate() + 1) }
    return out
  })()

  // ocupação fictícia, estável por dia + profissional + horário
  const ocupado = (dia, p, m) => {
    let h = 7
    for (const c of dia.toDateString() + p + m) h = (h * 31 + c.charCodeAt(0)) >>> 0
    return h % 10 < 4
  }
  const horarios = dia => {
    const [ini, fim] = D.expediente[dia.getDay()]
    const agora = new Date(), hoje = dia.toDateString() === agora.toDateString()
    const minAgora = agora.getHours() * 60 + agora.getMinutes() + 30
    const out = []
    for (let m = ini * 60; m + st.svc.min <= fim * 60; m += 30) {
      if (hoje && m < minAgora) continue
      const livre = st.pro === 'qualquer' ? st.svc.pros.some(p => !ocupado(dia, p, m)) : !ocupado(dia, st.pro, m)
      if (livre) out.push(m)
    }
    return out
  }
  const nomePro = () => (st.pro === 'qualquer' ? 'o primeiro profissional livre' : pro(st.pro).nome)
  const dataLonga = d => `${SEM[d.getDay()]}, ${d.getDate()} de ${MES[d.getMonth()]}`

  function resumo() {
    const itens = []
    if (st.svc) itens.push(`<div><dt>Serviço</dt><dd>${esc(st.svc.nome)} · ${brl(st.svc.preco)}</dd></div>`)
    if (st.pro) itens.push(`<div><dt>Com</dt><dd>${esc(nomePro())}</dd></div>`)
    if (st.hora != null) itens.push(`<div><dt>Quando</dt><dd>${dataLonga(dias[st.dia])} às ${hhmm(st.hora)}</dd></div>`)
    return itens.length ? `<dl class="ag-resumo">${itens.join('')}</dl>` : ''
  }

  function corpo() {
    if (st.passo === 0) return `<div class="ag-lista">${D.servicos.map(s => `
      <button type="button" class="ag-opt${st.svc === s ? ' sel' : ''}" data-svc="${s.id}">
        <b>${esc(s.nome)}</b><span>${s.min} min · ${brl(s.preco)}</span></button>`).join('')}</div>`

    if (st.passo === 0.5) return `<div class="ag-aviso"><p>${esc(st.svc.nome)} tem o valor definido depois de uma avaliação rápida.
      Mande uma foto do cabelo pelo WhatsApp e a gente responde com valor e horário.</p>
      <a class="ag-btn" data-zap href="${D.marca.whatsapp}" target="_blank" rel="noopener">Chamar no WhatsApp</a></div>`

    if (st.passo === 1) {
      const lista = st.svc.pros.map(pro)
      return `<div class="ag-lista">${lista.map(p => `
        <button type="button" class="ag-opt${st.pro === p.id ? ' sel' : ''}" data-pro="${p.id}">
          <span class="eq-mono">${iniciais(p.nome)}</span><b>${esc(p.nome)}</b><span>${esc(p.papel)}</span></button>`).join('')}
        ${lista.length > 1 ? `<button type="button" class="ag-opt${st.pro === 'qualquer' ? ' sel' : ''}" data-pro="qualquer"><b>Sem preferência</b><span>Mais horários disponíveis</span></button>` : ''}</div>`
    }

    if (st.passo === 2) {
      const hs = horarios(dias[st.dia])
      return `<div class="ag-dias" role="group" aria-label="Dia">${dias.map((d, i) => `
        <button type="button" class="ag-dia${i === st.dia ? ' sel' : ''}" data-dia="${i}">
          <small>${SEM[d.getDay()]}</small><b>${d.getDate()}</b><small>${MES[d.getMonth()]}</small></button>`).join('')}</div>
        ${hs.length ? `<div class="ag-horas" role="group" aria-label="Horário">${hs.map(m => `
          <button type="button" class="ag-hora${st.hora === m ? ' sel' : ''}" data-hora="${m}">${hhmm(m)}</button>`).join('')}</div>`
          : '<p class="ag-vazio">Sem horários livres neste dia. Escolha outro.</p>'}`
    }

    if (st.passo === 3) return `${resumo()}<form class="ag-form">
      <label>Seu nome<input name="nome" required autocomplete="name" value="${esc(st.nome)}"></label>
      <label>WhatsApp<input name="whats" required inputmode="tel" autocomplete="tel" placeholder="(15) 99999-9999" value="${esc(st.whats)}"></label>
      <label class="ag-check"><input type="checkbox" required checked> Aceito receber a confirmação e o lembrete pelo WhatsApp</label>
      <button class="ag-btn" type="submit">Confirmar horário</button></form>`

    // passo 4: confirmado, com a prévia das mensagens automáticas
    const d = dias[st.dia], h = hhmm(st.hora), n = esc(st.nome.split(' ')[0])
    const vespera = new Date(d); vespera.setDate(d.getDate() - 1)
    return `<div class="ag-ok"><h3>Horário marcado, ${n}.</h3>${resumo()}
      <div class="ag-zap" aria-label="Prévia das mensagens automáticas">
        <p class="ag-zap-topo">Ninja's Barbershop <small>mensagens automáticas</small></p>
        <p class="ag-msg"><span class="ag-quando">Agora</span>Oi, ${n}! Seu horário está confirmado: ${esc(st.svc.nome)} com ${esc(nomePro())}, ${dataLonga(d)} às ${h}. Para remarcar, é só responder aqui.</p>
        <p class="ag-msg"><span class="ag-quando">Véspera, ${dataLonga(vespera)}</span>${n}, amanhã às ${h} tem horário seu na Ninja's. Responda 1 para confirmar ou 2 para remarcar.</p>
        <p class="ag-msg"><span class="ag-quando">No dia, 8h</span>Bom dia! Hoje às ${h}, na Rua Lara Campos, 740. Até já.</p>
      </div>
      <button type="button" class="ag-btn ag-btn-sec" data-reiniciar>Fazer outro agendamento</button></div>`
  }

  function render(rolar) {
    const passoVisivel = Math.floor(st.passo)
    raiz.innerHTML = `<ol class="ag-passos">${PASSOS.map((p, i) => `<li class="${i === passoVisivel && st.passo < 4 ? 'on' : i < passoVisivel || st.passo === 4 ? 'ok' : ''}"><span>${i + 1}</span>${p}</li>`).join('')}</ol>
      ${st.passo > 0 && st.passo < 4 ? '<button type="button" class="ag-voltar" data-voltar>Voltar</button>' : ''}
      <div class="ag-corpo">${corpo()}</div>`
    if (rolar) {
      const top = raiz.getBoundingClientRect().top
      if (top < 0 || top > innerHeight * 0.6) raiz.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const escolherSvc = id => {
    st.svc = D.servicos.find(s => s.id === id)
    st.pro = null; st.hora = null
    st.passo = st.svc.preco == null ? 0.5 : st.svc.pros.length === 1 ? (st.pro = st.svc.pros[0], 2) : 1
  }

  document.addEventListener('click', e => {
    const t = e.target.closest('button')
    if (!t) return
    const ds = t.dataset
    if (ds.agendar) { escolherSvc(ds.agendar); render(true); return }
    if (!raiz.contains(t)) return
    if (ds.svc) escolherSvc(ds.svc)
    else if (ds.pro) { st.pro = ds.pro; st.hora = null; st.passo = 2 }
    else if (ds.dia) { st.dia = +ds.dia; st.hora = null }
    else if (ds.hora) { st.hora = +ds.hora; st.passo = 3 }
    else if ('voltar' in ds) st.passo = st.passo === 0.5 ? 0 : st.passo === 2 && st.svc.pros.length === 1 ? 0 : Math.ceil(st.passo) - 1
    else if ('reiniciar' in ds) Object.assign(st, { passo: 0, svc: null, pro: null, dia: 0, hora: null })
    else return
    render(true)
  })
  raiz.addEventListener('submit', e => {
    e.preventDefault()
    const f = new FormData(e.target)
    st.nome = String(f.get('nome')).trim(); st.whats = String(f.get('whats')).trim()
    st.passo = 4
    render(true)
  })
  render(false)
})()
