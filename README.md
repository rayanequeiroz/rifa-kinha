# Rifa Solidária da Kinha

Campanha solidária para ajudar a custear o tratamento contra o câncer da Kinha. Esta versão é uma demonstração da interface e do fluxo de participação.

## Executar a demonstração

Requer Node.js 22.18 ou superior e npm.

```sh
npm ci
npm run dev
```

Abra [localhost:3000](http://localhost:3000). A Fase 1 funciona sem variáveis de ambiente ou serviços externos.

1. Selecione números em uma ou mais faixas. O botão **Sortear número** adiciona um número disponível.
2. Clique em **Continuar** e use um nome e telefone fictícios, por exemplo Maria Silva e (11) 99999-9999.
3. Gere o Pix de teste. O QR Code e o texto copiável contêm uma mensagem de demonstração, sem cobrança.
4. Use **Simular pagamento aprovado**. O pedido exibe o nome, os números e o valor simulado. A grade marca os números como vendidos.
5. Recarregue enquanto o pedido estiver aberto ou use **Consultar último pedido**. O endereço com `?pedido=` recupera o pedido apenas no navegador de origem.

A grade começa com números fictícios reservados e vendidos. Pedidos criados durante o teste ficam no armazenamento local, com reserva simulada de 15 minutos. O telefone é validado no formulário e descartado. Para reiniciar, apague os dados locais deste site no navegador. A disponibilidade da demonstração é independente para cada navegador e não representa vendas da campanha.

## Personalizar

A configuração em [lib/campaign.ts](lib/campaign.ts) reúne preços, promoção desativada, quantidade, prazo de reserva, prêmio, fotos, sorteio, autorização, regulamento e contato. As imagens da apresentação e da história usam uma ilustração temporária identificada na página. Para trocar pelas fotos, coloque os arquivos em `public/` e atualize os caminhos, textos alternativos e a legenda.

## Verificar

```sh
npm test
npm run build
npm run check
```

Os testes cobrem seleção, sorteio de números, preço, formulário e o ciclo de reservas e confirmações de demonstração. A checagem de tipos gera os tipos do App Router antes de executar o TypeScript.

## Fases seguintes

- **Fase 2 · Supabase.** Criar um projeto de teste, versionar migrations com as transações de reserva e as políticas de acesso, proteger a chave privada em variáveis de servidor e validar concorrência em um banco real.
- **Fase 3 · Mercado Pago.** Configurar uma integração de teste do Checkout Transparente e confirmar na documentação oficial os dados do pagador exigidos pela API escolhida. Configurar o webhook HTTPS e seu segredo, validar a assinatura e consultar a API antes de confirmar. Exercitar duplicidade, expiração e conciliação de pagamentos tardios em ambiente de teste.
- **Vercel.** Quando houver autorização, importar este repositório como Next.js e configurar as credenciais nos ambientes correspondentes após concluir as integrações. A demonstração roda localmente com os passos acima.
