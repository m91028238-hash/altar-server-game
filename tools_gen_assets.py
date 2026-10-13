from PIL import Image, ImageDraw, ImageFilter
import math, random
random.seed(7)
OUT='/workspace/pub/assets/'
def ss(w,h): return Image.new('RGBA',(w*2,h*2),(0,0,0,0))
def fin(im,name,q=82):
    im=im.resize((im.width//2,im.height//2),Image.LANCZOS)
    im.save(OUT+name+'.webp','WEBP',quality=q)
def grad(w,h,top,bot):
    im=Image.new('RGBA',(w,h)); d=ImageDraw.Draw(im)
    for y in range(h):
        t=y/h; d.line([(0,y),(w,y)],fill=tuple(int(top[i]*(1-t)+bot[i]*t) for i in range(3))+(255,))
    return im
def glow(im,xy,r,col,a=120):
    g=Image.new('RGBA',im.size,(0,0,0,0)); d=ImageDraw.Draw(g)
    x,y=xy; d.ellipse([x-r,y-r,x+r,y+r],fill=col+(a,))
    g=g.filter(ImageFilter.GaussianBlur(r/2)); im.alpha_composite(g)
def iso_floor(d,cx,cy,n,s,c1,c2):
    for i in range(-n,n):
        for j in range(-n,n):
            x=cx+(i-j)*s; y=cy+(i+j)*s/2
            d.polygon([(x,y),(x+s,y+s/2),(x,y+s),(x-s,y+s/2)],fill=c1 if (i+j)%2 else c2)
def church(name,variant=0):
    W,H=1080,1440; im=grad(W*2,H*2,(60,32,24),(28,14,10)); d=ImageDraw.Draw(im)
    S=2
    # back walls (isometric)
    d.polygon([(0,300*S),(W*S/2*S/S,0),(W*S/2,820*S),(0,1100*S)],fill=(120,70,45))
    d.polygon([(W*S,300*S),(W*S/2,0),(W*S/2,820*S),(W*S,1100*S)],fill=(95,52,34))
    # windows (stained glass)
    cols=[(220,60,60),(60,110,220),(240,190,60),(70,170,90)]
    for k in range(3):
        x=120*S+k*130*S; y=380*S-k*65*S+60*S
        for side in (0,1):
            xx = x if side==0 else W*S-x
            pts=[(xx-30*S,y+40*S),(xx-30*S,y+200*S),(xx+30*S,y+200*S),(xx+30*S,y+40*S)]
            d.polygon(pts,fill=(30,20,30)); d.pieslice([xx-30*S,y,xx+30*S,y+80*S],180,360,fill=(30,20,30))
            for q in range(8):
                c=random.choice(cols); yy=y+30*S+q*20*S
                d.rectangle([xx-24*S,yy,xx+24*S,yy+18*S],fill=c)
            glow(im,(xx,y+120*S),110*S,(255,200,120),70)
    d=ImageDraw.Draw(im)
    iso_floor(d,W*S/2,800*S,9,70*S,(170,130,95),(140,100,70))
    # sanctuary step + altar
    ax,ay=W*S/2,760*S
    d.polygon([(ax-300*S,ay),(ax,ay-150*S),(ax+300*S,ay),(ax,ay+150*S)],fill=(200,170,130))
    d.polygon([(ax-300*S,ay),(ax,ay+150*S),(ax,ay+180*S),(ax-300*S,ay+30*S)],fill=(150,120,90))
    d.polygon([(ax+300*S,ay),(ax,ay+150*S),(ax,ay+180*S),(ax+300*S,ay+30*S)],fill=(120,95,70))
    # altar block
    bx,by=ax,ay-40*S
    d.polygon([(bx-150*S,by),(bx,by-70*S),(bx+150*S,by),(bx,by+70*S)],fill=(250,245,235))
    d.polygon([(bx-150*S,by),(bx,by+70*S),(bx,by+170*S),(bx-150*S,by+100*S)],fill=(225,215,200))
    d.polygon([(bx+150*S,by),(bx,by+70*S),(bx,by+170*S),(bx+150*S,by+100*S)],fill=(195,185,170))
    d.line([(bx-150*S,by+10*S),(bx,by+80*S),(bx+150*S,by+10*S)],fill=(210,170,60),width=8*S)
    # crucifix on wall
    cx=W*S/2; d.rectangle([cx-8*S,250*S,cx+8*S,560*S],fill=(90,50,25)); d.rectangle([cx-80*S,320*S,cx+80*S,336*S],fill=(90,50,25))
    d.ellipse([cx-14*S,334*S,cx+14*S,362*S],fill=(230,200,160))
    glow(im,(cx,400*S),200*S,(255,210,140),60); d=ImageDraw.Draw(im)
    # candles
    for dx in (-110,-60,60,110):
        x=bx+dx*S; y=by-10*S
        d.rectangle([x-6*S,y-60*S,x+6*S,y],fill=(250,245,225)); d.ellipse([x-6*S,y-80*S,x+6*S,y-58*S],fill=(255,200,80))
        glow(im,(x,y-70*S),40*S,(255,190,90),140); d=ImageDraw.Draw(im)
    # pews
    for r in range(4):
        for side in (-1,1):
            px=W*S/2+side*(260+r*70)*S; py=(1000+r*95)*S
            d.polygon([(px-110*S,py),(px,py-55*S),(px+110*S,py),(px,py+55*S)],fill=(110,60,30))
            d.polygon([(px-110*S,py),(px,py+55*S),(px,py+85*S),(px-110*S,py+30*S)],fill=(80,42,20))
    if variant==1:  # sacristy tint: cabinets
        for k in range(4):
            x=(150+k*90)*S; y=(700-k*45)*S
            d.rectangle([x,y,x+70*S,y+200*S],fill=(100,55,30),outline=(60,30,15),width=4*S)
    # vignette
    v=Image.new('L',im.size,0); dv=ImageDraw.Draw(v); dv.ellipse([-300*S,-200*S,W*S+300*S,H*S+200*S],fill=255)
    v=v.filter(ImageFilter.GaussianBlur(150*S)); dark=Image.new('RGBA',im.size,(10,5,3,255)); dark.putalpha(Image.eval(v,lambda p:255-p))
    im.alpha_composite(dark)
    im=im.resize((W,H),Image.LANCZOS).convert('RGB'); im.save(OUT+name+'.jpg',quality=80)
church('church'); church('sacristy',1)
def scene(name,top,bot,draw):
    W,H=1080,1440; im=grad(W,H,top,bot); d=ImageDraw.Draw(im); draw(im,d,W,H)
    im.convert('RGB').save(OUT+name+'.jpg',quality=80)
def house(im,d,W,H):
    for i in range(80): x,y=random.randint(0,W),random.randint(0,500); d.ellipse([x,y,x+3,y+3],fill=(220,220,255))
    d.ellipse([780,90,900,210],fill=(240,240,210)); glow(im,(840,150),120,(200,200,255),60); d=ImageDraw.Draw(im)
    d.polygon([(0,1000),(W,1000),(W,H),(0,H)],fill=(30,40,30))
    d.polygon([(200,600),(540,380),(880,600)],fill=(70,35,40)); d.rectangle([250,600,830,1050],fill=(110,90,80))
    for x in (320,640): d.rectangle([x,680,x+120,820],fill=(255,200,90)); glow(im,(x+60,750),110,(255,170,60),90); d=ImageDraw.Draw(im)
    d.rectangle([490,850,590,1050],fill=(60,30,20))
def cross(im,d,W,H):
    d.polygon([(0,800),(W,800),(W,H),(0,H)],fill=(50,45,35))
    d.polygon([(440,800),(640,800),(W,H),(0,H)],fill=(90,80,60)); d.polygon([(0,1050),(W,1000),(W,1120),(0,1170)],fill=(90,80,60))
    for x in (120,950,250): d.line([(x,800),(x-30,450),(x+40,380)],fill=(30,25,20),width=18)
    d.rectangle([700,560,720,820],fill=(80,60,40)); d.rectangle([660,610,760,628],fill=(80,60,40))
    m=Image.new('RGBA',im.size,(0,0,0,0)); dm=ImageDraw.Draw(m)
    for i in range(14): y=random.randint(700,1300); dm.ellipse([-200+random.randint(0,800),y,600+random.randint(0,800),y+120],fill=(180,190,200,40))
    im.alpha_composite(m.filter(ImageFilter.GaussianBlur(30)))
def hosp(im,d,W,H):
    d.rectangle([100,300,980,1100],fill=(80,90,85)); d.polygon([(0,1100),(W,1100),(W,H),(0,H)],fill=(40,45,40))
    for r in range(4):
        for c in range(6):
            x,y=150+c*140,360+r*170; lit=random.random()<.2
            d.rectangle([x,y,x+80,y+110],fill=(120,230,160) if lit else (25,30,30))
            if lit: glow(im,(x+40,y+55),70,(100,255,150),70); d=ImageDraw.Draw(im)
    d.rectangle([480,330,600,350],fill=(160,40,40)); d.rectangle([530,280,550,400],fill=(160,40,40))
scene('house',(15,15,45),(40,30,60),house); scene('crossroads',(40,30,50),(90,60,60),cross); scene('hospital',(10,25,25),(30,50,45),hosp)
def hub(im,d,W,H):
    d.rectangle([0,0,W,H],fill=(110,150,80))
    for i in range(400): x,y=random.randint(0,W),random.randint(0,H); d.ellipse([x,y,x+14,y+8],fill=(95,135,70))
    d.line([(540,420),(250,820),(200,1150)],fill=(200,180,130),width=50); d.line([(540,420),(850,800),(820,1200)],fill=(200,180,130),width=50); d.line([(540,420),(540,1300)],fill=(200,180,130),width=50)
    # church
    d.polygon([(400,420),(540,330),(680,420),(680,560),(400,560)],fill=(220,190,150)); d.polygon([(380,430),(540,320),(700,430)],fill=(150,60,50))
    d.rectangle([515,180,565,340],fill=(220,190,150)); d.polygon([(505,190),(540,120),(575,190)],fill=(150,60,50)); d.rectangle([536,80,544,130],fill=(240,200,80)); d.rectangle([524,92,556,100],fill=(240,200,80))
    for x,y in [(100,200),(900,150),(950,1300),(80,1350),(300,1000),(760,600)]:
        d.ellipse([x-50,y-50,x+50,y+50],fill=(60,100,50)); d.ellipse([x-35,y-60,x+25,y],fill=(80,125,60))
    d.ellipse([650,1050,1000,1250],fill=(80,140,200))
scene('hub',(0,0,0),(0,0,0),hub)
# sprites
def sprite(name,fn,w=256,h=320):
    im=ss(w,h); d=ImageDraw.Draw(im); fn(im,d,2); fin(im,name)
def person(robe,over,skin=(240,200,165),hair=(70,40,25),extra=None):
    def f(im,d,S):
        d.ellipse([60*S,290*S,196*S,315*S],fill=(0,0,0,80))
        d.polygon([(80*S,140*S),(176*S,140*S),(200*S,300*S),(56*S,300*S)],fill=robe)
        if over: d.polygon([(76*S,140*S),(180*S,140*S),(196*S,240*S),(60*S,240*S)],fill=over)
        d.ellipse([88*S,50*S,168*S,135*S],fill=skin); d.pieslice([86*S,44*S,170*S,110*S],180,360,fill=hair)
        d.ellipse([108*S,88*S,118*S,100*S],fill=(40,30,30)); d.ellipse([138*S,88*S,148*S,100*S],fill=(40,30,30))
        d.arc([115*S,100*S,141*S,120*S],20,160,fill=(150,70,60),width=3*S)
        d.ellipse([60*S,170*S,90*S,200*S],fill=skin); d.ellipse([166*S,170*S,196*S,200*S],fill=skin)
        if extra: extra(d,S)
    return f
sprite('server',person((160,20,30),(250,250,250)))
def stole(d,S): d.polygon([(110*S,140*S),(146*S,140*S),(140*S,300*S),(116*S,300*S)],fill=(220,180,50))
sprite('priest',person((40,40,45),(245,240,225),hair=(120,120,120),extra=stole))
sprite('seminarian',person((25,25,30),None))
def demon(im,d,S):
    glow(im,(128*S,170*S),110*S,(150,30,160),110); d=ImageDraw.Draw(im)
    d.polygon([(40*S,300*S),(70*S,120*S),(186*S,120*S),(216*S,300*S),(170*S,260*S),(128*S,305*S),(86*S,260*S)],fill=(55,20,70))
    d.ellipse([70*S,60*S,186*S,170*S],fill=(80,30,95))
    d.polygon([(80*S,85*S),(55*S,10*S),(105*S,70*S)],fill=(30,10,40)); d.polygon([(176*S,85*S),(201*S,10*S),(151*S,70*S)],fill=(30,10,40))
    for x in (100,156): d.ellipse([(x-14)*S,100*S,(x+14)*S,122*S],fill=(255,220,60)); d.ellipse([(x-4)*S,104*S,(x+4)*S,118*S],fill=(40,0,0))
    d.arc([100*S,125*S,156*S,155*S],200,340,fill=(255,220,60),width=4*S)
sprite('demon',demon)
# items 128
def item(name,fn):
    im=ss(128,128); d=ImageDraw.Draw(im); glow(im,(128,128),80,(255,230,150),70); d=ImageDraw.Draw(im); fn(d,2); fin(im,'i_'+name)
G=(230,185,60);GD=(170,125,30);W_=(250,248,240)
def chalice(d,S): d.pieslice([30*S,10*S,98*S,80*S],0,180,fill=G); d.rectangle([60*S,44*S,68*S,98*S],fill=GD); d.ellipse([52*S,62*S,76*S,76*S],fill=G); d.polygon([(36*S,118*S),(92*S,118*S),(70*S,96*S),(58*S,96*S)],fill=G)
def paten(d,S): d.ellipse([14*S,44*S,114*S,90*S],fill=G); d.ellipse([28*S,52*S,100*S,82*S],fill=GD); d.ellipse([44*S,52*S,84*S,76*S],fill=W_)
def ciborium(d,S): d.pieslice([30*S,30*S,98*S,100*S],0,180,fill=G); d.pieslice([30*S,26*S,98*S,80*S],180,360,fill=GD); d.rectangle([61*S,10*S,67*S,30*S],fill=G); d.rectangle([54*S,15*S,74*S,20*S],fill=G); d.polygon([(40*S,120*S),(88*S,120*S),(68*S,64*S),(60*S,64*S)],fill=G)
def cruets(d,S):
    for x,c in ((40,(230,240,255,200)),(88,(150,30,60,230))): d.ellipse([(x-20)*S,56*S,(x+20)*S,116*S],fill=c,outline=(200,200,210),width=3*S); d.rectangle([(x-6)*S,28*S,(x+6)*S,60*S],fill=c)
def missal(d,S): d.rectangle([20*S,24*S,108*S,108*S],fill=(150,25,30)); d.rectangle([24*S,28*S,104*S,104*S],outline=G,width=3*S); d.rectangle([60*S,40*S,68*S,92*S],fill=G); d.rectangle([44*S,54*S,84*S,62*S],fill=G); d.rectangle([90*S,100*S,96*S,124*S],fill=(40,120,60))
def lectionary(d,S): d.rectangle([20*S,24*S,108*S,108*S],fill=(40,80,140)); d.rectangle([60*S,40*S,68*S,92*S],fill=G); d.rectangle([44*S,54*S,84*S,62*S],fill=G)
def candle(d,S): d.rectangle([52*S,40*S,76*S,110*S],fill=W_); d.ellipse([56*S,14*S,72*S,42*S],fill=(255,190,60)); d.rectangle([40*S,108*S,88*S,118*S],fill=G)
def crossi(d,S): d.rectangle([58*S,6*S,70*S,124*S],fill=G); d.rectangle([30*S,30*S,98*S,42*S],fill=G)
def bell(d,S): d.pieslice([30*S,20*S,98*S,130*S],180,360,fill=G); d.rectangle([30*S,72*S,98*S,90*S],fill=G); d.ellipse([56*S,88*S,72*S,104*S],fill=GD); d.rectangle([58*S,6*S,70*S,24*S],fill=(110,60,30))
def corporal(d,S): d.polygon([(14*S,64*S),(64*S,40*S),(114*S,64*S),(64*S,88*S)],fill=W_,outline=(200,200,200)); d.rectangle([60*S,56*S,68*S,72*S],fill=(200,40,40))
def purif(d,S): d.rectangle([24*S,40*S,104*S,90*S],fill=W_); d.rectangle([60*S,54*S,68*S,76*S],fill=(200,40,40)); d.rectangle([54*S,61*S,74*S,68*S],fill=(200,40,40))
def lavabo(d,S): d.ellipse([16*S,64*S,112*S,104*S],fill=(210,210,220)); d.ellipse([26*S,68*S,102*S,94*S],fill=(140,190,230)); d.rectangle([20*S,40*S,40*S,56*S],fill=W_)
def thurible(d,S): d.line([(64*S,4*S),(64*S,50*S)],fill=G,width=3*S); d.ellipse([36*S,50*S,92*S,110*S],fill=G); d.ellipse([50*S,30*S,70*S,50*S],fill=(220,220,220,150)); d.ellipse([60*S,14*S,86*S,36*S],fill=(220,220,220,120))
def boat(d,S): d.pieslice([20*S,30*S,108*S,100*S],0,180,fill=G); d.rectangle([60*S,90*S,68*S,110*S],fill=GD); d.ellipse([44*S,104*S,84*S,118*S],fill=G)
def water(d,S): d.ellipse([34*S,40*S,94*S,120*S],fill=(140,200,255,220),outline=(220,240,255),width=3*S); d.rectangle([56*S,14*S,72*S,44*S],fill=(200,230,255)); d.rectangle([60*S,64*S,68*S,100*S],fill=W_); d.rectangle([50*S,74*S,78*S,82*S],fill=W_)
def rosary(d,S):
    for k in range(18): a=k/18*6.28; d.ellipse([(64+38*math.cos(a)-6)*S,(54+34*math.sin(a)-6)*S,(64+38*math.cos(a)+6)*S,(54+34*math.sin(a)+6)*S],fill=(120,60,160))
    d.rectangle([60*S,88*S,68*S,124*S],fill=G); d.rectangle([52*S,98*S,76*S,104*S],fill=G)
def scap(d,S): d.line([(30*S,10*S),(40*S,70*S)],fill=(120,80,40),width=4*S); d.line([(98*S,10*S),(88*S,70*S)],fill=(120,80,40),width=4*S); d.rectangle([28*S,66*S,62*S,110*S],fill=(110,60,30)); d.rectangle([66*S,66*S,100*S,110*S],fill=(110,60,30)); d.ellipse([36*S,76*S,54*S,98*S],fill=(220,200,140))
def vest(d,S): d.polygon([(30*S,20*S),(98*S,20*S),(110*S,120*S),(18*S,120*S)],fill=(240,240,240)); d.polygon([(54*S,20*S),(74*S,20*S),(70*S,120*S),(58*S,120*S)],fill=G)
def medal(d,S): d.ellipse([28*S,28*S,100*S,100*S],fill=(200,200,215)); d.ellipse([38*S,38*S,90*S,90*S],fill=(160,160,180)); d.polygon([(64*S,44*S),(54*S,84*S),(74*S,84*S)],fill=(230,230,240))
def sword(d,S): d.polygon([(64*S,6*S),(72*S,90*S),(56*S,90*S)],fill=(220,230,255)); d.rectangle([40*S,88*S,88*S,96*S],fill=G); d.rectangle([60*S,96*S,68*S,122*S],fill=(120,70,30))
for n,f in dict(chalice=chalice,paten=paten,ciborium=ciborium,cruets=cruets,missal=missal,lectionary=lectionary,candle=candle,cross=crossi,bell=bell,corporal=corporal,purificator=purif,lavabo=lavabo,thurible=thurible,boat=boat,water=water,rosary=rosary,scapular=scap,vestment=vest,medal=medal,sword=sword).items(): item(n,f)
# UI frame
im=ss(400,200); d=ImageDraw.Draw(im); d.rounded_rectangle([4,4,796,396],40,fill=(40,22,14,235),outline=(220,175,70),width=10); d.rounded_rectangle([24,24,776,376],28,outline=(150,110,40),width=4); fin(im,'frame')
