import QRCode from 'qrcode';
import JSZip from 'jszip';
import { generateQrDataUrl } from './qrCodeGenerator';
import { getPlateIdentification } from './plateNumberHelper';

export type ArtworkTheme =
  | 'emerald_green'
  | 'royal_blue'
  | 'official_google'
  | 'black_gold'
  | 'acrylic_crystal'
  | 'cyber_neon'
  | 'rose_luxury'
  | 'gourmet_red'
  | 'instagram_dual'
  | 'instagram_official';

export interface ArtworkOptions {
  businessName?: string;
  leadId?: string;
  niche?: string;
  city?: string;
  rating?: number;
  reviewCount?: number;
  weakness?: string;
  permanentUrl: string;
  googleUrl?: string;
  instagramUrl?: string;
  instagramHandle?: string;
  tiktokUrl?: string;
  socialNetworkType?: 'instagram' | 'tiktok';
  qrTargetMode?: 'dynamic' | 'direct';
  theme?: ArtworkTheme;
  format?: 'plate_10x10' | 'card_54x85_horizontal' | 'card_54x85_vertical';
  resolution?: '4k' | '2.4k';
}

/**
 * Official Google Colors
 */
export const GOOGLE_COLORS = {
  blue: '#4285F4',
  red: '#EA4335',
  yellow: '#FBBC05',
  green: '#34A853',
};

/**
 * Draw Official Google "G" Logo
 */
function drawGoogleGLogo(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number
) {
  ctx.save();
  ctx.translate(cx, cy);

  const scale = radius / 12;
  ctx.scale(scale, scale);

  const drawPath = (d: string, color: string) => {
    ctx.fillStyle = color;
    const p = new Path2D(d);
    ctx.fill(p);
  };

  // Google G 4-color official vector paths centered around (12, 12)
  ctx.translate(-12, -12);

  // Blue
  drawPath(
    'M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z',
    GOOGLE_COLORS.blue
  );
  // Green
  drawPath(
    'M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z',
    GOOGLE_COLORS.green
  );
  // Yellow
  drawPath(
    'M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z',
    GOOGLE_COLORS.yellow
  );
  // Red
  drawPath(
    'M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z',
    GOOGLE_COLORS.red
  );

  ctx.restore();
}

/**
 * Official Instagram Camera Glyph Vector
 */
export function drawInstagramCameraLogo(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string = '#ffffff'
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = size * 0.095;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const half = size / 2;
  const radius = size * 0.28;

  // Outer rounded square
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(-half, -half, size, size, radius);
  } else {
    ctx.rect(-half, -half, size, size);
  }
  ctx.stroke();

  // Center camera lens
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.26, 0, Math.PI * 2);
  ctx.stroke();

  // Flash dot (top-right)
  ctx.beginPath();
  ctx.arc(half * 0.56, -half * 0.56, size * 0.065, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Official Full-Color Instagram Gradient Badge with Glass Specular Highlights
 * Vector-sharp at any resolution (4K / 600 DPI) with official Meta brand gradient.
 */
export function drawInstagramOfficialBadge(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  options?: {
    shadow?: boolean;
    gloss?: boolean;
  }
) {
  const { shadow = true, gloss = true } = options || {};
  ctx.save();
  ctx.translate(cx, cy);

  const half = size / 2;
  const radius = size * 0.23;

  if (shadow) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = size * 0.12;
    ctx.shadowOffsetY = size * 0.05;
  }

  // Authentic Instagram multi-color gradient
  // Linear 45-degree angle gradient base
  const grad = ctx.createLinearGradient(-half, half, half, -half);
  grad.addColorStop(0.0, '#ffd600'); // Yellow bottom-left
  grad.addColorStop(0.12, '#ff7a00'); // Orange
  grad.addColorStop(0.35, '#ff0069'); // Magenta/Pink
  grad.addColorStop(0.65, '#d300c5'); // Purple
  grad.addColorStop(1.0, '#7638fa'); // Royal violet-blue top-right

  ctx.fillStyle = grad;
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(-half, -half, size, size, radius);
  } else {
    ctx.rect(-half, -half, size, size);
  }
  ctx.fill();

  // Radial overlay at bottom-left corner for true authentic Instagram look
  ctx.shadowColor = 'transparent';
  const radialGlow = ctx.createRadialGradient(-half * 0.85, half * 0.85, 0, -half * 0.85, half * 0.85, size * 0.9);
  radialGlow.addColorStop(0.0, 'rgba(255, 220, 90, 0.85)');
  radialGlow.addColorStop(0.4, 'rgba(255, 90, 40, 0.45)');
  radialGlow.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = radialGlow;
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(-half, -half, size, size, radius);
  } else {
    ctx.rect(-half, -half, size, size);
  }
  ctx.fill();

  // Glass Specular gloss reflection across top rim
  if (gloss) {
    const glossGrad = ctx.createLinearGradient(0, -half, 0, 0);
    glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0.38)');
    glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = glossGrad;
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(-half, -half, size, half * 0.7, [radius, radius, 0, 0]);
    } else {
      ctx.rect(-half, -half, size, half * 0.7);
    }
    ctx.fill();
  }

  // Outer border rim
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = Math.max(1.5, size * 0.015);
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(-half, -half, size, size, radius);
  } else {
    ctx.rect(-half, -half, size, size);
  }
  ctx.stroke();

  // Inner Official White Camera Glyph
  const cameraSize = size * 0.62;
  const camHalf = cameraSize / 2;
  const camRadius = cameraSize * 0.28;

  ctx.strokeStyle = '#ffffff';
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = cameraSize * 0.105;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Outer squircle
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(-camHalf, -camHalf, cameraSize, cameraSize, camRadius);
  } else {
    ctx.rect(-camHalf, -camHalf, cameraSize, cameraSize);
  }
  ctx.stroke();

  // Center lens
  ctx.beginPath();
  ctx.arc(0, 0, cameraSize * 0.255, 0, Math.PI * 2);
  ctx.stroke();

  // Flash dot
  ctx.beginPath();
  ctx.arc(camHalf * 0.58, -camHalf * 0.58, cameraSize * 0.07, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Photo-Style NFC Phone with Hand & Curved Arched Text
 * Replicates the exact vector style from the uploaded reference photo:
 * - Arched text "Aproxime seu Telefone"
 * - Clean white vector phone with "NFC" screen badge
 * - Radiowaves emitting sideways
 * - Hand contour holding the phone
 */
export function drawPhotoStyleNfcGraphic(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number = 1,
  flipHorizontal: boolean = false
) {
  ctx.save();
  ctx.translate(cx, cy);
  if (flipHorizontal) {
    ctx.scale(-scale, scale);
  } else {
    ctx.scale(scale, scale);
  }

  // Curved text: "Aproxime seu Telefone" along an arc above the phone
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 18.5px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.textAlign = 'center';
  
  const text = 'Aproxime seu Telefone';
  const radius = 112;
  const totalAngle = Math.PI * 0.50; // ~90 degrees arc
  const startAngle = -Math.PI / 2 - totalAngle / 2;
  const angleStep = totalAngle / (text.length - 1);

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const angle = startAngle + i * angleStep;
    const charX = radius * Math.cos(angle);
    const charY = radius * Math.sin(angle) + 16;

    ctx.save();
    ctx.translate(charX, charY);
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillText(char, 0, 0);
    ctx.restore();
  }
  ctx.restore();

  // Contactless Radio Waves on the left
  ctx.strokeStyle = '#ffffff';
  ctx.lineCap = 'round';
  ctx.lineWidth = 3.8;

  // Wave 1 (inner)
  ctx.beginPath();
  ctx.arc(-26, 0, 20, -Math.PI * 0.38, Math.PI * 0.38, false);
  ctx.stroke();

  // Wave 2 (middle)
  ctx.beginPath();
  ctx.arc(-26, 0, 34, -Math.PI * 0.38, Math.PI * 0.38, false);
  ctx.stroke();

  // Wave 3 (outer)
  ctx.beginPath();
  ctx.arc(-26, 0, 48, -Math.PI * 0.38, Math.PI * 0.38, false);
  ctx.stroke();

  // Phone body outline
  ctx.lineWidth = 4.2;
  const phoneX = 8;
  const phoneY = -52;
  const phoneW = 54;
  const phoneH = 104;
  const phoneR = 12;

  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(phoneX, phoneY, phoneW, phoneH, phoneR);
  } else {
    ctx.rect(phoneX, phoneY, phoneW, phoneH);
  }
  ctx.stroke();

  // Phone ear speaker notch
  ctx.beginPath();
  ctx.moveTo(phoneX + phoneW / 2 - 8, phoneY + 8);
  ctx.lineTo(phoneX + phoneW / 2 + 8, phoneY + 8);
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Screen outline
  ctx.lineWidth = 1.5;
  ctx.strokeRect(phoneX + 5, phoneY + 16, phoneW - 10, phoneH - 32);

  // "NFC" text inside screen
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 17px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('NFC', phoneX + phoneW / 2, phoneY + 44);

  // Small radio wave below NFC text
  ctx.beginPath();
  ctx.arc(phoneX + phoneW / 2, phoneY + 60, 8, -Math.PI * 0.3, Math.PI * 0.3, false);
  ctx.lineWidth = 2;
  ctx.stroke();

  // Hand outline holding phone
  ctx.lineWidth = 3.6;
  ctx.beginPath();
  // Thumb resting on side of phone
  ctx.moveTo(phoneX + phoneW + 2, phoneY + 45);
  ctx.bezierCurveTo(phoneX + phoneW + 18, phoneY + 50, phoneX + phoneW + 20, phoneY + 68, phoneX + phoneW + 12, phoneY + 82);
  // Palm line
  ctx.lineTo(phoneX + phoneW + 24, phoneY + 115);
  // Fingers wrap around front bottom
  ctx.moveTo(phoneX + phoneW - 8, phoneY + 80);
  ctx.lineTo(phoneX + phoneW + 12, phoneY + 82);
  ctx.moveTo(phoneX + phoneW - 8, phoneY + 95);
  ctx.lineTo(phoneX + phoneW + 8, phoneY + 98);
  ctx.stroke();

  ctx.restore();
}

/**
 * Organic Fluid White S-Curve Wave Separator for Instagram + Google Plate
 */
function drawInstagramGoogleWave(ctx: CanvasRenderingContext2D, width: number, splitY: number, margin: number) {
  ctx.save();

  // Soft drop shadow beneath wave onto the blue section
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;

  // Fluid S-curve wave band
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(margin, splitY - 14);
  ctx.bezierCurveTo(
    width * 0.28, splitY + 48,
    width * 0.72, splitY - 52,
    width - margin, splitY + 22
  );
  ctx.lineTo(width - margin, splitY + 46);
  ctx.bezierCurveTo(
    width * 0.72, splitY - 28,
    width * 0.28, splitY + 72,
    margin, splitY + 10
  );
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * 3D Metallic Standoff Bolt with Chamfered Rim & Screw Slot
 */
function drawStandoffBolt(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number = 32) {
  ctx.save();
  ctx.translate(x, y);

  // Drop shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;

  // Outer metallic gradient
  const grad = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, 2, 0, 0, radius);
  grad.addColorStop(0.0, '#ffffff');
  grad.addColorStop(0.4, '#e2e8f0');
  grad.addColorStop(0.85, '#94a3b8');
  grad.addColorStop(1.0, '#64748b');

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Screw slot
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-radius * 0.45, 0);
  ctx.lineTo(radius * 0.45, 0);
  ctx.stroke();

  ctx.restore();
}

/**
 * Realistic 3D Faceted Metallic Gold Star ("Amarelo Meio Dourado")
 * 5-pointed star with dual-facet shading for embossed 3D relief,
 * vibrant warm golden yellow luster (#FBBF24 / #F59E0B / #FDE047),
 * specular highlights, and clean amber glow matching the 3D totem.
 */
function drawRealistic3DStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number
) {
  const points: { outX: number; outY: number; inX: number; inY: number; prevInX: number; prevInY: number }[] = [];
  const startAngle = -Math.PI / 2;
  const step = (Math.PI * 2) / 5;
  const halfStep = Math.PI / 5;

  ctx.save();

  // Warm golden ambient drop shadow
  ctx.shadowColor = 'rgba(217, 119, 6, 0.4)';
  ctx.shadowBlur = outerRadius * 0.3;
  ctx.shadowOffsetY = outerRadius * 0.12;

  // Precompute vertices
  for (let i = 0; i < 5; i++) {
    const tipAngle = startAngle + i * step;
    const valleyAngle = tipAngle + halfStep;
    const prevValleyAngle = tipAngle - halfStep;

    points.push({
      outX: cx + Math.cos(tipAngle) * outerRadius,
      outY: cy + Math.sin(tipAngle) * outerRadius,
      inX: cx + Math.cos(valleyAngle) * innerRadius,
      inY: cy + Math.sin(valleyAngle) * innerRadius,
      prevInX: cx + Math.cos(prevValleyAngle) * innerRadius,
      prevInY: cy + Math.sin(prevValleyAngle) * innerRadius,
    });
  }

  // Draw 5 points with faceted 3D relief in "amarelo meio dourado"
  points.forEach((pt) => {
    // 1. Lit Facet (Left side): bright luminous warm yellow-gold
    const litGrad = ctx.createLinearGradient(cx, cy, pt.outX, pt.outY);
    litGrad.addColorStop(0.0, '#fffef0'); // luminous warm gold center
    litGrad.addColorStop(0.3, '#fef08a'); // soft bright yellow
    litGrad.addColorStop(0.65, '#fde047'); // yellow-300
    litGrad.addColorStop(1.0, '#fbbf24'); // amber-400 (rich golden yellow)

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(pt.prevInX, pt.prevInY);
    ctx.lineTo(pt.outX, pt.outY);
    ctx.closePath();
    ctx.fillStyle = litGrad;
    ctx.fill();

    // 2. Shadow Facet (Right side): rich warm golden-amber depth (clean gold, no dark brown!)
    const shadowGrad = ctx.createLinearGradient(cx, cy, pt.outX, pt.outY);
    shadowGrad.addColorStop(0.0, '#facc15'); // bright gold
    shadowGrad.addColorStop(0.5, '#fbbf24'); // warm amber gold
    shadowGrad.addColorStop(0.9, '#f59e0b'); // deep amber
    shadowGrad.addColorStop(1.0, '#d97706'); // warm golden edge (pure amber depth)

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(pt.outX, pt.outY);
    ctx.lineTo(pt.inX, pt.inY);
    ctx.closePath();
    ctx.fillStyle = shadowGrad;
    ctx.fill();
  });

  // Center specular micro-gem (bright golden glint)
  ctx.shadowColor = 'transparent';
  ctx.beginPath();
  ctx.arc(cx, cy, innerRadius * 0.38, 0, Math.PI * 2);
  const centerGlint = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerRadius * 0.38);
  centerGlint.addColorStop(0.0, '#ffffff');
  centerGlint.addColorStop(0.5, '#fef08a');
  centerGlint.addColorStop(0.85, '#fbbf24');
  centerGlint.addColorStop(1.0, 'transparent');
  ctx.fillStyle = centerGlint;
  ctx.fill();

  // Subtle crisp golden star outline for razor-sharp definition
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const pt = points[i];
    if (i === 0) ctx.moveTo(pt.outX, pt.outY);
    else ctx.lineTo(pt.outX, pt.outY);
    ctx.lineTo(pt.inX, pt.inY);
  }
  ctx.closePath();
  ctx.lineWidth = Math.max(1, outerRadius * 0.035);
  ctx.strokeStyle = '#f59e0b';
  ctx.stroke();

  ctx.restore();
}

/**
 * Standard CRC-32 table for embedding accurate PNG pHYs chunks
 */
const crcTable: number[] = (() => {
  const table: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
})();

function crc32(buf: Uint8Array): number {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

/**
 * Embeds physical print resolution (pHYs chunk) into a PNG data URL
 * so that Photoshop, CorelDRAW, Illustrator, InDesign, Windows Photo Viewer,
 * and commercial print shops recognize exact DPI (e.g. 600 DPI = 23622 pixels/meter).
 */
export function setPngDpi(dataUrl: string, dpi: number = 600): string {
  try {
    const parts = dataUrl.split(',');
    if (parts.length !== 2) return dataUrl;
    const binary = atob(parts[1]);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    // Verify PNG header signature (89 50 4E 47 0D 0A 1A 0A)
    if (bytes[0] !== 0x89 || bytes[1] !== 0x50 || bytes[2] !== 0x4e || bytes[3] !== 0x47) {
      return dataUrl;
    }

    // Calculate pixels per meter: dpi / 0.0254
    const ppm = Math.round(dpi / 0.0254);

    // Build pHYs data: 4 bytes ppm_x, 4 bytes ppm_y, 1 byte unit (1 = meter)
    const physData = new Uint8Array(9);
    const view = new DataView(physData.buffer);
    view.setUint32(0, ppm, false);
    view.setUint32(4, ppm, false);
    physData[8] = 1;

    // CRC of chunk type + data
    const crcInput = new Uint8Array(4 + 9);
    crcInput.set([0x70, 0x48, 0x59, 0x73], 0); // 'pHYs'
    crcInput.set(physData, 4);
    const crc = crc32(crcInput);

    // Build full chunk: 4 bytes len (9) + 4 bytes 'pHYs' + 9 bytes data + 4 bytes CRC = 21 bytes
    const physChunk = new Uint8Array(21);
    const chunkView = new DataView(physChunk.buffer);
    chunkView.setUint32(0, 9, false);
    physChunk.set([0x70, 0x48, 0x59, 0x73], 4);
    physChunk.set(physData, 8);
    chunkView.setUint32(17, crc, false);

    // In PNG, IHDR ends at byte 33 (8 + 25). Insert pHYs immediately after IHDR.
    const insertPos = 33;
    const newBytes = new Uint8Array(bytes.length + physChunk.length);
    newBytes.set(bytes.subarray(0, insertPos), 0);
    newBytes.set(physChunk, insertPos);
    newBytes.set(bytes.subarray(insertPos), insertPos + physChunk.length);

    let binaryStr = '';
    const sliceSize = 8192;
    for (let i = 0; i < newBytes.length; i += sliceSize) {
      binaryStr += String.fromCharCode.apply(null, Array.from(newBytes.subarray(i, i + sliceSize)));
    }
    return 'data:image/png;base64,' + btoa(binaryStr);
  } catch (err) {
    console.warn('Could not inject DPI into PNG header:', err);
    return dataUrl;
  }
}

/**
 * Official High-Definition Contactless NFC Vector Graphic (Card & Totem)
 */
function drawOfficialContactlessNfcIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  strokeColor: string = '#0f172a'
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  const phoneW = 200;
  const phoneH = 350;
  const phoneRadius = 36;

  ctx.shadowColor = 'rgba(15, 23, 42, 0.12)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 6;

  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(-phoneW / 2, -phoneH / 2, phoneW, phoneH, phoneRadius);
  } else {
    ctx.rect(-phoneW / 2, -phoneH / 2, phoneW, phoneH);
  }
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = strokeColor;
  ctx.stroke();

  const screenMargin = 12;
  const screenW = phoneW - screenMargin * 2;
  const screenH = phoneH - screenMargin * 2;
  const screenRadius = phoneRadius - 8;

  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(-screenW / 2, -screenH / 2, screenW, screenH, screenRadius);
  } else {
    ctx.rect(-screenW / 2, -screenH / 2, screenW, screenH);
  }
  const screenGrad = ctx.createLinearGradient(0, -screenH / 2, 0, screenH / 2);
  screenGrad.addColorStop(0, '#f8fafc');
  screenGrad.addColorStop(1, '#f1f5f9');
  ctx.fillStyle = screenGrad;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#e2e8f0';
  ctx.stroke();

  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(-24, -phoneH / 2 + 14, 48, 8, 4);
  } else {
    ctx.rect(-24, -phoneH / 2 + 14, 48, 8);
  }
  ctx.fillStyle = strokeColor;
  ctx.fill();

  const waveCenterY = -14;
  const waveRadii = [34, 56, 78, 100];
  const waveAngles = 0.38 * Math.PI;

  waveRadii.forEach((r, idx) => {
    ctx.beginPath();
    ctx.arc(0, waveCenterY, r, -Math.PI / 2 - waveAngles, -Math.PI / 2 + waveAngles, false);
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.strokeStyle = idx === waveRadii.length - 1 ? '#1a73e8' : (idx === 2 ? '#2563eb' : strokeColor);
    ctx.stroke();
  });

  ctx.beginPath();
  ctx.arc(0, waveCenterY, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#1a73e8';
  ctx.fill();

  ctx.save();
  ctx.translate(0, 70);

  const badgeW = 126;
  const badgeH = 76;
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(-badgeW / 2, -badgeH / 2, badgeW, badgeH, 18);
  } else {
    ctx.rect(-badgeW / 2, -badgeH / 2, badgeW, badgeH);
  }
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = strokeColor;
  ctx.stroke();

  ctx.fillStyle = strokeColor;
  ctx.font = '900 36px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '3px';
  ctx.fillText('NFC', 0, -4);

  ctx.fillStyle = '#1a73e8';
  ctx.font = '800 11px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.letterSpacing = '1.5px';
  ctx.fillText('TOUCH', 0, 20);

  ctx.restore();

  ctx.beginPath();
  ctx.moveTo(-32, phoneH / 2 - 20);
  ctx.lineTo(32, phoneH / 2 - 20);
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#94a3b8';
  ctx.stroke();

  ctx.restore();
}

/**
 * Official High-Definition Contactless NFC Interaction Graphic
 * Perfectly matches the 3D totem simulator layout:
 * - Rounded container card with subtle border & background
 * - Left: Blue contactless radio waves radiating toward the phone
 * - Right: Sleek upright smartphone with top speaker pill, bottom home bar,
 *   and the official NFC contactless symbol perfectly centered & aligned INSIDE the phone screen.
 * 100% vector-drawn for ultra-crisp 600 DPI printing.
 */
export function drawOfficialSmartphoneNfc(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number = 1.35,
  theme: ArtworkTheme = 'emerald_green'
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Accent color based on theme
  let accentColor = '#2563eb'; // Google Blue default
  if (theme === 'emerald_green') {
    accentColor = '#059669';
  } else if (theme === 'royal_blue') {
    accentColor = '#2563eb';
  }

  // -------------------------------------------------------------------------
  // 1. OUTER CONTAINER CARD (Matches 3D Totem's rounded card box)
  // -------------------------------------------------------------------------
  const cardW = 380;
  const cardH = 340;
  const cardR = 36;

  // Soft ambient drop shadow
  ctx.save();
  ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;

  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, cardR);
  } else {
    ctx.rect(-cardW / 2, -cardH / 2, cardW, cardH);
  }
  ctx.fillStyle = '#f8fafc';
  ctx.fill();
  ctx.restore();

  // Card border
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#e2e8f0';
  ctx.stroke();

  // -------------------------------------------------------------------------
  // 2. LEFT COLUMN: CONTACTLESS RADIO WAVES (Radiating toward phone)
  // -------------------------------------------------------------------------
  const waveCX = -94;
  const waveCY = 0;
  const waveRadii = [30, 56, 82];
  const arcSpan = 0.38 * Math.PI;

  waveRadii.forEach((r, idx) => {
    ctx.beginPath();
    ctx.arc(waveCX, waveCY, r, -arcSpan, arcSpan, false);
    ctx.lineWidth = 9;
    ctx.strokeStyle = idx === 0 ? '#3b82f6' : idx === 1 ? '#2563eb' : '#1d4ed8';
    ctx.stroke();
  });

  // Small radio wave origin dot
  ctx.beginPath();
  ctx.arc(waveCX, waveCY, 7.5, 0, Math.PI * 2);
  ctx.fillStyle = '#2563eb';
  ctx.fill();

  // -------------------------------------------------------------------------
  // 3. RIGHT COLUMN: MODERN UPRIGHT SMARTPHONE (WITH CENTERED NFC SYMBOL)
  // -------------------------------------------------------------------------
  const phoneCX = 66;
  const phoneCY = 0;
  const phoneW = 144;
  const phoneH = 246;
  const phoneR = 26;

  // Phone drop shadow
  ctx.save();
  ctx.shadowColor = 'rgba(15, 23, 42, 0.12)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 8;

  // Phone body outline
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(phoneCX - phoneW / 2, phoneCY - phoneH / 2, phoneW, phoneH, phoneR);
  } else {
    ctx.rect(phoneCX - phoneW / 2, phoneCY - phoneH / 2, phoneW, phoneH);
  }
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.restore();

  // Phone outer bezel stroke
  ctx.lineWidth = 9;
  ctx.strokeStyle = '#0f172a';
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(phoneCX - phoneW / 2, phoneCY - phoneH / 2, phoneW, phoneH, phoneR);
  } else {
    ctx.rect(phoneCX - phoneW / 2, phoneCY - phoneH / 2, phoneW, phoneH);
  }
  ctx.stroke();

  // Inner Screen
  const screenMargin = 7;
  const screenW = phoneW - screenMargin * 2;
  const screenH = phoneH - screenMargin * 2;
  const screenR = phoneR - 5;

  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(phoneCX - screenW / 2, phoneCY - screenH / 2, screenW, screenH, screenR);
  } else {
    ctx.rect(phoneCX - screenW / 2, phoneCY - screenH / 2, screenW, screenH);
  }
  const screenGrad = ctx.createLinearGradient(phoneCX, phoneCY - screenH / 2, phoneCX, phoneCY + screenH / 2);
  screenGrad.addColorStop(0, '#ffffff');
  screenGrad.addColorStop(0.5, '#f8fafc');
  screenGrad.addColorStop(1, '#f1f5f9');
  ctx.fillStyle = screenGrad;
  ctx.fill();

  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#e2e8f0';
  ctx.stroke();

  // Speaker notch / dynamic island pill at top of phone
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(phoneCX - 22, phoneCY - phoneH / 2 + 14, 44, 7, 3.5);
  } else {
    ctx.rect(phoneCX - 22, phoneCY - phoneH / 2 + 14, 44, 7);
  }
  ctx.fillStyle = '#0f172a';
  ctx.fill();

  // Bottom home indicator bar
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(phoneCX - 22, phoneCY + phoneH / 2 - 16, 44, 4.5, 2.25);
  } else {
    ctx.rect(phoneCX - 22, phoneCY + phoneH / 2 - 16, 44, 4.5);
  }
  ctx.fillStyle = '#94a3b8';
  ctx.fill();

  // -------------------------------------------------------------------------
  // 4. NFC SYMBOL & LOGO - DEAD CENTER INSIDE THE SMARTPHONE SCREEN
  // -------------------------------------------------------------------------
  const nfcCenterY = phoneCY + 4;

  // Mini contactless radio wave arcs right above the NFC text (centered inside phone)
  const miniWaveCY = nfcCenterY - 36;
  const miniRadii = [14, 25];
  miniRadii.forEach((r, idx) => {
    ctx.beginPath();
    ctx.arc(phoneCX, miniWaveCY, r, -Math.PI * 0.72, -Math.PI * 0.28, false);
    ctx.lineWidth = 4.5;
    ctx.strokeStyle = idx === 1 ? '#2563eb' : '#0f172a';
    ctx.stroke();
  });

  // Small radio wave dot
  ctx.beginPath();
  ctx.arc(phoneCX, miniWaveCY, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#2563eb';
  ctx.fill();

  // Bold "NFC" Typography centered inside the phone screen
  ctx.fillStyle = '#0f172a';
  ctx.font = '900 38px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '2px';
  ctx.fillText('NFC', phoneCX, nfcCenterY + 4);

  // Subtle clean pill badge below NFC
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(phoneCX - 32, nfcCenterY + 30, 64, 16, 8);
  } else {
    ctx.rect(phoneCX - 32, nfcCenterY + 30, 64, 16);
  }
  ctx.fillStyle = 'rgba(37, 99, 235, 0.08)';
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(37, 99, 235, 0.25)';
  ctx.stroke();

  ctx.fillStyle = '#2563eb';
  ctx.font = '800 9px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.letterSpacing = '1px';
  ctx.fillText('TOUCH', phoneCX, nfcCenterY + 38);

  ctx.restore(); // restore global
}

/**
 * Backward compatibility alias for drawOfficialSmartphoneNfc
 */
export const drawOfficialHandAndPhoneNfc = drawOfficialSmartphoneNfc;

/**
 * Draw Themed Fluid Energy Ribbon (Verde Esmeralda, Azul Royal ou Google 4-Cores)
 */
function drawThemedWavingRibbon(
  ctx: CanvasRenderingContext2D,
  margin: number,
  width: number,
  splitY: number,
  waveHeight: number,
  theme: ArtworkTheme = 'emerald_green'
) {
  ctx.save();

  // Layer 1: Ambient Neon Back-Glow
  const glowH = waveHeight * 2.2;
  const glowGrad = ctx.createLinearGradient(margin, splitY, width - margin, splitY);

  if (theme === 'emerald_green') {
    glowGrad.addColorStop(0.0, 'rgba(16, 185, 129, 0.55)');
    glowGrad.addColorStop(0.35, 'rgba(245, 158, 11, 0.45)');
    glowGrad.addColorStop(0.7, 'rgba(52, 211, 153, 0.65)');
    glowGrad.addColorStop(1.0, 'rgba(5, 150, 105, 0.55)');
  } else if (theme === 'royal_blue') {
    glowGrad.addColorStop(0.0, 'rgba(37, 99, 235, 0.55)');
    glowGrad.addColorStop(0.35, 'rgba(2, 132, 199, 0.55)');
    glowGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.65)');
    glowGrad.addColorStop(1.0, 'rgba(30, 64, 175, 0.55)');
  } else {
    // Official Google Colors
    glowGrad.addColorStop(0.0, 'rgba(234, 67, 53, 0.45)');
    glowGrad.addColorStop(0.3, 'rgba(251, 188, 5, 0.45)');
    glowGrad.addColorStop(0.6, 'rgba(52, 168, 83, 0.45)');
    glowGrad.addColorStop(1.0, 'rgba(66, 133, 244, 0.55)');
  }

  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.moveTo(margin, splitY - 20);
  ctx.bezierCurveTo(width * 0.28, splitY + 55, width * 0.72, splitY - 55, width - margin, splitY + 20);
  ctx.lineTo(width - margin, splitY + 20 + glowH);
  ctx.bezierCurveTo(width * 0.72, splitY - 55 + glowH, width * 0.28, splitY + 55 + glowH, margin, splitY - 20 + glowH);
  ctx.closePath();
  ctx.filter = 'blur(16px)';
  ctx.fill();
  ctx.filter = 'none';

  // Layer 2: Core Vibrant Fluid Wave
  const coreGrad = ctx.createLinearGradient(margin, splitY, width - margin, splitY);
  if (theme === 'emerald_green') {
    coreGrad.addColorStop(0.0, '#047857');
    coreGrad.addColorStop(0.25, '#10b981');
    coreGrad.addColorStop(0.5, '#fbbf24'); // Golden center edge
    coreGrad.addColorStop(0.75, '#34d399');
    coreGrad.addColorStop(1.0, '#059669');
  } else if (theme === 'royal_blue') {
    coreGrad.addColorStop(0.0, '#1d4ed8');
    coreGrad.addColorStop(0.3, '#3b82f6');
    coreGrad.addColorStop(0.65, '#0284c7');
    coreGrad.addColorStop(1.0, '#38bdf8');
  } else {
    coreGrad.addColorStop(0.0, GOOGLE_COLORS.red);
    coreGrad.addColorStop(0.28, GOOGLE_COLORS.yellow);
    coreGrad.addColorStop(0.58, GOOGLE_COLORS.green);
    coreGrad.addColorStop(0.92, GOOGLE_COLORS.blue);
  }

  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.moveTo(margin, splitY - 12);
  ctx.bezierCurveTo(width * 0.28, splitY + 45, width * 0.72, splitY - 45, width - margin, splitY + 12);
  ctx.lineTo(width - margin, splitY + 12 + waveHeight);
  ctx.bezierCurveTo(width * 0.72, splitY - 45 + waveHeight, width * 0.28, splitY + 45 + waveHeight, margin, splitY - 12 + waveHeight);
  ctx.closePath();
  ctx.fill();

  // Layer 3: Specular High-Tech Upper Rim Light
  ctx.beginPath();
  ctx.moveTo(margin, splitY - 12);
  ctx.bezierCurveTo(width * 0.28, splitY + 45, width * 0.72, splitY - 45, width - margin, splitY + 12);
  const rimGrad = ctx.createLinearGradient(margin, splitY, width - margin, splitY);
  if (theme === 'emerald_green') {
    rimGrad.addColorStop(0.0, 'rgba(254, 240, 138, 0.6)');
    rimGrad.addColorStop(0.3, 'rgba(251, 191, 36, 0.95)');
    rimGrad.addColorStop(0.7, 'rgba(254, 240, 138, 0.95)');
    rimGrad.addColorStop(1.0, 'rgba(52, 211, 153, 0.85)');
  } else if (theme === 'royal_blue') {
    rimGrad.addColorStop(0.0, 'rgba(186, 230, 253, 0.6)');
    rimGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.95)');
    rimGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.95)');
    rimGrad.addColorStop(1.0, 'rgba(125, 211, 252, 0.85)');
  } else {
    rimGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.4)');
    rimGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.95)');
    rimGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.95)');
    rimGrad.addColorStop(1.0, 'rgba(224, 242, 254, 0.85)');
  }
  ctx.strokeStyle = rimGrad;
  ctx.lineWidth = 6;
  ctx.stroke();

  ctx.restore();
}

/**
 * Draw QR Code with Corner Framing Brackets [ ⌜ ⌝ ⌞ ⌟ ] & Dashed Guideline Box
 * Identical to the official Google Review Mockup reference!
 */
function drawQrWithBrackets(
  ctx: CanvasRenderingContext2D,
  qrImg: HTMLImageElement,
  x: number,
  y: number,
  size: number
) {
  ctx.save();

  // Corner brackets parameters
  const bracketLen = size * 0.22;
  const bracketOffset = 24;
  const radius = 22;

  const left = x - bracketOffset;
  const right = x + size + bracketOffset;
  const top = y - bracketOffset;
  const bottom = y + size + bracketOffset;

  // Thin dashed guideline box connecting brackets (as in the mockup!)
  ctx.save();
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(left, top, right - left, bottom - top, radius);
  } else {
    ctx.rect(left, top, right - left, bottom - top);
  }
  ctx.setLineDash([12, 10]);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#cbd5e1';
  ctx.stroke();
  ctx.restore();

  // Draw QR Matrix
  ctx.drawImage(qrImg, x, y, size, size);

  // Center Google G Emblem inside QR Code
  const centerRadius = size * 0.12;
  const centerCX = x + size / 2;
  const centerCY = y + size / 2;

  ctx.beginPath();
  ctx.arc(centerCX, centerCY, centerRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
  ctx.shadowBlur = 18;
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#f1f5f9';
  ctx.stroke();

  drawGoogleGLogo(ctx, centerCX, centerCY, centerRadius * 0.72);

  // 4 Bold Corner Framing Brackets [ ⌜ ⌝ ⌞ ⌟ ]
  ctx.lineWidth = 14;
  ctx.strokeStyle = '#0f172a';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Top Left Bracket
  ctx.beginPath();
  ctx.moveTo(left, top + bracketLen);
  ctx.lineTo(left, top + radius);
  ctx.arcTo(left, top, left + radius, top, radius);
  ctx.lineTo(left + bracketLen, top);
  ctx.stroke();

  // Top Right Bracket
  ctx.beginPath();
  ctx.moveTo(right - bracketLen, top);
  ctx.lineTo(right - radius, top);
  ctx.arcTo(right, top, right, top + radius, radius);
  ctx.lineTo(right, top + bracketLen);
  ctx.stroke();

  // Bottom Left Bracket
  ctx.beginPath();
  ctx.moveTo(left, bottom - bracketLen);
  ctx.lineTo(left, bottom - radius);
  ctx.arcTo(left, bottom, left + radius, bottom, radius);
  ctx.lineTo(left + bracketLen, bottom);
  ctx.stroke();

  // Bottom Right Bracket
  ctx.beginPath();
  ctx.moveTo(right - bracketLen, bottom);
  ctx.lineTo(right - radius, bottom);
  ctx.arcTo(right, bottom, right, bottom - radius, radius);
  ctx.lineTo(right, bottom - bracketLen);
  ctx.stroke();

  ctx.restore();
}

/**
 * Image loader helper
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Dual Hybrid Plate: Instagram + Google Reviews (Matching Uploaded Real Photo)
 */
async function drawInstagramDualPlate(
  ctx: CanvasRenderingContext2D,
  options: ArtworkOptions,
  width: number,
  height: number,
  margin: number,
  plateW: number,
  plateH: number,
  plateRadius: number
): Promise<void> {
  const {
    businessName = '',
    leadId = 'TAG01',
    permanentUrl,
    googleUrl,
    instagramUrl,
    instagramHandle,
    tiktokUrl,
    socialNetworkType = 'instagram',
    qrTargetMode = 'dynamic'
  } = options;

  // Split Position: Split horizontally around Y = 1140
  const splitY = 1140;

  // 1. TOP HALF: Instagram Vibrant Gradient
  const instaGrad = ctx.createLinearGradient(margin, 0, width - margin, splitY);
  instaGrad.addColorStop(0.0, '#75187e'); // Deep purple
  instaGrad.addColorStop(0.2, '#8d2282'); // Purple
  instaGrad.addColorStop(0.45, '#c52e77'); // Magenta
  instaGrad.addColorStop(0.7, '#e34157'); // Coral pink
  instaGrad.addColorStop(0.88, '#f75f3a'); // Orange
  instaGrad.addColorStop(1.0, '#faa23f'); // Amber gold edge
  ctx.fillStyle = instaGrad;
  ctx.fillRect(0, 0, width, splitY + 40);

  // Soft radiant glow on top-right of Instagram section
  const topGlow = ctx.createRadialGradient(width * 0.75, 420, 40, width * 0.75, 420, 850);
  topGlow.addColorStop(0, 'rgba(255, 160, 60, 0.35)');
  topGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, width, splitY + 40);

  // 2. BOTTOM HALF: Google Royal Blue Gradient
  const blueGrad = ctx.createLinearGradient(margin, splitY, width - margin, height);
  blueGrad.addColorStop(0.0, '#0c3a82'); // Deep Google Blue
  blueGrad.addColorStop(0.35, '#1052ab');
  blueGrad.addColorStop(0.7, '#1565c0');
  blueGrad.addColorStop(1.0, '#0a3272');
  ctx.fillStyle = blueGrad;
  ctx.fillRect(0, splitY - 10, width, height - splitY + 10);

  // 3. ORGANIC WHITE WAVE SEPARATOR
  drawInstagramGoogleWave(ctx, width, splitY, margin);

  // Differentiate Dynamic / Direct URLs for Top Social (Instagram/TikTok) and Bottom Google
  const isDynamic = qrTargetMode === 'dynamic' || permanentUrl.includes('/r/') || permanentUrl.includes('/redirect/') || permanentUrl.includes('/qr/');
  const isTikTok = socialNetworkType === 'tiktok';

  // 1. Bottom QR: Google Reviews URL
  let effectiveGoogleUrl = '';
  if (googleUrl && googleUrl.trim().length > 0) {
    effectiveGoogleUrl = googleUrl;
  } else if (isDynamic) {
    const baseClean = permanentUrl.split('?')[0];
    effectiveGoogleUrl = `${baseClean}?to=google`;
  } else {
    effectiveGoogleUrl = permanentUrl;
  }

  // 2. Top QR: Social URL (Instagram or TikTok)
  let effectiveSocialUrl = '';
  if (isTikTok) {
    if (!isDynamic && tiktokUrl && tiktokUrl.trim().length > 0) {
      effectiveSocialUrl = tiktokUrl.startsWith('http') ? tiktokUrl : `https://tiktok.com/@${tiktokUrl.replace(/^@/, '')}`;
    } else if (isDynamic) {
      const baseClean = permanentUrl.split('?')[0];
      effectiveSocialUrl = `${baseClean}?to=tiktok`;
    } else {
      effectiveSocialUrl = tiktokUrl || `https://tiktok.com`;
    }
  } else {
    const rawInsta = (instagramUrl || '').trim();
    const handleClean = (instagramHandle || '').replace(/^@/, '').trim();
    if (!isDynamic && (rawInsta || handleClean)) {
      if (rawInsta.startsWith('http')) {
        effectiveSocialUrl = rawInsta;
      } else if (rawInsta) {
        effectiveSocialUrl = `https://instagram.com/${rawInsta.replace(/^@/, '')}`;
      } else {
        effectiveSocialUrl = `https://instagram.com/${handleClean}`;
      }
    } else if (isDynamic) {
      const baseClean = permanentUrl.split('?')[0];
      effectiveSocialUrl = `${baseClean}?to=instagram`;
    } else {
      effectiveSocialUrl = rawInsta || `https://instagram.com`;
    }
  }

  const [googleQrDataUrl, instaQrDataUrl] = await Promise.all([
    generateQrDataUrl(effectiveGoogleUrl, { width: 1000, margin: 1 }),
    generateQrDataUrl(effectiveSocialUrl, { width: 1000, margin: 1 })
  ]);

  const [googleQrImg, instaQrImg] = await Promise.all([
    loadImage(googleQrDataUrl),
    loadImage(instaQrDataUrl)
  ]);

  // ============================================================================
  // TOP SECTION: INSTAGRAM (LEFT: QR CODE | CENTER: INSTAGRAM LOGO | RIGHT: NFC)
  // ============================================================================
  const topQrCX = 560;
  const topQrCY = 510;
  const topQrSize = 350;

  // Top Left: "leia o QR Code"
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = '700 36px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.fillText('leia o QR Code', topQrCX, topQrCY - topQrSize / 2 - 25);

  // QR Code Frosted Card
  const pad = 18;
  const cardW = topQrSize + pad * 2;
  const cardH = topQrSize + pad * 2;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(topQrCX - cardW / 2, topQrCY - cardH / 2, cardW, cardH, 28);
  } else {
    ctx.rect(topQrCX - cardW / 2, topQrCY - cardH / 2, cardW, cardH);
  }
  ctx.fill();
  ctx.stroke();

  // Draw Instagram QR
  ctx.drawImage(instaQrImg, topQrCX - topQrSize / 2, topQrCY - topQrSize / 2, topQrSize, topQrSize);

  // Subtitle / ID below QR code: e.g. "z1v9ef • INSTAGRAM"
  const topCode = leadId ? leadId.substring(0, 6).toLowerCase() : 'z1v9ef';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.font = '800 26px "JetBrains Mono", monospace';
  ctx.fillText(`${topCode} • ${isTikTok ? 'TIKTOK' : 'INSTAGRAM'}`, topQrCX, topQrCY + topQrSize / 2 + 45);
  ctx.restore();

  // Top Center: Instagram Camera Glyph + "Siga-nos no Instagram"
  const instaLogoCY = 490;
  drawInstagramCameraLogo(ctx, width / 2, instaLogoCY, 185);

  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 4;
  ctx.font = '900 52px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.letterSpacing = '1px';
  ctx.fillText('Siga-nos no Instagram', width / 2, 850);

  if (instagramHandle && instagramHandle.trim().length > 0) {
    ctx.font = '800 36px "Plus Jakarta Sans", "Inter", sans-serif';
    ctx.fillStyle = '#fef08a'; // Light gold accent for @handle
    ctx.fillText(`@${instagramHandle.replace('@', '')}`, width / 2, 915);
  } else if (businessName && businessName.trim().length > 0) {
    ctx.font = '700 32px "Plus Jakarta Sans", "Inter", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillText(businessName, width / 2, 915);
  }
  ctx.restore();

  // Top Right: Smartphone with NFC Touch Illustration
  const topNfcCX = 1840;
  const topNfcCY = 500;
  drawPhotoStyleNfcGraphic(ctx, topNfcCX, topNfcCY, 1.85, false);

  // ============================================================================
  // BOTTOM SECTION: GOOGLE REVIEWS (LEFT: NFC | CENTER: "G" | RIGHT: QR CODE)
  // ============================================================================
  // Bottom Top: "Sua opinião Importa" + 5 Gold Stars
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = '900 58px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.letterSpacing = '1.5px';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 4;
  ctx.fillText('Sua opinião Importa', width / 2, 1370);

  // 5 Spaced Realistic 3D Gold Stars
  const starY = 1450;
  const starSpacing = 72;
  const starStartX = width / 2 - starSpacing * 2;
  for (let i = 0; i < 5; i++) {
    drawRealistic3DStar(ctx, starStartX + i * starSpacing, starY, 30, 13);
  }
  ctx.restore();

  // Bottom Center: Circular Google "G" Medallion
  const badgeCX = width / 2;
  const badgeCY = 1760;
  const badgeRadius = 160;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 14;

  // Outer Bevel Ring
  const outerRimRadius = badgeRadius + 12;
  const rimGrad = ctx.createLinearGradient(badgeCX - outerRimRadius, badgeCY - outerRimRadius, badgeCX + outerRimRadius, badgeCY + outerRimRadius);
  rimGrad.addColorStop(0.0, '#ffffff');
  rimGrad.addColorStop(0.4, '#e2e8f0');
  rimGrad.addColorStop(0.8, '#cbd5e1');
  rimGrad.addColorStop(1.0, '#94a3b8');

  ctx.beginPath();
  ctx.arc(badgeCX, badgeCY, outerRimRadius, 0, Math.PI * 2);
  ctx.fillStyle = rimGrad;
  ctx.fill();

  // Inner White Disc
  ctx.shadowColor = 'transparent';
  ctx.beginPath();
  ctx.arc(badgeCX, badgeCY, badgeRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  ctx.lineWidth = 4;
  ctx.strokeStyle = '#f1f5f9';
  ctx.stroke();

  drawGoogleGLogo(ctx, badgeCX, badgeCY, 120);
  ctx.restore();

  // Bottom Left: Smartphone with NFC Touch Illustration
  const botNfcCX = 560;
  const botNfcCY = 1750;
  drawPhotoStyleNfcGraphic(ctx, botNfcCX, botNfcCY, 1.85, false);

  // Bottom Right: Google Reviews QR Code
  const botQrCX = 1840;
  const botQrCY = 1750;
  const botQrSize = 350;

  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = '700 36px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.fillText('leia o QR Code', botQrCX, botQrCY - botQrSize / 2 - 25);

  // QR Code Frosted Card
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(botQrCX - cardW / 2, botQrCY - cardH / 2, cardW, cardH, 28);
  } else {
    ctx.rect(botQrCX - cardW / 2, botQrCY - cardH / 2, cardW, cardH);
  }
  ctx.fill();
  ctx.stroke();

  // Draw Google QR
  ctx.drawImage(googleQrImg, botQrCX - botQrSize / 2, botQrCY - botQrSize / 2, botQrSize, botQrSize);

  // Subtitle / ID below QR code: e.g. "w3d7ul • GOOGLE 5★"
  const botCode = leadId ? leadId.substring(Math.max(0, leadId.length - 6)).toLowerCase() : 'w3d7ul';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.font = '800 26px "JetBrains Mono", monospace';
  ctx.fillText(`${botCode} • GOOGLE 5★`, botQrCX, botQrCY + botQrSize / 2 + 45);
  ctx.restore();

  // Discreet plate identification on lower-left (Roman numeral / serial tag)
  const plateInfo = getPlateIdentification(leadId, businessName);
  const plateTag = plateInfo.leftEdgeTag || (plateInfo.roman ? `Nº ${plateInfo.roman}` : (plateInfo.numStr ? `Nº ${plateInfo.numStr}` : ''));
  if (plateTag) {
    ctx.save();
    ctx.font = '800 24px "Plus Jakarta Sans", "JetBrains Mono", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '1px';
    ctx.fillText(plateTag, margin + 45, height - margin - 45);
    ctx.restore();
  }

  // 4 Metallic Corner Standoff Bolts
  drawStandoffBolt(ctx, margin + 58, margin + 58, 32);
  drawStandoffBolt(ctx, width - margin - 58, margin + 58, 32);
  drawStandoffBolt(ctx, margin + 58, height - margin - 58, 32);
  drawStandoffBolt(ctx, width - margin - 58, height - margin - 58, 32);
}

/**
 * ============================================================================
 * PLACA 10cm x 10cm - MODELO EXCLUSIVO 100% INSTAGRAM OFICIAL (ULTRA HD 600 DPI)
 * Design profissional de balcão / totem em acrílico com Logo Oficial em Alta Resolução,
 * QR Code de altíssima precisão direcionando para o perfil, NFC Contactless,
 * arroba em destaque e acabamento chanfrado.
 * ============================================================================
 */
async function drawInstagramOfficialPlate(
  ctx: CanvasRenderingContext2D,
  options: ArtworkOptions,
  width: number,
  height: number,
  margin: number,
  plateW: number,
  plateH: number,
  plateRadius: number
): Promise<void> {
  const {
    businessName = '',
    leadId = 'TAG01',
    permanentUrl,
    instagramUrl,
    instagramHandle
  } = options;

  // Split Position: Header takes ~45% (1080 px)
  const splitY = 1080;

  // 1. BOTTOM BASE: Pure Clean White Acrylic (#ffffff)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // 2. TOP HERO: Iconic Instagram Sunset Gradient
  const instaGrad = ctx.createLinearGradient(margin, margin, width - margin, splitY);
  instaGrad.addColorStop(0.0, '#405de6'); // Royal violet-blue
  instaGrad.addColorStop(0.18, '#5851db'); // Deep purple
  instaGrad.addColorStop(0.38, '#833ab4'); // Purple
  instaGrad.addColorStop(0.58, '#c13584'); // Magenta
  instaGrad.addColorStop(0.76, '#e1306c'); // Coral pink
  instaGrad.addColorStop(0.90, '#fd1d1d'); // Red orange
  instaGrad.addColorStop(1.0, '#f77737'); // Sunset amber
  ctx.fillStyle = instaGrad;
  ctx.fillRect(0, 0, width, splitY);

  // Radiant warm corner glow on top-right and violet glow on top-left
  const warmGlow = ctx.createRadialGradient(width * 0.85, 300, 30, width * 0.85, 300, 850);
  warmGlow.addColorStop(0.0, 'rgba(255, 214, 0, 0.45)');
  warmGlow.addColorStop(0.5, 'rgba(255, 122, 0, 0.25)');
  warmGlow.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = warmGlow;
  ctx.fillRect(0, 0, width, splitY);

  const purpleGlow = ctx.createRadialGradient(margin + 200, 350, 40, margin + 200, 350, 900);
  purpleGlow.addColorStop(0.0, 'rgba(118, 56, 250, 0.35)');
  purpleGlow.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = purpleGlow;
  ctx.fillRect(0, 0, width, splitY);

  // Instagram Wavy Separator Ribbon
  const ribbonH = 46;
  ctx.save();
  const ribbonGrad = ctx.createLinearGradient(margin, splitY, width - margin, splitY);
  ribbonGrad.addColorStop(0.0, '#ffd600');
  ribbonGrad.addColorStop(0.3, '#ff0069');
  ribbonGrad.addColorStop(0.7, '#d300c5');
  ribbonGrad.addColorStop(1.0, '#7638fa');
  ctx.fillStyle = ribbonGrad;
  ctx.shadowColor = 'rgba(225, 48, 108, 0.45)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 6;
  ctx.beginPath();
  ctx.moveTo(margin, splitY - 14);
  ctx.bezierCurveTo(width * 0.35, splitY + 22, width * 0.65, splitY - 32, width - margin, splitY + 12);
  ctx.lineTo(width - margin, splitY + ribbonH);
  ctx.bezierCurveTo(width * 0.65, splitY - 32 + ribbonH, width * 0.35, splitY + 22 + ribbonH, margin, splitY - 14 + ribbonH);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Thin pristine white highlight on ribbon top
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(margin, splitY - 14);
  ctx.bezierCurveTo(width * 0.35, splitY + 22, width * 0.65, splitY - 32, width - margin, splitY + 12);
  ctx.stroke();
  ctx.restore();

  // Determine Instagram Handle & Destination
  const cleanHandle = (instagramHandle || instagramUrl || '')
    .replace(/.*instagram\.com\//, '')
    .replace(/^@/, '')
    .replace(/\/.*$/, '')
    .trim();
  const displayHandle = cleanHandle || (businessName ? businessName.replace(/\s+/g, '').toLowerCase() : 'seuperfil');
  const effectiveInstaUrl = instagramUrl && instagramUrl.trim().length > 0
    ? (instagramUrl.startsWith('http') ? instagramUrl : `https://instagram.com/${instagramUrl.replace(/^@/, '')}`)
    : cleanHandle
    ? `https://instagram.com/${cleanHandle}`
    : permanentUrl;

  // Load High-Precision QR Code pointing to Instagram
  const qrDataUrl = await generateQrDataUrl(effectiveInstaUrl, {
    width: 1200,
    margin: 1,
    darkColor: '#000000',
    lightColor: '#ffffff'
  });
  const qrImg = await loadImage(qrDataUrl);

  // TOP SECTION CONTENT (HERO)
  // 1. Official Instagram Logo Badge (Prominent High-Resolution)
  const logoCY = 310;
  const logoSize = 250;
  drawInstagramOfficialBadge(ctx, width / 2, logoCY, logoSize, { shadow: true, gloss: true });

  // 2. Call to Action: "Siga-nos no Instagram"
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 4;
  ctx.font = '900 68px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.letterSpacing = '1.5px';
  ctx.fillText('Siga-nos no Instagram', width / 2, 530);

  // 3. Subtitle / Business Name
  const clientName = (businessName && businessName.trim().length > 0) ? businessName.trim().toUpperCase() : 'SUA EMPRESA';
  ctx.font = '800 38px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.letterSpacing = '2px';
  ctx.fillText(clientName, width / 2, 600);
  ctx.restore();

  // 4. Highlighted Instagram Handle Badge (@perfil)
  const handlePillY = 665;
  const handlePillH = 92;
  const handleText = `@${displayHandle}`;
  ctx.save();
  ctx.font = '900 48px "Plus Jakarta Sans", "Inter", sans-serif';
  const handleW = ctx.measureText(handleText).width + 120;
  const pillX = width / 2 - handleW / 2;

  // Dark translucent background with golden border for the handle
  ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 6;
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(pillX, handlePillY, handleW, handlePillH, handlePillH / 2);
  } else {
    ctx.rect(pillX, handlePillY, handleW, handlePillH);
  }
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Small camera icon inside pill on left
  drawInstagramCameraLogo(ctx, pillX + 54, handlePillY + handlePillH / 2, 40, '#fef08a');

  // Text inside pill
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '1px';
  ctx.fillText(handleText, width / 2 + 22, handlePillY + handlePillH / 2);
  ctx.restore();

  // Subtitle note
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.textAlign = 'center';
  ctx.font = '700 32px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.fillText('Acompanhe nossas novidades, fotos e promoções!', width / 2, 805);
  ctx.restore();

  // BOTTOM WHITE ACRYLIC: SYMMETRICAL INTERACTION COLUMNS (NFC | OU | QR CODE)
  const bottomCenterY = splitY + (height - splitY) / 2 + 10;
  const leftColCX = width * 0.28;
  const rightColCX = width * 0.72;

  // Center "OU" Medallion
  ctx.save();
  ctx.beginPath();
  ctx.arc(width / 2, bottomCenterY, 48, 0, Math.PI * 2);
  ctx.fillStyle = '#f8fafc';
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#cbd5e1';
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = '900 40px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('OU', width / 2, bottomCenterY);
  ctx.restore();

  // LEFT COLUMN: OFFICIAL SMARTPHONE NFC
  ctx.save();
  ctx.fillStyle = '#0f172a';
  ctx.font = '900 56px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '1px';
  ctx.fillText('Aproxime seu celular', leftColCX, bottomCenterY - 370);
  ctx.restore();

  // Smartphone vector with Instagram gradient wave accents
  drawOfficialSmartphoneNfc(ctx, leftColCX, bottomCenterY - 10, 1.48, 'instagram_official');

  ctx.save();
  ctx.fillStyle = '#64748b';
  ctx.font = '700 32px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Sem aplicativo • Direto no perfil', leftColCX, bottomCenterY + 380);
  ctx.restore();

  // RIGHT COLUMN: DYNAMIC INSTAGRAM QR CODE
  ctx.save();
  ctx.fillStyle = '#0f172a';
  ctx.font = '900 56px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '1px';
  ctx.fillText('Aponte a câmera', rightColCX, bottomCenterY - 370);
  ctx.restore();

  const qrSize = 640;
  const qrX = rightColCX - qrSize / 2;
  const qrY = bottomCenterY - qrSize / 2 - 10;
  drawQrWithBrackets(ctx, qrImg, qrX, qrY, qrSize);

  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#64748b';
  ctx.font = '700 32px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.fillText('⚡ Abra o Instagram em 3s', rightColCX, bottomCenterY + 380);
  ctx.restore();

  // FOOTER BASELINE
  const footerY = height - margin - 45;
  const footerText = 'ALF AUTOMAÇÃO • PLACA INSTAGRAM NFC & QR';
  ctx.save();
  ctx.font = '800 24px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.letterSpacing = '4px';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const textW = ctx.measureText(footerText).width;

  ctx.beginPath();
  ctx.moveTo(width / 2 - textW / 2 - 120, footerY);
  ctx.lineTo(width / 2 - textW / 2 - 30, footerY);
  ctx.moveTo(width / 2 + textW / 2 + 30, footerY);
  ctx.lineTo(width / 2 + textW / 2 + 120, footerY);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#cbd5e1';
  ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.fillText(footerText, width / 2, footerY);
  ctx.restore();

  // Plate Identification Tag
  const plateInfo = getPlateIdentification(leadId, businessName);
  const plateTag = plateInfo.leftEdgeTag || (plateInfo.roman ? `Nº ${plateInfo.roman}` : (plateInfo.numStr ? `Nº ${plateInfo.numStr}` : ''));
  if (plateTag) {
    ctx.save();
    ctx.font = '800 24px "Plus Jakarta Sans", "JetBrains Mono", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '1px';
    ctx.fillText(plateTag, margin + 45, footerY);
    ctx.restore();
  }

  // 4 Metallic Corner Standoff Bolts
  drawStandoffBolt(ctx, margin + 58, margin + 58, 32);
  drawStandoffBolt(ctx, width - margin - 58, margin + 58, 32);
  drawStandoffBolt(ctx, margin + 58, height - margin - 58, 32);
  drawStandoffBolt(ctx, width - margin - 58, height - margin - 58, 32);
}

/**
 * ============================================================================
 * PLACA 10cm x 10cm - MODELO OFICIAL GOOGLE REVIEW NFC (ULTRA HD 600 DPI)
 * Proporções perfeitamente alinhadas e idênticas aos modelos de referência
 * verde esmeralda / azul royal / preto piano / instagram duplo / instagram 100%:
 * ============================================================================
 */
export async function generatePlate10x10DataUrl(
  options: ArtworkOptions,
  resolution: '4k' | '2.4k' = '4k'
): Promise<string> {
  const {
    businessName = '',
    leadId = 'TAG01',
    permanentUrl,
    theme = 'emerald_green'
  } = options;

  // Ultra HD: 4000 x 4000 px @ 600 DPI (4K Ultra-HD), or 2400 x 2400 px
  const baseSize = 2400;
  const targetSize = (options.resolution === '2.4k' || resolution === '2.4k') ? 2400 : 4000;

  const canvas = document.createElement('canvas');
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Falha ao inicializar o Canvas 2D');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Scale from base 2400 coordinate space to target 4K canvas
  const scale = targetSize / baseSize;
  ctx.scale(scale, scale);

  const width = baseSize;
  const height = baseSize;

  // 1. Acrylic Outer Plate Contour (Rounded rectangle with chamfered edge)
  const plateRadius = 90;
  const margin = 28; // Bleed margin for laser cut & edge finishing
  const plateW = width - margin * 2;
  const plateH = height - margin * 2;

  ctx.save();
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(margin, margin, plateW, plateH, plateRadius);
  } else {
    ctx.rect(margin, margin, plateW, plateH);
  }
  ctx.clip();

  // If theme is 100% Instagram Official
  if (theme === 'instagram_official') {
    await drawInstagramOfficialPlate(ctx, options, width, height, margin, plateW, plateH, plateRadius);

    // Restore clipping path and draw acrylic outer bevel
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(margin, margin, plateW, plateH, plateRadius);
    } else {
      ctx.rect(margin, margin, plateW, plateH);
    }
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#e2e8f0';
    ctx.stroke();
    ctx.restore();

    return setPngDpi(canvas.toDataURL('image/png'), 600);
  }

  // If theme is Instagram Dual, execute the dual layout matching the uploaded photo
  if (theme === 'instagram_dual') {
    await drawInstagramDualPlate(ctx, options, width, height, margin, plateW, plateH, plateRadius);

    // Restore clipping path and draw acrylic outer bevel
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(margin, margin, plateW, plateH, plateRadius);
    } else {
      ctx.rect(margin, margin, plateW, plateH);
    }
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#e2e8f0';
    ctx.stroke();
    ctx.restore();

    return setPngDpi(canvas.toDataURL('image/png'), 600);
  }

  // Split Position: Top Section takes ~45% of total height (1080 px)
  const splitY = 1080;

  // 2. BOTTOM HALF: Pure Clean White Acrylic (#ffffff)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // 3. TOP HALF: Themed Background (Verde Esmeralda, Azul Royal ou Preto Piano)
  if (theme === 'emerald_green') {
    const greenGrad = ctx.createLinearGradient(0, 0, width, splitY);
    greenGrad.addColorStop(0.0, '#02180d');
    greenGrad.addColorStop(0.35, '#05331b');
    greenGrad.addColorStop(0.7, '#084d29');
    greenGrad.addColorStop(1.0, '#031a0e');
    ctx.fillStyle = greenGrad;
    ctx.fillRect(0, 0, width, splitY);

    const topGlow = ctx.createRadialGradient(width / 2, 220, 50, width / 2, 450, 1150);
    topGlow.addColorStop(0, 'rgba(16, 185, 129, 0.45)');
    topGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = topGlow;
    ctx.fillRect(0, 0, width, splitY);
  } else if (theme === 'royal_blue') {
    const blueGrad = ctx.createLinearGradient(0, 0, width, splitY);
    blueGrad.addColorStop(0.0, '#02122b');
    blueGrad.addColorStop(0.35, '#062454');
    blueGrad.addColorStop(0.7, '#0b3d88');
    blueGrad.addColorStop(1.0, '#041738');
    ctx.fillStyle = blueGrad;
    ctx.fillRect(0, 0, width, splitY);

    const topGlow = ctx.createRadialGradient(width / 2, 220, 50, width / 2, 450, 1150);
    topGlow.addColorStop(0, 'rgba(59, 130, 246, 0.45)');
    topGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = topGlow;
    ctx.fillRect(0, 0, width, splitY);
  } else {
    // Piano Black
    ctx.fillStyle = '#080808';
    ctx.fillRect(0, 0, width, splitY);

    const topGlow = ctx.createRadialGradient(width / 2, 220, 50, width / 2, 450, 1150);
    topGlow.addColorStop(0, 'rgba(30, 41, 59, 0.5)');
    topGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = topGlow;
    ctx.fillRect(0, 0, width, splitY);
  }

  // 4. THEMED WAVING FLUID ENERGY RIBBON
  const waveHeight = 68;
  drawThemedWavingRibbon(ctx, margin, width, splitY, waveHeight, theme);

  // ============================================================================
  // TOP SECTION: 3D REALISTIC SPACED STARS & HERO HEADLINE
  // ============================================================================
  // 5 Golden Realistic 3D Faceted Stars Spaced Out Elegantly
  const starY = margin + 140;
  const starSpacing = 180;
  const startStarX = width / 2 - starSpacing * 2;
  for (let i = 0; i < 5; i++) {
    drawRealistic3DStar(ctx, startStarX + i * starSpacing, starY, 62, 27);
  }

  // Headline Typography
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';

  // Line 1: NÓS ADORARÍAMOS A SUA
  ctx.font = '900 58px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.letterSpacing = '3px';
  ctx.fillText('NÓS ADORARÍAMOS A SUA', width / 2, starY + 145);

  // Line 2: AVALIAÇÃO NO GOOGLE
  ctx.font = '900 80px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.letterSpacing = '4px';
  ctx.fillText('AVALIAÇÃO NO GOOGLE', width / 2, starY + 255);

  // Line 3: HERO CLIENT TAG (Ex: DANI PONTELLO) - SE PREENCHIDO
  const clientNameText = (businessName && businessName.trim().length > 0 ? businessName.trim() : '').toUpperCase();
  if (clientNameText.length > 0) {
    let clientFontSize = 120;
    const maxClientWidth = width - 360;

    ctx.font = `900 ${clientFontSize}px "Plus Jakarta Sans", "Inter", sans-serif`;
    while (ctx.measureText(clientNameText).width > maxClientWidth && clientFontSize > 64) {
      clientFontSize -= 4;
      ctx.font = `900 ${clientFontSize}px "Plus Jakarta Sans", "Inter", sans-serif`;
    }

    const textWidth = ctx.measureText(clientNameText).width;
    const goldGrad = ctx.createLinearGradient(width / 2 - textWidth / 2, starY + 415, width / 2 + textWidth / 2, starY + 415);
    goldGrad.addColorStop(0.0, '#fffbeb');
    goldGrad.addColorStop(0.2, '#fef08a');
    goldGrad.addColorStop(0.6, '#fbbf24');
    goldGrad.addColorStop(1.0, '#f59e0b');

    ctx.fillStyle = goldGrad;
    ctx.shadowColor = 'rgba(245, 158, 11, 0.45)';
    ctx.shadowBlur = 24;
    ctx.letterSpacing = '2px';
    ctx.fillText(clientNameText, width / 2, starY + 415);

    // Subtle Gold Accent Lines
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 5;
    ctx.beginPath();
    const lineExtent = Math.min(textWidth / 2 + 50, 750);
    ctx.moveTo(width / 2 - lineExtent, starY + 445);
    ctx.lineTo(width / 2 + lineExtent, starY + 445);
    ctx.stroke();

    // Line 4: Friendly Encouragement subtitle
    ctx.fillStyle = '#f1f5f9';
    ctx.font = '700 36px "Plus Jakarta Sans", "Inter", sans-serif';
    ctx.letterSpacing = '0.5px';
    ctx.fillText('Sua opinião de 5 estrelas é muito importante para nós!', width / 2, starY + 540);
  } else {
    // If no client name, center the encouragement subtitle with elegant presence
    ctx.fillStyle = '#f1f5f9';
    ctx.font = '700 42px "Plus Jakarta Sans", "Inter", sans-serif';
    ctx.letterSpacing = '0.5px';
    ctx.fillText('Sua opinião de 5 estrelas é muito importante para nós!', width / 2, starY + 420);
  }

  ctx.restore();

  // ============================================================================
  // CENTER CIRCULAR GOOGLE "G" MEDALLION WITH 3D METALLIC RIM
  // ============================================================================
  const badgeRadius = 165;
  const badgeCX = width / 2;
  const badgeCY = splitY + waveHeight / 2;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 45;
  ctx.shadowOffsetY = 16;

  // Outer Chrome / Silver Bevel Ring
  const outerRimRadius = badgeRadius + 14;
  const rimGrad = ctx.createLinearGradient(badgeCX - outerRimRadius, badgeCY - outerRimRadius, badgeCX + outerRimRadius, badgeCY + outerRimRadius);
  rimGrad.addColorStop(0.0, '#ffffff');
  rimGrad.addColorStop(0.35, '#e2e8f0');
  rimGrad.addColorStop(0.7, '#cbd5e1');
  rimGrad.addColorStop(1.0, '#94a3b8');

  ctx.beginPath();
  ctx.arc(badgeCX, badgeCY, outerRimRadius, 0, Math.PI * 2);
  ctx.fillStyle = rimGrad;
  ctx.fill();

  // Inner White Acrylic Disc
  ctx.shadowColor = 'transparent';
  ctx.beginPath();
  ctx.arc(badgeCX, badgeCY, badgeRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  ctx.lineWidth = 4;
  ctx.strokeStyle = '#f1f5f9';
  ctx.stroke();

  drawGoogleGLogo(ctx, badgeCX, badgeCY, 120);
  ctx.restore();

  // ============================================================================
  // BOTTOM SECTION: EXACT BASE AS IN REFERENCE MOCKUP (PERFECT SYMMETRY)
  // ============================================================================
  const bottomCenterY = 1720;
  const leftColCX = 620;
  const rightColCX = 1780;

  // 1. CENTER VERTICAL HAIRLINE DIVIDER WITH "OU" CIRCULAR BADGE
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(width / 2, splitY + 160);
  ctx.lineTo(width / 2, bottomCenterY - 55);
  ctx.moveTo(width / 2, bottomCenterY + 55);
  ctx.lineTo(width / 2, 2180);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#e2e8f0';
  ctx.stroke();

  // "OU" Badge Circle
  ctx.beginPath();
  ctx.arc(width / 2, bottomCenterY, 48, 0, Math.PI * 2);
  ctx.fillStyle = '#f8fafc';
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#cbd5e1';
  ctx.stroke();

  // "OU" Text
  ctx.fillStyle = '#0f172a';
  ctx.font = '900 40px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('OU', width / 2, bottomCenterY);
  ctx.restore();

  // 2. LEFT COLUMN: OFFICIAL NFC CONTACTLESS INTERACTION DIAGRAM
  // Title (Top): "Aproxime seu celular"
  ctx.save();
  ctx.fillStyle = '#0f172a';
  ctx.font = '900 56px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '1px';
  ctx.fillText('Aproxime seu celular', leftColCX, bottomCenterY - 370);
  ctx.restore();

  // Vector Graphic: Target Sensor Disc + Modern Smartphone with NFC Waves
  drawOfficialSmartphoneNfc(ctx, leftColCX, bottomCenterY - 10, 1.48, theme);

  // Subtitle (Bottom): "Sem aplicativo • Direto no celular"
  ctx.save();
  ctx.fillStyle = '#64748b';
  ctx.font = '700 32px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Sem aplicativo • Direto no celular', leftColCX, bottomCenterY + 380);
  ctx.restore();

  // 3. RIGHT COLUMN: DYNAMIC QR CODE WITH BRACKETS & DASHED BOX
  // Title (Top): "Aponte a câmera" - EXACT SAME Y, FONT & ALIGNMENT AS LEFT TITLE
  ctx.save();
  ctx.fillStyle = '#0f172a';
  ctx.font = '900 56px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '1px';
  ctx.fillText('Aponte a câmera', rightColCX, bottomCenterY - 370);
  ctx.restore();

  // Vector Graphic: High-Precision QR Code centered at bottomCenterY - 10
  const qrSize = 640;
  const qrX = rightColCX - qrSize / 2;
  const qrY = bottomCenterY - qrSize / 2 - 10;

  const qrDataUrl = await generateQrDataUrl(permanentUrl, {
    width: 1200,
    margin: 1,
    darkColor: '#000000',
    lightColor: '#ffffff',
  });
  const qrImg = await loadImage(qrDataUrl);

  drawQrWithBrackets(ctx, qrImg, qrX, qrY, qrSize);

  // Subtitle (Bottom): "⚡ Avalie em 3 segundos" - EXACT SAME Y, FONT & ALIGNMENT AS LEFT SUBTITLE
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#64748b';
  ctx.font = '700 32px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.fillText('⚡ Avalie em 3 segundos', rightColCX, bottomCenterY + 380);
  ctx.restore();

  // ============================================================================
  // FOOTER BASELINE: ————— ALF AUTOMAÇÃO —————
  // ============================================================================
  const footerY = height - margin - 45;
  const footerText = 'ALF AUTOMAÇÃO';
  ctx.save();
  ctx.font = '800 24px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.letterSpacing = '5px';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const textW = ctx.measureText(footerText).width;

  // Left hairline
  ctx.beginPath();
  ctx.moveTo(width / 2 - textW / 2 - 140, footerY);
  ctx.lineTo(width / 2 - textW / 2 - 30, footerY);
  // Right hairline
  ctx.moveTo(width / 2 + textW / 2 + 30, footerY);
  ctx.lineTo(width / 2 + textW / 2 + 140, footerY);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#cbd5e1';
  ctx.stroke();

  // Text
  ctx.fillStyle = '#64748b';
  ctx.fillText(footerText, width / 2, footerY);
  ctx.restore();

  // Discreet Plate Identification on Lower-Left (Roman Numeral / Serial Tag)
  const plateInfo = getPlateIdentification(leadId, businessName);
  const plateTag = plateInfo.leftEdgeTag || (plateInfo.roman ? `Nº ${plateInfo.roman}` : (plateInfo.numStr ? `Nº ${plateInfo.numStr}` : ''));
  if (plateTag) {
    ctx.save();
    ctx.font = '800 24px "Plus Jakarta Sans", "JetBrains Mono", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '1px';
    ctx.fillText(plateTag, margin + 45, footerY);
    ctx.restore();
  }

  // Restore clipping path and draw acrylic outer bevel
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(margin, margin, plateW, plateH, plateRadius);
  } else {
    ctx.rect(margin, margin, plateW, plateH);
  }
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#e2e8f0';
  ctx.stroke();
  ctx.restore();

  // Return PNG embedded with official 600 DPI print metadata (pHYs chunk)
  return setPngDpi(canvas.toDataURL('image/png'), 600);
}

/**
 * ============================================================================
 * CARTÃO NFC CR80 (5,4cm x 8,5cm) - PROPORÇÃO EXATA & ULTRA HD
 * ============================================================================
 */
export async function generateCardNfcDataUrl(
  options: ArtworkOptions,
  orientation: 'horizontal' | 'vertical' = 'horizontal'
): Promise<string> {
  const {
    businessName = '',
    leadId = 'TAG01',
    permanentUrl,
    theme = 'emerald_green'
  } = options;

  const isHorizontal = orientation === 'horizontal';
  const width = isHorizontal ? 2040 : 1296;
  const height = isHorizontal ? 1296 : 2040;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Falha ao inicializar o Canvas 2D');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const margin = 24;
  const cardRadius = 50;

  ctx.save();
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(margin, margin, width - margin * 2, height - margin * 2, cardRadius);
  } else {
    ctx.rect(margin, margin, width - margin * 2, height - margin * 2);
  }
  ctx.clip();

  if (isHorizontal) {
    const splitY = 560;
    const isInsta = theme === 'instagram_official' || theme === 'instagram_dual';

    // Bottom White
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Top Themed Background
    if (isInsta) {
      const g = ctx.createLinearGradient(0, 0, width, splitY);
      g.addColorStop(0, '#405de6');
      g.addColorStop(0.3, '#833ab4');
      g.addColorStop(0.65, '#c13584');
      g.addColorStop(1, '#f77737');
      ctx.fillStyle = g;
    } else if (theme === 'emerald_green') {
      const g = ctx.createLinearGradient(0, 0, width, splitY);
      g.addColorStop(0, '#02180d');
      g.addColorStop(0.5, '#05331b');
      g.addColorStop(1, '#02180d');
      ctx.fillStyle = g;
    } else if (theme === 'royal_blue') {
      const g = ctx.createLinearGradient(0, 0, width, splitY);
      g.addColorStop(0, '#02122b');
      g.addColorStop(0.5, '#062454');
      g.addColorStop(1, '#02122b');
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = '#0a0a0a';
    }
    ctx.fillRect(0, 0, width, splitY);

    // Themed Ribbon
    const ribbonH = 38;
    drawThemedWavingRibbon(ctx, margin, width, splitY, ribbonH, theme);

    // Top Spaced 3D Realistic Stars
    const starY = margin + 95;
    const starSpacing = 105;
    const startStarX = width / 2 - starSpacing * 2;
    for (let i = 0; i < 5; i++) {
      drawRealistic3DStar(ctx, startStarX + i * starSpacing, starY, 36, 16);
    }

    // Headline & Big Business Name
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = '900 42px "Plus Jakarta Sans", "Inter", sans-serif';
    if (isInsta) {
      ctx.fillText('SIGA-NOS NO INSTAGRAM', width / 2, starY + 80);
      const cleanH = (options.instagramHandle || options.instagramUrl || businessName || 'empresa')
        .replace(/.*instagram\.com\//, '')
        .replace(/^@/, '')
        .replace(/\/.*$/, '')
        .trim();
      ctx.fillStyle = '#fef08a';
      ctx.font = '900 58px "Plus Jakarta Sans", "Inter", sans-serif';
      ctx.fillText(`@${cleanH}`, width / 2, starY + 150);
    } else {
      ctx.fillText('NÓS ADORARÍAMOS A SUA AVALIAÇÃO', width / 2, starY + 80);
      const clientTag = (businessName ? businessName.trim() : 'SUA EMPRESA').toUpperCase();
      ctx.fillStyle = '#fbbf24';
      ctx.font = '900 58px "Plus Jakarta Sans", "Inter", sans-serif';
      ctx.fillText(clientTag, width / 2, starY + 150);
    }

    // Center Badge (Instagram or Google)
    const badgeR = 95;
    const badgeCY = splitY + ribbonH / 2;
    ctx.beginPath();
    ctx.arc(width / 2, badgeCY, badgeR, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = 25;
    ctx.fill();
    ctx.shadowColor = 'transparent';

    if (isInsta) {
      drawInstagramOfficialBadge(ctx, width / 2, badgeCY, 130);
    } else {
      drawGoogleGLogo(ctx, width / 2, badgeCY, 68);
    }

    // Bottom Content
    const leftCX = width * 0.28;
    const rightCX = width * 0.74;
    const bottomMidY = 930;

    // Titles Row (Top of bottom section) - Perfectly Matched
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 36px "Plus Jakarta Sans", "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Aproxime seu celular', leftCX, bottomMidY - 200);
    ctx.fillText('Aponte a câmera', rightCX, bottomMidY - 200);

    // NFC Left Graphic
    drawOfficialSmartphoneNfc(ctx, leftCX, bottomMidY + 15, 0.96, theme);

    // Center OU Badge
    ctx.save();
    ctx.beginPath();
    ctx.arc(width / 2, bottomMidY + 15, 36, 0, Math.PI * 2);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#cbd5e1';
    ctx.stroke();
    ctx.font = '900 32px "Plus Jakarta Sans", "Inter", sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('OU', width / 2, bottomMidY + 15);
    ctx.restore();

    // QR Right Graphic
    const qrSize = 400;
    const effectiveTarget = isInsta && (options.instagramUrl || options.instagramHandle)
      ? (options.instagramUrl && options.instagramUrl.startsWith('http')
          ? options.instagramUrl
          : `https://instagram.com/${(options.instagramHandle || options.instagramUrl || '').replace(/^@/, '')}`)
      : permanentUrl;
    const qrDataUrl = await generateQrDataUrl(effectiveTarget, { width: 800, margin: 1 });
    const qrImg = await loadImage(qrDataUrl);
    drawQrWithBrackets(ctx, qrImg, rightCX - qrSize / 2, bottomMidY - qrSize / 2 + 15, qrSize);

    // Subtitles Row (Bottom) - Perfectly Matched
    ctx.fillStyle = '#64748b';
    ctx.font = '700 24px "Plus Jakarta Sans", "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Sem aplicativo • Direto no celular', leftCX, bottomMidY + 230);
    ctx.fillText(isInsta ? '⚡ Conecte-se em 3s' : '⚡ Avalie em 3 segundos', rightCX, bottomMidY + 230);

  } else {
    // Vertical CR80 Card
    const splitY = 820;
    const isInsta = theme === 'instagram_official' || theme === 'instagram_dual';

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    if (isInsta) {
      const g = ctx.createLinearGradient(0, 0, width, splitY);
      g.addColorStop(0, '#405de6');
      g.addColorStop(0.3, '#833ab4');
      g.addColorStop(0.65, '#c13584');
      g.addColorStop(1, '#f77737');
      ctx.fillStyle = g;
    } else if (theme === 'emerald_green') {
      const g = ctx.createLinearGradient(0, 0, width, splitY);
      g.addColorStop(0, '#02180d');
      g.addColorStop(0.5, '#05331b');
      g.addColorStop(1, '#02180d');
      ctx.fillStyle = g;
    } else if (theme === 'royal_blue') {
      const g = ctx.createLinearGradient(0, 0, width, splitY);
      g.addColorStop(0, '#02122b');
      g.addColorStop(0.5, '#062454');
      g.addColorStop(1, '#02122b');
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = '#0a0a0a';
    }
    ctx.fillRect(0, 0, width, splitY);

    const ribbonH = 38;
    drawThemedWavingRibbon(ctx, margin, width, splitY, ribbonH, theme);

    // Top Stars
    const starY = margin + 115;
    const starSpacing = 95;
    const startStarX = width / 2 - starSpacing * 2;
    for (let i = 0; i < 5; i++) {
      drawRealistic3DStar(ctx, startStarX + i * starSpacing, starY, 36, 16);
    }

    // Headline & Big Business Name
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = '900 46px "Plus Jakarta Sans", "Inter", sans-serif';
    if (isInsta) {
      ctx.fillText('SIGA-NOS NO INSTAGRAM', width / 2, starY + 95);
      const cleanH = (options.instagramHandle || options.instagramUrl || businessName || 'empresa')
        .replace(/.*instagram\.com\//, '')
        .replace(/^@/, '')
        .replace(/\/.*$/, '')
        .trim();
      ctx.fillStyle = '#fef08a';
      ctx.font = '900 64px "Plus Jakarta Sans", "Inter", sans-serif';
      ctx.fillText(`@${cleanH}`, width / 2, starY + 250);
    } else {
      ctx.fillText('NÓS ADORARÍAMOS A SUA', width / 2, starY + 95);
      ctx.fillText('AVALIAÇÃO NO GOOGLE', width / 2, starY + 160);

      const clientTag = (businessName ? businessName.trim() : 'SUA EMPRESA').toUpperCase();
      ctx.fillStyle = '#fbbf24';
      ctx.font = '900 64px "Plus Jakarta Sans", "Inter", sans-serif';
      ctx.fillText(clientTag, width / 2, starY + 250);
    }

    // Center Badge
    const badgeR = 100;
    const badgeCY = splitY + ribbonH / 2;
    ctx.beginPath();
    ctx.arc(width / 2, badgeCY, badgeR, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = 25;
    ctx.fill();
    ctx.shadowColor = 'transparent';

    if (isInsta) {
      drawInstagramOfficialBadge(ctx, width / 2, badgeCY, 138);
    } else {
      drawGoogleGLogo(ctx, width / 2, badgeCY, 72);
    }

    // Bottom Content (Stacked vertically on CR80 Vertical)
    const midX = width / 2;

    // NFC Section
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 40px "Plus Jakarta Sans", "Inter", sans-serif';
    ctx.fillText('Aproxime seu celular', midX, 1020);

    drawOfficialSmartphoneNfc(ctx, midX, 1220, 1.05, theme);

    // OU
    ctx.font = '900 44px "Plus Jakarta Sans", "Inter", sans-serif';
    ctx.fillText('— OU APONTE A CÂMERA —', midX, 1460);

    // QR Code
    const qrSize = 440;
    const effectiveTarget = isInsta && (options.instagramUrl || options.instagramHandle)
      ? (options.instagramUrl && options.instagramUrl.startsWith('http')
          ? options.instagramUrl
          : `https://instagram.com/${(options.instagramHandle || options.instagramUrl || '').replace(/^@/, '')}`)
      : permanentUrl;
    const qrDataUrl = await generateQrDataUrl(effectiveTarget, { width: 800, margin: 1 });
    const qrImg = await loadImage(qrDataUrl);
    drawQrWithBrackets(ctx, qrImg, midX - qrSize / 2, 1510, qrSize);
  }

  // Discreet Plate Identification on Lower-Left of Card
  const plateInfo = getPlateIdentification(leadId, businessName);
  const plateTag = plateInfo.leftEdgeTag || (plateInfo.roman ? `Nº ${plateInfo.roman}` : (plateInfo.numStr ? `Nº ${plateInfo.numStr}` : ''));
  if (plateTag) {
    ctx.save();
    ctx.font = '800 20px "Plus Jakarta Sans", "JetBrains Mono", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '1px';
    ctx.fillText(plateTag, margin + 30, height - margin - 25);
    ctx.restore();
  }

  ctx.restore();

  // Outer border
  ctx.save();
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(margin, margin, width - margin * 2, height - margin * 2, cardRadius);
  } else {
    ctx.rect(margin, margin, width - margin * 2, height - margin * 2);
  }
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#cbd5e1';
  ctx.stroke();
  ctx.restore();

  // Return PNG embedded with official 600 DPI print metadata (pHYs chunk)
  return setPngDpi(canvas.toDataURL('image/png'), 600);
}

/**
 * Quick Download Single Plate PNG
 */
export async function downloadPlatePng(options: ArtworkOptions, fileNamePrefix?: string) {
  const dataUrl = await generatePlate10x10DataUrl(options, '4k');
  const a = document.createElement('a');
  const safeName = (options.businessName || 'empresa')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_')
    .substring(0, 32);
  const defaultPrefix = options.theme === 'instagram_official'
    ? 'placa_instagram_oficial_10x10cm'
    : options.theme === 'instagram_dual'
    ? 'placa_instagram_google_dupla_10x10cm'
    : 'placa_google_nfc_10x10cm';
  const prefix = fileNamePrefix || defaultPrefix;
  a.download = `${prefix}_${safeName}_4k_ultra_hd_600dpi.png`;
  a.href = dataUrl;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Generate Complete Graphic Production Kit (ZIP)
 */
export async function generateArtworkZipKit(options: ArtworkOptions): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder(`Kit_Grafica_NFC_${(options.businessName || 'Empresa').replace(/[^a-zA-Z0-9]/g, '_')}`);

  // 1. Placa 10x10 cm Ultra HD 4K (4000x4000 px @ 600 DPI)
  const plate10x10Url = await generatePlate10x10DataUrl(options, '4k');
  const plate10x10Base64 = plate10x10Url.split(',')[1];
  folder?.file('01_Placa_10x10cm_Balcao_UltraHD_600DPI.png', plate10x10Base64, { base64: true });

  // 2. Cartão CR80 Horizontal
  const cardHorizUrl = await generateCardNfcDataUrl(options, 'horizontal');
  const cardHorizBase64 = cardHorizUrl.split(',')[1];
  folder?.file('02_Cartao_NFC_CR80_Horizontal_5.4x8.5cm.png', cardHorizBase64, { base64: true });

  // 3. Cartão CR80 Vertical
  const cardVertUrl = await generateCardNfcDataUrl(options, 'vertical');
  const cardVertBase64 = cardVertUrl.split(',')[1];
  folder?.file('03_Cartao_NFC_CR80_Vertical_8.5x5.4cm.png', cardVertBase64, { base64: true });

  // 4. QR Code individual em alta definição
  const standaloneQrUrl = await generateQrDataUrl(options.permanentUrl, { width: 1200, margin: 1 });
  const standaloneQrBase64 = standaloneQrUrl.split(',')[1];
  folder?.file('04_QRCode_Dinamico_1200x1200px.png', standaloneQrBase64, { base64: true });

  // 5. Manual técnico de impressão e gravação NFC
  const manualContent = `========================================================================
ALF AUTOMAÇÃO - MANUAL TÉCNICO DE PRODUÇÃO GRÁFICA & GRAVAÇÃO NFC
========================================================================

CLIENTE: ${options.businessName || 'Empresa'}
TAG ID: ${options.leadId || 'TAG01'}
LINK DE REDIRECIONAMENTO INTELIGENTE: ${options.permanentUrl}

1. ESPECIFICAÇÕES DA PLACA 10x10 CM:
   - Tamanho Final: 10,0 cm x 10,0 cm
   - Resolução: 2400 x 2400 pixels (600 DPI reais)
   - Acabamento Recomendado: Acrílico Cristal 3mm com impressão UV reversa
     ou Adesivo Vinil Fosco Laminado com corte a laser em cantos arredondados.
   - Posição do Chip NFC: Colar chip NTAG215 (25mm ou 30mm) exatamente no
     verso da área "Aproxime seu celular".

2. ESPECIFICAÇÕES DOS CARTÕES NFC (CR80):
   - Tamanho Final: 8,5 cm x 5,4 cm (Cantos arredondados raio 3mm)
   - Espessura: PVC 0.76mm ou 0.82mm com chip NTAG215 embutido.

3. GRAVAÇÃO DO CHIP NFC:
   - Use o app "NFC Tools" (Android / iOS)
   - Selecione "Write" -> "Add a record" -> "URL / URI"
   - Insira a URL: ${options.permanentUrl}
   - Bloqueio de gravação (Lock): Opcional, para evitar sobrescrita por terceiros.

ALF Automação - Aceleração de Presença Digital Google
`;
  folder?.file('05_Manual_Producao_Grafica_e_NFC.txt', manualContent);

  return await zip.generateAsync({ type: 'blob' });
}

export const downloadPlate10x10Png = async (options: ArtworkOptions, fileNamePrefix: string = 'placa_google_nfc_10x10cm') => {
  return downloadPlatePng(options, fileNamePrefix);
};

export const downloadCardNfcPng = async (
  options: ArtworkOptions,
  orientation: 'horizontal' | 'vertical' = 'horizontal',
  fileNamePrefix: string = 'cartao_google_nfc'
) => {
  const dataUrl = await generateCardNfcDataUrl(options, orientation);
  const a = document.createElement('a');
  const safeName = (options.businessName || 'empresa')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_')
    .substring(0, 32);
  a.download = `${fileNamePrefix}_${orientation}_${safeName}_ultra_hd.png`;
  a.href = dataUrl;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export const downloadCompleteArtworkKitZip = async (options: ArtworkOptions) => {
  const blob = await generateArtworkZipKit(options);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = (options.businessName || 'empresa')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_')
    .substring(0, 32);
  a.download = `Kit_Grafica_NFC_${safeName}.zip`;
  a.href = url;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
