import sys, os, numpy as np
sys.path.insert(0,'/home/user/render/wood')
from PIL import Image, ImageFilter
from engine import carve, to_rgba
from designs import build
OUT='/home/user/render/build/assets'; os.makedirs(OUT,exist_ok=True)
DPI=200; PW,PH=int(5.5*DPI),int(8.5*DPI)
CREAM='#ECE5D4'
BOOK={'receta':{'bg':(9,9,9),'ink':CREAM,'hdr':'#E6DFCE'},
      'pensamiento':{'bg':(251,249,244),'ink':'#1E1B18','hdr':'#2B2B2B','div':(11,11,11)},
      'biografia':{'bg':(15,36,62),'ink':CREAM,'hdr':'#E6DFCE'}}
def texture(rgb, seed, light=False):
    rng=np.random.default_rng(seed)
    base=np.ones((PH,PW,3),np.float32)*np.array(rgb,np.float32)
    n=rng.standard_normal((PH,PW)).astype(np.float32)
    g=np.asarray(Image.fromarray(((n-n.min())/(np.ptp(n))*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))).astype(np.float32)/255-0.5
    fib=rng.standard_normal((PH//6,PW//2)).astype(np.float32)
    fib=np.asarray(Image.fromarray(((fib-fib.min())/np.ptp(fib)*255).astype(np.uint8)).resize((PW,PH),Image.BICUBIC)).astype(np.float32)/255-0.5
    amp=7 if light else 9
    base+= (g*amp + fib*amp*0.6)[...,None]
    yy,xx=np.mgrid[0:PH,0:PW]; d=np.sqrt(((xx-PW/2)/(PW/2))**2+((yy-PH/2)/(PH/2))**2)
    vig=np.clip(d-0.55,0,1)**1.6
    base*= (1-vig*(0.10 if light else 0.35))[...,None]
    return Image.fromarray(np.clip(base,0,255).astype(np.uint8),'RGB')
def place(bg, key, cx, top, size, color, framed=True, opacity=0.96, seed=5):
    m=carve(build(key,framed),px=1400,seed=seed)
    ic=to_rgba(m,color,size=size,opacity=opacity)
    bg=bg.convert('RGBA'); bg.alpha_composite(ic,(int(cx-size/2),int(top))); return bg.convert('RGB')
def diamond_ghost(bg,color,op):
    from designs import Ink
    from engine import carve
    ink=Ink(3); C=500
    ink.poly([(500,120),(880,500),(500,880),(120,500)],3,'black'); ink.poly([(500,190),(810,500),(500,810),(190,500)],2,'white')
    ink.poly([(500,300),(700,500),(500,700),(300,500)],2,'black')
    m=carve(ink,px=1200,seed=9); ic=to_rgba(m,color,size=int(PW*0.46),opacity=op)
    bg=bg.convert('RGBA'); bg.alpha_composite(ic,(int(PW/2-ic.size[0]/2),int(PH*0.47))); return bg.convert('RGB')
def save(img,name): img.save(f'{OUT}/{name}.jpg',quality=86,optimize=True,progressive=True)
TILE=int(1.45*DPI); TOP=int(0.9*DPI)
for b,cfg in BOOK.items():
    light=b=='pensamiento'
    pd=texture(cfg['bg'],1,light); save(diamond_ghost(pd,cfg['ink'],0.07),f'{b}_portadilla')
    save(texture(cfg['bg'],2,light),f'{b}_toc')
keys={'receta':['R0','R1','R2','R3','R4','R5'],'pensamiento':['P0','P1','P2','P3','P4','P5','P6'],'biografia':['B0','B1','B2','B3']}
for b,ks in keys.items():
    cfg=BOOK[b]
    for i,k in enumerate(ks):
        if b=='pensamiento': base=texture(cfg['div'],10+i); col=CREAM
        else: base=texture(cfg['bg'],10+i); col=cfg['ink']
        save(place(base,k,PW/2,TOP,TILE,col,seed=20+i),f'{b}_cap{i}')
    # emblemas de encabezado / índice
    for i,k in enumerate(ks):
        m=carve(build(k,False),px=900,seed=40+i)
        to_rgba(m,cfg['hdr'],size=300).save(f'{OUT}/{b}_emb{i}.png')
# transiciones
T=int(1.15*DPI); TT=int(5.35*DPI)
save(place(texture(BOOK['receta']['bg'],30),'RT',PW/2,TT,T,CREAM,seed=31),'receta_trans')
save(place(texture(BOOK['pensamiento']['bg'],31,True),'P6',PW/2,TT,T,'#1E1B18',seed=32),'pensamiento_trans')
save(place(texture(BOOK['biografia']['bg'],32),'B2',PW/2,TT,T,CREAM,seed=33),'biografia_trans')
print(sorted(os.listdir(OUT)))
