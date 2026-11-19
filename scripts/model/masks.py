import bpy,math
from mathutils import Vector
from pathlib import Path
bpy.ops.wm.read_factory_settings(use_empty=True)
base=Path(__file__).resolve().parent / 'build'
bpy.ops.import_scene.gltf(filepath=str(base/'vehicle.glb'))
scene=bpy.context.scene
scene.world=bpy.data.worlds.new('Matte');scene.world.color=(0,0,0);scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(0,0,0,1)
for mat in bpy.data.materials:
 mat.use_nodes=True;nt=mat.node_tree;nt.nodes.clear()
 em=nt.nodes.new('ShaderNodeEmission')
 em.inputs[0].default_value=(*{'Paint':(1,0,0),'DRL':(0,1,0),'Indicator':(0,0,1),'Brake':(1,0,1)}.get(mat.name,(0,0,0)),1)
 out=nt.nodes.new('ShaderNodeOutputMaterial');nt.links.new(em.outputs[0],out.inputs['Surface'])
scene.render.engine='CYCLES';scene.cycles.samples=4;scene.cycles.max_bounces=0;scene.cycles.use_denoising=False
scene.view_settings.view_transform='Raw';scene.view_settings.look='None';scene.render.film_transparent=False
bpy.ops.object.camera_add(location=(0,-8,1.9));cam=bpy.context.object;scene.camera=cam;cam.data.clip_end=1000
scene.render.resolution_x=448;scene.render.resolution_y=252;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.render.use_persistent_data=True
dst=base/'masks';dst.mkdir(exist_ok=True)
def render(label,pos,target,lens):
 cam.location=pos;cam.rotation_euler=(Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=lens;scene.render.filepath=str(dst/(label+'.png'));bpy.ops.render.render(write_still=True)
a=math.radians(37)
for i in range(24):
 ang=a+2*math.pi*i/24;render(f'{i:02}',(8.25*math.sin(ang),-8.25*math.cos(ang),1.97),(0,0,.69),52)
render('wheel',(2.76,-2.78,.93),(.86,-1.46,.47),46);render('high',(3.5,-5.15,7.20),(0,0,.55),53)
