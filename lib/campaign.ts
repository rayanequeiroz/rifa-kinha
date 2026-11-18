export const campaign = {
  name: 'Rifa Solidária da Kinha',
  slogan: 'Concorra a 1 diária de hospedagem à escolha do ganhador!',
  totalNumbers: 300,
  priceInCents: 1500,
  promotion: { enabled: false, quantity: 3, priceInCents: 3900 },
  reservationMinutes: 15,
  prizeValueInCents: 30000,
  photos: {
    hero: { src: '/kinha-ilustracao.webp', alt: 'Ilustração de uma gata tigrada sobre uma manta rosa' },
    story: { src: '/kinha-ilustracao.webp', alt: 'Ilustração de uma gata tigrada, usada enquanto a foto da Kinha não está disponível' },
    caption: 'Imagem ilustrativa · Foto da Kinha em breve',
  },
  drawDate: '',
  drawRule: '',
  authorization: '',
  rulesUrl: '',
  contact: '',
  contactUrl: '',
};

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export const formatPrice = (cents: number) => brl.format(cents / 100);
export const formatNumber = (number: number) => String(number).padStart(3, '0');

export function calculateTotal(quantity: number) {
  const { promotion, priceInCents } = campaign;
  if (!promotion.enabled) return quantity * priceInCents;

  const bundles = Math.floor(quantity / promotion.quantity);
  const individuals = quantity % promotion.quantity;
  return bundles * promotion.priceInCents + individuals * priceInCents;
}
