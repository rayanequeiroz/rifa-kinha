import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculateTotal, campaign, formatNumber } from '../lib/campaign.ts';
import {
  availability, confirmDemoOrder, createDemoOrder, numberList, orderStatus,
  pickRandomNumber, toggleNumber, validParticipant,
} from '../lib/demo.ts';

const now = 1_000_000;
const reserve = (numbers = [1, 2]) => {
  const order = createDemoOrder([], numbers, 'Pessoa Fictícia', 'demo-id', now);
  assert.ok(order);
  return order;
};

test('a grade contém 300 números e os limites são formatados com três dígitos', () => {
  assert.equal(numberList.length, 300);
  assert.equal(formatNumber(numberList[0]), '001');
  assert.equal(formatNumber(numberList.at(-1)!), '300');
});

test('seleciona, remove e sorteia apenas números disponíveis', () => {
  const states = availability([], now);
  assert.deepEqual(toggleNumber([2], 1, states), [1, 2]);
  assert.deepEqual(toggleNumber([1, 2], 1, states), [2]);
  for (const number of [0, 3, 5, 301]) {
    assert.deepEqual(toggleNumber([2], number, states), [2]);
  }
  assert.equal(pickRandomNumber([1, 2], states, () => 0), 4);
  assert.equal(pickRandomNumber(numberList, states), undefined);
});

test('cobra R$ 15 por número com a promoção desativada', () => {
  assert.equal(calculateTotal(0), 0);
  assert.equal(calculateTotal(1), 1500);
  assert.equal(calculateTotal(3), 4500);
  assert.equal(calculateTotal(300), 450000);
});

test('valida nome completo e telefone com DDD', () => {
  assert.ok(validParticipant('Pessoa Fictícia', '(11) 99999-9999'));
  assert.ok(validParticipant('Pessoa Fictícia', '11 3333-3333'));
  assert.ok(!validParticipant('Pessoa', '(11) 99999-9999'));
  assert.ok(!validParticipant('Pessoa Fictícia', '99999-9999'));
});

test('rejeita números duplicados, vazios, reservados ou vendidos', () => {
  for (const numbers of [[], [1, 1], [5], [3], [301]]) {
    assert.equal(createDemoOrder([], numbers, 'Pessoa Fictícia', 'id', now), null);
  }
  assert.equal(createDemoOrder([reserve()], [2, 4], 'Outra Pessoa', 'outro', now), null);
});

test('reserva o número pelo prazo configurado e libera na expiração', () => {
  const order = reserve();
  assert.equal(order.expiresAt - now, campaign.reservationMinutes * 60_000);
  assert.equal(orderStatus(order, order.expiresAt - 1), 'pending');
  assert.equal(availability([order], order.expiresAt - 1).get(1), 'reserved');
  assert.equal(orderStatus(order, order.expiresAt), 'expired');
  assert.equal(availability([order], order.expiresAt).has(1), false);
  assert.ok(createDemoOrder([order], [1], 'Outra Pessoa', 'outro', order.expiresAt));
});

test('confirma uma vez e bloqueia recompra mesmo após o prazo da reserva', () => {
  const order = reserve();
  const confirmed = confirmDemoOrder([order], order.id, now);
  assert.equal(orderStatus(confirmed[0], order.expiresAt), 'confirmed');
  assert.equal(confirmed[0].total, 3000);
  assert.equal(availability(confirmed, order.expiresAt).get(1), 'sold');
  assert.equal(createDemoOrder(confirmed, [1], 'Outra Pessoa', 'outro', order.expiresAt), null);
  assert.deepEqual(confirmDemoOrder(confirmed, order.id, now), confirmed);
});

test('simulação de confirmação tardia não altera a reserva expirada', () => {
  const order = reserve();
  assert.deepEqual(confirmDemoOrder([order], order.id, order.expiresAt), [order]);
  assert.deepEqual(confirmDemoOrder([order], 'inexistente', now), [order]);
});
