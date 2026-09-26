import copy, re
from lxml import etree
NS={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
    'wp':'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
    'a':'http://schemas.openxmlformats.org/drawingml/2006/main',
    'pic':'http://schemas.openxmlformats.org/drawingml/2006/picture',
    'w14':'http://schemas.microsoft.com/office/word/2010/wordml'}
W='{%s}'%NS['w']
LOG=[]
def q(tag):
    p,t=tag.split(':'); return '{%s}%s'%(NS[p],t)
def tnodes(p):
    return [t for t in p.iter(W+'t') if not any(a.tag in (W+'txbxContent',) for a in t.iterancestors())]
def ptext(p): return ''.join(t.text or '' for t in tnodes(p))
def paras(body): return [c for c in body if c.tag==W+'p']
def set_text_range(p, start, end, new):
    """reemplaza el rango [start,end) del texto del párrafo por new, conservando el formato del run inicial."""
    ts=tnodes(p); pos=0; first=True; done=False
    for t in ts:
        s=t.text or ''; a,b=pos,pos+len(s); pos=b
        if b<=start or a>=end:
            if a>=end and not done and start==end==a and first: pass
            continue
        ls=max(start,a)-a; le=min(end,b)-a
        if first:
            t.text=s[:ls]+new+s[le:]; first=False
        else:
            t.text=s[:ls]+s[le:]
        t.set('{http://www.w3.org/XML/1998/namespace}space','preserve')
    if first:  # rango vacío al final
        ts[-1].text=(ts[-1].text or '')+new
def rep(body, old, new, book, count=1, why=''):
    hits=[(p,m.start()) for p in paras(body) for m in re.finditer(re.escape(old), ptext(p))]
    if len(hits)!=count:
        raise SystemExit(f'[{book}] esperaba {count} coincidencia(s) y hay {len(hits)}: {old[:80]!r}')
    for p,i in reversed(hits):
        before=ptext(p)
        set_text_range(p,i,i+len(old),new)
        LOG.append((book,'texto',old,new,why))
def find(body, needle, exact=False):
    hits=[p for p in paras(body) if (ptext(p).strip()==needle if exact else needle in ptext(p))]
    if len(hits)!=1: raise SystemExit(f'find: {len(hits)} para {needle[:60]!r}')
    return hits[0]
def strip_ids(el):
    for e in el.iter():
        for k in list(e.attrib):
            if k.startswith('{%s}'%NS['w14']) or k.endswith('}rsidR') or k.endswith('}rsidRDefault') or k.endswith('}rsidRPr') or k.endswith('}rsidP'):
                del e.attrib[k]
    for x in list(el.iter(W+'lastRenderedPageBreak')): x.getparent().remove(x)
def split(body, marker, book):
    p=find(body, marker)
    txt=ptext(p); i=txt.index(marker)
    p2=copy.deepcopy(p); strip_ids(p2)
    sp=p.find(W+'pPr/'+W+'sectPr')
    if sp is not None: sp.getparent().remove(sp)
    set_text_range(p,i,len(txt),'')
    set_text_range(p2,0,i,'')
    # recorta espacios
    for q_ in (p,p2):
        ts=tnodes(q_)
        if ts: ts[0].text=(ts[0].text or '').lstrip(); ts[-1].text=(ts[-1].text or '').rstrip()
    for r in list(p2.iter(W+'r')):   # runs vacíos
        if r.find(W+'drawing') is None and not ''.join(t.text or '' for t in r.iter(W+'t')) and r.find(W+'br') is None: r.getparent().remove(r)
    p.addnext(p2)
    LOG.append((book,'párrafo','(bloque continuo)','punto y aparte antes de: «'+marker[:60]+'…»','respiración'))
    return p2
def move_after(el, target):
    target.addnext(el)
