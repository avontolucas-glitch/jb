import sys, re, copy, shutil, os, json
sys.path.insert(0,'/home/user/render/build')
from xmlkit import *
from lxml import etree
S='/tmp/claude-0/-home-user-jb/d179e3ea-2dc4-5559-b338-b3b83ba56974/scratchpad'
OUT='/home/user/render/build/work'
import edits_bio, edits_pens, edits_rec
def load(b):
    d=f'{OUT}/{b}'
    if os.path.exists(d): shutil.rmtree(d)
    shutil.copytree(f'{S}/u_{b}', d)
    t=etree.parse(f'{d}/word/document.xml'); return t, t.getroot().find(W+'body')
def save(t,b): t.write(f'{OUT}/{b}/word/document.xml', xml_declaration=True, encoding='UTF-8', standalone=True)
def sect_of(p): return p.find(W+'pPr/'+W+'sectPr')
def give_sect_to_prev(p):
    sp=sect_of(p)
    if sp is None: return
    prev=p.getprevious()
    while prev is not None and prev.tag!=W+'p': prev=prev.getprevious()
    ppr=prev.find(W+'pPr')
    if ppr is None: ppr=etree.SubElement(prev,W+'pPr'); prev.insert(0,ppr)
    old=ppr.find(W+'sectPr')
    if old is not None: ppr.remove(old)
    ppr.append(sp)
def humanize(old,new):
    # no sumar firmas de 'texto pulido': rayas y punto y coma que el habla original no tenía
    if '—' not in old:
        def fix(m):
            x=m.group(1)
            return m.group(0) if (',' in x or len(x)>70) else ', '+x.strip()+','
        new=re.sub(r' ?—([^—]+)—',fix,new)
    if ';' not in old: new=re.sub(r';(\s|$)',r',\1',new)
    new=re.sub(r',\s*,',',',new); new=re.sub(r',\s*\.','.',new); new=re.sub(r',\s*:',':',new); new=re.sub(r':\s*,',':',new)
    new=re.sub(r',(\s*)»','»',new)
    return new
def run_book(b, mod, extra=None):
    t,body=load(b)
    for item in mod.REPS: rep(body,item[0],humanize(item[0],item[1]),b,why=item[2])
    for item in getattr(mod,'OBS',[]): rep(body,item[0],item[1],b,why=item[2])
    for m in mod.SPLITS: split(body,m,b)
    if extra: extra(t,body)
    glob(body,b)
    save(t,b); return t,body
def glob(body,b):
    cnt={}
    def sub(p,pat,repl,key,flags=0):
        for tn in tnodes(p):
            if tn.text:
                new,n=re.subn(pat,repl,tn.text,flags=flags)
                if n: tn.text=new; cnt[key]=cnt.get(key,0)+n
    for p in paras(body):
        sub(p,r'\bJulian\b','Julián','Julián (nombre)')
        sub(p,r'\bJULIAN\b','JULIÁN','Julián (nombre)')
        sub(p,r'\bf[íi]jate\b','fijate','voseo «fijate»'); sub(p,r'\bF[íi]jate\b','Fijate','voseo «fijate»')
        if b=='receta': sub(p,r'\bcuatro a seis\b','4 a 6','números «de 4 a 6» unificados')
        sub(p,r'(?<=\S)  +(?=\S)',' ','espacios dobles')
        sub(p,r' +([,.;:])(?!\.)',r'\1','espacio antes de puntuación')
        sub(p,r' — ([^—]{1,220}?) —(?=[ ,.;:])',r' —\1—','rayas de inciso')
        sub(p,r'(?<![.\d])\.(\s+)([a-záéíóúñ])',lambda m:'.'+m.group(1)+m.group(2).upper(),'mayúscula tras punto')
    for k,v in cnt.items(): LOG.append((b,'global',k,f'{v} casos',''))
    # restos a revisar
    for p in paras(body):
        tx=ptext(p)
        if ' — ' in tx: print(f'  [{b}] raya suelta:', tx[max(0,tx.index(" — ")-50):tx.index(" — ")+50])
def chapters(body):
    ps=paras(body); heads=[p for p in ps if re.fullmatch(r'CAPÍTULO \d+',ptext(p).strip())]
    return heads
def block(body, head):
    """desde el título de capítulo hasta el párrafo con sectPr (inclusive)."""
    out=[]; el=head
    while el is not None:
        out.append(el)
        if el.tag==W+'p' and sect_of(el) is not None: break
        el=el.getnext()
    return out
# ---------------- BIOGRAFÍA
tb,bb=run_book('biografia',edits_bio)
shel=ptext(find(bb,'Es como agarrar una persona que yo ya conozco'))
# ---------------- PENSAMIENTO
def pens_extra(t,body):
    p=find(body,'Es como agarrar una persona que yo ya conozco')
    old=ptext(p); set_text_range(p,0,len(old),shel)
    LOG.append(('pensamiento','sincronía','Anécdota de Shelleyar (versión sin limpiar)','Idéntica a la versión ya limpia de Biografía, Cap. 3','puente sincrónico'))
    # déjà vu → Arquetipos
    d1=find(body,'El déjà vu, la verdad'); d2=find(body,'Una de las cosas que también dejé de lado es el concepto de déjà vu')
    anchor=find(body,'Entonces, ¿una persona que dedica poder a sus cartas')
    anchor.addnext(d1); d1.addnext(d2)
    LOG.append(('pensamiento','estructura','Cierre de «Atravesar el tiempo»: déjà vu, tarot, brujos, adivinos, magos','Movido a «Arquetipos», junto a las cartas y los brujitos','el capítulo del tiempo termina en «mientras iban, fueron sanados»'))
    # imaginar/recordar → Observador
    qq=find(body,'¿Existe alguna diferencia entre imaginar y recordar?')
    note=find(body,'Este mismo Ojo Observador aparece desarrollado')
    note.addnext(qq)
    sp=sect_of(note); note.find(W+'pPr').remove(sp); qq.find(W+'pPr').append(sp)
    LOG.append(('pensamiento','estructura','«¿Existe alguna diferencia entre imaginar y recordar? No. Ambas son una imagen.»','Cierra ahora «El Observador Eterno» (recuerdos elaborados que convencen al observador)',''))
    # el Observador abre con su antecedente exacto (misma frase de Julián que lo precede en Receta)
    obs=find(body,'No se puede forzar porque es un Ojo Observador')
    pre=copy.deepcopy(obs); strip_ids(pre)
    ps=pre.find(W+'pPr/'+W+'sectPr')
    if ps is not None: ps.getparent().remove(ps)
    tx=ptext(pre); set_text_range(pre,0,len(tx),'No se puede forzar este saber que soy consciente de tener mucho dinero, este saber que soy consciente de tener pareja, este saber que soy consciente de tener muchísima suerte y muchísimos elementos y cosas.')
    obs.addprevious(pre)
    LOG.append(('pensamiento','sincronía','El capítulo del Observador abría con «No se puede forzar porque...» sin decir qué','Se antepone la frase exacta de Julián que lo precede en Receta, Cap. 2: «No se puede forzar este saber que soy consciente de tener mucho dinero...»','no dejar un pasaje sin su referente'))
    # reorden de capítulos
    heads=chapters(body)
    titles=[ptext(h.getnext()).strip() for h in heads]
    B={ti:block(body,h) for ti,h in zip(titles,heads)}
    order=['LA PALABRA','LIBERTAD INTERNA','EL OBSERVADOR ETERNO','CONVERSACIONES SINCERAS','LA INTELIGENCIA NATURAL','ARQUETIPOS']
    trans=find(body,'Logré atravesar el tiempo con éxito.',exact=True)
    first_empty=trans
    while True:
        pv=first_empty.getprevious()
        if pv is not None and pv.tag==W+'p' and not ptext(pv).strip() and sect_of(pv) is None and pv.find('.//'+W+'drawing') is None: first_empty=pv
        else: break
    for ti in order[1:]:
        for el in B[ti]: el.getparent().remove(el)
    ref=B['LA PALABRA'][-1]
    for ti in order[1:]:
        for el in B[ti]: ref.addnext(el); ref=el
    for n,h in enumerate(chapters(body)):
        tx=ptext(h); set_text_range(h,0,len(tx),f'CAPÍTULO {n}')
    LOG.append(('pensamiento','estructura','Orden: 0 Palabra · 1 Libertad · 2 Inteligencia Natural · 3 Conversaciones · 4 Arquetipos · 5 Observador · 6 Tiempo','Orden: 0 Palabra · 1 Libertad · 2 Observador Eterno · 3 Conversaciones · 4 Inteligencia Natural · 5 Arquetipos · 6 Tiempo','sincronía capítulo a capítulo con Receta y Biografía'))
tp,bp=run_book('pensamiento',edits_pens,pens_extra)
# ---------------- RECETA
def rec_extra(t,body):
    mv=find(body,'Realmente, realmente, uno tiene que monitorear')
    give_sect_to_prev(mv)
    target=find(body,'Esa conversación mental —aunque sea la lógica')
    target.addprevious(mv)
    LOG.append(('receta','estructura','«Realmente, realmente, uno tiene que monitorear... la conversación mental de un alumno» (cierre del Cap. 2)','Abre el Cap. 3 «Ahora mismo», justo antes de «Esa conversación mental...», que la necesita como referente','no dejar un párrafo colgado sin su antecedente'))
tr,br=run_book('receta',edits_rec,rec_extra)
json.dump(LOG,open(f'{OUT}/log.json','w'),ensure_ascii=False,indent=0)
print('cambios registrados:',len(LOG))
