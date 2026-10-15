import QRCode from 'qrcode';
import JSZip from 'jszip';
import { getPlateIdentification } from './plateNumberHelper';

export interface DynamicQrItem {
  id: string;
  name: string;
  permanentUrl: string;
  targetUrl: string;
  activeRedirect?: string;
  niche?: string;
  city?: string;
  status: 'active' | 'pending' | 'suspended';
}

/**
 * Gera um Data URL (base64 PNG) do QR Code usando a biblioteca offline QRCode
 */
export async function generateQrDataUrl(
  text: string,
  options: {
    width?: number;
    margin?: number;
    darkColor?: string;
    lightColor?: string;
  } = {}
): Promise<string> {
  const { width = 600, margin = 2, darkColor = '#000000', lightColor = '#ffffff' } = options;
  return QRCode.toDataURL(text, {
    width,
    margin,
    color: {
      dark: darkColor,
      light: lightColor,
    },
    errorCorrectionLevel: 'H',
  });
}

/**
 * Gera o código SVG vetorial puro do QR Code
 */
export async function generateQrSvg(
  text: string,
  options: {
    width?: number;
    margin?: number;
  } = {}
): Promise<string> {
  const { width = 400, margin = 2 } = options;
  return QRCode.toString(text, {
    type: 'svg',
    width,
    margin,
    errorCorrectionLevel: 'H',
  });
}

/**
 * Faz o download direto de um Data URL como arquivo PNG
 */
export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Gera e baixa um pacote ZIP contendo todos os QR Codes em PNG HD
 * mais um arquivo CSV e um manual TXT explicativo
 */
export async function downloadBatchQrZip(
  items: DynamicQrItem[],
  zipFilename = 'qrcodes_dinamicos_lote.zip',
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder('qrcodes_png_hd');

  let csvContent = 'ID,Numero_Placa,Numero_Romano,Nome,Link Permanente (Fixo),URL de Destino Atual,Status\n';

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const plateInfo = getPlateIdentification(item.name, item.id, i + 1);
    const indexStr = plateInfo.numStr || String(i + 1).padStart(2, '0');
    const romanTag = plateInfo.roman ? `[${plateInfo.roman}]_` : '';
    const safeName = item.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '_');

    // Gera PNG do QR Code (alta resolução 1000x1000)
    const dataUrl = await generateQrDataUrl(item.permanentUrl, {
      width: 1000,
      margin: 3,
    });
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');

    const filePrefix = `${indexStr}_${romanTag}${item.id}_${safeName}.png`;
    folder?.file(filePrefix, base64Data, { base64: true });

    const safeTarget = (item.targetUrl || 'Ainda não configurado (Em aberto)').replace(/"/g, '""');
    csvContent += `"${item.id}","${indexStr}","${plateInfo.roman || '-'}","${item.name}","${item.permanentUrl}","${safeTarget}","${item.status}"\n`;

    if (onProgress) {
      onProgress(i + 1, items.length);
    }
  }

  // Adiciona a planilha de controle CSV
  zip.file('tabela_controle_qrcodes.csv', '\uFEFF' + csvContent); // \uFEFF para UTF-8 BOM no Excel

  // Adiciona instruções em TXT
  const readme = `========================================================================
ALF AUTOMAÇÃO - PACOTE DE QR CODES DINÂMICOS GERADOS EM LOTE
========================================================================

Total de Códigos neste pacote: ${items.length} unidades

COMO FUNCIONA O QR CODE DINÂMICO INTELIGENTE:
1. O QR Code físico gerado NUNCA muda! Você pode imprimi-lo em adesivos,
   placas de acrílico de balcão, totens, cartões ou displays de mesa.
2. Cada imagem PNG nesta pasta aponta para um link permanente no seu servidor.
3. Você pode alterar a URL de destino de cada um deles quantas vezes quiser
   através do painel web da ALF Automação (aba QR Codes Dinâmicos ou Portal).
4. Se o QR code for escaneado antes de você cadastrar o link, ele exibe
   uma página amigável avisando que está reservado para aquele estabelecimento.

ARQUIVOS INCLUÍDOS:
- Pasta /qrcodes_png_hd: Todas as imagens PNG em 1000x1000 px de alta definição.
- tabela_controle_qrcodes.csv: Planilha com o mapeamento completo de cada código.

Suporte e Personalizações: ALF Automação Comercial
Data de Geração: ${new Date().toLocaleString('pt-BR')}
========================================================================`;

  zip.file('INSTRUCOES_QRCODES_DINAMICOS.txt', readme);

  // Gera o arquivo ZIP final e dispara o download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = zipFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Abre a janela de impressão com todos os QR Codes em formato de cartela / etiquetas
 */
export async function openBatchPrintWindow(
  items: DynamicQrItem[],
  title = 'Cartela de QR Codes Dinâmicos'
): Promise<void> {
  const printWindow = window.open('', '_blank', 'width=1000,height=900');
  if (!printWindow) {
    alert('Por favor, libere os pop-ups no seu navegador para imprimir as etiquetas.');
    return;
  }

  // Pre-generate QR Code images for print
  const cardsHtml: string[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const plateInfo = getPlateIdentification(item.name, item.id, i + 1);
    const dataUrl = await generateQrDataUrl(item.permanentUrl, {
      width: 400,
      margin: 1,
    });

    cardsHtml.push(`
      <div class="qr-card">
        <!-- Discreet plate number stamp on left side (Roman numeral or #ID) -->
        <div class="stamp-left-plate" title="Número da Placa Físico (Algarismo Romano Discreto)">
          ${plateInfo.leftEdgeTag || `Nº ${plateInfo.numStr}`}
        </div>

        <div class="header">
          <span class="badge">${plateInfo.roman ? `PLACA ${plateInfo.roman}` : `PLACA #${plateInfo.numStr}`}</span>
          <span class="brand">ALF AUTOMAÇÃO</span>
        </div>
        <div class="title">${item.name}</div>
        <div class="qr-box">
          <img src="${dataUrl}" alt="QR Code ${item.name}" />
        </div>
        <div class="cta">APONTE A CÂMERA DO CELULAR</div>
        <div class="link-label">${item.permanentUrl}</div>
        <div class="dest-preview">Destino: ${item.targetUrl ? item.targetUrl : 'Aguardando link'}</div>
        <div class="plate-footer-left">
          <span>${plateInfo.roman ? `Nº ${plateInfo.roman} (#${plateInfo.numStr})` : `Nº ${plateInfo.numStr}`}</span>
        </div>
      </div>
    `);
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>${title} - ${items.length} Unidades</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
        body { background: #f1f5f9; color: #0f172a; padding: 24px; }
        
        .toolbar {
          max-width: 900px;
          margin: 0 auto 24px auto;
          background: #ffffff;
          padding: 16px 24px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
          flex-wrap: wrap;
          gap: 12px;
        }
        .btn-print {
          background: #0284c7;
          color: #ffffff;
          border: none;
          padding: 10px 24px;
          font-size: 14px;
          font-weight: 800;
          border-radius: 10px;
          cursor: pointer;
        }
        .btn-print:hover { background: #0369a1; }
        
        .grid-container {
          max-width: 1000px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .qr-card {
          background: #ffffff;
          border: 2px dashed #cbd5e1;
          border-radius: 18px;
          padding: 20px;
          text-align: center;
          page-break-inside: avoid;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          position: relative;
        }

        .stamp-left-plate {
          position: absolute;
          left: 10px;
          bottom: 10px;
          font-size: 8px;
          font-weight: 800;
          font-family: monospace;
          color: #475569;
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          padding: 2px 6px;
          border-radius: 4px;
          letter-spacing: 0.5px;
        }

        .plate-footer-left {
          font-size: 8.5px;
          font-weight: 800;
          color: #94a3b8;
          letter-spacing: 0.5px;
          margin-top: 4px;
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          margin-bottom: 8px;
        }
        .badge {
          background: #0284c7;
          color: white;
          font-size: 10px;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 6px;
          letter-spacing: 0.5px;
        }
        .brand {
          font-size: 10px;
          font-weight: 800;
          color: #64748b;
          letter-spacing: 1px;
        }
        .title {
          font-size: 18px;
          font-weight: 900;
          color: #0f172a;
          margin-bottom: 12px;
        }
        .qr-box {
          background: white;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          margin-bottom: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.04);
        }
        .qr-box img {
          display: block;
          width: 180px;
          height: 180px;
        }
        .cta {
          font-size: 11px;
          font-weight: 800;
          color: #0369a1;
          background: #e0f2fe;
          padding: 4px 12px;
          border-radius: 20px;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        .link-label {
          font-size: 11px;
          font-family: monospace;
          color: #475569;
          word-break: break-all;
          margin-bottom: 4px;
        }
        .dest-preview {
          font-size: 10px;
          color: #94a3b8;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        @media print {
          body { background: white; padding: 0; }
          .no-print { display: none !important; }
          .grid-container {
            max-width: 100%;
            gap: 16px;
            grid-template-columns: repeat(2, 1fr);
          }
          .qr-card {
            border: 1.5px dashed #94a3b8;
            box-shadow: none !important;
            padding: 16px;
          }
        }
      </style>
    </head>
    <body>
      <div class="toolbar no-print">
        <div>
          <h2 style="font-size: 16px; font-weight: 800;">Folha de Impressão de Etiquetas (${items.length} QR Codes)</h2>
          <p style="font-size: 12px; color: #64748b;">Pronto para corte e colagem em placas acrílicas, balcões ou totens de mesa.</p>
          <div style="display: flex; gap: 6px; align-items: center; margin-top: 6px; font-size: 11px; color: #0369a1; background: #e0f2fe; padding: 4px 10px; border-radius: 6px;">
            <span>🏷️ <strong>Identificação Discreta no Canto Esquerdo:</strong> Cada adesivo contém o número da placa em algarismo romano discreto (Nº I, Nº IV, etc.) para você identificar a placa física e vincular facilmente na hora da venda sem revelar contagem aos clientes.</span>
          </div>
        </div>
        <button class="btn-print" onclick="window.print()">🖨️ Imprimir Agora</button>
      </div>

      <div class="grid-container">
        ${cardsHtml.join('')}
      </div>
    </body>
    </html>
  `);

  printWindow.document.close();
}
