// Dados do protótipo. Endereço, horário e WhatsApp são reais (Instagram, nov/2026).
// Serviços, preços e equipe são FICTÍCIOS: trocar pelos dados reais da Ninja's.
window.NINJAS = {
  marca: {
    nome: "Ninja's Barbershop",
    endereco: 'Rua Lara Campos, 740, Loja 4',
    cidade: 'Tietê, SP',
    instagram: 'https://www.instagram.com/ninjasbarbershop',
    whatsapp: 'https://wa.me/message/LQSZJMHUMB43B1',
    mapa: 'https://www.google.com/maps/search/?api=1&query=Rua+Lara+Campos,+740,+Tiet%C3%AA+-+SP',
    mapaEmbed: 'https://maps.google.com/maps?q=Rua%20Lara%20Campos%2C%20740%2C%20Tiet%C3%AA%20SP&z=16&output=embed',
  },
  horario: [['Segunda a sexta', '9h às 20h'], ['Sábado', '8h às 18h'], ['Domingo', 'Fechado']],
  // [abre, fecha] em horas, por dia da semana (0 = domingo)
  expediente: { 0: null, 1: [9, 20], 2: [9, 20], 3: [9, 20], 4: [9, 20], 5: [9, 20], 6: [8, 18] },
  servicos: [
    { id: 'corte', nome: 'Corte masculino', min: 40, preco: 55, pros: ['rafael', 'diego', 'bruna'] },
    { id: 'barba', nome: 'Barba', min: 30, preco: 45, pros: ['rafael', 'diego'] },
    { id: 'combo', nome: 'Corte e barba', min: 70, preco: 90, pros: ['rafael', 'diego'] },
    { id: 'barboterapia', nome: 'Barboterapia', desc: 'Toalha quente, óleos e massagem facial', min: 45, preco: 65, pros: ['rafael', 'diego'] },
    { id: 'infantil', nome: 'Corte infantil', min: 30, preco: 45, pros: ['rafael', 'diego', 'bruna'] },
    { id: 'sobrancelha', nome: 'Sobrancelha na navalha', min: 15, preco: 20, pros: ['rafael', 'diego'] },
    { id: 'feminino', nome: 'Corte feminino curto', min: 60, preco: 80, pros: ['bruna'] },
    { id: 'luzes', nome: 'Luzes e platinado', min: 120, preco: null, pros: ['bruna'] },
  ],
  equipe: [
    { id: 'rafael', nome: 'Rafael Moura', papel: 'Fundador e barbeiro', texto: 'Cortes clássicos, degradê e barba na navalha.' },
    { id: 'diego', nome: 'Diego Santos', papel: 'Barbeiro', texto: 'Texturizados, cabelo longo e barboterapia.' },
    { id: 'bruna', nome: 'Bruna Lima', papel: 'Cabeleireira', texto: 'Cortes femininos curtos, luzes e platinado.' },
  ],
  galeria: [
    ['g1.jpg', 'Médio com textura'], ['g3.jpg', 'Social penteado'], ['g4.jpg', 'Feminino com desenho'],
    ['g2.jpg', 'Degradê e barba'], ['g6.jpg', 'Barba e cabelo'], ['g9.jpg', 'Cacheado'],
    ['g7.jpg', 'Acabamento clássico'], ['g8.jpg', 'Pompadour'], ['g5.jpg', 'Undercut feminino'],
  ],
  antesDepois: [
    ['antes1.jpg', 'depois1.jpg', 'De longo a curto, com doação do cabelo'],
    ['antes2.jpg', 'depois2.jpg', 'Cabelo e barba alinhados'],
    ['antes3.jpg', 'depois3.jpg', 'Curto feminino com desenho'],
  ],
}
