import sys; sys.path.insert(0,'/home/user/render/wood')
from engine import carve,to_rgba
from designs import build
HDR={'receta':'#E6DFCE','pensamiento':'#2B2B2B','biografia':'#E6DFCE'}
keys=['R0','R1','R2','R3','R4','R5','P0','P1','P2','P3','P4','P5','P6','B0','B1','B2','B3']
masks={k:carve(build(k,False),px=900,seed=60+i) for i,k in enumerate(keys)}
for b,col in HDR.items():
    for k,m in masks.items(): to_rgba(m,col,size=260).save(f'/home/user/render/build/assets/x_{b}_{k}.png')
print('ok')
