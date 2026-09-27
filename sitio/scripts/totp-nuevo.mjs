#!/usr/bin/env node
/**
 * Genera el secreto para el código de 6 dígitos de la cuenta de Julián (TOTP, RFC 6238:
 * SHA-1, 30 segundos, 6 dígitos), compatible con Google Authenticator, Authy, 1Password…
 *
 *   node scripts/totp-nuevo.mjs julian@sumail.com
 *
 * 1. Cargá el secreto en las variables del proyecto como ADMIN_TOTP_SECRET (en Vercel:
 *    Settings → Environment Variables) y volvé a publicar.
 * 2. En el teléfono de Julián, en la app: «Agregar cuenta» → «Ingresar una clave de
 *    configuración» y pegar el secreto (tipo: basado en el tiempo). O armar un QR con el
 *    enlace otpauth:// en una herramienta que funcione sin conexión: nunca en una página
 *    web cualquiera, porque con ese enlace cualquiera genera los códigos.
 * 3. Comparar el código que muestra la app con el que imprime este script.
 *
 * El secreto no se guarda en ningún lado: si se pierde, se genera otro y se vuelve a cargar.
 * Sin dependencias: solo el módulo crypto de Node.
 */
import { createHmac, randomBytes } from "node:crypto";

const ALFABETO = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32(bytes) {
  let bits = 0;
  let valor = 0;
  let out = "";
  for (const b of bytes) {
    valor = (valor << 8) | b;
    bits += 8;
    while (bits >= 5) {
      out += ALFABETO[(valor >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += ALFABETO[(valor << (5 - bits)) & 31];
  return out;
}

function desdeBase32(txt) {
  const s = txt.toUpperCase().replace(/[\s=-]/g, "");
  const out = [];
  let bits = 0;
  let valor = 0;
  for (const c of s) {
    const n = ALFABETO.indexOf(c);
    if (n < 0) throw new Error("Secreto base32 inválido.");
    valor = (valor << 5) | n;
    bits += 5;
    if (bits >= 8) {
      out.push((valor >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

function codigo(secreto, ms = Date.now()) {
  const contador = Math.floor(ms / 1000 / 30);
  const msg = Buffer.alloc(8);
  msg.writeUInt32BE(Math.floor(contador / 2 ** 32), 0);
  msg.writeUInt32BE(contador >>> 0, 4);
  const h = createHmac("sha1", desdeBase32(secreto)).update(msg).digest();
  const o = h[h.length - 1] & 0x0f;
  const n = (((h[o] & 0x7f) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3]) % 1_000_000;
  return String(n).padStart(6, "0");
}

// Con --probar SECRETO solo muestra el código de ahora (para comparar con la app).
const args = process.argv.slice(2);
if (args[0] === "--probar") {
  if (!args[1]) {
    console.error("Uso: node scripts/totp-nuevo.mjs --probar SECRETO");
    process.exit(1);
  }
  console.log(`Código de ahora: ${codigo(args[1])}`);
  process.exit(0);
}

const cuenta = (args[0] || process.env.ADMIN_EMAIL || "julian").trim();
const emisor = "Julián Bermúdez";
const secreto = base32(randomBytes(20)); // 160 bits
const q = new URLSearchParams({ secret: secreto, issuer: emisor, algorithm: "SHA1", digits: "6", period: "30" });
const enlace = `otpauth://totp/${encodeURIComponent(emisor)}:${encodeURIComponent(cuenta)}?${q.toString().replace(/\+/g, "%20")}`;

console.log(`
Secreto (ADMIN_TOTP_SECRET):
  ${secreto}

Para cargarlo a mano en la app, en grupos de 4:
  ${secreto.match(/.{1,4}/g).join(" ")}

Enlace para un QR (solo con una herramienta sin conexión):
  ${enlace}

Código de ahora, para comparar con la app: ${codigo(secreto)}
(Para volver a verlo: node scripts/totp-nuevo.mjs --probar ${secreto})

Guardalo solo en las variables del proyecto. No lo subas al repositorio ni lo mandes por chat.
`);
