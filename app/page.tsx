import Image from 'next/image';
import Checkout from './checkout';
import { campaign, formatPrice } from '../lib/campaign';

function Brand() {
  return (
    <a className="brand" href="#inicio" aria-label="Rifa da Kinha, início">
      <span aria-hidden="true">♥</span> Rifa da Kinha
    </a>
  );
}

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#conteudo">Ir para o conteúdo</a>
      <header id="inicio" className="site-header">
        <div className="shell header-inner">
          <Brand />
          <nav aria-label="Navegação principal">
            <a href="#historia">A história da Kinha</a>
            <a href="#regulamento">Regulamento</a>
          </nav>
          <a className="button button-small" href="#numeros">Participar <span aria-hidden="true">↗</span></a>
        </div>
      </header>

      <main id="conteudo">
        <section className="hero">
          <div className="shell hero-inner">
            <div className="hero-copy">
              <div className="demo-label"><span aria-hidden="true" /> Versão de demonstração</div>
              <h1>Rifa Solidária <em>da Kinha</em></h1>
              <p className="hero-slogan">{campaign.slogan}</p>
              <p className="hero-description">Cada número ajuda a custear o tratamento contra o câncer da Kinha. Vem fazer parte dessa corrente de carinho?</p>
              <a className="button" href="#numeros">Escolher meus números <span aria-hidden="true">↓</span></a>
            </div>
            <figure className="hero-figure">
              <Image src={campaign.photos.hero.src} alt={campaign.photos.hero.alt} fill preload sizes="(max-width: 760px) 92vw, 540px" />
              <figcaption>{campaign.photos.caption}</figcaption>
            </figure>
          </div>
        </section>

        <div className="facts-band">
          <dl className="shell facts">
            <div><dt>Prêmio</dt><dd>{formatPrice(campaign.prizeValueInCents)} em gift card Airbnb</dd></div>
            <div><dt>Por número</dt><dd>{formatPrice(campaign.priceInCents)}</dd></div>
            <div><dt>Sorteio</dt><dd>Via Loteria Federal</dd></div>
          </dl>
        </div>

        <section className="shell story" id="historia" aria-labelledby="story-heading">
          <figure className="story-figure">
            <Image src={campaign.photos.story.src} alt={campaign.photos.story.alt} fill sizes="(max-width: 760px) 92vw, 420px" />
            <figcaption>{campaign.photos.caption}</figcaption>
          </figure>
          <div className="story-copy">
            <p className="eyebrow">A história da Kinha</p>
            <h2 id="story-heading">Todo cuidado conta.</h2>
            <p>A Kinha é nossa gatinha e está em tratamento contra o câncer. Criamos esta rifa para ajudar a custear o tratamento dela.</p>
            <p>Se você puder participar ou compartilhar a campanha, já estará ajudando a cuidar da Kinha. Obrigada por fazer parte dessa história. <span aria-hidden="true">♥</span></p>
          </div>
        </section>

        <Checkout />

        <section className="shell rules" id="regulamento" aria-labelledby="rules-heading">
          <div>
            <p className="eyebrow">Informações da rifa</p>
            <h2 id="rules-heading">Regulamento</h2>
            <p>A renda da campanha será destinada ao tratamento contra o câncer da Kinha.</p>
            {campaign.rulesUrl && <a className="text-link" href={campaign.rulesUrl}>Ler regulamento completo ↗</a>}
          </div>
          <dl className="rules-list">
            <div><dt>Prêmio</dt><dd>Gift card digital Airbnb no valor de {formatPrice(campaign.prizeValueInCents)}, para usar em uma hospedagem à escolha do ganhador.</dd></div>
            <div><dt>Participação</dt><dd>{campaign.totalNumbers} números, de 001 a {campaign.totalNumbers}, a {formatPrice(campaign.priceInCents)} cada.</dd></div>
            <div><dt>Sorteio</dt><dd>Baseado no resultado da Loteria Federal. {campaign.drawDate || 'Data a divulgar.'} {campaign.drawRule || 'Critério de apuração a divulgar.'}</dd></div>
            <div><dt>Autorização</dt><dd>{campaign.authorization || 'Dados da autorização a divulgar.'}</dd></div>
          </dl>
        </section>
      </main>

      <footer className="site-footer">
        <div className="shell footer-inner">
          <div><Brand /><p>Campanha solidária pelo tratamento da Kinha.</p></div>
          <div className="footer-links">
            <a className="text-link" href="#regulamento">Regulamento</a>
            {campaign.contactUrl
              ? <a className="text-link" href={campaign.contactUrl}>{campaign.contact || 'Contato'}</a>
              : <span>{campaign.contact || 'Contato a divulgar'}</span>}
          </div>
        </div>
      </footer>
    </>
  );
}
