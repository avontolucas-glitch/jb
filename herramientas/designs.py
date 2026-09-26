import math
from engine import Ink
C=500.0
def TT(s): return lambda x,y:(C+x*s, C+y*s)
def heart_pts(cx,cy,w,n=90):
    pts=[]
    for i in range(n):
        t=2*math.pi*i/n
        x=16*math.sin(t)**3; y=-(13*math.cos(t)-5*math.cos(2*t)-2*math.cos(3*t)-math.cos(4*t))
        pts.append((cx+x*w/32, cy+y*w/32))
    return pts
def eye(ink,T,s,w=300,h=120,iris='full',lashes=True):
    up=[T(x, -h*(1-(x/w)**2)**0.9) for x in [w*(i/30*2-1) for i in range(31)]]
    lo=[T(x, h*0.85*(1-(x/w)**2)**0.9) for x in [w*(1-i/30*2) for i in range(31)]]
    # contorno negro grueso (párpados) y esclerótica blanca
    ink.poly(up+lo,2.0)
    up2=[T(x, -h*0.78*(1-(x/(w*0.9))**2)**0.9) for x in [w*0.9*(i/30*2-1) for i in range(31)]]
    lo2=[T(x, h*0.64*(1-(x/(w*0.9))**2)**0.9) for x in [w*0.9*(1-i/30*2) for i in range(31)]]
    ink.poly(up2+lo2,1.6,'white')
    cx,cy=T(0,0); r=h*0.72*s
    if iris=='full':
        ink.circle(cx,cy,r,layer='black2')
        for k in range(14):
            a=2*math.pi*k/14
            ink.stroke([(cx+r*0.42*math.cos(a),cy+r*0.42*math.sin(a)),(cx+r*0.86*math.cos(a),cy+r*0.86*math.sin(a))],r*0.07,r*0.03,layer='white')
        ink.circle(cx,cy,r*0.34,layer='black2'); ink.circle(cx+r*0.18,cy-r*0.2,r*0.12,layer='white')
    elif iris=='half':
        ink.circle(cx,cy,r,layer='black2')
        half=[(cx+r*0.9*math.cos(a),cy+r*0.9*math.sin(a)) for a in [ -math.pi/2+math.pi*i/30 for i in range(31)]]
        ink.poly(half,1.0,'white')
        for k in range(5):
            a=-math.pi/2+math.pi*(k+0.5)/5
            ink.stroke([(cx+r*0.35*math.cos(a),cy+r*0.35*math.sin(a)),(cx+r*0.8*math.cos(a),cy+r*0.8*math.sin(a))],r*0.07,r*0.03)
        ink.circle(cx,cy,r*0.3,layer='black2'); ink.circle(cx-r*0.1,cy-r*0.12,r*0.1,layer='white')
    if lashes:
        for k in range(7):
            x=w*(-0.75+1.5*k/6); y=-h*(1-(x/w)**2)**0.9
            ang=math.atan2(-1, x/w*0.9)
            p0=T(x,y); p1=(p0[0]+math.cos(ang)*38*s, p0[1]+math.sin(ang)*38*s)
            ink.stroke([p0,p1],11*s,3*s)
def rays(ink,cx,cy,r1,r2,n,w,phase=0,alt=True,limit=None):
    for k in range(n):
        a=2*math.pi*k/n+phase
        rr=r2*(0.78 if (alt and k%2) else 1.0)
        if limit: rr=min(rr, limit/max(abs(math.cos(a)),abs(math.sin(a)))-18)
        if rr<=r1: continue
        ink.stroke([(cx+r1*math.cos(a),cy+r1*math.sin(a)),(cx+rr*math.cos(a),cy+rr*math.sin(a))],w,w*0.25)
def star(ink,x,y,r,layer='black',pts=4):
    P=[]
    for k in range(pts*2):
        a=-math.pi/2+math.pi*k/pts; rr=r if k%2==0 else r*0.34
        P.append((x+rr*math.cos(a),y+rr*math.sin(a)))
    ink.poly(P,0.8,layer)
def moon(ink,x,y,r,k,layer='black'):
    # k=0..7: 0 nueva, 4 llena
    if k==0:
        ink.circle(x,y,r,layer=layer,amp=0.8); ink.circle(x,y,r*0.8,layer='white',amp=0.5); return
    ink.circle(x,y,r,layer=layer,amp=0.8)
    if k==4:
        ink.circle(x,y,r*0.42,layer='white',amp=0.4); ink.circle(x,y,r*0.2,layer=layer,amp=0.3); return
    dd=2*r*(1-abs(4-k)/4)
    ink.circle(x+(-dd if k<4 else dd),y,r*1.0,layer='white',amp=0.6)
def flame(ink,x,y,h,layer='black',inner=True):
    P=ink.bez((x,y),(x-h*0.55,y-h*0.35),(x-h*0.05,y-h*0.7),(x,y-h))+ink.bez((x,y-h),(x+h*0.18,y-h*0.62),(x+h*0.5,y-h*0.4),(x,y))[1:]
    ink.poly(P,0.9,layer)
    if inner and layer=='black':
        Q=ink.bez((x,y-h*0.12),(x-h*0.22,y-h*0.3),(x-h*0.02,y-h*0.5),(x,y-h*0.62))+ink.bez((x,y-h*0.62),(x+h*0.1,y-h*0.42),(x+h*0.2,y-h*0.3),(x,y-h*0.12))[1:]
        ink.poly(Q,0.6,'white')
def spiral_pts(cx,cy,r0,r1,turns,n=400,ph=0):
    return [(cx+(r0+(r1-r0)*i/n)*math.cos(ph+2*math.pi*turns*i/n), cy+(r0+(r1-r0)*i/n)*math.sin(ph+2*math.pi*turns*i/n)) for i in range(n+1)]
def ichthys(ink,T,s,L=260,H=120):
    top=ink.bez(T(-L*0.62,0),T(-L*0.2,-H*1.1),T(L*0.3,-H*0.9),T(L*0.62,H*0.55))
    bot=ink.bez(T(L*0.62,-H*0.55),T(L*0.3,H*0.9),T(-L*0.2,H*1.1),T(-L*0.62,0))
    ink.poly(top+bot,1.6)
    # escamas talladas
    for row in range(3):
        for col in range(4):
            x=-L*0.18+col*L*0.14; y=-H*0.36+row*H*0.33
            cx,cy=T(x,y); r=H*0.2*s
            arc=[(cx+r*math.cos(a),cy+r*math.sin(a)) for a in [math.pi*0.5-math.pi*i/12 for i in range(13)]]
            ink.stroke(arc,6*s,3*s,layer='white',amp=0.4)
    ex,ey=T(-L*0.36,-H*0.14); ink.circle(ex,ey,14*s,layer='white'); ink.circle(ex,ey,6*s,layer='black2')
# ------------------------------------------------ ORLAS (compartidas por número de capítulo)
INNER=410
def frame(ink):
    o=[(40,40),(960,40),(960,960),(40,960)]; i=[(64,64),(936,64),(936,936),(64,936)]
    def rect(a,b,layer):
        pts=[]
        for (x0,y0),(x1,y1) in zip(a,a[1:]+a[:1]):
            for k in range(20): pts.append((x0+(x1-x0)*k/20,y0+(y1-y0)*k/20))
        ink.poly(pts,2.2,layer)
    rect(o,None,'black'); rect(i,None,'white')
    o2=[(84,84),(916,84),(916,916),(84,916)]; i2=[(92,92),(908,92),(908,908),(92,908)]
    rect(o2,None,'black2'); 
    rect(i2,None,'white')
    for (x,y) in [(52,52),(948,52),(948,948),(52,948)]:
        ink.poly([(x,y-13),(x+13,y),(x,y+13),(x-13,y)],0.6,'white')
def border(ink, chap):
    r=ink.r
    if chap==0:   # luz: rayos
        rays(ink,C,C,322,560,36,15,phase=0.04,limit=392)
    elif chap==1: # vid florida (orla de la xilografía de Neville)
        for q,(sx,sy) in enumerate([(-1,-1),(1,-1),(1,1),(-1,1)]):
            for side in (0,1):
                # tallo que nace en la esquina y corre por un borde, con zarcillo al final
                if side==0: p0=(C+sx*385,C+sy*385); p1=(C+sx*400,C+sy*250); p2=(C+sx*350,C+sy*150); p3=(C+sx*385,C+sy*40)
                else:       p0=(C+sx*385,C+sy*385); p1=(C+sx*250,C+sy*400); p2=(C+sx*150,C+sy*350); p3=(C+sx*40,C+sy*385)
                stem=ink.bez(p0,p1,p2,p3,60)
                ink.stroke(stem,12,6,taper=False)
                ex,ey=stem[-1]; tang=math.atan2(stem[-1][1]-stem[-3][1],stem[-1][0]-stem[-3][0])
                curl=[(ex+26*math.cos(tang+1.6+t*5.2)*(1-t*0.6)+26*math.cos(tang)*0.2, ey+26*math.sin(tang+1.6+t*5.2)*(1-t*0.6)) for t in [i/30 for i in range(31)]]
                ink.stroke(curl,7,3)
                for k,t in enumerate([0.14,0.3,0.46,0.62,0.78]):
                    i=int(t*60); x,y=stem[i]; x2,y2=stem[i+2]
                    base=math.atan2(y2-y,x2-x); a=base+(1.05 if k%2==0 else -1.05)
                    ink.leaf(x,y,a,54-k*3,18)
                for t in [0.24,0.54]:
                    i=int(t*60); x,y=stem[i]; d0=math.hypot(x-C,y-C)
                    ink.flower(C+(x-C)*(d0-44)/d0, C+(y-C)*(d0-44)/d0, 24)
                i=int(0.7*60); x,y=stem[i]; d0=math.hypot(x-C,y-C)
                for j in range(3): ink.circle(C+(x-C)*(d0-38)/d0+(j-1)*13, C+(y-C)*(d0-38)/d0+abs(j-1)*9, 7)
            ink.flower(C+sx*372,C+sy*372,30)
    elif chap==2: # estrellas de la vigilia
        pos=[]
        tries=0
        while len(pos)<26 and tries<4000:
            tries+=1
            x=r.uniform(110,890); y=r.uniform(110,890)
            if math.hypot(x-C,y-C)<335: continue
            if any(math.hypot(x-a,y-b)<82 for a,b in pos): continue
            pos.append((x,y))
        for k,(x,y) in enumerate(pos):
            if k%3==0: ink.circle(x,y,7)
            else: star(ink,x,y,r.uniform(20,30))
    elif chap==3: # fases de la luna (el tiempo)
        for k in range(8):
            a=-math.pi/2+2*math.pi*k/8+math.pi/8
            rr=392/max(abs(math.cos(a)),abs(math.sin(a)))*0.93
            moon(ink,C+rr*math.cos(a),C+rr*math.sin(a),33,k)
    elif chap==4: # olas
        for band,y0 in [(0,808),(1,858)]:
            pts=[(x, y0+13*math.sin((x/1000)*2*math.pi*5+band*1.3)) for x in range(112,890,6)]
            ink.stroke(pts,14,10,taper=False)
        for band,y0 in [(0,142),(1,190)]:
            pts=[(x, y0+13*math.sin((x/1000)*2*math.pi*5+band*1.3+0.8)) for x in range(112,890,6)]
            ink.stroke(pts,14,10,taper=False)
        for (x,y) in [(150,500),(850,500)]:
            ink.circle(x,y,12); ink.circle(x,y-70,8); ink.circle(x,y+70,8)
    elif chap==5: # llamas
        for k in range(8):
            a=-math.pi/2+2*math.pi*k/8+math.pi/8
            rr=392/max(abs(math.cos(a)),abs(math.sin(a)))*0.9
            flame(ink,C+rr*math.cos(a),C+rr*math.sin(a)+34,70)
    elif chap==6: # espirales
        for (sx,sy) in [(-1,-1),(1,-1),(1,1),(-1,1)]:
            cx,cy=C+sx*330,C+sy*330
            ink.stroke(spiral_pts(cx,cy,4,62,2.2,ph=r.uniform(0,6)),14,6,taper=False)
        for k in range(4):
            a=math.pi/2*k
            ink.circle(C+392*math.cos(a)*0.97,C+392*math.sin(a)*0.97,10)
# ------------------------------------------------ EMBLEMAS
def E_R0(ink,s):  # día y noche
    T=TT(s); cx,cy=T(0,0); R=235*s
    ink.circle(cx,cy,R)                       # disco
    ink.circle(cx,cy,R-24*s,layer='white')    # interior blanco
    half=[(cx+(R-24*s)*math.cos(a),cy+(R-24*s)*math.sin(a)) for a in [math.pi/2+math.pi*i/40 for i in range(41)]]
    ink.poly(half,1.2,'black2')               # mitad noche
    mx,my=T(-95,-10)
    ink.circle(mx,my,78*s,layer='white'); ink.circle(mx+34*s,my-8*s,70*s,layer='black2')  # luna tallada
    for (x,y,r) in [(-150,-120,12),(-60,130,9),(-175,70,7),(-40,-150,7)]:
        star(ink,*T(x,y),r*s*2.2,layer='white')
    ink.stroke([T(0,-R/s+18),T(0,R/s-18)],16*s,16*s,taper=False,layer='black2')
    sx,sy=T(110,0); ink.circle(sx,sy,52*s,layer='black2'); ink.circle(sx,sy,28*s,layer='white'); ink.circle(sx,sy,14*s,layer='black2')
    for k in range(12):
        a=2*math.pi*k/12
        ink.stroke([(sx+68*s*math.cos(a),sy+68*s*math.sin(a)),(sx+(100 if k%2==0 else 86)*s*math.cos(a),sy+(100 if k%2==0 else 86)*s*math.sin(a))],13*s,4*s,layer='black2')
def E_P0(ink,s):  # la pluma
    s=s*1.18; T=TT(s)
    spine=ink.bez(T(-190,230),T(-90,60),T(60,-120),T(200,-250))
    Lp=[];Rp=[]
    for i,(x,y) in enumerate(spine):
        t=i/(len(spine)-1)
        if t<0.18: w=0
        else: w=85*s*math.sin(math.pi*min(1,(t-0.18)/0.82))**0.7
        x2,y2=spine[min(i+1,len(spine)-1)];x1,y1=spine[max(i-1,0)]
        dx,dy=x2-x1,y2-y1;l=math.hypot(dx,dy) or 1;nx,ny=-dy/l,dx/l
        Lp.append((x+nx*w*1.1,y+ny*w*1.1));Rp.append((x-nx*w*0.8,y-ny*w*0.8))
    ink.poly(Lp+Rp[::-1],2.0)
    ink.stroke(spine[6:],10*s,4*s,layer='white')
    for i in range(10,len(spine)-3,2):
        x,y=spine[i];x2,y2=spine[i+1];dx,dy=x2-x,y2-y;l=math.hypot(dx,dy) or 1;nx,ny=-dy/l,dx/l
        t=i/(len(spine)-1); w=85*s*math.sin(math.pi*min(1,(t-0.18)/0.82))**0.7
        ink.stroke([(x+nx*8*s,y+ny*8*s),(x+nx*w*0.95+dx*2.5,y+ny*w*0.95+dy*2.5)],5*s,2*s,layer='white',amp=0.3)
        ink.stroke([(x-nx*8*s,y-ny*8*s),(x-nx*w*0.7+dx*2.5,y-ny*w*0.7+dy*2.5)],5*s,2*s,layer='white',amp=0.3)
    ink.stroke([T(-190,230),T(-215,268)],14*s,3*s)   # punta
    ink.stroke(ink.bez(T(-235,285),T(-120,300),T(-40,250),T(60,285)),12*s,4*s)  # trazo de tinta: la palabra
    ink.circle(*T(95,284),10*s)
def E_B0(ink,s):  # semilla que germina (Primera imagen)
    T=TT(s)
    top=ink.bez(T(-265,120),T(-120,70),T(120,70),T(265,120))
    bot=ink.bez(T(265,120),T(250,300),T(-250,300),T(-265,120))[1:]
    ink.poly(top+bot,2.0)
    for k in range(4):
        yy=150+k*30
        ink.stroke([T(x, yy+10*math.sin(x/60+k)+ (abs(x)/265)**2*28) for x in range(-230+k*20,231-k*20,12)],6*s,3*s,layer='white',amp=0.4)
    sx,sy=T(0,168)
    seed=[(sx+58*s*math.cos(a), sy+38*s*math.sin(a)) for a in [2*math.pi*i/48 for i in range(48)]]
    ink.poly(seed,1.0,'white')
    ink.stroke(ink.bez((sx-40*s,sy+6*s),(sx-10*s,sy-12*s),(sx+10*s,sy+12*s),(sx+40*s,sy-6*s)),8*s,3*s,layer='black2')
    ink.stroke(ink.bez((sx+50*s,sy-10*s),(sx+40*s,sy-40*s),(sx+10*s,sy-50*s),(sx,sy-72*s)),7*s,5*s,layer='white',amp=0.3)
    ink.stroke(ink.bez((sx-30*s,sy+30*s),(sx-60*s,sy+60*s),(sx-20*s,sy+80*s),(sx-54*s,sy+108*s)),5*s,1.5*s,layer='white',amp=0.3)
    ink.stroke(ink.bez((sx+18*s,sy+34*s),(sx+40*s,sy+62*s),(sx+10*s,sy+86*s),(sx+34*s,sy+112*s)),4*s,1.5*s,layer='white',amp=0.3)
    stem=ink.bez(T(0,132),T(-10,40),T(12,-50),T(0,-150))
    ink.stroke(stem,20*s,12*s,taper=False,layer='black2')
    ink.leaf(*T(0,-92),math.radians(-155),155*s,52*s)
    ink.leaf(*T(2,-138),math.radians(-33),170*s,56*s)
    ink.circle(*T(0,-162),15*s)
def E_heart(ink,s,cy=-30,w=430):
    T=TT(s); cx,cyy=T(0,cy)
    ink.poly(heart_pts(cx,cyy,w*s),2.4)
    return cx,cyy
def heart_hatch(ink,s,cx,cy,w,skip=None):
    # cortes que siguen el contorno (como el corazón del grabado de Neville)
    for k,sc in enumerate([0.92,0.84,0.76,0.68,0.6]):
        P=heart_pts(cx,cy+w*s*0.025*k,w*s*sc,n=160)
        for seg in range(k*3,160,9):
            part=P[seg:seg+6]
            if skip and any(skip(x,y) for x,y in part): continue
            ink.stroke(part,7*s,3*s,layer='white',amp=0.35)
def E_R1(ink,s):  # corazón-ojo sobre tronco con raíces (homenaje al grabado de Neville)
    T=TT(s)
    trunk=[T(-34,120),T(-26,190),T(-40,236),T(-92,262),T(-40,258),T(-6,244),T(0,272),T(8,244),T(44,258),T(96,262),T(42,234),T(28,190),T(34,120)]
    ink.poly(trunk,1.6)
    for k in range(4): ink.stroke([T(-16+k*11,140),T(-18+k*12,228)],4*s,2*s,layer='white',amp=0.3)
    cx,cy=E_heart(ink,s,cy=-40,w=440)
    heart_hatch(ink,s,cx,cy,440,skip=lambda x,y: abs(x-cx)<150*s and abs(y-(cy-10*s))<80*s)
    eye(ink,lambda x,y:(cx+x*s,cy-12*s+y*s),s,w=128,h=58,iris='full',lashes=False)
def E_P1(ink,s):  # corazón con cerradura (libertad interna)
    cx,cy=E_heart(ink,s,cy=-10,w=460)
    heart_hatch(ink,s,cx,cy,460,skip=lambda x,y: abs(x-cx)<70*s and cy-80*s<y<cy+120*s)
    ink.circle(cx,cy-18*s,40*s,layer='white')
    ink.poly([(cx-17*s,cy),(cx+17*s,cy),(cx+32*s,cy+110*s),(cx-32*s,cy+110*s)],1.0,'white')
def E_B1(ink,s):  # corazón coronado
    T=TT(s)
    cx,cy=E_heart(ink,s,cy=50,w=380)
    heart_hatch(ink,s,cx,cy,380)
    base=[T(-150,-118),T(150,-118),T(158,-150),T(-158,-150)]
    ink.poly(base,1.4)
    crown=[T(-160,-150),T(-190,-290),T(-90,-200),T(0,-315),T(90,-200),T(190,-290),T(160,-150)]
    ink.poly(crown,1.8)
    for (x,y) in [(-190,-290),(0,-315),(190,-290)]:
        ink.circle(*T(x,y-20),20*s)
    for x in [-90,0,90]: ink.circle(*T(x,-134),10*s,layer='white')
    ink.stroke([T(-120,-175),T(120,-175)],6*s,6*s,layer='white',taper=False)
def E_R2(ink,s): eye(ink,TT(s),s,w=280,h=130,iris='half')
def E_P2(ink,s):
    T=TT(s); rays(ink,*T(0,0),175*s,285*s,28,13*s,phase=0.05,alt=True)
    ink.circle(*T(0,0),170*s,layer='white')
    eye(ink,T,s,w=235,h=108,iris='full')
def E_B2(ink,s):
    T=TT(s); eye(ink,lambda x,y:T(x,y-40),s,w=270,h=120,iris='full')
    tx,ty=T(70,120)
    P=ink.bez((tx,ty),(tx-40*s,ty+70*s),(tx-30*s,ty+120*s),(tx,ty+122*s))+ink.bez((tx,ty+122*s),(tx+30*s,ty+120*s),(tx+40*s,ty+70*s),(tx,ty))[1:]
    ink.poly(P,1.0); ink.stroke([(tx-12*s,ty+70*s),(tx-10*s,ty+104*s)],7*s,3*s,layer='white')
def E_R3(ink,s):  # reloj de arena
    T=TT(s)
    for y in (-250,215):
        ink.poly([T(-170,y),T(170,y),T(170,y+36),T(-170,y+36)],1.4)
        ink.stroke([T(-150,y+18),T(150,y+18)],5*s,5*s,layer='white',taper=False)
    for sx in (-1,1):
        ink.stroke([T(sx*150,-214),T(sx*150,215)],12*s,12*s,taper=False)
    gl=ink.bez(T(-120,-214),T(-120,-60),T(-14,-20),T(-12,0))+ink.bez(T(-12,0),T(-14,20),T(-120,60),T(-120,215))[1:]
    gr=[(2*C-x,y) for x,y in gl]
    ink.stroke(gl,11*s,11*s,taper=False); ink.stroke(gr,11*s,11*s,taper=False)
    ink.poly([T(-72,-100),T(72,-100),T(10,-24),T(-10,-24)],1.0)    # arena arriba
    ink.poly([T(-110,212),T(-60,150),T(0,120),T(60,150),T(110,212)],1.4)  # montículo
    ink.stroke([T(0,-20),T(0,118)],5*s,5*s,taper=False)
    for k in range(4): ink.stroke([T(-60+k*38,190),T(-50+k*38,160)],4*s,2*s,layer='white',amp=0.3)
def E_P3(ink,s):  # el fruto
    T=TT(s)
    br=ink.bez(T(-270,-150),T(-120,-210),T(80,-190),T(260,-100))
    ink.stroke(br,26*s,12*s)
    ink.leaf(*T(-60,-190),math.radians(-120),140*s,46*s); ink.leaf(*T(140,-160),math.radians(-60),130*s,44*s)
    ink.stroke([T(30,-182),T(26,-80)],12*s,9*s,taper=False)
    fx,fy=T(20,40); R=150*s
    ink.circle(fx,fy,R)
    ink.poly([(fx-40*s,fy-R+8*s),(fx-20*s,fy-R-34*s),(fx,fy-R+2*s),(fx+20*s,fy-R-34*s),(fx+40*s,fy-R+8*s)],0.8)
    arc=[(fx+R*0.72*math.cos(a),fy+R*0.72*math.sin(a)) for a in [math.radians(200+i*4) for i in range(18)]]
    ink.stroke(arc,14*s,5*s,layer='white')
    for k in range(5):
        a=math.radians(20+k*14); ink.stroke([(fx+R*0.35*math.cos(a),fy+R*0.35*math.sin(a)),(fx+R*0.8*math.cos(a),fy+R*0.8*math.sin(a))],5*s,2*s,layer='white',amp=0.3)
def E_B3(ink,s):  # la luna de las noches de práctica
    T=TT(s); cx,cy=T(-30,10); R=230*s
    ink.circle(cx,cy,R); ink.circle(cx+105*s,cy-60*s,205*s,layer='white')
    for k in range(6):
        a=math.radians(120+k*16)
        ink.stroke([(cx+R*0.62*math.cos(a),cy+R*0.62*math.sin(a)),(cx+R*0.9*math.cos(a),cy+R*0.9*math.sin(a))],7*s,3*s,layer='white',amp=0.3)
    star(ink,*T(150,-150),70*s); ink.circle(*T(150,-150),10*s,layer='white')
    star(ink,*T(210,60),34*s); ink.circle(*T(95,150),10*s)
def E_R4(ink,s):  # la pesca
    T=TT(s); ichthys(ink,lambda x,y:T(x,y),s,L=330,H=150)
    for k in range(3): ink.circle(*T(-250+k*26,-90-k*40),(9-k*2)*s)
def E_P4(ink,s):  # el desierto (la inteligencia natural)
    T=TT(s); sx,sy=T(40,-95)
    ink.circle(sx,sy,112*s)
    for k in range(4):
        arc=[(sx+(38+k*18)*s*math.cos(a),sy+(38+k*18)*s*math.sin(a)) for a in [math.radians(200+i*6+k*9) for i in range(12)]]
        ink.stroke(arc,6*s,2*s,layer='white',amp=0.3)
    rays(ink,sx,sy,132*s,200*s,18,11*s,phase=0.1)
    ink.circle(sx,sy+80*s,150*s,layer='white') if False else None
    back=ink.bez(T(-295,230),T(-230,40),T(-40,20),T(120,230))
    ink.poly(back,1.6)
    front=ink.bez(T(-40,236),T(60,90),T(220,70),T(300,236))
    ink.poly(front,1.6)
    ink.stroke(ink.bez(T(-110,72),T(-150,120),T(-150,180),T(-200,228)),7*s,3*s,layer='white',amp=0.3)
    ink.stroke(ink.bez(T(150,112),T(120,150),T(110,190),T(70,232)),7*s,3*s,layer='white',amp=0.3)
    for k in range(3):
        ink.stroke([T(x, 170+k*20+6*math.sin(x/30+k)) for x in range(-40+k*30,110-k*10,10)],4*s,2*s,layer='white',amp=0.3)
        ink.stroke([T(x, 190+k*14+5*math.sin(x/28+k)) for x in range(180+k*10,280-k*10,10)],4*s,2*s,layer='white',amp=0.3)
    ink.stroke([T(-295,236),T(300,236)],12*s,12*s,taper=False)

def E_R5(ink,s):  # la lámpara de aceite
    T=TT(s)
    body=ink.bez(T(-230,40),T(-220,190),T(120,190),T(180,70))+ink.bez(T(180,70),T(230,40),T(270,10),T(290,0))[1:]+ink.bez(T(290,0),T(230,-8),T(160,20),T(120,20))[1:]+ink.bez(T(120,20),T(20,-20),T(-160,-10),T(-230,40))[1:]
    ink.poly(body,1.6)
    ink.stroke(ink.bez(T(-230,40),T(-320,20),T(-320,120),T(-220,120)),18*s,14*s,taper=False)
    ink.stroke(ink.bez(T(-170,80),T(-60,140),T(60,140),T(150,70)),7*s,4*s,layer='white')
    for k in range(5): ink.circle(*T(-120+k*55,112),8*s,layer='white')
    ink.poly([T(-120,170),T(90,170),T(60,205),T(-90,205)],1.0)
    flame(ink,*T(292,-10),190*s)
def E_P5(ink,s):  # la cruz
    T=TT(s)
    rays(ink,*T(0,-70),90*s,250*s,24,10*s,phase=0.13)
    ink.circle(*T(0,-70),112*s,layer='white')
    ink.poly([T(-34,-280),T(34,-280),T(34,-104),T(170,-104),T(170,-36),T(34,-36),T(34,280),T(-34,280),T(-34,-36),T(-170,-36),T(-170,-104),T(-34,-104)],1.8,'black2')
    ink.stroke([T(0,-255),T(0,255)],8*s,8*s,layer='white',taper=False)
    ink.stroke([T(-148,-70),T(148,-70)],8*s,8*s,layer='white',taper=False)
    ink.circle(*T(0,-70),16*s,layer='black2')
def E_P6(ink,s):  # la espiral del tiempo
    T=TT(s); cx,cy=T(0,0)
    ink.stroke(spiral_pts(cx,cy,6*s,265*s,3.4,n=600),44*s,18*s,taper=False)
    ink.stroke(spiral_pts(cx,cy,6*s,265*s,3.4,n=600)[40:],8*s,4*s,layer='white',amp=0.3,taper=False)
    ink.circle(cx,cy,20*s)
def E_RT(ink,s):  # la caña
    T=TT(s)
    ink.stroke(ink.bez(T(-250,250),T(-150,40),T(20,-170),T(240,-270)),16*s,5*s)
    ink.circle(*T(-205,178),26*s); ink.circle(*T(-205,178),11*s,layer='white'); ink.stroke([T(-205,178),T(-180,150)],5*s,5*s,taper=False)
    ink.stroke([T(240,-266),T(236,90)],4*s,4*s,taper=False)
    ichthys(ink,lambda x,y:T(236+y*0.0+x*0.0+0,0) if False else T(236+(y),150+(-x)),s,L=160,H=70)
    for k,y in enumerate([245,280]):
        ink.stroke([T(x,y+10*math.sin(x/34+k)) for x in range(-260,261,10)],10*s,7*s,taper=False)
EMB={'R0':(E_R0,0),'R1':(E_R1,1),'R2':(E_R2,2),'R3':(E_R3,3),'R4':(E_R4,4),'R5':(E_R5,5),'RT':(E_RT,4),
     'P0':(E_P0,0),'P1':(E_P1,1),'P2':(E_P2,2),'P3':(E_P3,3),'P4':(E_P4,4),'P5':(E_P5,5),'P6':(E_P6,6),
     'B0':(E_B0,0),'B1':(E_B1,1),'B2':(E_B2,2),'B3':(E_B3,3)}
def build(key, framed=True, seed=None):
    fn,chap=EMB[key]
    ink=Ink(seed if seed is not None else hash(key)%1000)
    if framed:
        frame(ink); border(ink,chap); fn(ink,1.08)
    else:
        fn(ink,1.45)
    return ink
