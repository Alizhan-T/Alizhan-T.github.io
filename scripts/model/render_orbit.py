import bpy,math,os
from mathutils import Vector
from pathlib import Path
bpy.ops.wm.read_factory_settings(use_empty=True)
base=Path(__file__).resolve().parent / 'build'
bpy.ops.import_scene.gltf(filepath=str(base/'vehicle.glb'))
scene=bpy.context.scene; scene.world=bpy.data.worlds.new('Showroom');scene.world.use_nodes=True
bg=scene.world.node_tree.nodes['Background'];bg.inputs[0].default_value=(.025,.030,.045,1);bg.inputs[1].default_value=.40
paint=bpy.data.materials.get('Paint').node_tree.nodes.get('Principled BSDF')
paint.inputs['Base Color'].default_value=(.055,.058,.066,1);paint.inputs['Metallic'].default_value=.78;paint.inputs['Roughness'].default_value=.20;paint.inputs['Coat Weight'].default_value=1.0;paint.inputs['Coat Roughness'].default_value=.115
for name,col,power in [('DRL',(.77,.88,1,1),7),('Tail',(1,.008,.016,1),3),('Brake',(.75,.008,.01,1),.2)]:
    bs=bpy.data.materials[name].node_tree.nodes.get('Principled BSDF');bs.inputs['Emission Color'].default_value=col;bs.inputs['Emission Strength'].default_value=power
scene.render.engine='CYCLES';scene.cycles.samples=40;scene.cycles.adaptive_threshold=.035;scene.cycles.max_bounces=4;scene.cycles.diffuse_bounces=1;scene.cycles.glossy_bounces=3;scene.cycles.transmission_bounces=1;scene.cycles.use_denoising=False
scene.view_settings.view_transform='AgX';scene.render.film_transparent=False
def look(o,t):o.rotation_euler=(Vector(t)-o.location).to_track_quat('-Z','Y').to_euler()
def light(pos,target,size,sz,energy,color=(1,1,1)):
 d=bpy.data.lights.new('LED','AREA');o=bpy.data.objects.new('LED',d);scene.collection.objects.link(o);o.location=pos;d.shape='RECTANGLE';d.size=size;d.size_y=sz;d.energy=energy;d.color=color;look(o,target)
# Longitudinal light banks form strips on the clean metal and the roof.
light((2.1,-.5,4.8),(0,-.4,.65),.34,6.7,440,(.86,.92,1))
light((-2.3,-.8,4.6),(0,-.5,.75),.46,6.2,510,(.91,.95,1))
light((1.95,3.3,3.4),(0,.2,.60),4,.34,400)
light((-.55,-4.2,2.75),(0,-1.0,.45),4.9,.50,320)
light((4.2,.2,1.7),(0,0,.63),1.25,4.3,130,(.69,.78,1))
light((-3.6,.8,1.9),(0,0,.65),2.2,4.3,150,(.63,.71,.95))
light((0,.4,6.0),(0,0,0),3.7,3.7,130)
# Smooth dark floor with a broad reflection only.
bpy.ops.mesh.primitive_plane_add(size=1500,location=(0,0,-.001));floor=bpy.data.materials.new('Studio floor');floor.use_nodes=True
bs=floor.node_tree.nodes['Principled BSDF'];bs.inputs['Base Color'].default_value=(.010,.012,.016,1);bs.inputs['Roughness'].default_value=.30;bs.inputs['Metallic'].default_value=.43;bpy.context.object.data.materials.append(floor)
bpy.ops.object.camera_add(location=(0,-8,1.9));cam=bpy.context.object;scene.camera=cam;cam.data.clip_end=1000
scene.render.resolution_x=896;scene.render.resolution_y=504;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG'
scene.render.use_persistent_data=True
dst=base/'frames';dst.mkdir(exist_ok=True)
def render(label,pos,target,lens):
 cam.location=pos;look(cam,target);cam.data.lens=lens
 scene.render.filepath=str(dst/(label+'.png'));bpy.ops.render.render(write_still=True)
a=math.radians(37)
for i in range(24):
 ang=a+2*math.pi*i/24;render(f'{i:02}',(8.25*math.sin(ang),-8.25*math.cos(ang),1.97),(0,0,.69),52)
render('wheel',(2.76,-2.78,.93),(.86,-1.46,.47),46)
render('high',(3.5,-5.15,7.20),(0,0,.55),53)
