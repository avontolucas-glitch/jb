/**
 * TEXTOS LEGALES — BORRADOR para revisar con un abogado antes de publicar.
 * Lo que está «(a definir)» lo completan Julián o Lucas (datos del responsable,
 * mail de contacto, plazos que se decidan).
 */
export type Legal = { titulo: string; bajada: string; partes: { titulo: string; parrafos: string[]; id?: string }[] };

const CONTACTO = "(mail de contacto, a definir)";
const RESPONSABLE = "Julián Bermúdez (nombre legal, CUIT y domicilio, a definir)";

export const legales: Record<string, Legal> = {
  terminos: {
    titulo: "Términos y condiciones",
    bajada: "Borrador: el texto legal lo redacta un profesional antes de publicar.",
    partes: [
      { titulo: "Uso del sitio", parrafos: ["(Texto legal, a definir)"] },
      { titulo: "Cuentas", parrafos: ["(Texto legal, a definir)"] },
      { titulo: "Compras y accesos", parrafos: ["(Texto legal, a definir)"] },
      { titulo: "Propiedad del contenido", parrafos: ["(Texto legal, a definir)"] },
    ],
  },

  privacidad: {
    titulo: "Política de privacidad",
    bajada: "Qué datos guardamos, para qué y cómo pedir que los cambiemos o los borremos. Borrador para revisar con un abogado.",
    partes: [
      {
        titulo: "Quién es el responsable",
        parrafos: [
          `El responsable de los datos que se cargan en este sitio es ${RESPONSABLE}. Para cualquier consulta sobre tus datos podés escribir a ${CONTACTO}.`,
        ],
      },
      {
        titulo: "Qué datos guardamos",
        parrafos: [
          "Tu cuenta: nombre, mail y la clave, que se guarda cifrada (nadie puede leerla, ni siquiera nosotros).",
          "Tus compras: qué compraste, cuándo, el monto y el medio de pago. Los datos de tu tarjeta los procesa el medio de pago; este sitio no los ve ni los guarda.",
          "Lo que nos mandás: tus preguntas para el encuentro, lo que contás al reservar una Masterclass 1 a 1, tu inscripción a una conferencia y tu mail o WhatsApp si te sumás a la lista.",
          "Lo mínimo para que el sitio funcione: una cookie que mantiene tu sesión abierta y algunas preferencias que quedan en tu dispositivo (por ejemplo, si silenciaste los sonidos).",
        ],
      },
      {
        titulo: "Para qué los usamos",
        parrafos: [
          "Para darte acceso a lo que compraste, avisarte lo que pediste que te avisemos, preparar tu Masterclass 1 a 1 o el encuentro de preguntas y cuidar la seguridad de tu cuenta.",
          "En los directos y en los libros digitales tu mail aparece como marca de agua: sirve para proteger el contenido y saber de quién era si alguien lo difunde.",
          "No vendemos ni alquilamos tus datos, y el sitio no tiene publicidad de terceros.",
        ],
      },
      {
        titulo: "Con quién los compartimos",
        parrafos: [
          "Solo con los servicios que hacen falta para prestarte lo que pediste: el alojamiento del sitio, el medio de pago, la plataforma de video y el envío de mails. Cada uno los usa únicamente para eso.",
        ],
      },
      {
        titulo: "Cuánto tiempo los guardamos",
        parrafos: [
          "Mientras tengas tu cuenta, y después solo lo que la ley obligue a conservar (por ejemplo, los comprobantes de compra). Si te das de baja de la lista, dejamos de escribirte en el momento.",
        ],
      },
      {
        titulo: "Tus derechos",
        parrafos: [
          `Podés pedir en cualquier momento ver tus datos, corregirlos o que los borremos, escribiendo a ${CONTACTO}. Lo hacemos sin costo, dentro de los plazos de la Ley 25.326 de Protección de los Datos Personales.`,
          "La Agencia de Acceso a la Información Pública, como órgano de control de esa ley, atiende las denuncias y reclamos de quienes vean afectados sus derechos.",
        ],
      },
      {
        titulo: "Cambios en esta política",
        parrafos: ["Si la cambiamos, lo vas a ver en esta misma página con la fecha de actualización, y si el cambio es importante te avisamos por mail."],
      },
    ],
  },

  reembolsos: {
    titulo: "Política de reembolsos",
    bajada: "Cuándo y cómo te devolvemos lo que pagaste. Borrador para revisar con un abogado; los plazos de cada producto son una propuesta a confirmar.",
    partes: [
      {
        id: "arrepentimiento",
        titulo: "Tu derecho de arrepentimiento",
        parrafos: [
          "Si compraste por internet, tenés 10 días corridos desde la compra para arrepentirte, sin dar explicaciones (Ley 24.240 de Defensa del Consumidor y artículo 1110 del Código Civil y Comercial). Podés hacerlo desde el Botón de arrepentimiento, al pie de todas las páginas.",
          "La ley prevé excepciones para los contenidos digitales que ya reprodujiste o descargaste (artículo 1116 del Código Civil y Comercial): por eso, más abajo, cada producto aclara hasta cuándo se puede devolver.",
        ],
      },
      {
        titulo: "Masterclass (Julián en vivo)",
        parrafos: [
          "Te devolvemos el total si lo pedís hasta 24 horas antes del directo. Si el directo se reprograma o se cancela, elegís entre la nueva fecha o el reembolso total.",
          "Una vez que entraste a la sala, el directo no se reembolsa.",
        ],
      },
      {
        titulo: "Masterclass grabada",
        parrafos: ["Te devolvemos el total dentro de los 10 días de la compra si todavía no viste ningún módulo."],
      },
      {
        titulo: "Masterclass 1 a 1",
        parrafos: [
          "Podés reprogramar o cancelar sin costo avisando con al menos 48 horas. Con menos aviso, o si no te presentás, el encuentro no se reembolsa.",
          "Si Julián tiene que cancelarlo, elegís entre una nueva fecha o el reembolso total.",
        ],
      },
      {
        titulo: "Conferencias privadas",
        parrafos: ["Te devolvemos la entrada si lo pedís hasta 48 horas antes. Si la conferencia se reprograma o se cancela, elegís entre la nueva fecha o el reembolso total."],
      },
      {
        titulo: "Libros",
        parrafos: [
          "Edición digital: te devolvemos el total dentro de los 10 días de la compra si todavía no abriste ningún capítulo.",
          "Libro impreso: los cambios y devoluciones se hacen donde lo compraste. El código para leerlo en digital sirve una sola vez.",
        ],
      },
      {
        titulo: "Cómo pedir un reembolso",
        parrafos: [
          `Desde el Botón de arrepentimiento o escribiendo a ${CONTACTO}, con el mail de tu cuenta y qué compraste. Te respondemos con un código de seguimiento.`,
          "El dinero vuelve por el mismo medio con el que pagaste. Los tiempos de acreditación dependen de ese medio (tarjeta, Mercado Pago, PayPal u otro).",
        ],
      },
    ],
  },
};
