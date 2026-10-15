import JSZip from 'jszip';
import { MiniSiteConfig, generateMiniSiteStandaloneHtml } from './miniSiteExporter';

export interface VercelClientDeployConfig {
  clientId: string;
  clientName: string;
  niche: string;
  city: string;
  subdomain: string;
  customDomain?: string;
  miniSiteConfig: MiniSiteConfig;
}

export function cleanClientSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'cliente-alf';
}

export function getClientVercelUrl(clientName: string, customDomain?: string): string {
  if (customDomain && customDomain.trim()) {
    const clean = customDomain.trim().replace(/^https?:\/\//i, '');
    return `https://${clean}`;
  }
  const slug = cleanClientSlug(clientName);
  return `https://${slug}.vercel.app`;
}

export function generateVercelConfigJson(clientName: string): string {
  const config = {
    version: 2,
    name: cleanClientSlug(clientName),
    builds: [
      {
        src: 'index.html',
        use: '@vercel/static'
      }
    ],
    routes: [
      {
        src: '/(.*)',
        dest: '/index.html',
        headers: {
          'Cache-Control': 'public, max-age=0, must-revalidate',
          'X-Frame-Options': 'SAMEORIGIN',
          'X-Content-Type-Options': 'nosniff'
        }
      }
    ]
  };
  return JSON.stringify(config, null, 2);
}

export function generateVercelPackageJson(clientName: string): string {
  const slug = cleanClientSlug(clientName);
  const pkg = {
    name: slug,
    version: '1.0.0',
    description: `Mini Site Hub de Alta Conversão & Placa NFC para ${clientName}`,
    private: true,
    scripts: {
      build: "echo 'Site estático pronto para Vercel'",
      start: "npx serve ."
    },
    keywords: ["minisite", "nfc", "google-reviews", "vercel"],
    author: "ALF Automação & Placas NFC"
  };
  return JSON.stringify(pkg, null, 2);
}

export function generateVercelReadme(clientName: string, vercelUrl: string): string {
  const slug = cleanClientSlug(clientName);
  return `# Mini Site Oficial - ${clientName}
> Criado e otimizado pela tecnologia **ALF Automação & Placas NFC**

Este pacote contém o Mini Site completo, responsivo e de altíssima conversão de **${clientName}**, pronto para ser hospedado na **Vercel** gratuitamente e com certificado SSL automático.

---

## 🚀 Opção 1: Publicação em 1 Minuto via Vercel CLI (Recomendado)

Se você já usa o terminal Node.js ou terminal do VS Code:

\`\`\`bash
# 1. Acesse esta pasta descompactada
cd ${slug}

# 2. Execute o comando de publicação direta
npx vercel --prod
\`\`\`

A Vercel fará o upload instantâneo e entregará sua URL de produção:
\`${vercelUrl}\`

---

## 🌐 Opção 2: Publicação Gratuita via GitHub + Vercel Web

1. Crie um repositório no seu GitHub com o nome \`${slug}\`
2. Envie estes arquivos (\`index.html\`, \`vercel.json\`, \`package.json\`)
3. Acesse [vercel.com/new](https://vercel.com/new)
4. Clique em **Import** no repositório criado
5. Clique em **Deploy**
6. Seu site estará ativo imediatamente com HTTPS grátis!

---

## 🏷️ Vincular Domínio Personalizado do Cliente
Exemplo: \`link.${cleanClientSlug(clientName)}.com.br\` ou \`www.${cleanClientSlug(clientName)}.com.br\`

1. No painel da Vercel, acesse o projeto criado
2. Vá em **Settings** > **Domains**
3. Digite o domínio do cliente
4. Aponte o CNAME no Registro.br ou Cloudflare conforme indicado na tela
5. O certificado SSL é gerado automaticamente em segundos!

---

## 📱 Recursos Inclusos no Mini Site:
- ⭐ **Booster de Avaliações Google 5 Estrelas** (Filtro inteligente para blindar contra notas baixas)
- 💬 **WhatsApp 1-Clique** com mensagem pré-formatada
- ⚡ **Pix Instantâneo** com cópia da chave e QR Code
- 📶 **Wi-Fi Conexão Direta** por QR Code
- 📍 **Localização GPS & Rota Maps/Waze**
- 📸 **Instagram & Redes Sociais**
- 🛡️ **Totalmente Autônomo** (Zero custos de banco de dados ou servidores pesados)
`;
}

export function generateVercelInstructionsHtml(clientName: string, vercelUrl: string): string {
  const slug = cleanClientSlug(clientName);
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Instruções de Publicação na Vercel - ${clientName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #090d16; color: #f1f5f9; padding: 40px 20px; line-height: 1.6; }
    .container { max-width: 680px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 24px; padding: 36px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
    h1 { font-size: 24px; font-weight: 900; color: #fff; margin-bottom: 8px; }
    .badge { display: inline-block; background: #0284c7; color: #fff; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 20px; }
    .step { background: #1e293b; border-left: 4px solid #38bdf8; border-radius: 12px; padding: 18px 20px; margin-bottom: 16px; }
    .step strong { display: block; font-size: 15px; color: #38bdf8; margin-bottom: 4px; }
    code { background: #020617; color: #38bdf8; padding: 3px 8px; border-radius: 6px; font-size: 13px; font-family: monospace; }
    .btn { display: inline-flex; align-items: center; justify-content: center; background: #0284c7; color: #fff; text-decoration: none; font-weight: 800; font-size: 14px; padding: 12px 24px; border-radius: 12px; margin-top: 10px; transition: background 0.2s; }
    .btn:hover { background: #0369a1; }
    .url-box { background: #020617; border: 1px dashed #38bdf8; border-radius: 12px; padding: 14px; margin: 20px 0; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <span class="badge">Vercel Deployment Guide</span>
    <h1>Mini Site de ${clientName}</h1>
    <p>Todos os arquivos deste pacote estão 100% configurados para publicação na Vercel com 0 custo de servidor.</p>

    <div class="url-box">
      <div style="font-size:12px;color:#94a3b8;margin-bottom:4px;">Link sugerido para o cliente:</div>
      <strong style="font-size:16px;color:#38bdf8;font-family:monospace;">${vercelUrl}</strong>
    </div>

    <div class="step">
      <strong>Método 1: Terminal / CLI em 30 Segundos</strong>
      Abra o terminal nesta pasta e execute:
      <br><br>
      <code>npx vercel --prod</code>
      <br><br>
      Siga as 3 confirmações rápidas na tela e seu site estará no ar!
    </div>

    <div class="step">
      <strong>Método 2: Vercel Web Dashboard</strong>
      1. Acesse <a href="https://vercel.com" target="_blank" style="color:#38bdf8;">vercel.com</a> e crie uma conta gratuita.<br>
      2. Clique em <strong>Add New... > Project</strong>.<br>
      3. Conecte com GitHub ou importe este repositório.<br>
      4. Clique no botão azul <strong>Deploy</strong>.
    </div>

    <a href="index.html" class="btn">Testar Mini Site no Navegador ➔</a>
  </div>
</body>
</html>`;
}

export async function downloadVercelClientZip(
  config: MiniSiteConfig,
  customVercelUrl?: string
): Promise<void> {
  const clientName = config.companyName || 'Cliente';
  const slug = cleanClientSlug(clientName);
  const vercelUrl = customVercelUrl || getClientVercelUrl(clientName);

  const zip = new JSZip();

  // 1. Generate standalone HTML for the client mini site
  const htmlContent = await generateMiniSiteStandaloneHtml(config);
  zip.file('index.html', htmlContent);

  // 2. Generate vercel.json
  zip.file('vercel.json', generateVercelConfigJson(clientName));

  // 3. Generate package.json
  zip.file('package.json', generateVercelPackageJson(clientName));

  // 4. Generate README.md
  zip.file('README.md', generateVercelReadme(clientName, vercelUrl));

  // 5. Generate .gitignore
  zip.file('.gitignore', 'node_modules\n.vercel\n.env\n.DS_Store\n');

  // 6. Generate INSTRUCOES_VERCEL.html
  zip.file('INSTRUCOES_VERCEL.html', generateVercelInstructionsHtml(clientName, vercelUrl));

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `minisite_${slug}_vercel.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateVercelClientPitchWhatsapp(
  clientName: string,
  vercelUrl: string,
  niche: string
): string {
  return `Olá, tudo bem? 🚀

Seu novo *Mini Site Oficial de ${clientName}* está pronto e otimizado para celulares e placas NFC!

✨ *Seu link exclusivo para clientes:*
👉 ${vercelUrl}

🌟 *O que já está configurado no seu site:*
⭐ *Avaliação 5 Estrelas no Google* (botão direto para turbinar seu perfil)
💬 *WhatsApp 1-Clique* para atendimento rápido
⚡ *Pix Copia e Cola + QR Code* com sua chave oficial
📶 *Wi-Fi Instantâneo por QR Code* (clientes conectam sem digitar senha)
📍 *Localização GPS & Rota* no Google Maps e Waze
📸 *Instagram & Redes Sociais*

🚀 *Hospedagem:*
O site foi estruturado para carregar em menos de 1 segundo em qualquer celular, sem travamentos.

Você pode colocar este link na sua **Bio do Instagram**, no seu **WhatsApp Business** e na sua **Placa NFC Inteligente**!

Abraço e ótimas vendas! 🏆`;
}
