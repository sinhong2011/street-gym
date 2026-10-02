# Export a web-ready muscle + skeleton GLB from the Z-Anatomy Blender template.
# 1. Download Z-Anatomy.zip from https://github.com/Z-Anatomy/Models-of-human-anatomy and unzip it.
# 2. ZOUT=<output dir> blender -b Z-Anatomy/Startup.blend --python scripts/export-anatomy.py
# 3. Copy <output dir>/anatomy.glb to public/models/.
# Output is a derivative of Z-Anatomy (CC BY-SA 4.0) and BodyParts3D (CC BY-SA 2.1 JP).
import bpy, re, json, os
S = os.environ["ZOUT"]
SIDE = re.compile(r'\.(l|r)$')
LABEL = re.compile(r'\.[a-z0-9]+$')
SKIP = re.compile(r'bursa|sheath|\.j$', re.I)

def wanted(o, colname):
    if o.type != 'MESH' or not o.users_collection: return False
    if o.users_collection[0].name != colname: return False
    if SKIP.search(o.name): return False
    return bool(SIDE.search(o.name)) or not LABEL.search(o.name)

dg = bpy.context.evaluated_depsgraph_get()
out = bpy.data.collections.new("EXPORT")
bpy.context.scene.collection.children.link(out)
made = []
for colname, prefix, ratio, floor in [("4: Muscular system", "M|", 0.10, 220), ("1: Skeletal system", "B|", 0.05, 120)]:
    for o in list(bpy.data.objects):
        if not wanted(o, colname): continue
        ev = o.evaluated_get(dg)
        try:
            me = bpy.data.meshes.new_from_object(ev, depsgraph=dg)
        except Exception:
            continue
        n = len(me.polygons)
        if n == 0: continue
        ob = bpy.data.objects.new(prefix + o.name, me)
        ob.matrix_world = o.matrix_world.copy()
        out.objects.link(ob)
        r = min(1.0, max(ratio, floor / n))
        if r < 1.0:
            m = ob.modifiers.new("dec", 'DECIMATE'); m.ratio = r
        made.append((ob.name, n, round(r, 3)))

for o in bpy.context.view_layer.objects: o.select_set(False)
for name, _, _ in made: bpy.data.objects[name].select_set(True)
bpy.ops.export_scene.gltf(
    filepath=os.path.join(S, "anatomy.glb"), export_format='GLB', use_selection=True,
    export_apply=True, export_materials='NONE', export_yup=True,
    export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=7,
    export_draco_position_quantization=12, export_draco_normal_quantization=8,
    export_texcoords=False, export_attributes=False,
)
json.dump(made, open(os.path.join(S, "made.json"), "w"))
print("EXPORTED", len(made))
