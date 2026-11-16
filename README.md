# Duskvale

Aplicacao React com Vite. A rota `/` exibe a tela de manutencao e as proximas paginas podem ser adicionadas em `src/App.jsx`.

## Desenvolvimento

```bash
npm install
npm run dev
```

No Codespaces, abra a porta `5173` pela aba **Ports** do VS Code e use a URL encaminhada por ela. A URL raiz `github.dev` mostra a tela de encaminhamento do GitHub, nao a aplicacao.

## Build para VPS

```bash
npm ci
npm run build
```

Publique o conteudo de `dist/` no diretorio configurado pelo Nginx. Use `deploy/nginx.conf` como base: o `try_files` preserva o fallback do React Router em rotas futuras.

## Atualizacoes do servidor

A pagina `/atualizacoes` le `public/atualizacoes.json` e consulta novamente a cada 30 segundos. Para registrar uma alteracao implantada no servidor, acrescente um objeto com `id` unico, `titulo`, `descricao`, `projeto`, `tipo` (`novo`, `ajuste` ou `correcao`) e `lancadoEm` (data e horario reais em ISO 8601 com fuso, por exemplo `2026-11-11T10:36:16-03:00`). Nao registre planos ou alteracoes do site como alteracoes do servidor. Em seguida, publique o JSON atualizado em `dist/` no servidor web; a pagina nao exige um novo build se apenas esse arquivo for alterado.

## Diretório de lojas

A rota `/lojas` consulta `/api/lojas` ao abrir e a cada 30 segundos. A API em `server/lojas-api.py` lê diretamente o cadastro `plugins/DuskValeLojas/config.yml` do Survival a cada requisição e publica apenas nome do jogador, nome da loja, coordenadas, mundo e comando. Cadastro ou remoção de loja não exige build ou reinício. A API é executada pelo serviço systemd `duskvale-lojas-api` e atendida pelo socket `/run/duskvale-lojas/api.sock`; o contêiner Nginx do site precisa montar esse diretório, conforme `deploy/nginx.conf`. Em caso de erro ao ler o arquivo, a API retorna HTTP 503. As imagens de avatar dependem de um serviço externo de skins e podem não refletir skins de contas Bedrock ou não oficiais.
