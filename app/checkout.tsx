'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { campaign, calculateTotal, formatNumber, formatPrice } from '../lib/campaign';
import {
  availability, confirmDemoOrder, createDemoOrder, demoPixCode, numberList,
  orderStatus, pickRandomNumber, toggleNumber, validParticipant, type DemoOrder,
} from '../lib/demo';

const storageKey = 'rifa-kinha:demo-orders:v1';
const groupSize = 50;
const groups = Array.from({ length: Math.ceil(numberList.length / groupSize) }, (_, index) => {
  const numbers = numberList.slice(index * groupSize, (index + 1) * groupSize);
  return { label: `${formatNumber(numbers[0])}–${formatNumber(numbers[numbers.length - 1])}`, numbers };
});
const statusNames = { available: 'Disponível', reserved: 'Reservado', sold: 'Vendido' };

function readOrders(): DemoOrder[] {
  try {
    const orders: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    return Array.isArray(orders) ? orders : [];
  } catch {
    return [];
  }
}

function setOrderInUrl(id?: string) {
  const url = new URL(location.href);
  if (id) url.searchParams.set('pedido', id);
  else url.searchParams.delete('pedido');
  history.replaceState(null, '', url);
}

function SelectedNumbers({ numbers }: { numbers: number[] }) {
  return <p className="selected-numbers">{numbers.map(formatNumber).join(', ')}</p>;
}

export default function Checkout() {
  const [orders, setOrders] = useState<DemoOrder[]>([]);
  const [now, setNow] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [group, setGroup] = useState(0);
  const [screen, setScreen] = useState<'participant' | 'order' | null>(null);
  const [orderId, setOrderId] = useState('');
  const [error, setError] = useState('');
  const [copyFeedback, setCopyFeedback] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const sync = () => {
      setOrders(readOrders());
      setNow(Date.now());
    };
    sync();
    const savedId = new URL(location.href).searchParams.get('pedido');
    if (savedId) {
      setOrderId(savedId);
      setScreen('order');
    }
    window.addEventListener('storage', sync);
    window.addEventListener('focus', sync);
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('focus', sync);
      window.clearInterval(timer);
    };
  }, []);

  const states = availability(orders, now);
  const activeNumbers = selected.filter((number) => !states.has(number));
  const unavailableCount = selected.length - activeNumbers.length;
  const currentOrder = orders.find((order) => order.id === orderId);
  const currentStatus = currentOrder && orderStatus(currentOrder, now);
  const latest = orders[orders.length - 1];
  const soldCount = Array.from(states.values()).filter((status) => status === 'sold').length;
  const randomAvailable = states.size + activeNumbers.length < numberList.length;

  useEffect(() => {
    const element = dialog.current;
    if (screen && element && !element.open) {
      opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      element.showModal();
    }
    if (screen) heading.current?.focus();
  }, [screen, currentStatus]);

  function closeDialog() {
    dialog.current?.close();
    setScreen(null);
    setOrderInUrl();
    setError('');
    setCopyFeedback('');
    if (opener.current?.isConnected && !opener.current.matches(':disabled')) {
      opener.current.focus();
    } else {
      document.getElementById('numbers-heading')?.focus();
    }
  }

  function changeNumber(number: number) {
    setSelected(toggleNumber(activeNumbers, number, states));
  }

  function chooseRandom() {
    const number = pickRandomNumber(activeNumbers, states);
    if (number === undefined) return;
    changeNumber(number);
    setGroup(Math.floor((number - 1) / groupSize));
  }

  function saveOrders(nextOrders: DemoOrder[]) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextOrders));
      setOrders(nextOrders);
      setNow(Date.now());
      return true;
    } catch {
      setError('O navegador não conseguiu guardar a demonstração. Verifique as permissões de armazenamento e tente novamente.');
      return false;
    }
  }

  function reserve(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const name = String(values.get('name') ?? '');
    const phone = String(values.get('phone') ?? '');
    if (!validParticipant(name, phone)) {
      setError('Informe nome e sobrenome e um telefone com DDD e 10 ou 11 dígitos.');
      return;
    }

    const current = readOrders();
    const submittedAt = Date.now();
    const order = createDemoOrder(current, selected, name, crypto.randomUUID(), submittedAt);
    if (!order) {
      setOrders(current);
      setNow(submittedAt);
      setError('A disponibilidade mudou. Volte à grade e confira sua seleção.');
      return;
    }

    if (!saveOrders([...current, order])) return;
    setSelected([]);
    setError('');
    setOrderId(order.id);
    setOrderInUrl(order.id);
    setScreen('order');
  }

  function confirm() {
    setError('');
    setCopyFeedback('');
    saveOrders(confirmDemoOrder(readOrders(), orderId, Date.now()));
  }

  async function copyPix() {
    try {
      await navigator.clipboard.writeText(demoPixCode);
      setCopyFeedback('Código de teste copiado!');
    } catch {
      setCopyFeedback('Selecione e copie o código no campo acima.');
    }
  }

  return (
    <section className="numbers-section" id="numeros" aria-labelledby="numbers-heading">
      <div className="shell numbers-inner">
        <div className="numbers-heading">
          <div>
            <p className="eyebrow">Participe da rifa</p>
            <h2 id="numbers-heading" tabIndex={-1}>Escolha seus números</h2>
            <p>Toque nos números que quiser ou deixe a sorte escolher.</p>
          </div>
          {latest && (
            <button className="button button-outline button-small" onClick={() => {
              setOrderId(latest.id);
              setOrderInUrl(latest.id);
              setScreen('order');
            }}>Consultar último pedido</button>
          )}
        </div>

        <div className="checkout-grid">
          <div className="number-board">
            <div className="board-tools">
              <ul className="legend" aria-label="Legenda dos números">
                <li><span className="swatch available" />Disponível</li>
                <li><span className="swatch reserved" />Reservado</li>
                <li><span className="swatch sold" />Vendido</li>
                <li><span className="swatch selected" />Selecionado</li>
              </ul>
              <button className="button button-outline button-small" onClick={chooseRandom} disabled={!randomAvailable}>
                <span aria-hidden="true">⤨</span> Sortear número
              </button>
            </div>
            <div className="number-groups" role="group" aria-label="Faixa de números">
              {groups.map(({ label }, index) => (
                <button key={label} className="group-button" aria-pressed={group === index} onClick={() => setGroup(index)}>{label}</button>
              ))}
            </div>
            <div className="number-grid" role="group" aria-label={`Números ${groups[group].label}`}>
              {groups[group].numbers.map((number) => {
                const status = states.get(number) ?? 'available';
                const checked = activeNumbers.includes(number);
                return (
                  <button
                    key={number} className={`number-tile ${checked ? 'selected' : status}`}
                    aria-label={`Número ${formatNumber(number)}: ${statusNames[status]}`}
                    aria-pressed={status === 'available' ? checked : undefined}
                    disabled={status !== 'available'} onClick={() => changeNumber(number)}
                  >{formatNumber(number)}</button>
                );
              })}
            </div>
            <p className="board-note">{soldCount} de {campaign.totalNumbers} vendidos na demonstração</p>
          </div>

          <aside className="summary" aria-labelledby="summary-heading">
            <h3 id="summary-heading">Sua seleção</h3>
            <div aria-live="polite">
              {activeNumbers.length > 0
                ? <SelectedNumbers numbers={activeNumbers} />
                : <p className="summary-empty">Escolha um número para começar.</p>}
              {unavailableCount > 0 && <p className="error">Alguns números ficaram indisponíveis.</p>}
              <dl className="summary-totals">
                <div><dt>Quantidade</dt><dd>{activeNumbers.length}</dd></div>
                <div><dt>Total</dt><dd>{formatPrice(calculateTotal(activeNumbers.length))}</dd></div>
              </dl>
            </div>
            <button className="button button-full" disabled={!activeNumbers.length} onClick={() => {
              setSelected(activeNumbers);
              setScreen('participant');
            }}>
              Continuar <span aria-hidden="true">→</span>
            </button>
            {activeNumbers.length > 0 && (
              <button className="clear-selection" onClick={() => setSelected([])}>Limpar seleção</button>
            )}
          </aside>
        </div>

        {screen && (
          <dialog ref={dialog} className="checkout-dialog" aria-labelledby="dialog-heading" onCancel={(event) => {
            event.preventDefault();
            closeDialog();
          }}>
            <div className="dialog-inner">
              <button className="close-button" aria-label="Fechar" onClick={closeDialog}>×</button>
              <p className="eyebrow">Demonstração</p>
              {screen === 'participant' && (
                <>
                  <h3 id="dialog-heading" ref={heading} tabIndex={-1}>Seus dados</h3>
                  <p>Use dados fictícios. O nome fica salvo neste navegador para a consulta, e o telefone é usado só para validar o formulário.</p>
                  <SelectedNumbers numbers={activeNumbers} />
                  <p className="order-total">{formatPrice(calculateTotal(activeNumbers.length))}</p>
                  <form onSubmit={reserve} className="participant-form">
                    <label>Nome completo<input name="name" type="text" maxLength={120} placeholder="Ex.: Maria Silva" required /></label>
                    <label>Telefone com DDD<input name="phone" type="tel" inputMode="tel" maxLength={20} placeholder="(11) 99999-9999" required /></label>
                    {error && <p className="error" role="alert">{error}</p>}
                    <button className="button button-full" type="submit">Gerar Pix de teste <span aria-hidden="true">→</span></button>
                  </form>
                </>
              )}
              {screen === 'order' && (
                <>
                  <h3 id="dialog-heading" ref={heading} tabIndex={-1}>
                    {currentStatus === 'confirmed' ? 'Compra confirmada!' :
                      currentStatus === 'expired' ? 'Reserva expirada' :
                      currentOrder ? 'Pix simulado' : 'Pedido indisponível'}
                  </h3>
                  {currentOrder && (
                    <>
                      {currentStatus === 'confirmed' && <p>Obrigada por participar, {currentOrder.name}! Estes são seus números na demonstração.</p>}
                      {currentStatus === 'expired' && <p>O tempo para simular o pagamento acabou. Os números voltaram para a grade.</p>}
                      {currentStatus === 'pending' && (
                        <p>Pagamento pendente. Reserva por mais <strong>{Math.max(1, Math.ceil((currentOrder.expiresAt - now) / 60_000))} min</strong>.</p>
                      )}
                      <SelectedNumbers numbers={currentOrder.numbers} />
                      <p className="order-total">
                        {currentStatus === 'confirmed' ? 'Valor pago na simulação · ' : 'Total · '}{formatPrice(currentOrder.total)}
                      </p>
                    </>
                  )}
                  {!currentOrder && <p>Abra o link no navegador em que a demonstração foi iniciada.</p>}
                  {currentStatus === 'pending' && (
                    <div className="pix-panel">
                      <p>Este QR Code é ilustrativo e não gera cobrança.</p>
                      <Image src="/pix-demo.png" alt="QR Code de demonstração, sem valor de pagamento" width={136} height={136} unoptimized />
                      <label className="pix-field">Código de teste<input readOnly value={demoPixCode} onFocus={(event) => event.currentTarget.select()} /></label>
                      <button className="button button-outline button-full" onClick={copyPix}>Copiar código Pix</button>
                      <p className="copy-feedback" aria-live="polite">{copyFeedback}</p>
                      <button className="button button-full" onClick={confirm}>Simular pagamento aprovado</button>
                    </div>
                  )}
                  {error && <p className="error" role="alert">{error}</p>}
                  <button className="clear-selection" onClick={closeDialog}>Voltar à rifa</button>
                </>
              )}
            </div>
          </dialog>
        )}
      </div>
    </section>
  );
}
