"""Build the original showroom study. Dimensions are in metres, Y-up, nose +Z.
Run with Python 3, NumPy and SciPy. The uncompressed GLB is written to argv[1].
"""
import json, math, struct, sys
from collections import defaultdict
import numpy as np
from scipy.interpolate import PchipInterpolator
from scipy.spatial.transform import Rotation

PI = math.pi
parts = defaultdict(list)
materials = {}
def mat(name, rgb, metal=0, rough=.35, emit=None):
    m = {"name": name, "pbrMetallicRoughness":{"baseColorFactor":[*rgb, 1], "metallicFactor":metal,"roughnessFactor":rough},"doubleSided":True}
    if emit: m["emissiveFactor"] = list(emit)
    if name == 'Paint': m['extensions']={'KHR_materials_clearcoat':{'clearcoatFactor':1,'clearcoatRoughnessFactor':.11}}
    materials[name]=m

mat('Paint',[.029,.10,.25],.79,.24)
mat('Glass',[.012,.020,.026],.35,.115)
mat('Shadowline',[.014,.016,.018],.63,.26)
mat('Lens',[.030,.041,.052],.67,.16)
mat('Lens reflector',[.26,.31,.37],.97,.20)
mat('Grille',[.009,.010,.012],.15,.37)
mat('Machined aluminum',[.35,.38,.41],.92,.24)
mat('Rim graphite',[.10,.105,.12],.9,.24)
mat('Rim cut face',[.54,.58,.62],.94,.20)
mat('Tire',[.014,.015,.017],.04,.67)
mat('Tire sidewall',[.025,.026,.027],.025,.62)
mat('Rotor',[.21,.23,.25],.84,.36)
mat('Caliper',[.31,.018,.011],.46,.28)
mat('Carbon',[.020,.023,.028],.48,.3)
mat('DRL',[.73,.86,1],.12,.13,(.75,.88,1))
mat('Tail',[.39,.002,.007],.15,.2,(.82,.011,.012))
mat('Brake',[.24,.003,.003],.1,.24,(.19,.001,.001))
mat('Indicator',[.025,.013,.004],.25,.24)
mat('Lens ruby',[.105,.002,.007],.45,.15)
mat('Badge blue',[.014,.19,.35],.58,.2)
mat('Badge white',[.88,.89,.91],.52,.22)

def add(name, v, f, outward=None):
    v=np.array(v,dtype=float); f=np.array(f,dtype='i4')
    if len(f)==0:return
    face=np.cross(v[f[:,1]]-v[f[:,0]],v[f[:,2]]-v[f[:,0]])
    if outward is not None:
        d=np.asarray(outward)
        if d.ndim==1: flip=(face@d)<0
        else:flip=(face*d[f].mean(axis=1)).sum(1)<0
        f[flip]=f[flip][:,[0,2,1]]
        face[flip]*=-1
    n=np.zeros(v.shape)
    for k in range(3):np.add.at(n,f[:,k],face)
    n/=np.maximum(1e-12,np.linalg.norm(n,axis=1)[:,None])
    parts[name].append((v.astype('f4'),n.astype('f4'),f))

def grid(name, rows, outward):
    a=np.asarray(rows); w=a.shape[1]; ids=np.arange((a.shape[0]-1)*w).reshape(-1,w)[:,:-1].flatten()
    f=np.concatenate((np.column_stack((ids,ids+1,ids+w)),np.column_stack((ids+1,ids+w+1,ids+w))))
    add(name,a.reshape(-1,3),f,outward)

def polygon(name, pts, outward=None):
    # Star-shaped patch with a center vertex.
    v=np.array(pts); center=v.mean(axis=0); count=len(v)
    add(name,[center,*v],[(0,i+1,(i+1)%count+1) for i in range(count)],outward)
def pipe(name, points, rad, sides=6, loop=False):
    p=np.array(points,dtype=float)
    if loop: p=np.concatenate([p,p[:1]])
    tangent=np.empty_like(p);tangent[1:-1]=p[2:]-p[:-2];tangent[0]=p[1]-p[0];tangent[-1]=p[-1]-p[-2]
    if loop:tangent[0]=tangent[-1]=p[1]-p[-2]
    tangent/=np.maximum(1e-8,np.linalg.norm(tangent,axis=1)[:,None])
    stable=np.eye(3)[np.argmin(np.abs(tangent).mean(0))]
    u=np.cross(tangent,stable); u/=np.maximum(np.linalg.norm(u,axis=1)[:,None],1e-8)
    v=np.cross(tangent,u)
    angle=np.linspace(0,2*PI,sides+1)
    offset=u[:,None,:]*np.cos(angle)[None,:,None]+v[:,None,:]*np.sin(angle)[None,:,None]
    grid(name,p[:,None,:]+rad*offset,offset.reshape(-1,3))
def shell(name, loop1, loop2, out):
    polygon(name,loop1,out); polygon(name,loop2)
    a=np.array(loop1);b=np.array(loop2)
    for i in range(len(a)): 
        j=(i+1)%len(a);polygon(name,[a[i],a[j],b[j],b[i]])

def spline(points):
    a=np.array(points);return PchipInterpolator(a[:,0],a[:,1])
width=spline([(-2.48,.792),(-2.34,.896),(-2.08,.93),(-1.52,.952),(-1.06,.929),(-.5,.916),(.45,.922),(1.08,.946),(1.5,.958),(1.88,.945),(2.22,.903),(2.47,.774)])
bonnet=spline([(-2.48,.92),(-2.40,.979),(-2.23,.995),(-1.83,1.002),(-1.57,1.026),(-1.1,1.024),(.56,1.012),(.83,1.013),(1.02,.957),(1.42,.902),(1.95,.845),(2.28,.795),(2.47,.738)])
shoulder=spline([(-2.48,.82),(-2.25,.918),(-1.50,.964),(-1.00,.950),(.0,.934),(.75,.921),(1.45,.926),(1.78,.901),(2.11,.845),(2.47,.688)])
def w(z):return float(width(z))
def top(z,t):
    h=float(bonnet(z)); sh=float(shoulder(z)); a=abs(t)
    # Central crown, crease up the two edges of the bonnet, sculpted shoulder.
    return h+(sh-h)*a**3+.022*math.exp(-((a-.75)/.10)**2)-.004*a
def bottom(z):
    for hub in (-1.47,1.47):
        dz=abs(z-hub)
        if dz<=.380: return .355+math.sqrt(max(0,.383**2-dz**2))
        if dz<.425:return .145+(.355+math.sqrt(.383**2-.380**2)-.145)*(.425-dz)/.045
    return .145+max(0,abs(z)-1.96)*.14
def edge_x(z,u):
    # shoulder edge, character line, concave lower door, rocker
    return w(z)+np.interp(u,[0,.07,.18,.34,.50,.75,.91,1],[0,.004,.002,-.015,-.02,-.042,-.033,-.039])
def side_at(s,z,y):
    h=top(z,1); b=bottom(z);return [s*edge_x(z,min(1,max(0,(h-y)/max(.055,h-b)))),y,z]
def sample(z0,z1,n):return np.linspace(z0,z1,n)
def capline_m(x): return 2.459-.095*(abs(x)/.94)**2
def tail_m(x): return -2.478+.098*(abs(x)/.94)**2
# Main hull terminates at cross planes and curves backwards toward the corners.
def end_warp(z,x):
    s=max(0,(abs(z)-2.06)/.415)
    return z-np.sign(z)*.101*(abs(x)/.94)**2*min(1,s)**2
zs=sorted(set([*np.linspace(-2.48,2.47,79),*sum(([hub+d for d in [-.425,-.400,-.38,-.365,-.34,-.29,-.2,-.1,0,.1,.2,.29,.34,.365,.38,.400,.425]] for hub in [-1.47,1.47]),[])]))
def upper(s,z,t): 
    x=s*w(z)*t;return [x,top(z,t),end_warp(z,x)]
grid('Paint',[[upper(1,z,t) for t in np.linspace(-1,1,41)] for z in zs],[0,1,0])
us=[0,.045,.07,.115,.18,.25,.34,.5,.63,.75,.86,.91,1]
for s in [-1,1]:
    grid('Paint',[[[s*edge_x(z,u),top(z,1)*(1-u)+bottom(z)*u,end_warp(z,edge_x(z,u))] for u in us] for z in zs],[s,0,0])
    for hub in [-1.47,1.47]:
        az=sample(hub-.425,hub+.425,100)
        grid('Grille',[[[s*(edge_x(z,1)-inset),bottom(z)-.002,z] for inset in [0,.09,.21]]for z in az],[0,-1,0])
        pipe('Paint',[[s*(edge_x(z,1)+.001),bottom(z)+.003,z] for z in az],.006)
    # F90 rocker has a narrow upper chamfer and a dark aero blade below.
    zsill=[-1.067,-.95,-.42,.15,.90,1.06]
    grid('Paint',[[[s*(w(z)+q),y,z]for q,y in [(-.043,.244),(-.021,.214),(.003,.186),(-.002,.154),(-.028,.141)]]for z in zsill],[s,.1,0])
    pipe('Carbon',[[s*(w(z)-.001),.146,z] for z in zsill],.012)
    # Four door shut-lines and flush handles.
    for zy in [[(.815,.930),(.832,.846),(.842,.665),(.864,.465),(.866,.295),(.833,.247)], [(-.217,.94),(-.226,.839),(-.249,.68),(-.259,.46),(-.265,.285),(-.224,.240)], [(-1.22,.935),(-1.32,.85),(-1.296,.781),(-1.17,.705),(-1.087,.621),(-1.01,.497),(-.955,.322),(-.888,.246)]]:
        pipe('Grille',[np.asarray(side_at(s,z,y))+[s*.002,0,0] for z,y in zy],.0028)
    for z in [.02,-.965]:
        q=side_at(s,z,.837); y=q[1];x=q[0]
        shape=[(z-.075,y-.006),(z-.072,y+.013),(z-.053,y+.021),(z+.069,y+.016),(z+.071,y+.004),(z+.049,y-.006)]
        shell('Paint',[[x+s*.020,yy,zz]for zz,yy in shape],[[x+s*.003,yy,zz]for zz,yy in shape],[s,0,0])
        pipe('Grille',[[x+s*.014,y-.006,z-.064],[x+s*.014,y-.007,z+.058]],.003)
    # Short F90 fender gill aft of front wheel.
    stop=[(.908,.797),(.904,.827),(1.084,.856),(1.163,.849),(1.123,.824),(.953,.791)]
    p=[side_at(s,z,y)for z,y in stop];p=[[x+.004*s,y,z] for x,y,z in p]
    polygon('Shadowline',p,[s,0,0])
    pipe('Machined aluminum',[p[1],p[2],p[3]],.004)
# Curved cabin with fitted window material and shaped pillars.
cabin_y=spline([(-1.87,1.005),(-1.65,1.073),(-1.37,1.22),(-1.11,1.361),(-.92,1.421),(-.65,1.449),(-.25,1.463),(.035,1.449),(.165,1.414),(.29,1.355),(.54,1.212),(.82,1.056),(.92,1.00)])
cabin_w=spline([(-1.87,.813),(-1.50,.855),(-1.0,.873),(-.45,.872),(.28,.865),(.76,.85),(.92,.83)])
def cab(z,t):
    b=top(z,.91)+.002; h=max(0,float(cabin_y(z))-b); c=float(cabin_w(z))
    # roof/windshield arcs, nearly planar side glass, rounded edge.
    curve=np.interp(abs(t),[0,.30,.55,.69,.74,.77,.79,.81,.83,.85,.91,1],[1,.996,.987,.976,.967,.95,.925,.874,.804,.735,.455,0])
    return [c*t,b+h*curve,z]
cz=sample(-1.87,.92,81); ts=[-t for t in [1,.97,.92,.88,.85,.83,.81,.79,.77,.74,.69,.55,.3]]+[0,.3,.55,.69,.74,.77,.79,.81,.83,.85,.88,.92,.97,1]
grid('Paint',[[cab(z,t) for t in ts] for z in cz],[0,1,0])
# Windshield and backlight follow the exact compound roof.
def screen(front,a,b):
    rows=[]
    for l in sample(0,1,27):
        row=[]
        for t in sample(-1,1,43):
            # rounded transverse corners and lateral sweep of windshield
            z=(a +(-.043*abs(t)**3 if front else .051*abs(t)**3))*(1-l)+(b+(-.074*abs(t)**3 if front else .070*abs(t)**3))*l
            q=cab(z,t*(.749+.115*l)); q[1]+=.006
            row.append(q)
        rows.append(row)
    grid('Glass',rows,[0,1,.4 if front else -.4])
    pipe('Shadowline',rows[0],.008);pipe('Shadowline',rows[-1],.009)
    for i in [0,-1]: pipe('Shadowline',[r[i]for r in rows],.005)
screen(True,.134,.866);screen(False,-.971,-1.791)
def zleft(t):return -1.635+.573*t-.105*math.sin(PI*t)
def zright(t):return .789-.646*t+.046*math.sin(PI*t)
for s in [-1,1]:
    def sideglass(z,r):
        t=1-(.012+.19*r)
        p=cab(z,s*t);p[0]+=s*.006;p[1]+=.004
        return p
    # The kink at the trailing side glass is formed by the curved rear boundary.
    for edgeA,edgeB in [(zleft,lambda t:-.269-.087*t),(lambda t:-.219-.081*t,zright)]:
        g=[]
        for r in sample(0,1,18):
            za=edgeA(r);zb=edgeB(r)
            g.append([sideglass(z,r) for z in sample(za,zb,35)])
        grid('Glass',g,[s,.28,0]);pipe('Shadowline',g[0],.010);pipe('Shadowline',g[-1],.011)
        for idx in [0,-1]:pipe('Shadowline',[row[idx] for row in g],.009)
    pipe('Shadowline',[sideglass(-1.37+.264*r,r) for r in sample(0,1,19)],.008)
    pipe('Machined aluminum',[sideglass(z,0) for z in sample(-1.64,.786,41)],.004)
# Bonnet panel gap follows the front fender and curves across cowl.
for s in [-1,1]:
    p=[]
    for z in sample(.871,2.37,62):
        t=.861-.132*(z-.871)/1.5
        a=upper(s,z,t);a[1]+=.001; p.append(a)
    pipe('Grille',p,.0022)
    # side mirror, faceted underside, clear turn strip
    root=[s*.835,.992,.682];tip=[s*.978,1.009,.607]
    pipe('Shadowline',[root,tip],.028,10)
    ring=[]
    for k in range(24):
        a=k*2*PI/24;ring.append([s*(1.001+.117*math.cos(a)),1.024+.047*math.sin(a),.640+.030*math.cos(a)])
    back=[[x,y+.001,z-.143]for x,y,z in ring]
    mid=[[x+s*.008,y+.012,z-.046]for x,y,z in ring]
    for j in range(24):
        q=(j+1)%24;name='Paint'if(ring[j][1]>1.011)else'Shadowline'
        polygon(name,[ring[j],ring[q],mid[q],mid[j]])
        polygon(name,[mid[j],mid[q],back[q],back[j]])
    polygon('Paint',ring,[0,0,1]);polygon('Lens reflector',back,[0,0,-1])
    pipe('Indicator',[[s*.993,1.020,.65],[s*1.068,1.022,.657],[s*1.110,1.024,.650]],.0035)
# Close the hull at each end.
for zz,sign in [(2.47,1),(-2.48,-1)]:
    rows=[]
    for u in sample(0,1,10):
        r=[]
        for t in sample(-1,1,101):
            x=w(zz)*t*(1-.044*u)
            z=end_warp(zz,x) - sign*(.004*u+.018*u*u)
            r.append([x,top(zz,t)*(1-u)+bottom(zz)*u,z])
        rows.append(r)
    grid('Paint',rows,[0,0,sign])
# Front insert follows the rounded transverse bumper. Outside portions sweep back
# into the fender while the center of the kidneys stays near vertical.
# Resolve the front bumper's transverse contour for lights and aero openings.
# Build a small sampled lookup once; outer bumper corners sweep back into the wing.
from scipy.interpolate import RegularGridInterpolator
front_x=np.linspace(0,.93,191)
front_y=np.linspace(.18,.83,25)
front_lookup=[]
front_stations=np.linspace(2.47,1.78,330)
for height in front_y:
    xx=[];zz=[]
    for station in front_stations:
        hi=top(station,1);lo=bottom(station);u=np.clip((hi-height)/max(.06,hi-lo),0,1)
        xx.append(edge_x(station,u));zz.append(end_warp(station,xx[-1]))
    base=[2.47-.101*(x/.94)**2-.020*np.clip((.74-height)/.56,0,1) for x in front_x]
    front_lookup.append([float(z if x <= xx[0] else np.interp(x,xx,zz)) for x,z in zip(front_x,base)])
front_shape=RegularGridInterpolator((front_y,front_x),np.asarray(front_lookup),bounds_error=False,fill_value=None)
def fr(x,y,depth=0):
    return [x,y,float(front_shape([[y,abs(x)]])[0])+depth]
def rr(x,y,depth=0):
    ax=abs(x);z=-2.48+.10*(ax/.94)**2-depth+(.8*max(0,ax-.78))
    return [x,y,z]
def region(name,coords,mapper,out):
    pts=[mapper(x,y)for x,y in coords];polygon(name,pts,out);return pts
for s in [-1,1]:
    # Paired swept trapezoidal kidneys, chrome perimeter, seven double grille ribs.
    kidney=[(.026,.682),(.047,.713),(.159,.724),(.305,.725),(.389,.712),(.422,.692),(.418,.659),(.372,.550),(.336,.526),(.119,.524),(.088,.533),(.067,.561)]
    kp=region('Grille',[(s*x,y)for x,y in kidney],lambda x,y:fr(x,y,.012),[0,0,1])
    pipe('Shadowline',kp,.014,9,True);pipe('Machined aluminum',[fr(s*x,y,.022)for x,y in kidney],.006,8,True)
    for p in sample(0,1,8):
        xb=.102+.25*p;xt=.077+.307*p
        for off in [.0,.011]:
            pipe('Rim graphite',[fr(s*(xb+off),.539+.008*abs(p-.5),.022),fr(s*(xt+off),.707+.004*math.sin(p*PI),.024)],.0037,6)
    lens=[(.420,.697),(.487,.734),(.700,.748),(.786,.767),(.881,.789),(.910,.771),(.898,.734),(.820,.690),(.744,.656),(.632,.627),(.473,.633),(.427,.647)]
    # Front light wraps following the fender top toward negative Z.
    def head(x,y,k=.018):
        return fr(x,y,k+.001)
    la=region('Lens',[(s*x,y)for x,y in lens],lambda x,y:head(x,y,.021),[0,.1,1])
    pipe('Shadowline',la,.008,8,True)
    def hp(seq,d,matname,rad):
        pipe(matname,[head(s*x,y,d)for x,y in seq],rad,8)
    # two angular light guides per headlamp, mirrored
    hp([(.448,.698),(.452,.657),(.467,.649),(.559,.650),(.591,.676)],.030,'DRL',.0085)
    hp([(.602,.711),(.611,.666),(.623,.657),(.710,.684),(.778,.738)],.030,'DRL',.0085)
    hp([(.472,.714),(.553,.719),(.571,.706)],.026,'Lens reflector',.004)
    hp([(.651,.726),(.715,.736),(.745,.742)],.026,'Lens reflector',.004)
    hp([(.795,.756),(.855,.771),(.887,.779)],.031,'Indicator',.006)
    # sculpted side inlet, carbon lip, inner slats
    intake=[(.551,.489),(.600,.511),(.791,.551),(.864,.564),(.889,.538),(.901,.413),(.892,.309),(.838,.267),(.748,.249),(.627,.267),(.555,.316),(.508,.367)]
    ip=region('Grille',[(s*x,y)for x,y in intake],lambda x,y:fr(x,y,.019),[0,0,1])
    pipe('Paint',ip,.017,9,True)
    for y in [.32,.368,.416,.466]:
        coords=[(.582,y-.012),(.839,y+.027),(.858,y+.031),(.849,y+.040),(.600,y+.008)]
        region('Shadowline',[(s*x,yy)for x,yy in coords],lambda x,y:fr(x,y,.043),[0,0,1])
    accents=[(.465,.498),(.548,.491),(.505,.413),(.584,.289),(.617,.256),(.600,.234),(.547,.257),(.447,.396)]
    region('Paint',[(s*x,y)for x,y in accents],lambda x,y:fr(x,y,.039),[0,0,1])
# Horizontal central intake and low chin spoiler; perimeter broadens downward.
mouth=[(-.47,.491),(-.335,.503),(0,.508),(.335,.503),(.47,.491),(.46,.442),(.514,.349),(.540,.307),(.497,.277),(.36,.265),(-.36,.265),(-.497,.277),(-.540,.307),(-.514,.349),(-.46,.442)]
mp=region('Grille',mouth,lambda x,y:fr(x,y,.021),[0,0,1]);pipe('Shadowline',mp,.011,8,True)
for y in [.292,.324,.356,.388,.420,.452,.482]:
    for x in np.arange(-.432,.451,.037):
        # Subtle wire mesh in the lower radiator aperture.
        pipe('Shadowline',[fr(x-.016,y,.029),fr(x-.007,y+.009,.029),fr(x+.006,y+.009,.029),fr(x+.016,y,.029)],.002,4)
lip=[(-.895,.284),(-.79,.227),(-.545,.210),(-.414,.216),(0,.219),(.414,.216),(.545,.210),(.79,.227),(.895,.284)]
pipe('Carbon',[fr(x,y,.032)for x,y in lip],.021,9)
# Tail light assemblies: red blades, turn and brake segments.
for s in [-1,1]:
    points=[(.314,.815),(.360,.870),(.667,.896),(.785,.898),(.898,.872),(.910,.846),(.892,.756),(.837,.736),(.709,.748),(.565,.774),(.368,.786)]
    t=region('Lens ruby',[(s*x,y)for x,y in points],lambda x,y:rr(x,y,.014),[0,0,-1]);pipe('Shadowline',t,.007,6,True)
    for offset,rad in [(0,.010),(.024,.006)]:
        pipe('Tail',[rr(s*x,y+offset,.025)for x,y in [(.352,.803),(.555,.811),(.753,.797),(.834,.795),(.867,.818),(.888,.853)]],rad,8)
    pipe('Brake',[rr(s*x,y,.029)for x,y in [(.420,.852),(.625,.868),(.799,.868),(.866,.858)]],.013,8)
    pipe('Indicator',[rr(s*x,y,.029)for x,y in [(.517,.827),(.705,.834),(.810,.837)]],.006,8)
# Rear boot cut, license panel, diffuser and quad black-chrome exhausts.
pipe('Grille',[rr(x,y,.008) for x,y in [(-.764,.925),(-.739,.884),(-.673,.772),(-.636,.650),(-.498,.610),(0,.602),(.498,.610),(.636,.650),(.673,.772),(.739,.884),(.764,.925)]],.003)
plate=[(-.229,.711),(.229,.711),(.229,.604),(-.229,.604)]
region('Shadowline',plate,lambda x,y:rr(x,y,.014),[0,0,-1])
diff=[(-.861,.369),(-.692,.346),(-.499,.361),(-.346,.392),(.346,.392),(.499,.361),(.692,.346),(.861,.369),(.83,.210),(.649,.181),(-.649,.181),(-.83,.210)]
region('Carbon',diff,lambda x,y:rr(x,y,.019),[0,0,-1])
for x in [-.37,-.19,0,.19,.37]:
    shell('Shadowline',[[x-.011,.349,-2.465],[x-.011,.150,-2.429],[x-.011,.184,-2.26],[x-.011,.304,-2.26]],[[x+.011,.349,-2.465],[x+.011,.150,-2.429],[x+.011,.184,-2.26],[x+.011,.304,-2.26]],[-1,0,0])
for x in [-.738,-.621,.621,.738]:
    ring=[[x+.051*math.cos(q),.251+.047*math.sin(q),rr(x,.25,.060)[2]] for q in sample(0,2*PI,31)[:-1]]
    b=[[a,y,z+.12]for a,y,z in ring];polygon('Grille',b,[0,0,-1])
    grid('Shadowline',[ring+[ring[0]],b+[b[0]]],[0,-1,0]);pipe('Machined aluminum',ring,.006,8,True)
# Wheel detail: nearly round shoulder, radial sidewall steps, drilled rotors,
# floating five split-Y spokes, rim lugs and blue/white hub roundel.
def wheel(s,hub):
    cz=.352; face=.943
    def point(x,r,angle):
        return [s*x,cz+r*math.sin(angle),hub+r*math.cos(angle)]
    def lathe(name,profile,n=72):
        rings=[]
        for x,r in profile:rings.append([point(x,r,a) for a in sample(0,2*PI,n+1)])
        coords=np.array(rings);dirs=coords.copy();dirs[:,:,0]=s*.20;dirs[:,:,1]-=cz;dirs[:,:,2]-=hub
        grid(name,rings,dirs.reshape(-1,3))
    def disk(name,x,cy,cz2,r,n=14):
        pts=[[s*x,cy+r*math.sin(a),cz2+r*math.cos(a)]for a in sample(0,2*PI,n+1)[:-1]];polygon(name,pts,[s,0,0])
    lathe('Tire',[(.710,.260),(.697,.279),(.698,.324),(.709,.342),(.731,.350),(.758,.352),(.870,.352),(.909,.349),(.933,.338),(.944,.319),(.948,.301),(.947,.279),(.942,.266)],96)
    for r,x in [(.282,.947),(.295,.948),(.315,.945),(.325,.941)]:
        lathe('Tire sidewall',[(x-.001,r-.0013),(x+.0013,r),(x-.001,r+.0013)])
    for x in [.751,.780,.820,.858,.888]:
        lathe('Tire sidewall',[(x-.002,.3516),(x,.3524),(x+.002,.3516)])
    lathe('Rim graphite',[(.933,.268),(.945,.276),(.953,.275),(.954,.265),(.948,.254),(.922,.247),(.752,.246),(.749,.252),(.760,.263)],80)
    lathe('Rim cut face',[(.953,.271),(.955,.274),(.954,.276)],80)
    lathe('Rotor',[(.868,.06),(.869,.223),(.863,.230),(.854,.229),(.852,.060)])
    disk('Rotor',.869,cz,hub,.224,72)
    for r in [.10,.16,.186,.198,.214,.22]:
        lathe('Rim graphite',[(.87,r-.0007),(.8702,r+.0007)])
    for i in range(21):
        for j in range(2):
            r=.183+.026*j;a=2*PI*i/21+j*.055
            disk('Grille',.8707,cz+r*math.sin(a),hub+r*math.cos(a),.0033,7)
    # Curved brake caliper on the aft side of each wheel.
    cal=[(hub-.191,cz-.100),(hub-.140,cz-.113),(hub-.131,cz-.073),(hub-.145,cz+.035),(hub-.137,cz+.096),(hub-.175,cz+.119),(hub-.213,cz+.091),(hub-.225,cz+.034),(hub-.217,cz-.057)]
    shell('Caliper',[[s*.898,y,z] for z,y in cal],[[s*.866,y,z]for z,y in cal],[s,0,0])
    for i in range(5):
        a=2*PI*i/5+.19
        for fork in [-1,1]:
            tip=a+fork*.21
            # Curved spoke broadens at the wheel centre and splits near midradius.
            coords=[(.045,a+fork*.18-.20),(.109,a+fork*.045-.088),(.166,a+fork*.088-.048),(.239,tip-.055),(.263,tip-.098),(.264,tip+.038),(.239,tip+.035),(.163,a+fork*.092+.047),(.110,a+fork*.045+.085),(.047,a+fork*.18+.20)]
            front=[point(.946+.007*(r/.263),r,t)for r,t in coords]
            back=[point(.925,r,t)for r,t in coords]
            shell('Rim graphite',front,back,[s,0,0])
            facet=[(.063,a+fork*.14-.079),(.115,a+fork*.049-.038),(.17,a+fork*.10-.025),(.258,tip-.061),(.259,tip-.018),(.170,a+fork*.10+.001),(.115,a+fork*.049+.003)]
            polygon('Rim cut face',[point(.947+.0075*(r/.263),r,t)for r,t in facet],[s,0,0])
        bolt=a+PI/5
        disk('Grille',.955,cz+.055*math.sin(bolt),hub+.055*math.cos(bolt),.0105,12)
        disk('Machined aluminum',.957,cz+.055*math.sin(bolt),hub+.055*math.cos(bolt),.0065,6)
    disk('Shadowline',.957,cz,hub,.0395,36)
    for k in range(4):
        q=[point(.959,0,0),*[point(.959,.029,a) for a in sample(k*PI/2,(k+1)*PI/2,10)]]
        polygon('Badge blue'if k%2==0 else'Badge white',q,[s,0,0])
for side in [-1,1]:
    for axle in [-1.47,1.47]: wheel(side,axle)
# Bonnet and boot roundels with quadrants, rendered from geometry at any distance.
def roundel(center,normal,r):
    c=np.array(center);n=np.asarray(normal,dtype=float);n/=np.linalg.norm(n);u=np.array([1,0,0]);v=np.cross(n,u)
    a=sample(0,2*PI,49)[:-1]
    circle=lambda rad,k,ofs:[c+n*ofs+rad*(u*np.cos(t)+v*np.sin(t))for t in k]
    polygon('Shadowline',circle(r,a,0),n);pipe('Machined aluminum',circle(r,a,0),.0018,6,True)
    for k in range(4):polygon('Badge blue'if k%2==0 else'Badge white',[c+n*.002,*circle(r*.76,sample(k*PI/2,(k+1)*PI/2,14),.002)],n)
roundel([0,top(2.388,0)+.003,2.388],[0,1,.18],.039);roundel(rr(0,.833,.016),[0,.15,-1],.035)
# Rear deck rib and discreet lip. 
p=[]
for t in sample(-1,1,49):
    z=-2.394+.035*t*t;x=.781*t; p.append([x,top(z,x/w(z))+.012,z])
pipe('Paint',p,.013,8)
# Serialize a single mesh grouped by material to minimize draw calls.
blob=bytearray(); views=[];acc=[]; primitives=[]
def buf(a,kind,typ,component):
    raw=a.tobytes();off=len(blob);blob.extend(raw);blob.extend(b'\0'*(-len(blob)%4));bi=len(views)
    views.append({'buffer':0,'byteOffset':off,'byteLength':len(raw),'target':kind})
    d={'bufferView':bi,'componentType':component,'count':len(a),'type':typ}
    if typ=='VEC3':d.update(min=a.min(0).tolist(),max=a.max(0).tolist())
    ai=len(acc);acc.append(d);return ai
allm=list(materials)
for name,batch in parts.items():
    vv=[];nn=[];ff=[];offset=0
    for v,n,f in batch:vv.append(v);nn.append(n);ff.append(f+offset);offset+=len(v)
    v=np.concatenate(vv);n=np.concatenate(nn);f=np.concatenate(ff).astype('uint32').flatten()
    p=buf(v,34962,'VEC3',5126);no=buf(n,34962,'VEC3',5126);ind=buf(f,34963,'SCALAR',5125)
    primitives.append({'attributes':{'POSITION':p,'NORMAL':no},'indices':ind,'material':allm.index(name),'mode':4})
g={'asset':{'version':'2.0','generator':'Original parametric F90 showroom study'},'extensionsUsed':['KHR_materials_clearcoat'],'scene':0,'scenes':[{'nodes':[0]}],'nodes':[{'mesh':0,'name':'BMW M5 F90 exterior study'}],'meshes':[{'primitives':primitives}],'materials':list(materials.values()),'buffers':[{'byteLength':len(blob)}],'bufferViews':views,'accessors':acc}
j=json.dumps(g,separators=(',',':')).encode();j+=b' '*(-len(j)%4)
with open(sys.argv[1],'wb') as out:
    out.write(struct.pack('<4sII',b'glTF',2,28+len(j)+len(blob)));out.write(struct.pack('<I4s',len(j),b'JSON')+j);out.write(struct.pack('<I4s',len(blob),b'BIN\0')+blob)
print(f'{sum(len(f) for b in parts.values() for _,_,f in b):,} triangles, {len(primitives)} material groups')
