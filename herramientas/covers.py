import sys, os, numpy as np
sys.path.insert(0,'/home/user/render/wood')
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from engine import carve, to_rgba
from designs import build
FD='/usr/share/texmf/fonts/opentype/public/tex-gyre/'
def F(sz,it=False): return ImageFont.truetype(FD+('texgyrepagella-italic.otf' if it else 'texgyrepagella-regular.otf'),sz)
DPI=300; BL=int(0.125*DPI); W=int(5.5*DPI)+2*BL; H=int(8.5*DPI)+2*BL
OUT='/home/user/jb/diseño/portadas'; os.makedirs(OUT,exist_ok=True)
BOOKS=[('receta','La Receta de La Manifestación','I',['LA RECETA DE LA','MANIFESTACIÓN'],(9,9,9),'#ECE5D4','R1','RT','No podés pescar una ballena con las herramientas para pescar un dorado.'),
       ('pensamiento','El Pensamiento es Tu Fe','II',['EL PENSAMIENTO','ES TU FE'],(246,242,233),'#1E1B18','P1','P6','Logré atravesar el tiempo con éxito.'),
       ('biografia','La Biografía','III',['LA BIOGRAFÍA'],(15,36,62),'#ECE5D4','B1','B2','Detrás del que está llorando hay alguien que está muy tranquilo observando cómo vos estás llorando.')]
def texture(rgb,seed,light):
    rng=np.random.default_rng(seed)
    base=np.ones((H,W,3),np.float32)*np.array(rgb,np.float32)
    n=rng.standard_normal((H,W)).astype(np.float32)
    g=np.asarray(Image.fromarray(((n-n.min())/np.ptp(n)*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.1))).astype(np.float32)/255-0.5
    fib=rng.standard_normal((H//8,W//3)).astype(np.float32)
    fib=np.asarray(Image.fromarray(((fib-fib.min())/np.ptp(fib)*255).astype(np.uint8)).resize((W,H),Image.BICUBIC)).astype(np.float32)/255-0.5
    amp=7 if light else 10
    base+=(g*amp+fib*amp*0.7)[...,None]
    yy,xx=np.mgrid[0:H,0:W]; d=np.sqrt(((xx-W/2)/(W/2))**2+((yy-H/2)/(H/2))**2)
    base*=(1-np.clip(d-0.5,0,1)**1.6*(0.12 if light else 0.38))[...,None]
    return Image.fromarray(np.clip(base,0,255).astype(np.uint8),'RGB').convert('RGBA')
def spaced(draw,cy,text,font,fill,track):
    ws=[draw.textlength(c,font=font) for c in text]; tw=sum(ws)+track*(len(text)-1); x=(W-tw)/2
    for c,w in zip(text,ws): draw.text((x,cy),c,font=font,fill=fill,anchor='ls'); x+=w+track
def wrap(draw,text,font,maxw):
    words=text.split(); lines=[]; cur=''
    for w_ in words:
        t=(cur+' '+w_).strip()
        if draw.textlength(t,font=font)>maxw and cur: lines.append(cur); cur=w_
        else: cur=t
    lines.append(cur); return lines
def diamond(d,cx,cy,r,fill): d.polygon([(cx,cy-r),(cx+r,cy),(cx,cy+r),(cx-r,cy)],fill=fill)
fronts=[]
for k,(b,name,num,title,bg,ink,front_key,back_key,quote) in enumerate(BOOKS):
    light=b=='pensamiento'; muted=ink
    # ---------- TAPA
    im=texture(bg,100+k,light); d=ImageDraw.Draw(im)
    spaced(d,BL+330,num,F(46),ink,18)
    y=BL+500+(130 if len(title)==1 else 0)//2
    for line in title: spaced(d,y,line,F(104),ink,16); y+=130
    diamond(d,W/2,y-30,11,ink)
    y=BL+500+2*130
    tile=to_rgba(carve(build(front_key,True),px=2000,seed=7+k),ink,size=880)
    im.alpha_composite(tile,(int(W/2-440),int(y+40)))
    spaced(d,y+40+880+150,'JULIÁN BERMÚDEZ',F(54),ink,14)
    spaced(d,H-BL-190,'ELVERBO',F(34),ink,16)
    im=im.convert('RGB'); im.save(f'{OUT}/{name} - tapa.png',dpi=(DPI,DPI)); fronts.append(im)
    # ---------- CONTRATAPA
    bk=texture(bg,200+k,light); d=ImageDraw.Draw(bk)
    t2=to_rgba(carve(build(back_key,True),px=1600,seed=17+k),ink,size=430)
    bk.alpha_composite(t2,(int(W/2-215),BL+380))
    fq=F(62,True); lines=wrap(d,'«'+quote+'»',fq,W-2*BL-420)
    y=BL+980
    for ln in lines: d.text((W/2,y),ln,font=fq,fill=ink,anchor='ms'); y+=92
    d.text((W/2,y+30),'JULIÁN BERMÚDEZ',font=F(30),fill=ink,anchor='ms')
    diamond(d,W/2,y+110,9,ink)
    y2=y+240
    for n_,t_,cur in [('I','LA RECETA DE LA MANIFESTACIÓN',b=='receta'),('II','EL PENSAMIENTO ES TU FE',b=='pensamiento'),('III','LA BIOGRAFÍA',b=='biografia')]:
        spaced(d,y2,f'{n_}  ·  {t_}',F(30 if cur else 26),ink if cur else (ink+'99' if False else ink),6); y2+=62
    d.text((BL+150,H-BL-190),'ELVERBO',font=F(30),fill=ink,anchor='ls')
    bk=bk.convert('RGB'); bk.save(f'{OUT}/{name} - contratapa.png',dpi=(DPI,DPI))
    im.save(f'{OUT}/{name} - tapa y contratapa.pdf',save_all=True,append_images=[bk],resolution=DPI)
# ---------- vista de la trilogía
sw=560; sh=int(sw*H/W); pad=90
mock=Image.new('RGB',(3*sw+4*pad,sh+2*pad),(214,208,196))
for i,f in enumerate(fronts):
    s=f.resize((sw,sh),Image.LANCZOS); x=pad+i*(sw+pad)
    sh_=Image.new('RGBA',(sw+40,sh+40),(0,0,0,0)); ImageDraw.Draw(sh_).rectangle([20,20,sw+20,sh+20],fill=(0,0,0,110))
    sh_=sh_.filter(ImageFilter.GaussianBlur(14)); mock.paste(sh_,(x-8,pad-4),sh_); mock.paste(s,(x,pad))
mock.save(f'{OUT}/La trilogía - tapas.jpg',quality=92)
print(os.listdir(OUT))
