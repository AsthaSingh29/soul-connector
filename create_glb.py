import struct
import json
import math
import os

def create_avatar_glb(output_path):
    vertices = []
    normals = []
    indices = []

    def add_box(cx, cy, cz, sx, sy, sz):
        hx, hy, hz = sx / 2.0, sy / 2.0, sz / 2.0
        # 6 faces: +Z, -Z, +X, -X, +Y, -Y
        faces = [
            # +Z
            ([(cx - hx, cy - hy, cz + hz), (cx + hx, cy - hy, cz + hz), (cx + hx, cy + hy, cz + hz), (cx - hx, cy + hy, cz + hz)], (0, 0, 1)),
            # -Z
            ([(cx + hx, cy - hy, cz - hz), (cx - hx, cy - hy, cz - hz), (cx - hx, cy + hy, cz - hz), (cx + hx, cy + hy, cz - hz)], (0, 0, -1)),
            # +X
            ([(cx + hx, cy - hy, cz + hz), (cx + hx, cy - hy, cz - hz), (cx + hx, cy + hy, cz - hz), (cx + hx, cy + hy, cz + hz)], (1, 0, 0)),
            # -X
            ([(cx - hx, cy - hy, cz - hz), (cx - hx, cy - hy, cz + hz), (cx - hx, cy + hy, cz + hz), (cx - hx, cy + hy, cz - hz)], (-1, 0, 0)),
            # +Y
            ([(cx - hx, cy + hy, cz + hz), (cx + hx, cy + hy, cz + hz), (cx + hx, cy + hy, cz - hz), (cx - hx, cy + hy, cz - hz)], (0, 1, 0)),
            # -Y
            ([(cx - hx, cy - hy, cz - hz), (cx + hx, cy - hy, cz - hz), (cx + hx, cy - hy, cz + hz), (cx - hx, cy - hy, cz + hz)], (0, -1, 0)),
        ]
        for quad, norm in faces:
            start_idx = len(vertices)
            for v in quad:
                vertices.append(v)
                normals.append(norm)
            indices.extend([start_idx, start_idx + 1, start_idx + 2, start_idx, start_idx + 2, start_idx + 3])

    def add_cylinder(cx, cy, cz, radius, height, segments=16):
        hh = height / 2.0
        start_idx = len(vertices)
        for i in range(segments):
            angle = (2 * math.pi * i) / segments
            x = math.cos(angle) * radius
            z = math.sin(angle) * radius
            nx, nz = math.cos(angle), math.sin(angle)
            
            # Bottom vertex
            vertices.append((cx + x, cy - hh, cz + z))
            normals.append((nx, 0, nz))
            # Top vertex
            vertices.append((cx + x, cy + hh, cz + z))
            normals.append((nx, 0, nz))

        for i in range(segments):
            next_i = (i + 1) % segments
            b1 = start_idx + i * 2
            t1 = start_idx + i * 2 + 1
            b2 = start_idx + next_i * 2
            t2 = start_idx + next_i * 2 + 1
            indices.extend([b1, b2, t2, b1, t2, t1])

    def add_sphere(cx, cy, cz, radius, rings=12, sectors=16):
        start_idx = len(vertices)
        for r in range(rings + 1):
            theta = math.pi * r / rings
            sin_t = math.sin(theta)
            cos_t = math.cos(theta)
            for s in range(sectors + 1):
                phi = 2 * math.pi * s / sectors
                sin_p = math.sin(phi)
                cos_p = math.cos(phi)

                x = cos_p * sin_t
                y = cos_t
                z = sin_p * sin_t
                vertices.append((cx + x * radius, cy + y * radius, cz + z * radius))
                normals.append((x, y, z))

        for r in range(rings):
            for s in range(sectors):
                first = start_idx + (r * (sectors + 1)) + s
                second = first + sectors + 1
                indices.extend([first, second, first + 1, second, second + 1, first + 1])

    # Build 3D Humanoid Tony:
    # 1. Base pedestal glow platform
    add_cylinder(0, 0.05, 0, radius=0.6, height=0.1, segments=20)
    add_cylinder(0, 0.15, 0, radius=0.45, height=0.1, segments=20)

    # 2. Lower body / pedestal column (stylized holographic transition)
    add_cylinder(0, 0.55, 0, radius=0.25, height=0.7, segments=16)

    # 3. Torso / Jacket (chest, shoulders)
    add_box(0, 1.15, 0, sx=0.65, sy=0.55, sz=0.32)
    # Left shoulder & arm
    add_box(-0.42, 1.1, 0, sx=0.22, sy=0.5, sz=0.25)
    # Right shoulder & arm
    add_box(0.42, 1.1, 0, sx=0.22, sy=0.5, sz=0.25)

    # 4. Collar & Neck
    add_cylinder(0, 1.5, 0, radius=0.12, height=0.18, segments=12)

    # 5. Head
    add_sphere(0, 1.75, 0, radius=0.22, rings=14, sectors=18)

    # 6. Stylized Hair (top & sides)
    add_sphere(0, 1.84, -0.04, radius=0.22, rings=12, sectors=16)
    add_box(0, 1.94, -0.02, sx=0.38, sy=0.12, sz=0.38)

    # 7. Glasses (Frames and bridge)
    add_box(-0.09, 1.76, 0.22, sx=0.11, sy=0.07, sz=0.04)
    add_box(0.09, 1.76, 0.22, sx=0.11, sy=0.07, sz=0.04)
    add_box(0, 1.76, 0.22, sx=0.07, sy=0.02, sz=0.03)

    # 8. Chest Core / Hologram Emblem
    add_box(0, 1.25, 0.17, sx=0.14, sy=0.14, sz=0.04)

    # Convert to binary
    v_bytes = bytearray()
    n_bytes = bytearray()
    min_pos = [float('inf')] * 3
    max_pos = [float('-inf')] * 3

    for v in vertices:
        for i in range(3):
            if v[i] < min_pos[i]: min_pos[i] = v[i]
            if v[i] > max_pos[i]: max_pos[i] = v[i]
        v_bytes.extend(struct.pack('<fff', *v))

    for n in normals:
        n_bytes.extend(struct.pack('<fff', *n))

    i_bytes = bytearray()
    for idx in indices:
        i_bytes.extend(struct.pack('<H', idx))

    # Align each buffer to 4 bytes
    def pad(b, byte_char=b'\x00'):
        rem = len(b) % 4
        if rem != 0:
            b.extend(byte_char * (4 - rem))
        return b

    pad(v_bytes)
    pad(n_bytes)
    pad(i_bytes)

    offset_v = 0
    len_v = len(v_bytes)
    offset_n = len_v
    len_n = len(n_bytes)
    offset_i = len_v + len_n
    len_i = len(i_bytes)

    total_bin = v_bytes + n_bytes + i_bytes

    gltf = {
        "asset": {
            "version": "2.0",
            "generator": "SoulConnector 3D Avatar Generator"
        },
        "scene": 0,
        "scenes": [{"nodes": [0]}],
        "nodes": [{"mesh": 0, "name": "TonyAvatar3D"}],
        "materials": [
            {
                "name": "HologramCyan",
                "pbrMetallicRoughness": {
                    "baseColorFactor": [0.0, 0.95, 1.0, 0.9],
                    "metallicFactor": 0.2,
                    "roughnessFactor": 0.3
                },
                "emissiveFactor": [0.0, 0.7, 0.9],
                "alphaMode": "BLEND",
                "doubleSided": True
            }
        ],
        "meshes": [
            {
                "name": "TonyMesh",
                "primitives": [
                    {
                        "attributes": {
                            "POSITION": 0,
                            "NORMAL": 1
                        },
                        "indices": 2,
                        "material": 0,
                        "mode": 4
                    }
                ]
            }
        ],
        "accessors": [
            {
                "bufferView": 0,
                "byteOffset": 0,
                "componentType": 5126, # FLOAT
                "count": len(vertices),
                "type": "VEC3",
                "min": min_pos,
                "max": max_pos
            },
            {
                "bufferView": 1,
                "byteOffset": 0,
                "componentType": 5126, # FLOAT
                "count": len(normals),
                "type": "VEC3"
            },
            {
                "bufferView": 2,
                "byteOffset": 0,
                "componentType": 5123, # UNSIGNED_SHORT
                "count": len(indices),
                "type": "SCALAR"
            }
        ],
        "bufferViews": [
            {
                "buffer": 0,
                "byteOffset": offset_v,
                "byteLength": len_v,
                "target": 34962 # ARRAY_BUFFER
            },
            {
                "buffer": 0,
                "byteOffset": offset_n,
                "byteLength": len_n,
                "target": 34962 # ARRAY_BUFFER
            },
            {
                "buffer": 0,
                "byteOffset": offset_i,
                "byteLength": len_i,
                "target": 34963 # ELEMENT_ARRAY_BUFFER
            }
        ],
        "buffers": [
            {
                "byteLength": len(total_bin)
            }
        ]
    }

    json_bytes = bytearray(json.dumps(gltf, separators=(',', ':')).encode('utf-8'))
    pad(json_bytes, b' ')

    total_len = 12 + 8 + len(json_bytes) + 8 + len(total_bin)

    with open(output_path, 'wb') as f:
        # GLB Header
        f.write(struct.pack('<4sII', b'glTF', 2, total_len))
        # JSON Chunk
        f.write(struct.pack('<II', len(json_bytes), 0x4E4F534A))
        f.write(json_bytes)
        # BIN Chunk
        f.write(struct.pack('<II', len(total_bin), 0x004E4942))
        f.write(total_bin)

    print(f"Successfully generated 3D Avatar GLB at: {output_path} ({total_len} bytes, {len(vertices)} vertices, {len(indices)//3} triangles)")

if __name__ == '__main__':
    create_avatar_glb('assets/models/avatar.glb')
