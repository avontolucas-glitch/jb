import sys, re, os, copy, shutil, json
sys.path.insert(0,'/home/user/render/build')
from xmlkit import *
from lxml import etree
WK='/home/user/render/build/work'; AS='/home/user/render/build/assets'
EMU=914400; PGW,PGH=int(5.5*EMU),int(8.5*EMU)
XMLSP='{http://www.w3.org/XML/1998/namespace}space'
COL={'receta':dict(main='F2EEE4',muted='B3AB9B',orn='B3AB9B',body=None),
     'pensamiento':dict(main='2B2B2B',muted='6E6A63',orn='4A4640',div_main='F2EEE4',div_muted='BDB5A3'),
     'biografia':dict(main='F2EEE4',muted='A9B8D0',orn='8FA6CC')}
EPI_NEW={'biografia':{1:('Le has hecho poco menor que los ángeles, y lo coronaste de gloria y de honra.','Salmos 8:5',True)}}
TRANS={'receta':'No podés pescar una ballena con las herramientas para pescar un dorado.',
       'pensamiento':'Logré atravesar el tiempo con éxito.',
       'biografia':'Detrás del que está llorando hay alguien que está muy tranquilo observando cómo vos estás llorando.'}
def el(tag,**attrs):
    e=etree.Element(q(tag))
    for k,v in attrs.items(): e.set(q('w:'+k) if ':' not in k else q(k),str(v))
    return e
def sub(parent,tag,**attrs):
    e=el(tag,**attrs); parent.append(e); return e
def rpr(size=None,color=None,i=False,b=False,caps=False,sc=False,track=None,font='Palatino Linotype'):
    r=el('w:rPr'); sub(r,'w:rFonts',ascii=font,hAnsi=font,cs=font)
    if b: sub(r,'w:b'); sub(r,'w:bCs')
    if i: sub(r,'w:i'); sub(r,'w:iCs')
    if caps: sub(r,'w:caps')
    if sc: sub(r,'w:smallCaps')
    if color: sub(r,'w:color',val=color)
    if track is not None: sub(r,'w:spacing',val=track)
    if size: sub(r,'w:sz',val=size); sub(r,'w:szCs',val=size)
    sub(r,'w:lang',val='es-AR')
    return r
def ppr(jc='center',before=0,after=0,line=None,pb=False,keep=False,indL=None,indR=None,first=None,mark=None,sect=None):
    p=el('w:pPr')
    if keep: sub(p,'w:keepNext')
    if pb: sub(p,'w:pageBreakBefore')
    sp=sub(p,'w:spacing',before=before,after=after)
    if line: sp.set(q('w:line'),str(line)); sp.set(q('w:lineRule'),'auto')
    if indL is not None or indR is not None or first is not None:
        ind=sub(p,'w:ind')
        if indL is not None: ind.set(q('w:left'),str(indL))
        if indR is not None: ind.set(q('w:right'),str(indR))
        if first is not None: ind.set(q('w:firstLine'),str(first))
    sub(p,'w:jc',val=jc)
    if mark is not None: p.append(mark)
    if sect is not None: p.append(sect)
    return p
def run(text,rp):
    r=el('w:r'); r.append(rp); t=sub(r,'w:t'); t.text=text; t.set(XMLSP,'preserve'); return r
def para(text,pp,rp):
    p=el('w:p'); p.append(pp); p.append(run(text,copy.deepcopy(rp)) if isinstance(text,str) else text); return p
def set_ppr(p,newp):
    old=p.find(W+'pPr'); sect=None
    if old is not None:
        sect=old.find(W+'sectPr'); p.remove(old)
    if sect is not None: newp.append(sect)
    p.insert(0,newp)
def restyle_runs(p,rp):
    for r in p.findall(W+'r'):
        if r.find(W+'drawing') is not None: continue
        o=r.find(W+'rPr')
        if o is not None: r.remove(o)
        r.insert(0,copy.deepcopy(rp))
def sect_of(p): return p.find(W+'pPr/'+W+'sectPr')
class Pkg:
    def __init__(s,b):
        s.b=b; s.d=f'{WK}/{b}'; s.t=etree.parse(f'{s.d}/word/document.xml'); s.body=s.t.getroot().find(W+'body')
        s.rels=etree.parse(f'{s.d}/word/_rels/document.xml.rels'); s.n=0
        s.ct=open(f'{s.d}/[Content_Types].xml',encoding='utf8').read()
    def add_rel(s,typ,target):
        s.n+=1; rid=f'rIdJB{s.n}'
        e=etree.SubElement(s.rels.getroot(),'{http://schemas.openxmlformats.org/package/2006/relationships}Relationship')
        e.set('Id',rid); e.set('Type','http://schemas.openxmlformats.org/officeDocument/2006/relationships/'+typ); e.set('Target',target); return rid
    def media(s,src,name):
        shutil.copy(src,f'{s.d}/word/media/{name}'); return s.add_rel('image',f'media/{name}')
    def header(s,name,img=None):
        tpl=('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
             '<w:hdr xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" mc:Ignorable="w14">')
        if img:
            sz=int(0.30*EMU); did=9600+s.n
            body=(f'<w:p><w:pPr><w:jc w:val="right"/></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="{sz}" cy="{sz}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="{did}" name="Emblema{did}"/><wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="{did}" name="Emblema{did}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="{sz}" cy="{sz}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>')
            rels=f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/{img}"/></Relationships>'
        else:
            body='<w:p><w:pPr><w:jc w:val="right"/></w:pPr><w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>'
            rels='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>'
        open(f'{s.d}/word/{name}','w',encoding='utf8').write(tpl+body+'</w:hdr>')
        open(f'{s.d}/word/_rels/{name}.rels','w',encoding='utf8').write(rels)
        s.ct=s.ct.replace('</Types>',f'<Override PartName="/word/{name}" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/></Types>')
        return s.add_rel('header',name)
    def part(s,kind,name,body_xml,img=None):
        ns=('xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" mc:Ignorable="w14"')
        tag='w:hdr' if kind=='header' else 'w:ftr'
        open(f'{s.d}/word/{name}','w',encoding='utf8').write(f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<{tag} {ns}>{body_xml}</{tag}>')
        rel='' if not img else f'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/{img}"/>'
        open(f'{s.d}/word/_rels/{name}.rels','w',encoding='utf8').write(f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">{rel}</Relationships>')
        s.ct=s.ct.replace('</Types>',f'<Override PartName="/word/{name}" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.{kind}+xml"/></Types>')
        return s.add_rel(kind,name)
    def save(s):
        if 'Extension="jpg"' not in s.ct and 'Extension="jpeg"' not in s.ct:
            s.ct=s.ct.replace('</Types>','<Default Extension="jpg" ContentType="image/jpeg"/></Types>')
        if 'Extension="png"' not in s.ct: s.ct=s.ct.replace('</Types>','<Default Extension="png" ContentType="image/png"/></Types>')
        open(f'{s.d}/[Content_Types].xml','w',encoding='utf8').write(s.ct)
        s.rels.write(f'{s.d}/word/_rels/document.xml.rels',xml_declaration=True,encoding='UTF-8',standalone=True)
        s.t.write(f'{s.d}/word/document.xml',xml_declaration=True,encoding='UTF-8',standalone=True)
REF=re.compile(r'((?:[1-3] )?[A-ZÁÉÍÓÚ][a-záéíóú]+ \d+:\d+)\s*$')
def epi_text(p):
    out=[]
    for e in p.iter():
        if e.tag==W+'t': out.append(e.text or '')
        elif e.tag==W+'br': out.append('\n')
    return ''.join(out)
BOOKTITLE={'receta':'LA RECETA DE LA MANIFESTACIÓN','pensamiento':'EL PENSAMIENTO ES TU FE','biografia':'LA BIOGRAFÍA'}
DROP={'receta':'E6D8B4','pensamiento':'2B2B2B','biografia':'C9D5EA'}
def rx(text,color,size=15,track=60,sc=False):
    t=html_esc(text)
    return (f'<w:r><w:rPr><w:rFonts w:ascii="Palatino Linotype" w:hAnsi="Palatino Linotype" w:cs="Palatino Linotype"/>'
            + ('<w:smallCaps/>' if sc else '') + f'<w:color w:val="{color}"/><w:spacing w:val="{track}"/><w:sz w:val="{size}"/><w:szCs w:val="{size}"/><w:lang w:val="es-AR"/></w:rPr><w:t xml:space="preserve">{t}</w:t></w:r>')
def html_esc(t): return t.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')
def inline_img(did,inch=0.24):
    sz=int(inch*EMU)
    return (f'<w:r><w:rPr><w:position w:val="-6"/></w:rPr><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="{sz}" cy="{sz}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="{did}" name="Emblema{did}"/><wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="{did}" name="Emblema{did}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="{sz}" cy="{sz}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>')
def design(b):
    P=Pkg(b); body=P.body; C=COL[b]; LOGD=[]
    ps=paras(body)
    # ---------- página 5.5x8.5, márgenes espejados
    for sp in body.iter(W+'sectPr'):
        for x in sp.findall(W+'pgSz'): x.set(q('w:w'),'7920'); x.set(q('w:h'),'12240')
        for x in sp.findall(W+'pgMar'):
            for k,v in dict(top=1080,bottom=1008,left=1080,right=792,header=560,footer=500,gutter=0).items(): x.set(q('w:'+k),str(v))
    st=open(f'{P.d}/word/settings.xml',encoding='utf8').read()
    if '<w:mirrorMargins/>' not in st:
        for tag in ['w:alignBordersAndEdges','w:bordersDoNotSurround','w:gutterAtTop','w:hideSpellingErrors','w:hideGrammaticalErrors','w:activeWritingStyle','w:proofState','w:formsDesign','w:attachedTemplate','w:linkStyles','w:stylePaneFormatFilter','w:stylePaneSortMethod','w:documentType','w:mailMerge','w:revisionView','w:trackRevisions','w:doNotTrackMoves','w:doNotTrackFormatting','w:documentProtection','w:autoFormatOverride','w:styleLockTheme','w:styleLockQFSet','w:defaultTabStop']:
            i=st.find('<'+tag)
            if i>0: st=st[:i]+'<w:mirrorMargins/>'+st[i:]; break
    if '<w:autoHyphenation' not in st:
        m=re.search(r'<w:defaultTabStop[^>]*/>',st)
        if m: st=st[:m.end()]+'<w:autoHyphenation/>'+st[m.end():]
    open(f'{P.d}/word/settings.xml','w',encoding='utf8').write(st)
    sty=open(f'{P.d}/word/styles.xml',encoding='utf8').read()
    sty=re.sub(r'(<w:rPrDefault><w:rPr>.*?)<w:sz w:val="24"/><w:szCs w:val="24"/>',r'\1<w:sz w:val="22"/><w:szCs w:val="22"/>',sty,count=1,flags=re.S)
    open(f'{P.d}/word/styles.xml','w',encoding='utf8').write(sty)
    # ---------- fondos: extensión a página nueva
    for a in body.iter(q('wp:anchor')):
        a.find(q('wp:extent')).set('cx',str(PGW)); a.find(q('wp:extent')).set('cy',str(PGH))
        for x in a.iter(q('a:ext')): x.set('cx',str(PGW)); x.set('cy',str(PGH))
    def set_bg(p,asset,name):
        rid=P.media(f'{AS}/{asset}.jpg',name)
        for bl in p.iter(q('a:blip')): bl.set(q('r:embed'),rid)
    # ---------- medios: emblemas
    nch={'receta':6,'pensamiento':7,'biografia':4}[b]
    emb_rid={}; hdr_rid={}
    for i in range(nch):
        shutil.copy(f'{AS}/{b}_emb{i}.png',f'{P.d}/word/media/emblema{i}.png')
        emb_rid[i]=P.add_rel('image',f'media/emblema{i}.png')
        hdr_rid[i]=P.header(f'headerJB{i}.xml',f'emblema{i}.png')
    hdr_empty=P.header('headerJBvacio.xml',None)
    # ---------- portadilla
    first=ps[0]; set_bg(first,f'{b}_portadilla','fondo_portadilla.jpg')
    elv=[p for p in ps if ptext(p).strip()=='ELVERBO'][0]
    fm=[]; e=first
    while e is not elv: fm.append(e); e=e.getnext()
    tit=[p for p in fm if len(ptext(p).strip())>12][0]
    empt=[p for p in fm if not ptext(p).strip() and p is not first]
    top=[p for p in empt if fm.index(p)<fm.index(tit)]; bot=[p for p in empt if fm.index(p)>fm.index(tit)]
    for p in top[4:]: p.getparent().remove(p)
    for p in bot[12:]: p.getparent().remove(p)
    brk={'LA RECETA DE LA MANIFESTACIÓN':('LA RECETA DE LA','MANIFESTACIÓN'),'EL PENSAMIENTO ES TU FE':('EL PENSAMIENTO','ES TU FE')}.get(ptext(tit).strip())
    if brk:
        r0=[r for r in tit.findall(W+'r') if r.find(W+'t') is not None][0]
        for r in tit.findall(W+'r')[1:]:
            if r.find(W+'drawing') is None: tit.remove(r)
        r0.find(W+'t').text=brk[0]; sub(r0,'w:br'); t2=sub(r0,'w:t'); t2.text=brk[1]
    # copyright: compactar vacíos
    toc_head=[p for p in ps if ptext(p).strip()=='CONTENIDOS'][0]
    e=elv.getnext(); cp=[]
    while e is not toc_head: cp.append(e); e=e.getnext()
    run_e=[]
    for p in cp+[None]:
        if p is not None and not ptext(p).strip(): run_e.append(p); continue
        for x in run_e[1:]: x.getparent().remove(x)
        run_e=[]
    LEGAL={'receta':'CFC8B8','pensamiento':'4A4640','biografia':'B9C6DA'}[b]
    for p in cp:
        if p.getparent() is None: continue
        for r_ in p.iter(W+'r'):
            rp_=r_.find(W+'rPr')
            if rp_ is None: rp_=el('w:rPr'); r_.insert(0,rp_)
            for tag in ('rFonts','color','sz','szCs'):
                for x in rp_.findall(W+tag): rp_.remove(x)
            rp_.insert(0,el('w:rFonts',ascii='Palatino Linotype',hAnsi='Palatino Linotype',cs='Palatino Linotype'))
            order=[W+t for t in ('rStyle','rFonts','b','bCs','i','iCs','caps','smallCaps','strike','dstrike','outline','shadow','emboss','imprint','noProof','snapToGrid','vanish','webHidden','color','spacing','w','kern','position','sz','szCs')]
            for tag,val in (('color',LEGAL),('sz','16'),('szCs','16')):
                e_=el('w:'+tag,val=val); idx=order.index(W+tag)
                pos=len(rp_)
                for i_,c in enumerate(rp_):
                    if c.tag in order and order.index(c.tag)>idx: pos=i_; break
                rp_.insert(pos,e_)
    set_bg(toc_head,f'{b}_toc','fondo_indice.jpg')
    # ---------- capítulos
    heads=[p for p in paras(body) if re.fullmatch(r'CAPÍTULO \d+',ptext(p).strip())]
    toc=[p for p in paras(body) if re.match(r'\s*CAPÍTULO \d+ · ',ptext(p))]
    titles=[]
    for n,h in enumerate(heads):
        title=h.getnext(); titles.append(ptext(title).strip())
        div = b=='pensamiento'
        main=C['div_main'] if div else C['main']; muted=C['div_muted'] if div else C['muted']
        set_bg(h,f'{b}_cap{n}',f'fondo_cap{n}.jpg')
        set_ppr(h,ppr(before=2640,after=60,pb=True,keep=True))
        restyle_runs(h,rpr(size=19,color=muted,track=110))
        tt=ptext(title); set_text_range(title,0,len(tt),tt.strip())
        set_ppr(title,ppr(after=300,keep=True,line=252))
        restyle_runs(title,rpr(size=33,color=main,track=50))
        # región del epígrafe
        reg=[]; e=title.getnext()
        while e is not None and e.tag==W+'p':
            tx=ptext(e).strip(); jc=e.find(W+'pPr/'+W+'jc')
            isbody=(jc is not None and jc.get(q('w:val'))=='both' and len(tx)>60) or (len(tx)>60 and not tx.startswith(('"','“','«')) and not REF.search(tx))
            if isbody: break
            reg.append(e); e=e.getnext()
        firstbody=e
        txt='\n'.join(epi_text(p) for p in reg)
        marker='versículo propuesto' in txt
        txt=txt.replace('[versículo propuesto — a confirmar]','')
        m=REF.search(txt.strip())
        if m:
            ref=m.group(1); quote=txt.strip()[:m.start()].strip()
        elif n in EPI_NEW.get(b,{}):
            quote,ref,marker=EPI_NEW[b][n]; LOGD.append(('diseño',f'Cap. {n}: se propone epígrafe {ref}'))
        else: quote=ref=None
        for p in reg:
            sp=sect_of(p)
            if sp is not None: raise SystemExit('sectPr en epígrafe')
            p.getparent().remove(p)
        anchor=title
        if quote:
            quote=re.sub(r'\s*\n\s*',' ',quote); quote=re.sub(r',(?=\S)',', ',quote).strip().strip('"“”«» ')
            qp=para('«'+quote+'»',ppr(after=80,line=264,indL=560,indR=560,keep=True),rpr(size=21,color=main,i=True))
            anchor.addnext(qp); anchor=qp
            rp_=para(ref,ppr(after=(80 if marker else 520),keep=True),rpr(size=18,color=muted,sc=True,track=40))
            anchor.addnext(rp_); anchor=rp_
            if marker:
                mp=para('[versículo propuesto — a confirmar]',ppr(after=520),rpr(size=15,color=muted,i=True))
                anchor.addnext(mp); anchor=mp
        if div and firstbody is not None:
            fb=firstbody.find(W+'pPr')
            if fb is None: fb=el('w:pPr'); firstbody.insert(0,fb)
            if fb.find(W+'pageBreakBefore') is None:
                pos=0
                for i_,c in enumerate(fb):
                    if c.tag in (W+'pStyle',W+'keepNext',W+'keepLines'): pos=i_+1
                fb.insert(pos,el('w:pageBreakBefore'))
    # ---------- "En el principio" en versalitas (Cap. 0)
    h0=heads[0]; e=h0.getnext()
    while e is not None and not ptext(e).strip().startswith('En el principio'): e=e.getnext()
    if e is not None:
        r=[r for r in e.findall(W+'r') if r.find(W+'t') is not None][0]; t=r.find(W+'t')
        if t.text.startswith('En el principio'):
            r2=copy.deepcopy(r); t.text=t.text[len('En el principio'):]
            r2.find(W+'t').text='En el principio'
            rp2=r2.find(W+'rPr') if r2.find(W+'rPr') is not None else sub(r2,'w:rPr')
            if rp2.find(W+'smallCaps') is None:
                x=el('w:smallCaps'); 
                kids=[c.tag for c in rp2]; idx=0
                for i_,c in enumerate(rp2):
                    if c.tag in (W+'rStyle',W+'rFonts',W+'b',W+'bCs',W+'i',W+'iCs',W+'caps'): idx=i_+1
                rp2.insert(idx,x)
                y=el('w:spacing',val=30); idx2=len(rp2)
                for i_,c in enumerate(rp2):
                    if c.tag in (W+'sz',W+'szCs',W+'lang',W+'w',W+'kern',W+'position'): idx2=min(idx2,i_)
                rp2.insert(idx2,y)
            r.addprevious(r2)
    # ---------- cuerpo: respiración (interlineado y espacio entre párrafos)
    for p in paras(body):
        jc=p.find(W+'pPr/'+W+'jc')
        if jc is not None and jc.get(q('w:val'))=='both' and ptext(p).strip():
            pp=p.find(W+'pPr'); spc=pp.find(W+'spacing')
            if spc is None:
                spc=el('w:spacing'); anchor_tags=[W+'pStyle',W+'keepNext',W+'keepLines',W+'pageBreakBefore',W+'framePr',W+'widowControl',W+'numPr',W+'suppressLineNumbers',W+'pBdr',W+'shd',W+'tabs',W+'suppressAutoHyphens',W+'kinsoku',W+'wordWrap',W+'overflowPunct',W+'topLinePunct',W+'autoSpaceDE',W+'autoSpaceDN',W+'bidi',W+'adjustRightInd',W+'snapToGrid']
                idx=0
                for i_,c in enumerate(pp):
                    if c.tag in anchor_tags: idx=i_+1
                pp.insert(idx,spc)
            for k in list(spc.attrib): del spc.attrib[k]
            spc.set(q('w:before'),'0'); spc.set(q('w:after'),'150'); spc.set(q('w:line'),'290'); spc.set(q('w:lineRule'),'auto')
    # ---------- ornamento de cierre ◆ ◆ ◆ y transiciones
    heads=[p for p in paras(body) if re.fullmatch(r'CAPÍTULO \d+',ptext(p).strip())]
    tq=[p for p in paras(body) if ptext(p).strip()==TRANS[b]]
    tq=[p for p in tq if sect_of(p) is not None][0]
    for n,h in enumerate(heads):
        stop=heads[n+1] if n+1<len(heads) else None
        e=h; last=None
        while e is not None and e is not stop:
            if e is tq: break
            if e.tag==W+'p' and ptext(e).strip() and e is not h and e is not h.getnext(): last=e
            e=e.getnext()
        orn=para('◆ ◆ ◆',ppr(before=420,after=0),rpr(size=18,color=C['orn'],track=60))
        last.addnext(orn)
        lp=last.find(W+'pPr')
        if lp.find(W+'keepNext') is None:
            pos=0
            for i_,c in enumerate(lp):
                if c.tag==W+'pStyle': pos=i_+1
            lp.insert(pos,el('w:keepNext'))
        sp=sect_of(last)
        if sp is not None: sp.getparent().remove(sp); orn.find(W+'pPr').append(sp)
        # vacíos sobrantes después del ornamento (sin tocar el bloque de transición)
        e=orn.getnext()
        while e is not None and e.tag==W+'p' and not ptext(e).strip() and e.find('.//'+W+'drawing') is None and e.find(W+'pPr/'+W+'pageBreakBefore') is None:
            nx=e.getnext(); sp2=sect_of(e)
            if sp2 is not None:
                sp2.getparent().remove(sp2); o=sect_of(orn)
                if o is not None: o.getparent().remove(o)
                orn.find(W+'pPr').append(sp2)
            e.getparent().remove(e); e=nx
    # transición
    e=tq.getprevious(); empt=[]
    while e is not None and e.tag==W+'p' and not ptext(e).strip() and e.find('.//'+W+'drawing') is None:
        empt.append(e); e=e.getprevious()
    for x in empt[:-7]: x.getparent().remove(x)
    set_bg(tq,f'{b}_trans','fondo_transicion.jpg')
    restyle_runs(tq,rpr(size=26,color=C['main'],i=True,track=10))
    pp=tq.find(W+'pPr'); ind=el('w:ind'); ind.set(q('w:left'),'560'); ind.set(q('w:right'),'560')
    jcx=pp.find(W+'jc'); jcx.addprevious(ind)
    # ---------- titulillos (par: libro · impar: capítulo) y folios
    heads_now=[p for p in paras(body) if re.fullmatch(r'CAPÍTULO \d+',ptext(p).strip())]
    ctitles=[ptext(h.getnext()).strip() for h in heads_now]
    mu=C['muted']
    odd={}; even={}
    for i in range(nch):
        odd[i]=P.part('header',f'headerJBimpar{i}.xml',f'<w:p><w:pPr><w:jc w:val="right"/></w:pPr>{rx(ctitles[i],mu)}{rx("   ",mu)}{inline_img(9800+i)}</w:p>',f'emblema{i}.png')
        even[i]=P.part('header',f'headerJBpar{i}.xml',f'<w:p><w:pPr><w:jc w:val="left"/></w:pPr>{inline_img(9850+i)}{rx("   ",mu)}{rx(BOOKTITLE[b],mu)}</w:p>',f'emblema{i}.png')
    fld=(f'<w:fldSimple w:instr=" PAGE ">{rx("1",mu,size=17,track=20)}</w:fldSimple>')
    ftr=P.part('footer','footerJB.xml',f'<w:p><w:pPr><w:jc w:val="center"/></w:pPr>{rx("·   ",mu,size=17,track=0)}{fld}{rx("   ·",mu,size=17,track=0)}</w:p>')
    ftr0=P.part('footer','footerJBvacio.xml','<w:p><w:pPr><w:jc w:val="center"/></w:pPr></w:p>')
    cur=None
    for x in body:
        if x.tag==W+'p':
            tx=ptext(x).strip()
            if re.fullmatch(r'CAPÍTULO \d+',tx): cur=int(tx.split()[1])
            sp=sect_of(x)
        elif x.tag==W+'sectPr': sp=x
        else: sp=None
        if sp is None or cur is None: continue
        for r_ in sp.findall(W+'headerReference')+sp.findall(W+'footerReference'): sp.remove(r_)
        if x is tq: refs=[('header','default',hdr_empty),('header','even',hdr_empty),('footer','default',ftr0),('footer','even',ftr0)]
        else: refs=[('header','default',odd[cur]),('header','even',even[cur]),('footer','default',ftr),('footer','even',ftr)]
        for k,(kind,typ,rid) in enumerate(refs):
            e_=el(f'w:{kind}Reference',type=typ); e_.set(q('r:id'),rid); sp.insert(k,e_)
    st=open(f'{P.d}/word/settings.xml',encoding='utf8').read()
    if '<w:evenAndOddHeaders' not in st:
        m=re.search(r'<w:(bookFoldRevPrinting|bookFoldPrinting|drawingGridHorizontalSpacing|drawingGridVerticalSpacing|displayHorizontalDrawingGridEvery|displayVerticalDrawingGridEvery|doNotUseMarginsForDrawingGridOrigin|drawingGridHorizontalOrigin|drawingGridVerticalOrigin|doNotShadeFormData|noPunctuationKerning|characterSpacingControl)\b',st)
        st=st[:m.start()]+'<w:evenAndOddHeaders/>'+st[m.start():]
        open(f'{P.d}/word/settings.xml','w',encoding='utf8').write(st)
    # ---------- índice (CONTENIDOS) en el orden nuevo, con emblemas
    tsect=None
    for p in toc:
        s_=sect_of(p)
        if s_ is not None: tsect=s_; s_.getparent().remove(s_)
    donor=[p for p in toc if p.find('.//'+q('wp:inline')) is not None][0]
    donor_run=[r for r in donor.findall(W+'r') if r.find(W+'drawing') is not None][0]
    bytitle={re.sub(r'^\s*CAPÍTULO \d+ · ','',ptext(p)).strip():p for p in toc}
    anchor=toc[0].getprevious()
    for p in toc: p.getparent().remove(p)
    for n,ti in enumerate(titles):
        p=bytitle[ti]
        if p.find('.//'+q('wp:inline')) is None:
            p.insert(1,copy.deepcopy(donor_run))
        for bl in p.iter(q('a:blip')): bl.set(q('r:embed'),emb_rid[n])
        for ex in p.iter(q('wp:extent')): ex.set('cx',str(int(0.24*EMU))); ex.set('cy',str(int(0.24*EMU)))
        for ex in p.iter(q('a:ext')): ex.set('cx',str(int(0.24*EMU))); ex.set('cy',str(int(0.24*EMU)))
        for dp in p.iter(q('wp:docPr')): dp.set('id',str(9700+n))
        for dp in p.iter(q('pic:cNvPr')): dp.set('id',str(9700+n))
        tr=[r for r in p.findall(W+'r') if r.find(W+'t') is not None][-1]
        for r in [r for r in p.findall(W+'r') if r.find(W+'t') is not None][:-1]: p.remove(r)
        tr.find(W+'t').text=f'  CAPÍTULO {n} · {ti}'; tr.find(W+'t').set(XMLSP,'preserve')
        anchor.addnext(p); anchor=p
    anchor.find(W+'pPr').append(tsect)
    # ---------- citas bíblicas dentro del texto (Juan 10:30)
    for p in paras(body):
        if ptext(p).strip()=='"Yo y el Padre uno somos."':
            t=tnodes(p); t[0].text='«Yo y el Padre uno somos.»'
            for x in t[1:]: x.text=''
            set_ppr(p,ppr(before=120,after=40,keep=True)); restyle_runs(p,rpr(size=21,color=None if b=='pensamiento' else C['main'],i=True))
            nx=p.getnext(); set_ppr(nx,ppr(after=200)); restyle_runs(nx,rpr(size=18,color=C['muted'],sc=True,track=40))
    # ---------- espaciador fijo sobre cada apertura (el grabado del fondo queda arriba)
    for h in [p for p in paras(body) if re.fullmatch(r'CAPÍTULO \d+',ptext(p).strip())]:
        spacer=el('w:p'); pp_=el('w:pPr'); sub(pp_,'w:keepNext'); sub(pp_,'w:pageBreakBefore')
        sub(pp_,'w:spacing',before=0,after=0,line=2560,lineRule='exact'); sub(pp_,'w:jc',val='center'); spacer.append(pp_)
        dr=[r for r in h.findall(W+'r') if r.find(W+'drawing') is not None]
        for r in dr: spacer.append(r)
        hp=h.find(W+'pPr'); pb=hp.find(W+'pageBreakBefore')
        if pb is not None: hp.remove(pb)
        hp.find(W+'spacing').set(q('w:before'),'0')
        h.addprevious(spacer)
    # ---------- letra capital de tres líneas en cada apertura
    for h in [p for p in paras(body) if re.fullmatch(r'CAPÍTULO \d+',ptext(p).strip())]:
        e=h.getnext()
        while e is not None:
            jc_=e.find(W+'pPr/'+W+'jc') if e.tag==W+'p' else None
            if jc_ is not None and jc_.get(q('w:val'))=='both' and ptext(e).strip(): break
            e=e.getnext()
        ts=[t for t in tnodes(e) if (t.text or '').strip()]
        first=ts[0]; lead=first.text.lstrip(); letter=lead[0]
        first.text=lead[1:]
        dp=el('w:p'); pp_=el('w:pPr'); sub(pp_,'w:keepNext')
        pb=e.find(W+'pPr/'+W+'pageBreakBefore')
        if pb is not None: e.find(W+'pPr').remove(pb); sub(pp_,'w:pageBreakBefore')
        fp=sub(pp_,'w:framePr',dropCap='drop',lines=3,wrap='around',vAnchor='text',hAnchor='text')
        sub(pp_,'w:spacing',before=0,after=0,line=880,lineRule='exact'); sub(pp_,'w:textAlignment',val='baseline')
        dp.append(pp_)
        rp_=rpr(size=108,color=DROP[b]); pos=el('w:position',val=-9)
        rp_.insert([c.tag for c in rp_].index(W+'sz'),pos)
        dp.append(run(letter,rp_))
        e.addprevious(dp)
    # ---------- página «La trilogía» antes del índice
    toc_head=[p for p in paras(body) if ptext(p).strip()=='CONTENIDOS'][0]
    mu=C['muted']; mn=C['main'] if b!='pensamiento' else '2B2B2B'
    items=[('I','LA RECETA DE LA MANIFESTACIÓN','el cómo','receta'),('II','EL PENSAMIENTO ES TU FE','el porqué','pensamiento'),('III','LA BIOGRAFÍA','el quién','biografia')]
    blk=[para('LA TRILOGÍA',ppr(before=2300,after=120,pb=True,keep=True),rpr(size=22,color=mu,track=160)),
         para('◆',ppr(after=560,keep=True),rpr(size=16,color=mu))]
    for num,tit,sub_,bk in items:
        cur_=bk==b
        blk.append(para(f'{num}  ·  {tit}',ppr(after=40,keep=True),rpr(size=20 if cur_ else 18,color=mn if cur_ else mu,track=70)))
        blk.append(para(sub_,ppr(after=380,keep=True),rpr(size=17,color=mu,i=True,track=20)))
    for x in blk: toc_head.addprevious(x)
    # ---------- notas de puente con el emblema del capítulo al que apuntan
    KEYOF={'Receta':'R','El Pensamiento es Tu Fe':'P','Biografía':'B'}
    def inline_doc(rid,did,inch):
        sz=int(inch*EMU)
        x=(f'<w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
           f'<w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="{sz}" cy="{sz}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="{did}" name="Puente{did}"/><wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="{did}" name="Puente{did}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="{rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="{sz}" cy="{sz}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>')
        return etree.fromstring(x)
    xrid={}
    def xemb(key):
        if key not in xrid: xrid[key]=P.media(f'{AS}/x_{b}_{key}.png',f'puente_{key}.png')
        return xrid[key]
    did=9900
    for p in paras(body):
        m=re.search(r'(Receta|El Pensamiento es Tu Fe|Biografía), Capítulo (\d+)\.$',ptext(p).strip())
        if not m or len(ptext(p))>220: continue
        key=KEYOF[m.group(1)]+m.group(2)
        firstr=[r for r in p.findall(W+'r') if r.find(W+'t') is not None][0]
        im_=inline_doc(xemb(key),did,0.26); did+=1
        br=el('w:r'); sub(br,'w:br')
        firstr.addprevious(im_); firstr.addprevious(br)
        pp=p.find(W+'pPr'); spc=pp.find(W+'spacing')
        if spc is None:
            spc=el('w:spacing'); pp.find(W+'jc').addprevious(spc)
        spc.set(q('w:before'),'200'); spc.set(q('w:after'),'260')
        LOGD.append(('diseño',f'nota de puente con emblema {key}'))
    # ---------- mapa de la trilogía (sección final, encabezado limpio) y colofón
    orns=[p for p in paras(body) if ptext(p).strip()=='◆ ◆ ◆']
    lastorn=orns[-1]
    e=lastorn.getnext()
    while e is not None and e.tag==W+'p' and not ptext(e).strip() and e.find('.//'+W+'drawing') is None:
        nx=e.getnext(); e.getparent().remove(e); e=nx
    final=body.find(W+'sectPr')
    chap_sect=copy.deepcopy(final)
    refs=chap_sect.findall(W+'headerReference')+chap_sect.findall(W+'footerReference')
    t_=el('w:type',val='continuous'); refs[-1].addnext(t_)
    for x in chap_sect.findall(W+'cols'): chap_sect.remove(x)
    lastorn.find(W+'pPr').append(chap_sect)
    for hr in final.findall(W+'headerReference'): hr.set(q('r:id'),hdr_empty)
    T={'R':['DOS FORMATOS DE LA MENTE','EL SENTIMIENTO CREA LA REALIDAD','CONOCEDORES DEL BIEN Y EL MAL','AHORA MISMO','LA PESCA','CARGAR EL ESTADO'],
       'P':['LA PALABRA','LIBERTAD INTERNA','EL OBSERVADOR ETERNO','CONVERSACIONES SINCERAS','LA INTELIGENCIA NATURAL','ARQUETIPOS','ATRAVESAR EL TIEMPO'],
       'B':['PRIMERA IMAGEN','EL RECONOCIMIENTO','EL DESASTRE','PONER A PRUEBA']}
    mine={'receta':'R','pensamiento':'P','biografia':'B'}[b]
    mn=C['main'] if b!='pensamiento' else '2B2B2B'; mu=C['muted']
    anchor=lastorn
    def add(x):
        nonlocal_anchor[0].addnext(x); nonlocal_anchor[0]=x
    nonlocal_anchor=[anchor]
    add(para('LA TRILOGÍA, CAPÍTULO A CAPÍTULO',ppr(before=1300,after=100,pb=True,keep=True),rpr(size=18,color=mu,track=60)))
    add(para('Cada número de capítulo es la misma imagen vista desde otra faceta.',ppr(after=60,keep=True),rpr(size=17,color=mu,i=True)))
    add(para('◆',ppr(after=300,keep=True),rpr(size=14,color=mu)))
    ns='xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"'
    def cellxml(w,inner): return f'<w:tc><w:tcPr><w:tcW w:w="{w}" w:type="dxa"/><w:vAlign w:val="top"/></w:tcPr>{inner}</w:tc>'
    def ptxt(text,size,color,track=40,i=False,after=0):
        return (f'<w:p><w:pPr><w:spacing w:before="0" w:after="{after}" w:line="220" w:lineRule="auto"/><w:jc w:val="center"/></w:pPr>'
                f'<w:r><w:rPr><w:rFonts w:ascii="Palatino Linotype" w:hAnsi="Palatino Linotype" w:cs="Palatino Linotype"/>'+('<w:i/>' if i else '')+f'<w:color w:val="{color}"/><w:spacing w:val="{track}"/><w:sz w:val="{size}"/><w:szCs w:val="{size}"/><w:lang w:val="es-AR"/></w:rPr><w:t xml:space="preserve">{html_esc(text)}</w:t></w:r></w:p>')
    rows=''
    hdr=''.join(cellxml(1848,ptxt(n_,13,mn if k_==mine else mu,20,after=120)) for k_,n_ in [('R','RECETA'),('P','PENSAMIENTO'),('B','BIOGRAFÍA')])
    rows+=f'<w:tr><w:trPr><w:cantSplit/></w:trPr>{cellxml(504,ptxt("",14,mu))}{hdr}</w:tr>'
    imgcells=[]
    for n in range(7):
        cells=[cellxml(504,ptxt(str(n),22,mu,0))]
        for k_ in 'RPB':
            if n<len(T[k_]):
                key=f'{k_}{n}'; rid=xemb(key)
                img=etree.tostring(inline_doc(rid,did,0.36)).decode(); did+=1
                img=re.sub(r' xmlns:\w+="[^"]*"','',img)
                inner=(f'<w:p><w:pPr><w:spacing w:before="0" w:after="40"/><w:jc w:val="center"/></w:pPr>{img}</w:p>'
                       +ptxt(T[k_][n],13,mn if k_==mine else mu,30,after=180))
            else: inner=ptxt('·',16,mu,0)
            cells.append(cellxml(1848,inner))
        rows+=f'<w:tr><w:trPr><w:cantSplit/></w:trPr>{"".join(cells)}</w:tr>'
    tbl=(f'<w:tbl xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
         '<w:tblPr><w:tblW w:w="6048" w:type="dxa"/><w:jc w:val="center"/><w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar><w:left w:w="40" w:type="dxa"/><w:right w:w="40" w:type="dxa"/></w:tblCellMar><w:tblLook w:val="0000" w:firstRow="0" w:lastRow="0" w:firstColumn="0" w:lastColumn="0" w:noHBand="1" w:noVBand="1"/></w:tblPr>'
         '<w:tblGrid><w:gridCol w:w="504"/><w:gridCol w:w="1848"/><w:gridCol w:w="1848"/><w:gridCol w:w="1848"/></w:tblGrid>'+rows+'</w:tbl>')
    add(etree.fromstring(tbl))
    add(para('',ppr(after=0),rpr(size=8)))
    col=[('◆',14,False,500,False),
         ('Este libro se terminó de componer en septiembre de 2026, en tipografía Palatino, para ELVERBO EDITORIAL.',17,True,160,False),
         ('Los grabados que abren cada capítulo comparten orla y motivo en los tres libros de la trilogía: el mismo número de capítulo, la misma imagen, vista desde otra faceta de Julián Bermúdez.',17,True,160,False),
         ('Buenos Aires, Argentina',15,False,0,False)]
    for k,(tx,sz,it,aft,_) in enumerate(col):
        add(para(tx,ppr(before=(3000 if k==0 else 0),after=aft,pb=(k==0),keep=True,indL=700,indR=700),rpr(size=sz,color=mu,i=it,track=(0 if k else 20))))
    LOGD.append(('diseño','mapa de la trilogía y colofón al final'))
    P.save()
    # ---------- limpieza de medios viejos sin referencia
    doc=open(f'{P.d}/word/document.xml',encoding='utf8').read()
    used=set(re.findall(r'r:(?:embed|id)="([^"]+)"',doc))
    rel=P.rels.getroot(); removed=[]
    for r in list(rel):
        tgt=r.get('Target'); rid=r.get('Id')
        if (tgt.startswith('media/bg_') or re.match(r'media/image\d+\.png',tgt)) and rid not in used:
            rel.remove(r); removed.append(tgt)
    P.rels.write(f'{P.d}/word/_rels/document.xml.rels',xml_declaration=True,encoding='UTF-8',standalone=True)
    allrels=''.join(open(os.path.join(dp,f),encoding='utf8').read() for dp,_,fs in os.walk(f'{P.d}/word/_rels') for f in fs)
    for f in os.listdir(f'{P.d}/word/media'):
        if f'media/{f}' not in allrels: os.remove(f'{P.d}/word/media/{f}')
    print(b,'ok; medios viejos quitados:',len(removed),LOGD)
    return LOGD
logd={}
for b in ['receta','pensamiento','biografia']: logd[b]=design(b)
json.dump(logd,open(f'{WK}/log_design.json','w'),ensure_ascii=False)
