import bpy, os
B=os.path.dirname(os.path.abspath(__file__))+'/'
m=bpy.data.materials['iphone-16-pro-001.001']; nt=m.node_tree; N=nt.nodes; L=nt.links
bsdf=N['Principled BSDF']
def img(path, non_color=False):
    i=bpy.data.images.load(path, check_existing=True)
    if non_color: i.colorspace_settings.name='Non-Color'
    return i
N['Albedo'].image=img(B+'basecolor.png')
N['Metalness'].image=img(B+'metalness.png',True)
N['Roughness'].image=img(B+'roughness.png',True)
N['Normal Map'].image=img(B+'normal.png',True)
# base color straight from pre-multiplied albedo
for l in list(L):
    if l.to_node==bsdf and l.to_socket.name in ('Base Color','Transmission Weight'): L.remove(l)
L.new(N['Albedo'].outputs['Color'], bsdf.inputs['Base Color'])
bsdf.inputs['Transmission Weight'].default_value=0.0
for name in ('Mix Color','Ambient Oclussion','Transmisive','Height','Displacement'):
    if name in N: N.remove(N[name])
m.surface_render_method='DITHERED' if hasattr(m,'surface_render_method') else None
# screen: own material + planar UVs 0..1
d=bpy.data.objects['display']; me=d.data
xs=[v.co.x for v in me.vertices]; zs=[v.co.z for v in me.vertices]
x0,x1,z0,z1=min(xs),max(xs),min(zs),max(zs)
uv=me.uv_layers.active
for poly in me.polygons:
    for li in poly.loop_indices:
        co=me.vertices[me.loops[li].vertex_index].co
        uv.data[li].uv=((x1-co.x)/(x1-x0),(co.z-z0)/(z1-z0))
sm=bpy.data.materials.new('Screen'); sm.use_nodes=True
sn=sm.node_tree.nodes; sb=sn['Principled BSDF']
ti=sn.new('ShaderNodeTexImage'); ti.image=img(B+'screen.png'); ti.name='ScreenTex'
sm.node_tree.links.new(ti.outputs['Color'], sb.inputs['Emission Color'])
sb.inputs['Emission Strength'].default_value=1.0
sb.inputs['Base Color'].default_value=(0,0,0,1); sb.inputs['Roughness'].default_value=0.15
me.materials.clear(); me.materials.append(sm)
# export only the phone hierarchy
bpy.ops.object.select_all(action='DESELECT')
root=bpy.data.objects['iphone-16-pro']; root.select_set(True)
for o in root.children_recursive: o.select_set(True)
bpy.ops.export_scene.gltf(filepath=B+'iphone.glb', export_format='GLB', use_selection=True,
    export_image_format='WEBP', export_image_quality=85, export_apply=False, export_vertex_color='NONE',
    export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=6,
    export_yup=True, export_cameras=False, export_lights=False)
print("EXPORTED", os.path.getsize(B+'iphone.glb'), "screenUV bbox", x0,x1,z0,z1)
