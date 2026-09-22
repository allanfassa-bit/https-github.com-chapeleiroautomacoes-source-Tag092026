# Manual Técnico & Skill: Redirecionamento Dinâmico NFC SaaS (ALF Automação)

Este documento registra a arquitetura do módulo de mensalidade recorrente para placas físicas NFC e QR Codes dinâmicos com painel do cliente integrado por senha.

## 🛠️ Arquitetura de Redirecionamento Dinâmico

O redirecionamento inteligente dinâmico evita que o lojista precise reprogramar tags NFC físicas ou reimprimir QR Codes. O link da placa é fixo, mas o destino é alterado na nuvem instantaneamente.

### 🔗 Fluxo de Execução
1. **Leitura Física:** O cliente aproxima o smartphone da placa NFC ou escaneia o QR Code contendo a URL:
   `https://[seu-dominio].run.app/r/[leadId]`
2. **Requisição Segura (Backend):** O servidor Express recebe a chamada e valida o ID contra caracteres perigosos.
3. **Consulta de Status e Destino (Firestore):** O servidor puxa o cadastro do lead do Firestore.
4. **Verificação de Adimplência (SaaS Status):**
   * Se `nfcBillingStatus === 'suspended'`, o acesso é bloqueado e mostra uma tela de aviso personalizado para reativar a mensalidade com a ALF.
   * Se `nfcBillingStatus === 'active'`, o sistema verifica qual link está ativo e redireciona o cliente para o destino configurado (Google Meu Negócio, WhatsApp, Instagram, Website ou URL customizada).

---

## 🔒 Camada de Segurança e Blindagem (CyberShield Defense)

Implementamos técnicas avançadas de segurança digital para proteger a propriedade intelectual e os dados dos estabelecimentos:

1. **Anti-Fingerprinting:** O cabeçalho `X-Powered-By` foi desabilitado no Express para ocultar a assinatura tecnológica.
2. **Defesa contra Path Traversal & API Abuse:** O parâmetro `leadId` é estritamente filtrado por regex para impedir injeção de diretórios ou comandos.
3. **Proteção contra Injeção de Scripts (Open Redirect XSS):** O sistema analisa a URL de destino e aceita apenas os protocolos seguros `http:` e `https:`, inviabilizando exploração por payloads `javascript:`.
4. **Cabeçalhos de Segurança:** Configuração do `X-Frame-Options` para anular Clickjacking, `X-Content-Type-Options: nosniff` contra Mime-Sniffing e políticas de segurança CORS contra scraping de dados por domínios terceiros.

---

## 💻 Portal do Lojista (Painel SaaS)

### Painel Administrativo Master (Para a ALF Automação)
* **Gerenciador de Senhas:** Define o PIN numérico do portal do cliente.
* **Seletor de Planos/Módulos:** Marca as permissões individuais de cada lojista (o que ele contratou para alterar).
* **Bloqueador de Mensalidade:** Ativa ou suspende a placa NFC com um clique.

### Painel de Autoatendimento do Cliente (Smartphone)
* **Acesso Simples:** Login pelo ID do lead e senha PIN de 4 dígitos.
* **QR Code Dinâmico:** Imagem gerada em tempo real para impressão e colocação em balcões de acrílico.
* **Destinos Rápidos:** Seletor visual intuitivo para escolher o destino do NFC entre GMB, WhatsApp, Instagram ou Website.
