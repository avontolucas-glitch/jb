# Motor de "grabado" (xilografía/linóleo) procedural: formas con temblor de mano, cortes de gubia, grano y bordes comidos.
import math, random, io
import numpy as np, cairosvg
from PIL import Image, ImageFilter
S = 1000.0  # lienzo lógico 1000x1000

class Ink:
    def __init__(self, seed):
        self.r = random.Random(seed)
        self.ops = []     # (color, path) en orden de tallado
        ink=self
        class L:
            def __init__(s,c): s.c=c
            def append(s,p): ink.ops.append((s.c,p))
        self.black=L('#000'); self.white=L('#fff'); self.black2=L('#000')
    # --- primitivas con temblor
    def jit(self, a): return self.r.uniform(-a, a)
    def wob(self, pts, amp=2.2, closed=True):
        out=[]; n=len(pts)
        ph=[self.r.uniform(0,6.28) for _ in range(3)]
        for i,(x,y) in enumerate(pts):
            t=i/max(n,1)*6.28
            d=amp*(0.6*math.sin(3*t+ph[0])+0.3*math.sin(7*t+ph[1])+0.25*math.sin(13*t+ph[2]))
            out.append((x+d+self.jit(amp*0.35), y+d*0.7+self.jit(amp*0.35)))
        return out
    @staticmethod
    def path(pts, closed=True):
        s='M%.1f %.1f '%pts[0]+' '.join('L%.1f %.1f'%p for p in pts[1:])
        return s+(' Z' if closed else '')
    def poly(self, pts, amp=2.2, layer='black'):
        getattr(self,layer).append(self.path(self.wob(pts,amp)))
    def circle(self, cx, cy, r, amp=None, layer='black', n=None):
        n=n or max(24,int(r*0.9)); amp=amp if amp is not None else max(1.2,r*0.018)
        pts=[(cx+r*math.cos(2*math.pi*i/n), cy+r*math.sin(2*math.pi*i/n)) for i in range(n)]
        self.poly(pts,amp,layer)
    def ring(self, cx, cy, r, w, layer_out='black', layer_in='white'):
        self.circle(cx,cy,r+w/2,layer=layer_out); self.circle(cx,cy,r-w/2,layer=layer_in)
    def stroke(self, pts, w0, w1=None, layer='black', amp=1.0, taper=True):
        """trazo de pincel/gubia: polilínea con ancho variable (afinado en las puntas)."""
        if len(pts)<2: return
        w1 = w0 if w1 is None else w1
        P=self.sample(pts, 90)
        L=[];R=[]
        for i,(x,y) in enumerate(P):
            t=i/(len(P)-1)
            w=w0+(w1-w0)*t
            if taper: w*=max(0.18, math.sin(math.pi*min(1,max(0,t*0.92+0.04)))**0.55)
            w*=1+0.12*math.sin(t*11+self.r.uniform(0,1))
            x2,y2=P[min(i+1,len(P)-1)]; x1,y1=P[max(i-1,0)]
            dx,dy=x2-x1,y2-y1; l=math.hypot(dx,dy) or 1
            nx,ny=-dy/l,dx/l
            L.append((x+nx*w/2,y+ny*w/2)); R.append((x-nx*w/2,y-ny*w/2))
        getattr(self,layer).append(self.path(self.wob(L+R[::-1],amp)))
    @staticmethod
    def bez(p0,p1,p2,p3=None,n=40):
        out=[]
        for i in range(n+1):
            t=i/n
            if p3 is None:
                x=(1-t)**2*p0[0]+2*(1-t)*t*p1[0]+t*t*p2[0]; y=(1-t)**2*p0[1]+2*(1-t)*t*p1[1]+t*t*p2[1]
            else:
                x=(1-t)**3*p0[0]+3*(1-t)**2*t*p1[0]+3*(1-t)*t*t*p2[0]+t**3*p3[0]
                y=(1-t)**3*p0[1]+3*(1-t)**2*t*p1[1]+3*(1-t)*t*t*p2[1]+t**3*p3[1]
            out.append((x,y))
        return out
    @staticmethod
    def sample(pts,n):
        d=[0]
        for i in range(1,len(pts)): d.append(d[-1]+math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]))
        tot=d[-1] or 1; out=[]; j=0
        for k in range(n):
            s=tot*k/(n-1)
            while j<len(d)-2 and d[j+1]<s: j+=1
            seg=(d[j+1]-d[j]) or 1; t=(s-d[j])/seg
            out.append((pts[j][0]+(pts[j+1][0]-pts[j][0])*t, pts[j][1]+(pts[j+1][1]-pts[j][1])*t))
        return out
    # --- motivos
    def leaf(self, x, y, ang, L, W, layer='black', vein=True):
        ca,sa=math.cos(ang),math.sin(ang)
        def T(u,v): return (x+u*ca-v*sa, y+u*sa+v*ca)
        pts=[T(u*L, W*math.sin(math.pi*u)**0.9*(1 if k==0 else -1)) for k in (0,1) for u in ([i/20 for i in range(21)] if k==0 else [1-i/20 for i in range(21)])]
        self.poly(pts,1.2,layer)
        if vein and layer=='black':
            self.stroke([T(0.12*L,0),T(0.8*L,0)], W*0.16, W*0.05, layer='white', amp=0.4)
    def flower(self, x, y, r, layer='black'):
        for k in range(5):
            a=2*math.pi*k/5+self.r.uniform(-.15,.15)
            self.circle(x+r*0.55*math.cos(a), y+r*0.55*math.sin(a), r*0.42, layer=layer, amp=0.8)
        self.circle(x,y,r*0.22,layer='white' if layer=='black' else 'black',amp=0.4)
    def hatch(self, x0,y0,x1,y1, n, w, ang=0.35, clip=None):
        """cortes paralelos de gubia (blanco) en un rectángulo."""
        for i in range(n):
            t=(i+0.5)/n
            x=x0+(x1-x0)*t
            self.stroke([(x-(y1-y0)*ang*0.5,y0),(x+(y1-y0)*ang*0.5,y1)], w, w*0.5, layer='white', amp=0.6)
    # --- render
    def svg(self):
        body=''.join(f'<path d="{p}" fill="{c}"/>' for c,p in self.ops)
        return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {S:.0f} {S:.0f}">'
                f'<rect width="1000" height="1000" fill="#fff"/>{body}</svg>')

def carve(ink, px=1400, seed=1, grain=0.55, bite=0.5):
    """Estampa de linóleo: temblor, bordes comidos, marcas de gubia, tinta despareja y leve giro del taco."""
    from PIL import ImageDraw
    png=cairosvg.svg2png(bytestring=ink.svg().encode(), output_width=px, output_height=px)
    g=np.asarray(Image.open(io.BytesIO(png)).convert('L')).astype(np.float32)/255.0
    rng=np.random.default_rng(seed); H,W=g.shape; k=px/1000
    def smooth_noise(scale, amp):
        n=rng.standard_normal((max(2,H//scale)+2, max(2,W//scale)+2)).astype(np.float32)
        im=Image.fromarray(((n-n.min())/(np.ptp(n)+1e-6)*255).astype(np.uint8)).resize((W,H),Image.BICUBIC)
        return (np.asarray(im).astype(np.float32)/255.0-0.5)*2*amp
    framed=getattr(ink,'framed',False)
    # 1) marcas de desbaste: crestas curvas que la gubia deja en el fondo (solo en tacos con marco)
    if framed:
        mk=Image.new('L',(W,H),255); dr=ImageDraw.Draw(mk)
        inkmask=g<0.5
        dist_img=Image.fromarray((inkmask*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(int(28*k)|1))
        near=np.asarray(dist_img)>0
        n_marks=int(160*grain)
        for _ in range(n_marks*6):
            if n_marks<=0: break
            x=rng.uniform(0.11,0.89)*W; y=rng.uniform(0.11,0.89)*H
            xi,yi=int(x),int(y)
            if inkmask[yi,xi] or near[yi,xi]: continue
            # agrupadas: varias crestas paralelas cortas
            ang=rng.normal(0.3,0.5); L=rng.uniform(12,34)*k; curv=rng.uniform(-0.6,0.6)
            for j in range(rng.integers(1,4)):
                ox=-np.sin(ang)*j*7*k; oy=np.cos(ang)*j*7*k
                pts=[(x+ox+t*L*np.cos(ang+curv*t), y+oy+t*L*np.sin(ang+curv*t)) for t in np.linspace(0,1,8)]
                dr.line(pts,fill=0,width=max(1,int(rng.uniform(1.2,2.4)*k)))
            n_marks-=1
        g=np.minimum(g,np.asarray(mk).astype(np.float32)/255.0)
    # 2) temblor orgánico + leve giro del taco
    dx=smooth_noise(80,3.0*k)+smooth_noise(25,0.9*k); dy=smooth_noise(80,3.0*k)+smooth_noise(25,0.9*k)
    yy,xx=np.mgrid[0:H,0:W]
    sx=np.clip((xx+dx).astype(int),0,W-1); sy=np.clip((yy+dy).astype(int),0,H-1)
    g=g[sy,sx]
    rot=float(rng.uniform(-0.7,0.7)) if framed else float(rng.uniform(-1.5,1.5))
    g=np.asarray(Image.fromarray((g*255).astype(np.uint8)).rotate(rot,resample=Image.BICUBIC,fillcolor=255)).astype(np.float32)/255
    # 3) borde comido por la tinta y aplastado por la prensa
    gb=np.asarray(Image.fromarray((g*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(px/600))).astype(np.float32)/255
    fine=smooth_noise(3,0.5)+smooth_noise(9,0.4)
    squash=smooth_noise(60,0.06)
    ink_mask=(gb+fine*0.38*bite-squash) < 0.5
    # 4) veta y rayones de la madera dentro de la tinta; restos fuera
    sc=Image.new('L',(W,H),0); d2=ImageDraw.Draw(sc)
    for _ in range(int(px*0.9*grain)):
        x=rng.uniform(0,W); y=rng.uniform(0,H); L=rng.uniform(6,34)*k*1.6
        a=rng.normal(0,0.18); w=max(1,int(rng.choice([1,1,1,2])*px/1400))
        d2.line([(x,y),(x+L*np.cos(a),y+L*np.sin(a))],fill=255,width=w)
    ink_mask &= ~(np.asarray(sc)>0)
    left=Image.new('L',(W,H),0); dl=ImageDraw.Draw(left)
    for _ in range(int(px*0.22*grain)):
        x=rng.uniform(0,W); y=rng.uniform(0,H); r=rng.uniform(0.6,2.2)*k*1.4
        if rng.random()<0.5: dl.ellipse([x-r,y-r,x+r,y+r],fill=255)
        else:
            L=rng.uniform(5,18)*k*1.5; a=rng.normal(0,0.3); dl.line([(x,y),(x+L*np.cos(a),y+L*np.sin(a))],fill=255,width=max(1,int(px/1200)))
    near=np.asarray(Image.fromarray((ink_mask*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(int(px/60)|1)))>0
    ink_mask |= (np.asarray(left)>0) & near
    ink_mask=np.asarray(Image.fromarray((ink_mask*255).astype(np.uint8)).filter(ImageFilter.MedianFilter(3)))>0
    # 5) tinta despareja: el rodillo carga menos en algunas zonas, con poros finos
    dens=0.86+smooth_noise(140,0.10)+smooth_noise(35,0.05)
    pores=(rng.random((H,W))<0.012*grain)
    sn=rng.standard_normal((max(2,H//18),max(2,W//160))).astype(np.float32)
    sn=np.asarray(Image.fromarray(((sn-sn.min())/(np.ptp(sn)+1e-6)*255).astype(np.uint8)).resize((W,H),Image.BICUBIC)).astype(np.float32)/255
    starve=sn>0.70
    alpha=np.where(ink_mask, np.clip(dens,0.55,1.0),0.0)
    alpha=np.where(ink_mask & starve & (rng.random((H,W))<0.28),alpha*0.55,alpha)
    alpha=np.where(ink_mask & pores,alpha*0.2,alpha)
    a=Image.fromarray((alpha*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))
    return a  # L: opacidad de la tinta

def to_rgba(mask, color, size=None, opacity=1.0):
    if size: mask=mask.resize((size,size), Image.LANCZOS)
    c=tuple(int(color.lstrip('#')[i:i+2],16) for i in (0,2,4))
    a=np.asarray(mask).astype(np.float32)*opacity
    out=np.zeros((mask.size[1],mask.size[0],4),np.uint8); out[...,0],out[...,1],out[...,2]=c; out[...,3]=a.astype(np.uint8)
    return Image.fromarray(out,'RGBA')
