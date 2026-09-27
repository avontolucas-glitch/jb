/**
 * Yo Da sabe en qué parte del año estás: la estación (según el hemisferio), las
 * fiestas (Nochebuena, Navidad, Año Nuevo, Reyes, Pascua, el comienzo de cada
 * estación, la Semana Santa, el Carnaval…) y, si se puede, el tiempo que hace (la temperatura, si llueve, si nieva).
 * Todo en la fecha de la zona horaria de la persona.
 *
 * El hemisferio sale de la latitud aproximada de la conexión (la manda /api/yo,
 * redondeada a grados enteros: alcanza para saber si es verano o invierno, no para
 * saber dónde está) o, si no hay, de la zona horaria. Cerca del ecuador no hay
 * cuatro estaciones: ahí Yo Da habla solo del tiempo. El tiempo lo trae /api/yo del
 * servicio meteorológico de Noruega (MET Norway, libre y con atribución). Nunca se
 * nombra el lugar: solo la temperatura y el cielo.
 */

export type Cielo = "despejado" | "nubes" | "nublado" | "lluvia" | "tormenta" | "nieve" | "niebla";
export type Clima = { temp: number; cielo: Cielo; noche?: boolean };
export type Hemisferio = "norte" | "sur" | "tropico";
export type Estacion = "primavera" | "verano" | "otoño" | "invierno";
type Fecha = { anio: number; mes: number; dia: number };

/** Zonas del hemisferio sur y cercanas al ecuador (por si no llega la latitud). */
const SUR = /^(America\/(Argentina|Montevideo|Santiago|Asuncion|Sao_Paulo|Punta_Arenas|La_Paz)|Australia\/|Pacific\/(Auckland|Chatham|Fiji|Tongatapu|Noumea)|Africa\/(Johannesburg|Maputo|Harare|Windhoek|Lusaka|Gaborone|Maseru|Mbabane)|Indian\/(Mauritius|Reunion|Antananarivo)|Antarctica\/)/;
const TROPICO = /^(America\/(Bogota|Caracas|Lima|Guayaquil|Panama|Costa_Rica|Managua|Tegucigalpa|El_Salvador|Guatemala|Belize|Santo_Domingo|Puerto_Rico|Port_of_Spain|Manaus|Belem|Fortaleza|Recife|Bahia|Cayenne|Paramaribo|Guyana|Barbados|Martinique)|Africa\/(Lagos|Accra|Abidjan|Nairobi|Kinshasa|Luanda|Addis_Ababa|Dakar|Kampala|Dar_es_Salaam)|Asia\/(Singapore|Jakarta|Kuala_Lumpur|Manila|Bangkok|Ho_Chi_Minh|Colombo)|Pacific\/(Honolulu|Guam))/;

export function hemisferio(lat: number | null | undefined, zona?: string | null): Hemisferio {
  if (typeof lat === "number" && Number.isFinite(lat)) return Math.abs(lat) < 12 ? "tropico" : lat < 0 ? "sur" : "norte";
  const z = zona ?? "";
  if (TROPICO.test(z)) return "tropico";
  return SUR.test(z) ? "sur" : "norte";
}

/** La fecha de hoy en una zona horaria. */
export function fechaEn(zona?: string | null, ahora = new Date()): Fecha {
  try {
    const p = Object.fromEntries(
      new Intl.DateTimeFormat("en-US", { timeZone: zona ?? undefined, year: "numeric", month: "numeric", day: "numeric" })
        .formatToParts(ahora)
        .map((x) => [x.type, x.value]),
    );
    return { anio: Number(p.year), mes: Number(p.month), dia: Number(p.day) };
  } catch {
    return { anio: ahora.getFullYear(), mes: ahora.getMonth() + 1, dia: ahora.getDate() };
  }
}

const diaDelAnio = (f: Fecha) => Math.round((Date.UTC(f.anio, f.mes - 1, f.dia) - Date.UTC(f.anio, 0, 1)) / 86_400_000);
const es = (f: Fecha, mes: number, dia: number) => f.mes === mes && f.dia === dia;

/** Domingo de Pascua (algoritmo de Meeus/Butcher, calendario gregoriano). */
function pascua(anio: number): Fecha {
  const a = anio % 19, b = Math.floor(anio / 100), c = anio % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  return { anio, mes, dia: ((h + l - 7 * m + 114) % 31) + 1 };
}
const menosDias = (f: Fecha, n: number): Fecha => {
  const d = new Date(Date.UTC(f.anio, f.mes - 1, f.dia - n));
  return { anio: d.getUTCFullYear(), mes: d.getUTCMonth() + 1, dia: d.getUTCDate() };
};

/** Los comienzos de estación (fechas del hemisferio norte; en el sur, la estación opuesta). */
const COMIENZOS: { mes: number; dia: number; norte: Estacion; sur: Estacion }[] = [
  { mes: 3, dia: 20, norte: "primavera", sur: "otoño" },
  { mes: 6, dia: 21, norte: "verano", sur: "invierno" },
  { mes: 9, dia: 22, norte: "otoño", sur: "primavera" },
  { mes: 12, dia: 21, norte: "invierno", sur: "verano" },
];

/** La estación y cuántos días hace que empezó (null cerca del ecuador). En el sur, la primavera se festeja el 21 de septiembre. */
export function estacionDe(f: Fecha, hem: Hemisferio): { estacion: Estacion; desde: number } | null {
  if (hem === "tropico") return null;
  const hoy = diaDelAnio(f);
  const comienzos = COMIENZOS.map((c) => ({ ...c, n: diaDelAnio({ anio: f.anio, mes: c.mes, dia: hem === "sur" && c.mes === 9 ? 21 : c.dia }) }));
  let actual = comienzos[comienzos.length - 1];
  let desde = hoy + (diaDelAnio({ anio: f.anio - 1, mes: 12, dia: 31 }) + 1 - actual.n);
  for (const c of comienzos) if (hoy >= c.n) {
    actual = c;
    desde = hoy - c.n;
  }
  return { estacion: hem === "sur" ? actual.sur : actual.norte, desde };
}

const azar = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];

/** Las fiestas del día (en la fecha de la persona). `region`: el país, si se sabe (para el Día del Amigo del Río de la Plata). */
export function fiestaDe(f: Fecha, hem: Hemisferio, region?: string | null): string | null {
  if (es(f, 12, 24)) return "Nochebuena. Hmm. Esta noche, lo que deseás, como regalo ya recibido sentilo.";
  if (es(f, 12, 25)) return "¡Feliz Navidad! Hmm. Nacer de nuevo, cada día se puede: en la imaginación, empieza.";
  if (es(f, 12, 31)) return "Último día del año. El que viene, ya vivido imaginalo: esta noche, brindá por él como cumplido.";
  if (es(f, 1, 1)) return "¡Feliz Año Nuevo! Página en blanco, el año es. Escribila desde el final, hmm.";
  if (es(f, 1, 5)) return "Víspera de Reyes. Los zapatos, afuera; el deseo, adentro, ya cumplido.";
  if (es(f, 1, 6)) return "Día de Reyes. Hmm. Los regalos que de verdad importan, primero en la imaginación llegan.";
  if (es(f, 2, 14)) return "San Valentín. El amor que imaginás cumplido, antes que nada en vos vive.";
  // Semana Santa y lo que se mueve con la Pascua
  const p = pascua(f.anio);
  const antes = (n: number) => {
    const d = menosDias(p, n);
    return es(f, d.mes, d.dia);
  };
  if (antes(48) || antes(47)) return "Carnaval. Hmm. Disfrazarse, por un día se puede; el estado que elegís, todos los días lo vestís.";
  if (antes(46)) return "Miércoles de Ceniza. Cuarenta días empiezan: buen tiempo para soltar una creencia vieja.";
  if (antes(7)) return "Domingo de Ramos: Semana Santa empieza. Hmm. Recibir lo que llega, como si ya lo esperaras.";
  if (antes(6) || antes(5) || antes(4)) return "Semana Santa. Hmm. Días de recogimiento: la conversación de adentro, más clara se escucha.";
  if (antes(3)) return "Jueves Santo. La mesa compartida, hoy se recuerda. Hmm. Lo que das, vuelve.";
  if (antes(2)) return "Viernes Santo. Hmm. Silencio y recogimiento: buen día para escuchar la conversación de adentro.";
  if (antes(1)) return "Sábado de Gloria. Entre lo que terminó y lo que renace, el silencio. Hmm. Ahí se siembra.";
  if (es(f, p.mes, p.dia)) return "¡Felices Pascuas! Lo que parecía terminado, de nuevo vive. Así también un deseo.";
  if (antes(-49)) return "Pentecostés. Hmm. Las lenguas de fuego: la palabra que se dice con fe, enciende.";
  if (es(f, 11, 1)) return "Día de Todos los Santos. Hmm. Lo que honrás, en vos sigue vivo.";
  if (es(f, 11, 2)) return region === "mx" ? "Día de Muertos. Los que se fueron, en la memoria viven: con cariño recordalos, hmm." : "Día de los Fieles Difuntos. Hmm. Lo que se ama, no se va: en la memoria vive.";
  if (es(f, 12, 8)) return "Día de la Inmaculada Concepción. Hmm. Lo concebido sin mancha: así, un deseo limpio de dudas.";
  if (es(f, 12, 12) && region === "mx") return "Día de la Virgen de Guadalupe. Hmm. La fe que se tiene, montañas mueve.";
  if (es(f, 7, 20) && (region === "ar" || region === "uy" || region === "br")) return "Día del Amigo. Hmm. Lo que le deseás a un amigo, como ya cumplido decíselo: dos regalos en uno.";
  if (hem === "sur" && es(f, 9, 21)) return `¡Día de la primavera! Lo que sembraste en el invierno, florecer empieza.${region === "ar" ? " Y del estudiante: aprender lo que ya sabés, también es florecer." : ""}`;
  if (hem !== "tropico") {
    const largo = (hem === "norte" && es(f, 6, 21)) || (hem === "sur" && es(f, 12, 21));
    const corto = (hem === "norte" && es(f, 12, 21)) || (hem === "sur" && es(f, 6, 21));
    if (largo) return "El día más largo del año, hoy. Hmm. Más luz, para ver el final que elegiste.";
    if (corto) return "La noche más larga del año, hoy. Hmm. Buena, para imaginar sin apuro.";
  }
  return null;
}

/** Un guiño a la estación: al empezar (los primeros días), o cada tanto. */
export function comentarioEstacion(f: Fecha, hem: Hemisferio): string | null {
  const e = estacionDe(f, hem);
  if (!e) return null;
  if (e.desde <= 3) {
    const dias = e.desde === 0 ? "hoy empieza" : e.desde === 1 ? "empezó ayer" : `empezó hace ${e.desde} días`;
    return {
      primavera: `La primavera ${dias}. Hmm. Lo que sembraste, a florecer va.`,
      verano: `El verano ${dias}. Días largos: más tiempo para vivir en el final.`,
      otoño: `El otoño ${dias}. Como las hojas, lo que no sirve se suelta. Liviano, mejor se asume.`,
      invierno: `El invierno ${dias}. Hmm. Las raíces, en silencio, crecen. Tus deseos, igual.`,
    }[e.estacion];
  }
  return {
    primavera: azar([
      "Primavera, donde estás. Hmm. Todo florece: tus deseos, también, si los regás.",
      "En primavera estás. Las abejas no dudan de la flor: así, con tu deseo.",
      "Primavera. Alergia al polen, quizás; a lo nuevo, alergia no tengas. Hmm.",
      "Primavera, donde estás. Hasta los árboles se animan a empezar de nuevo. Vos, ¿por qué no?",
    ]),
    verano: azar([
      "Verano, donde estás. Hmm. Sol afuera; adentro, el final feliz también brilla.",
      "En verano estás. Protector solar para la piel; para la mente, pensamientos buenos. Hmm.",
      "Verano. Las vacaciones que querés, primero en la imaginación se toman: el pasaje, gratis.",
      "Verano, donde estás. Días largos: tiempo de sobra para imaginar… y para un helado.",
    ]),
    otoño: azar([
      "Otoño, donde estás. Lo que ya no sirve, como las hojas, soltalo. Hmm.",
      "En otoño estás. Los árboles sueltan sin drama: aprender de ellos, podemos.",
      "Otoño. Las hojas crujen bajo tus pies: así suenan las creencias viejas cuando las pisás. Hmm.",
      "Otoño, donde estás. Algo caliente, una manta y una buena escena en la mente: receta de estación.",
    ]),
    invierno: azar([
      "Invierno, donde estás. Hmm. Afuera frío; adentro, el deseo encendido mantené.",
      "En invierno estás. Las raíces, en silencio crecen: como lo que asumís.",
      "Invierno. Los osos hibernan; los deseos, no: seguí imaginando bajo la frazada.",
      "Invierno, donde estás. Hmm. Hasta las alas se me enfrían. La imaginación, calefacción gratis es.",
    ]),
  }[e.estacion];
}

/** Lo que dice del tiempo que hace (sin nombrar el lugar). */
export function comentarioClima(c: Clima | null | undefined): string | null {
  if (!c) return null;
  const t = Math.round(c.temp);
  const grados = `${t} ${Math.abs(t) === 1 ? "grado" : "grados"}`;
  if (c.cielo === "tormenta") return `Tormenta, donde estás. Hmm. Afuera truena; adentro, calma: el que observa, no se moja.`;
  if (c.cielo === "nieve") return `¡Nieva donde estás! ${grados}. Todo en blanco: una página nueva. El final, escribí en ella.`;
  if (c.cielo === "lluvia") return `Llueve donde estás, ${grados}. Hmm. La lluvia riega lo que sembraste: buen día para imaginar.`;
  if (c.cielo === "niebla") return `Niebla, donde estás. Afuera no se ve lejos; adentro, el final clarito podés ver.`;
  if (t <= 0) return `${t < 0 ? `${Math.abs(t)} bajo cero` : "Cero grados"}, donde estás… hmm. Tiritar hasta a mí me da. Imaginate al sol: la mente, temperatura no tiene.`;
  if (t < 10) return `${grados}, donde estás. Frío hace. Adentro, el fuego del deseo encendido mantené.`;
  if (t < 18) return `${grados}, donde estás. Fresquito. Un buen abrigo… y una buena escena en la mente.`;
  if (t < 27) return c.cielo === "despejado" && !c.noche ? `${grados} y sol, donde estás. Día lindo; más lindo, si lo sentís ya resuelto.` : `${grados}, donde estás. Templado: ni frío ni calor, como una mente en paz.`;
  if (t < 33) return `${grados}, donde estás. Calorcito. Para soñar despierto, el calor bueno es. Hmm.`;
  return `${grados}, donde estás. Hmm. Calor fuerte. Agua tomá, y el deseo, fresco mantené.`;
}

/**
 * Lo que Yo Da suma al saludo, a lo sumo una cosa: la fiesta del día; si no, el
 * comienzo de la estación; si no, el tiempo (siempre si es para comentar: lluvia,
 * nieve, tormenta, mucho frío o calor; si no, a veces); si no, a veces la estación.
 */
export function extraDelDia(o: { zona?: string | null; lat?: number | null; clima?: Clima | null; region?: string | null; ahora?: Date }): string | null {
  const f = fechaEn(o.zona, o.ahora);
  const hem = hemisferio(o.lat, o.zona);
  const fiesta = fiestaDe(f, hem, o.region);
  if (fiesta) return fiesta;
  const e = estacionDe(f, hem);
  if (e && e.desde <= 3) return comentarioEstacion(f, hem);
  const clima = comentarioClima(o.clima);
  const llamativo = !!o.clima && (o.clima.cielo === "lluvia" || o.clima.cielo === "nieve" || o.clima.cielo === "tormenta" || o.clima.temp < 8 || o.clima.temp >= 30);
  if (clima && (llamativo || Math.random() < 0.45)) return clima;
  if (Math.random() < 0.3) return comentarioEstacion(f, hem);
  return null;
}

/** «¿Qué tiempo hace?», «¿qué estación es?», «¿es feriado?»: todo junto, en pocas palabras. */
export function queTiempo(o: { zona?: string | null; lat?: number | null; clima?: Clima | null; region?: string | null; ahora?: Date }): string {
  const f = fechaEn(o.zona, o.ahora);
  const hem = hemisferio(o.lat, o.zona);
  const partes = [fiestaDe(f, hem, o.region), comentarioClima(o.clima), comentarioEstacion(f, hem)].filter(Boolean) as string[];
  if (!partes.length) return "Cerca del ecuador estás, parece: estaciones, poco cambian. Y el tiempo de afuera, ver no puedo ahora. El de adentro, vos lo elegís. Hmm.";
  if (!o.clima) partes.push("El tiempo de afuera, ver no puedo ahora; el de adentro, vos lo elegís.");
  return partes.slice(0, 3).join(" ");
}

/** ¿Hoy es su cumpleaños? `cumple`: «MM-DD» de la cuenta. El 29 de febrero, los años sin ese día, se festeja el 28. */
export function esCumple(cumple: string | null | undefined, zona?: string | null, ahora = new Date()): boolean {
  const m = /^(\d{2})-(\d{2})$/.exec(cumple ?? "");
  if (!m) return false;
  const f = fechaEn(zona, ahora);
  const [mes, dia] = [Number(m[1]), Number(m[2])];
  if (f.mes === mes && f.dia === dia) return true;
  const bisiesto = (f.anio % 4 === 0 && f.anio % 100 !== 0) || f.anio % 400 === 0;
  return mes === 2 && dia === 29 && !bisiesto && f.mes === 2 && f.dia === 28;
}

/** El saludo de Yo Da el día del cumpleaños (con gracia, y con su guiño de siempre). */
export function saludoCumple(nombre?: string | null): string {
  const n = nombre ? `, ${nombre}` : "";
  return azar([
    `¡Feliz cumpleaños${n}! Hmm. Un año más de imaginación tenés: el mejor este será, si así lo asumís.`,
    `¡Feliz cumpleaños${n}! Las velas, soplá; el deseo, ya cumplido sentilo. Así se pide, hmm.`,
    `Hoy es tu día${n}. ¡Feliz cumpleaños! Torta no puedo convidarte; un deseo cumplido por adelantado, sí.`,
  ]);
}
