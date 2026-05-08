// ProductConfigurator3D.tsx — v7 (THREE.DecalGeometry — imperativo)
// ─────────────────────────────────────────────────────────
//  ✦ Decals via THREE.DecalGeometry imperativo (sin drei <Decal>)
//  ✦ Modelo GLB completamente intacto — ningún mesh se detacha
//  ✦ DecalRenderer gestiona add/remove de meshes en un <group>
//  ✦ Texto: CanvasTexture 512×512 generada con makeTextTexture
//  ✦ Imágenes: THREE.TextureLoader async dentro de DecalRenderer
//  ✦ Material de tela = color sólido puro (sin mapa UV global)
// ─────────────────────────────────────────────────────────

import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls, Environment, ContactShadows, useGLTF, Center
} from "@react-three/drei";
import {
  Suspense, useRef, useState, useEffect, useMemo, useCallback,
} from "react";
import * as THREE from "three";
import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry.js";

import { motion, AnimatePresence } from "framer-motion";
import {
  Palette, Layers, Type, Ruler,
  Image as ImageIcon, X, ShoppingBag, Check,
  RotateCw, ZoomIn, Move, Trash2, Tag,
} from "lucide-react";

// ─── Config ──────────────────────────────────────────────
const MODEL_PATH = "/models/hoodie/HUDIJS PA DETALJAM.glb";
useGLTF.preload(MODEL_PATH);

/** Nombre exacto del mesh body en el GLB */
const BODY_MESH_NAME = "Pattern_137163";

const COLORS = [
  { name: "Obsidiana",  hex: "#1a1a1a" },
  { name: "Crema",      hex: "#f0e8dc" },
  { name: "Piedra",     hex: "#9e9e9e" },
  { name: "Marino",     hex: "#1e3a5f" },
  { name: "Burdeos",    hex: "#6b2d3e" },
  { name: "Oliva",      hex: "#4a5c30" },
  { name: "Terracota",  hex: "#c4613b" },
  { name: "Mostaza",    hex: "#c8960a" },
];

const TEXTURES = [
  { name: "Liso",      roughness: 0.35, metalness: 0.00, icon: "●" },
  { name: "Algodón",   roughness: 0.82, metalness: 0.00, icon: "◌" },
  { name: "Seda",      roughness: 0.28, metalness: 0.12, icon: "◎" },
  { name: "Mezclilla", roughness: 0.72, metalness: 0.00, icon: "▦" },
  { name: "Cuero",     roughness: 0.52, metalness: 0.22, icon: "◈" },
  { name: "Franela",   roughness: 0.88, metalness: 0.00, icon: "◉" },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const ACCESSORY_COLORS = [
  { name: "Dorado",   hex: "#FFD700" },
  { name: "Plateado", hex: "#C0C0C0" },
  { name: "Negro",    hex: "#111111" },
  { name: "Cobre",    hex: "#B87333" },
];

const FONTS = [
  { name: "DM Sans",           fam: "DM Sans",          weight: "800" },
  { name: "Playfair Display",  fam: "Playfair Display",  weight: "700" },
  { name: "Bebas Neue",        fam: "Bebas Neue",        weight: "400" },
  { name: "Courier Prime",     fam: "Courier Prime",     weight: "700" },
  { name: "Montserrat",        fam: "Montserrat",        weight: "900" },
  { name: "Lobster",           fam: "Lobster",           weight: "400" },
];

// ─── Types ────────────────────────────────────────────────
export interface StampItem {
  id: string;
  type: "text" | "image";
  x: number;
  y: number;
  scale: number;
  side: "front" | "back";
  text?: string;
  fontFam?: string;
  fontWeight?: string;
  color?: string;
  imageUrl?: string;
  imageEl?: HTMLImageElement;
}

// ─── Utilidad: generar CanvasTexture para texto ───────────
/**
 * Genera una THREE.CanvasTexture 512×512 con el texto renderizado
 * y fondo transparente.  Se llama sólo cuando cambian los props
 * relevantes (memoizado en el componente padre).
 */
function makeTextTexture(
  text: string,
  fontFam: string,
  fontWeight: string,
  color: string,
): THREE.CanvasTexture {
  const S = 512;
  const cv = document.createElement("canvas");
  cv.width = S; cv.height = S;
  const ctx = cv.getContext("2d")!;
  ctx.clearRect(0, 0, S, S);

  const sz = Math.round(S * 0.18);
  ctx.font          = `${fontWeight} ${sz}px '${fontFam}', sans-serif`;
  ctx.fillStyle     = color;
  ctx.strokeStyle   = "rgba(0,0,0,0.35)";
  ctx.lineWidth     = sz * 0.05;
  ctx.textAlign     = "center";
  ctx.textBaseline  = "middle";
  ctx.shadowColor   = "rgba(0,0,0,0.6)";
  ctx.shadowBlur    = sz * 0.12;

  ctx.strokeText(text.toUpperCase(), S / 2, S / 2);
  ctx.fillText(text.toUpperCase(), S / 2, S / 2);

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace   = THREE.SRGBColorSpace;
  tex.needsUpdate  = true;
  return tex;
}

// (makeTextTexture is used directly inside DecalRenderer)

// ─────────────────────────────────────────────────────────────────────────────
//  DECAL SYSTEM — Solución Definitiva
//
//  PRINCIPIO CLAVE: Los vértices de DecalGeometry están en ESPACIO MUNDO.
//  Solución: geo.applyMatrix4(bodyMesh.matrixWorld.invert()) los convierte a
//  ESPACIO LOCAL del bodyMesh. Luego bodyMesh.add(decalMesh) hace que el decal
//  herede TODAS las transformaciones (escala 0.001, rotación 90°, group 2.2,
//  auto-rotate) → el logo se PEGA a la prenda sin nunca más desalinearse.
//
//  MAPA DE EJES DE LA GEOMETRÍA (pattern_137163.glb):
//    local X → ancho del hoodie     (eje X mundo sin cambio)
//    local Y → profundidad frente↔atrás  (→ +Z mundo: cara frontal = localBox.MAX.y)
//    local Z → altura del hoodie    (→ -Y mundo: localBox.MIN.z = capucha, MAX.z = dobladillo)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mapea coordenadas canvas (0..1) → posición LOCAL del bodyMesh geometry.
 * Usa geometry.boundingBox dinámico — sin valores hardcodeados.
 *
 * canvas (0,0) = esquina superior-izquierda
 * canvas (1,1) = esquina inferior-derecha
 */
/**
 * Obtiene parámetros exactos de proyección para DecalGeometry,
 * respetando el BoundingBox y diferenciando Frente/Espalda.
 */
function getDecalParameters(
  bodyMesh: THREE.Mesh,
  item: StampItem
) {
  bodyMesh.geometry.computeBoundingBox();
  const lb = bodyMesh.geometry.boundingBox!;

  // MAPEO EXACTO:
  // X = Ancho (Left/Right)
  // Y = Profundidad (Front/Back) -> +Y es el Frente, -Y es la Espalda.
  // Z = Altura (Arriba/Abajo) pero invertida por matrix. -> -Z es Arriba, +Z es Abajo.

  const localCenterX = (lb.max.x + lb.min.x) / 2;
  const localCenterZ = (lb.max.z + lb.min.z) / 2;
  
  const localWidth  = lb.max.x - lb.min.x;
  const localHeight = lb.max.z - lb.min.z;
  const localDepth  = lb.max.y - lb.min.y;

  // Offset holgado para colocar el proyector fuera de la geometría
  const depthOffset = localDepth * 0.2; 
  
  // Frente: posicionado en el extremo frontal (+Y) más el offset. Espalda: extremo trasero (-Y) menos offset.
  const localY = item.side === "front" 
    ? lb.max.y + depthOffset
    : lb.min.y - depthOffset;

  // canvas X → local X. La espalda la invertimos natural.
  const flipX = item.side === "back" ? -1 : 1;
  const localX = localCenterX + (item.x - 0.5) * localWidth * 0.65 * flipX;

  // canvas Y → local Z. 
  // Canvas Y=0 (arriba) mapea a la cima de la cabeza (-Z). Canvas Y=1 mapea a la base (+Z).
  // Así que (item.y - 0.5) cuando es 0 será negativo -> mueve hacia -Z (Arriba).
  const localZ = localCenterZ + (item.y - 0.5) * localHeight * 0.65;

  const localPos = new THREE.Vector3(localX, localY, localZ);
  const worldPos = localPos.clone();
  bodyMesh.localToWorld(worldPos);

  // Orientación del Rayo Proyector:
  // Frente (+Y) dispara hacia adentro (-Y). Espalda (-Y) dispara hacia adentro (+Y).
  const yAimDir = item.side === "front" ? -1 : 1;
  const localTarget = new THREE.Vector3(localPos.x, localPos.y + yAimDir, localPos.z);
  const worldTarget = localTarget.clone();
  bodyMesh.localToWorld(worldTarget);

  const projector = new THREE.Object3D();
  projector.position.copy(worldPos);

  // Al apuntar desde el proyector, le decimos dónde queda el "Arriba" del lente.
  // En este malla, Arriba es -Z. 
  const localUp = new THREE.Vector3(0, 0, -1);
  const worldUp = localUp.clone().transformDirection(bodyMesh.matrixWorld).normalize();

  projector.up.copy(worldUp);
  projector.lookAt(worldTarget);

  return { localPos, worldPos, projEuler: projector.rotation.clone() };
}

// ─── Decal geometry renderer ──────────────────────────────────────────────────
function DecalRenderer({
  bodyMesh,
  stampItems,
}: {
  bodyMesh: THREE.Mesh;
  stampItems: StampItem[];
}) {
  const decalMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());

  // ── Efecto principal: texto ────────────────────────────────────────
  useEffect(() => {
    if (!bodyMesh) return;
    const existing = decalMeshesRef.current;
    const nextIds  = new Set(stampItems.map((i) => i.id));

    // Eliminar decals que ya no están en stampItems
    existing.forEach((dm, id) => {
      if (!nextIds.has(id)) {
        bodyMesh.remove(dm);
        dm.geometry.dispose();
        (dm.material as THREE.Material).dispose();
        existing.delete(id);
      }
    });

    // Crear/actualizar decals de texto
    stampItems.forEach((item) => {
      if (item.type !== "text") return;
      const tex = makeTextTexture(
        item.text ?? "",
        item.fontFam     ?? "DM Sans",
        item.fontWeight  ?? "800",
        item.color       ?? "#ffffff",
      );
      if (!tex) return;
      upsertDecal(bodyMesh, existing, item, tex);
    });
  }, [bodyMesh, stampItems]);

  // ── Efecto asíncrono: imágenes ────────────────────────────────────
  useEffect(() => {
    if (!bodyMesh) return;
    const existing = decalMeshesRef.current;

    stampItems
      .filter((i) => i.type === "image" && i.imageUrl)
      .forEach((item) => {
        if (existing.has(item.id)) return; // ya colocado
        new THREE.TextureLoader().load(item.imageUrl!, (tex) => {
          if (!bodyMesh) return;
          tex.colorSpace  = THREE.SRGBColorSpace;
          tex.needsUpdate = true;
          upsertDecal(bodyMesh, existing, item, tex);
        });
      });
  }, [bodyMesh, stampItems]);

  // ── Limpieza al desmontar ─────────────────────────────────────────
  useEffect(() => {
    return () => {
      decalMeshesRef.current.forEach((dm) => {
        bodyMesh?.remove(dm);
        dm.geometry.dispose();
        (dm.material as THREE.Material).dispose();
      });
      decalMeshesRef.current.clear();
    };
  }, [bodyMesh]);

  // Sin JSX propio — el decal es hijo directo de bodyMesh en la escena
  return null;
}

/**
 * Crea o reemplaza un decal sobre el bodyMesh.
 *
 * FLUJO:
 *  1. stampToLocalPos  → posición en espacio LOCAL del geometry
 *  2. localPos → worldPos con applyMatrix4(matrixWorld)
 *  3. DecalGeometry(bodyMesh, worldPos, euler, size) → vértices en MUNDO
 *  4. geo.applyMatrix4(matrixWorld.invert())         → vértices en LOCAL
 *  5. bodyMesh.add(decalMesh)                        → el decal hereda todo
 */
function upsertDecal(
  bodyMesh: THREE.Mesh,
  map: Map<string, THREE.Mesh>,
  item: StampItem,
  texture: THREE.Texture,
) {
  // Eliminar versión anterior
  const old = map.get(item.id);
  if (old) {
    bodyMesh.remove(old);
    old.geometry.dispose();
    (old.material as THREE.Material).dispose();
  }

  bodyMesh.updateMatrixWorld(true);

  // 1 & 2. Parámetros exactos calculados usando getDecalParameters
  const { localPos, worldPos, projEuler } = getDecalParameters(bodyMesh, item);

  // 4. Tamaño del decal en MUNDO
  bodyMesh.geometry.computeBoundingBox();
  const lb = bodyMesh.geometry.boundingBox!;
  const mat = bodyMesh.matrixWorld;
  const worldScaleX = new THREE.Vector3(mat.elements[0], mat.elements[1], mat.elements[2]).length();
  
  const localWidth  = lb.max.x - lb.min.x;
  
  const sizeX = localWidth * worldScaleX * 0.22 * item.scale;
  let sizeY = sizeX;
  
  // SOLUCIÓN: Imágenes proporcionales (Escalado sin distorsión visual real)
  if (item.type === "image" && item.imageEl) {
    sizeY = sizeX * (item.imageEl.naturalHeight / item.imageEl.naturalWidth);
  }
  
  // AUMENTO DEL VOLUMEN DE PROYECCIÓN (1.0 sugerido para asegurar que cruza pliegues del frente)
  // Utilizamos max 1.0 para que incluso logos pequeños envuelvan arrugas frontales y traseras.
  const projDepth = 1.0; 

  const decalSize = new THREE.Vector3(sizeX, sizeY, projDepth);

  if (import.meta.env?.DEV) {
    console.log(
      "[Decal] localPos:", localPos.toArray().map((v) => v.toFixed(1)).join(","),
      "| worldPos:", worldPos.toArray().map((v) => v.toFixed(3)).join(","),
      "| euler:", [projEuler.x, projEuler.y, projEuler.z].map((v) => v.toFixed(3)).join(","),
      "| size:", sizeX.toFixed(4), "depth:", projDepth.toFixed(4),
    );
  }

  // 5. Crear DecalGeometry (vértices en MUNDO)
  let geo: THREE.BufferGeometry;
  try {
    geo = new DecalGeometry(bodyMesh, worldPos, projEuler, decalSize);
    if ((geo.attributes.position?.count ?? 0) === 0 && import.meta.env?.DEV) {
      console.warn("[Decal] ⚠️ DecalGeometry vacío — posición fuera del mesh. worldPos:", worldPos);
    }
  } catch (e) {
    console.error("[Decal] DecalGeometry falló:", e);
    geo = new THREE.PlaneGeometry(sizeX, sizeY);
  }

  // 6. KEY: convertir vértices de MUNDO → LOCAL del bodyMesh
  //    Así cuando bodyMesh rota/escala, el decal se mueve con él
  geo.applyMatrix4(bodyMesh.matrixWorld.clone().invert());

  // El proyector configurado con 'lookAt' corrige naturalmente el efecto espejo en X en la espalda, ya no necesitamos hack en textura.
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.repeat.set(1, 1);
  texture.offset.set(0, 0);
  texture.needsUpdate = true;

  // 7. Material anti z-fighting
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.1,           // elimina bordes sucios de PNGs
    depthTest: true,
    depthWrite: false,        // evita que el quad tape lo que hay detrás
    polygonOffset: true,
    polygonOffsetFactor: -4,  // fuerza el logo delante de la tela
    polygonOffsetUnits: -2,
    toneMapped: false,
    side: THREE.FrontSide,
  });

  // 8. Añadir como HIJO del bodyMesh → hereda toda transformación
  const mesh = new THREE.Mesh(geo, material);
  bodyMesh.add(mesh);
  map.set(item.id, mesh);
}


// ─── GLB Model ────────────────────────────────────────────


/**
 * MAPA DE EJES (confirmado por worldMatrix y logs):
 *   Geometry local X → world X          (ANCHO)
 *   Geometry local Y → world +Z         (PROFUNDIDAD frente↔atrás)
 *   Geometry local Z → world -Y         (ALTURA, invertida)
 *
 *   Cara FRONTAL = localBox.max.y  (máximo Y de geometría = frente hacia cámara)
 *   Ancho canvas  → eje local X
 *   Alto canvas   → eje local Z (canvasY=0 top → localBox.min.z, canvasY=1 bottom → localBox.max.z)
 */



// ─── GLB Model ────────────────────────────────────────────

function HoodieModel({
  color,
  materialProps,
  accessoryHex,
  stampItems,
}: {
  color: string;
  materialProps: { roughness: number; metalness: number };
  accessoryHex: string;
  stampItems: StampItem[];
}) {
  const { scene } = useGLTF(MODEL_PATH);
  const cloned    = useMemo(() => scene.clone(true), [scene]);
  const groupRef  = useRef<THREE.Group>(null);

  useFrame((_, dt) => {
    if (groupRef.current) groupRef.current.rotation.y += dt * 0.15;
  });

  const ACCESSORY_MAT_NAMES = ["Material.009", "Material.003", "Material.002"];

  // Clone materials once + find body mesh — model stays INTACT
  const bodyMesh = useMemo<THREE.Mesh | null>(() => {
    cloned.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return;
      if (Array.isArray(node.material)) {
        node.material = (node.material as THREE.Material[]).map((m) => m.clone());
      } else if (node.material) {
        node.material = (node.material as THREE.Material).clone();
      }
    });

    // 1) exact name
    let found: THREE.Mesh | null = null;
    cloned.traverse((node) => {
      if (node instanceof THREE.Mesh && node.name === BODY_MESH_NAME) found = node as THREE.Mesh;
    });

    // 2) largest fabric mesh fallback
    if (!found) {
      let maxArea = 0;
      cloned.traverse((node) => {
        if (!(node instanceof THREE.Mesh)) return;
        const mats = Array.isArray(node.material) ? node.material : [node.material];
        const isAcc = mats.some((m) => ACCESSORY_MAT_NAMES.some((a) => (m.name ?? "").includes(a)));
        if (isAcc) return;
        const box = new THREE.Box3().setFromObject(node);
        const s   = new THREE.Vector3(); box.getSize(s);
        const area = s.x * s.y;
        if (area > maxArea) { maxArea = area; found = node as THREE.Mesh; }
      });
      console.warn("[v7] Fallback bodyMesh:", (found as THREE.Mesh | null)?.name);
    }

    // ── DIAGNOSTIC LOGS ─────────────────────────────────────────────
    if (found) {
      found.updateMatrixWorld(true);

      const localBox    = new THREE.Box3().setFromObject(found);
      const localCenter = new THREE.Vector3();
      const localSize   = new THREE.Vector3();
      localBox.getCenter(localCenter);
      localBox.getSize(localSize);

      console.log("=== DIAG bodyMesh name ===", found.name);
      console.log("=== DIAG local bbox center ===",
        `x:${localCenter.x.toFixed(4)} y:${localCenter.y.toFixed(4)} z:${localCenter.z.toFixed(4)}`);
      console.log("=== DIAG local bbox size ===",
        `x:${localSize.x.toFixed(4)} y:${localSize.y.toFixed(4)} z:${localSize.z.toFixed(4)}`);
      console.log("=== DIAG local position ===",
        `x:${found.position.x.toFixed(4)} y:${found.position.y.toFixed(4)} z:${found.position.z.toFixed(4)}`);
      console.log("=== DIAG local rotation (deg) ===",
        `x:${THREE.MathUtils.radToDeg(found.rotation.x).toFixed(2)} y:${THREE.MathUtils.radToDeg(found.rotation.y).toFixed(2)} z:${THREE.MathUtils.radToDeg(found.rotation.z).toFixed(2)}`);
      console.log("=== DIAG worldMatrix ===",
        found.matrixWorld.toArray().map((v: number) => v.toFixed(4)).join(", "));

      const allMeshNames: string[] = [];
      cloned.traverse((n) => { if (n instanceof THREE.Mesh) allMeshNames.push(n.name); });
      console.log("=== DIAG all mesh names ===", allMeshNames.join(" | "));
    } else {
      console.error("=== DIAG ERROR: bodyMesh NOT FOUND ===");
    }
    // ── END DIAGNOSTIC ───────────────────────────────────────────────

    return found;
  }, [cloned]);

  // Imperatively update material color/roughness
  useEffect(() => {
    cloned.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return;
      const mats = Array.isArray(node.material)
        ? (node.material as THREE.Material[])
        : [node.material as THREE.Material];
      mats.forEach((m) => {
        if (!(m instanceof THREE.MeshStandardMaterial || m instanceof THREE.MeshPhysicalMaterial)) return;
        const n = m.name ?? "";
        if (n.includes("Material.009") || n.includes("Material.003")) {
          m.color.set(accessoryHex); m.roughness = 0.18; m.metalness = 0.92;
        } else if (n.includes("Material.002")) {
          m.color.set("#2a2a2a"); m.roughness = 0.72; m.metalness = 0;
        } else {
          m.color.set(color); m.map = null;
          m.roughness = materialProps.roughness; m.metalness = materialProps.metalness;
        }
        m.needsUpdate = true;
      });
    });
  }, [cloned, color, materialProps, accessoryHex]);

  return (
    <group ref={groupRef}>
      <Center top={false}>
        <primitive object={cloned} scale={[2.2, 2.2, 2.2]} />
      </Center>

      {/* Decals via THREE.DecalGeometry — does NOT need to be a child of the mesh */}
      {bodyMesh && (
        <DecalRenderer bodyMesh={bodyMesh} stampItems={stampItems} />
      )}
    </group>
  );
}

// ─── Loader ───────────────────────────────────────────────
function CanvasLoader() {
  return (
    <div style={{
      position: "absolute", inset: 0, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 14,
      background: "rgba(10,10,10,0.9)", backdropFilter: "blur(8px)",
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: "50%",
        border: "2px solid rgba(196,57,90,0.2)", borderTopColor: "#C4395A",
        animation: "cfg-spin 0.9s linear infinite",
      }} />
      <p style={{
        fontFamily: "'DM Sans',sans-serif", fontSize: 10,
        color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em", textTransform: "uppercase",
      }}>
        Cargando modelo
      </p>
    </div>
  );
}

// ─── Interactive 2D stamp canvas ─────────────────────────
interface StampCanvasProps {
  baseColor: string;
  items: StampItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number) => void;
}

function StampCanvas({ baseColor, items, selectedId, onSelect, onMove }: StampCanvasProps) {
  const cvRef    = useRef<HTMLCanvasElement>(null);
  const dragging = useRef<{ id: string; ox: number; oy: number } | null>(null);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const W = cv.width; const H = cv.height;
    ctx.clearRect(0, 0, W, H);

    // Silueta hoodie
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    const cx = W / 2;
    const top = H * 0.07; const sh = H * 0.17;
    ctx.moveTo(cx - W * 0.27, top + sh);
    ctx.lineTo(cx - W * 0.38, top + sh * 0.28);
    ctx.lineTo(cx - W * 0.22, top);
    ctx.quadraticCurveTo(cx, top - H * 0.02, cx + W * 0.22, top);
    ctx.lineTo(cx + W * 0.38, top + sh * 0.28);
    ctx.lineTo(cx + W * 0.27, top + sh);
    ctx.lineTo(cx + W * 0.35, H * 0.93);
    ctx.lineTo(cx - W * 0.35, H * 0.93);
    ctx.closePath();
    ctx.fill();

    // Costura central
    ctx.beginPath();
    ctx.moveTo(cx, top + sh * 0.6); ctx.lineTo(cx, H * 0.93);
    ctx.strokeStyle = "rgba(255,255,255,0.05)"; ctx.lineWidth = 1.5; ctx.stroke();

    // Grid
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    for (let gx = 0; gx < W; gx += 26)
      for (let gy = 0; gy < H; gy += 26)
        ctx.fillRect(gx, gy, 1.5, 1.5);

    // Items
    items.forEach((item) => {
      ctx.save();
      ctx.translate(item.x * W, item.y * H);

      if (item.type === "text" && item.text) {
        const sz = Math.round(H * 0.055 * item.scale);
        ctx.font          = `${item.fontWeight} ${sz}px '${item.fontFam}', sans-serif`;
        ctx.fillStyle     = item.color ?? "rgba(255,255,255,0.95)";
        ctx.strokeStyle   = "rgba(0,0,0,0.28)";
        ctx.lineWidth     = sz * 0.04;
        ctx.textAlign     = "center";
        ctx.textBaseline  = "middle";
        ctx.shadowColor   = "rgba(0,0,0,0.55)";
        ctx.shadowBlur    = sz * 0.1;
        ctx.strokeText(item.text.toUpperCase(), 0, 0);
        ctx.fillText(item.text.toUpperCase(), 0, 0);
      }
      if (item.type === "image" && item.imageEl) {
        const iw = W * 0.16 * item.scale;
        const ih = (iw / item.imageEl.naturalWidth) * item.imageEl.naturalHeight;
        ctx.shadowColor = "rgba(0,0,0,0.4)"; ctx.shadowBlur = 8;
        ctx.drawImage(item.imageEl, -iw / 2, -ih / 2, iw, ih);
      }

      if (selectedId === item.id) {
        const r = Math.max(22, H * 0.055 * item.scale * 1.2);
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.strokeStyle = "#C4395A"; ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = "#C4395A";
        ctx.beginPath(); ctx.arc(r, -r, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.shadowBlur = 0;
        ctx.fillText("✥", r, -r);
      }
      ctx.restore();
    });
  }, [baseColor, items, selectedId]);

  const getXY = (e: MouseEvent | TouchEvent, cv: HTMLCanvasElement) => {
    const rect = cv.getBoundingClientRect();
    const src  = "touches" in e ? (e as TouchEvent).touches[0] : (e as MouseEvent);
    return { x: (src.clientX - rect.left) / rect.width, y: (src.clientY - rect.top) / rect.height };
  };

  const handleDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const cv = cvRef.current; if (!cv) return;
    const { x, y } = getXY(e.nativeEvent, cv);
    const W = cv.width; const H = cv.height;

    // Buscamos de arriba hacia abajo (el último renderizado es el que está encima)
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      let hit = false;

      if (it.type === "text") {
        // Para texto usamos un radio circular generoso
        hit = Math.hypot(x - it.x, y - it.y) < 0.12 * it.scale;
      } else if (it.type === "image" && it.imageEl) {
        // Para imágenes usamos su caja real
        const iw = 0.16 * it.scale;
        const ih = (iw / it.imageEl.naturalWidth) * it.imageEl.naturalHeight;
        hit = (
          x >= it.x - iw/2 && x <= it.x + iw/2 &&
          y >= it.y - ih/2 && y <= it.y + ih/2
        );
      } else {
        // Fallback genérico
        hit = Math.hypot(x - it.x, y - it.y) < 0.1 * it.scale;
      }

      if (hit) {
        onSelect(it.id);
        dragging.current = { id: it.id, ox: x - it.x, oy: y - it.y };
        if (e.cancelable) e.preventDefault();
        return;
      }
    }
    onSelect(null);
  };

  useEffect(() => {
    const mv = (e: MouseEvent | TouchEvent) => {
      if (!dragging.current || !cvRef.current) return;
      const { x, y } = getXY(e, cvRef.current);
      onMove(
        dragging.current.id,
        Math.max(0.04, Math.min(0.96, x - dragging.current.ox)),
        Math.max(0.04, Math.min(0.96, y - dragging.current.oy)),
      );
    };
    const up = () => { dragging.current = null; };
    window.addEventListener("mousemove", mv);
    window.addEventListener("mouseup",   up);
    window.addEventListener("touchmove", mv, { passive: false });
    window.addEventListener("touchend",  up);
    return () => {
      window.removeEventListener("mousemove", mv);
      window.removeEventListener("mouseup",   up);
      window.removeEventListener("touchmove", mv);
      window.removeEventListener("touchend",  up);
    };
  }, [onMove]);

  return (
    <canvas
      ref={cvRef} width={340} height={420}
      onMouseDown={handleDown}
      onTouchStart={handleDown}
      style={{ width: "100%", height: "100%", cursor: "move", display: "block", borderRadius: 12, touchAction: "none" }}
    />
  );
}

// ─── Small button style ───────────────────────────────────
const btnSm: React.CSSProperties = {
  width: 26, height: 26, borderRadius: 6,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.05)",
  color: "rgba(255,255,255,0.7)",
  fontSize: 14, fontWeight: 700, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
};

const Lbl = ({ children }: { children: React.ReactNode }) => (
  <p style={{
    fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", color: "rgba(255,255,255,0.28)",
    textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 4,
  }}>
    {children}
  </p>
);

// ─── Main ─────────────────────────────────────────────────
const ProductConfigurator3D = ({ onAddToCart }: { onAddToCart?: (c: Record<string, unknown>) => void }) => {
  const [selectedColor,   setSelectedColor]   = useState(COLORS[0]);
  const [selectedTexture, setSelectedTexture] = useState(TEXTURES[0]);
  const [selectedSize,    setSelectedSize]    = useState("M");
  const [selectedAcc,     setSelectedAcc]     = useState(ACCESSORY_COLORS[0]);
  const [selectedFont,    setSelectedFont]    = useState(FONTS[0]);
  const [activeTab,       setActiveTab]       = useState<"color" | "material" | "stamp" | "size">("color");
  const [added,           setAdded]           = useState(false);

  const [stampItems,      setStampItems]      = useState<StampItem[]>([]);
  const [selectedStampId, setSelectedStampId] = useState<string | null>(null);
  const [newText,         setNewText]         = useState("");
  const [textColor,       setTextColor]       = useState("#ffffff");
  const decalSide                                     = "front";

  const addText = () => {
    if (!newText.trim()) return;
    const item: StampItem = {
      id: `txt-${Date.now()}`, type: "text",
      x: 0.5, y: 0.38, scale: 1, side: decalSide,
      text: newText.trim(),
      fontFam: selectedFont.fam, fontWeight: selectedFont.weight, color: textColor,
    };
    setStampItems((p) => [...p, item]);
    setSelectedStampId(item.id);
    setNewText("");
  };

  const addImage = (file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const item: StampItem = {
        id: `img-${Date.now()}`, type: "image",
        x: 0.5, y: 0.42, scale: 1, side: decalSide,
        imageUrl: url, imageEl: img,
      };
      setStampItems((p) => [...p, item]);
      setSelectedStampId(item.id);
    };
    img.src = url;
  };

  const moveItem = useCallback((id: string, x: number, y: number) => {
    setStampItems((p) => p.map((i) => (i.id === id ? { ...i, x, y } : i)));
  }, []);

  const scaleSelected = (d: number) => {
    if (!selectedStampId) return;
    setStampItems((p) => p.map((i) =>
      i.id === selectedStampId ? { ...i, scale: Math.max(0.3, Math.min(3, i.scale + d)) } : i,
    ));
  };

  const deleteSelected = () => {
    setStampItems((p) => p.filter((i) => i.id !== selectedStampId));
    setSelectedStampId(null);
  };

  const selectedItem = stampItems.find((i) => i.id === selectedStampId) ?? null;

  const tabs = [
    { id: "color",    label: "Color",    icon: <Palette size={12} /> },
    { id: "material", label: "Material", icon: <Layers  size={12} /> },
    { id: "stamp",    label: "Estampa",  icon: <Type    size={12} /> },
    { id: "size",     label: "Talla",    icon: <Ruler   size={12} /> },
  ] as const;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700;800;900&family=Playfair+Display:wght@700&family=Bebas+Neue&family=Courier+Prime:wght@700&family=Montserrat:wght@900&family=Lobster&display=swap');
        @keyframes cfg-spin   { to { transform:rotate(360deg); } }
        .cfg-wrap { font-family:'DM Sans',sans-serif; width:100%; max-width:1160px; margin:0 auto; }
        .cfg-banner {
          position:relative; overflow:hidden;
          border-radius:12px 12px 0 0; background:#050505;
          padding:32px 40px;
          display:grid; grid-template-columns:1fr auto; align-items:center; gap:24px;
          border:1px solid rgba(255,255,255,0.15);
          border-bottom:none;
        }
        @media(max-width:640px){
          .cfg-banner{grid-template-columns:1fr;padding:24px 20px;}
        }
        .cfg-body {
          background:#0a0a0a;
          border-radius:0 0 12px 12px;
          display:grid; grid-template-columns:1fr 400px;
          min-height:640px; overflow:hidden;
          border:1px solid rgba(255,255,255,0.15);
        }
        @media(max-width:820px){
          .cfg-body{grid-template-columns:1fr;}
          .cfg-canvas-col{min-height:380px!important; border-bottom:1px solid rgba(255,255,255,0.15);}
          .cfg-panel{max-height:75vh;}
        }
        .cfg-scroll::-webkit-scrollbar{width:3px;}
        .cfg-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.07);border-radius:3px;}
        .cfg-tab-lbl{display:none;}
        @media(min-width:480px){.cfg-tab-lbl{display:inline;}}
        .cfg-shine-text {
          background:linear-gradient(90deg,#C4395A,#ff7a9a,#ffd166,#a78bfa,#C4395A);
          background-size:200% auto;
          -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent;
          animation:cfg-shine 3.5s linear infinite;
        }
      `}</style>

      <div className="cfg-wrap">

        {/* ════════════ BANNER ════════════ */}
        <div className="cfg-banner">
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: "radial-gradient(circle at 10% 20%,rgba(255,255,255,0.03) 0%,transparent 60%)",
          }} />

          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 14,
              border: "1px solid rgba(255,255,255,0.3)",
              padding: "4px 10px", background: "#fff", color: "#000",
            }}>
              <span style={{
                width: 6, height: 6, background: "#000", display: "inline-block",
              }} />
              <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                Studio 3D Configurator
              </span>
            </div>
            <h1 style={{
              fontSize: "clamp(26px,4vw,42px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05,
              color: "#fff", margin: 0,
            }}>
              Diseña tu<br />
              <span style={{ color: "transparent", WebkitTextStroke: "1.5px #fff", fontWeight: 900 }}>Hoodie Único</span>
            </h1>
            <p style={{
              fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 14, maxWidth: 400, lineHeight: 1.6,
              fontWeight: 500, letterSpacing: "-0.01em"
            }}>
              Motor de renderizado en tiempo real. Proyección Decal 3D precisa con simulación de texturas.
            </p>
          </div>

          <div style={{ position: "relative", zIndex: 2, flexShrink: 0 }}>
            <div style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 16, padding: "15px 20px", backdropFilter: "blur(10px)", textAlign: "center",
            }}>
              <p style={{ fontSize: 9, letterSpacing: "0.14em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", marginBottom: 4 }}>Desde</p>
              <p style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: "-0.05em", margin: 0 }}>
                $259.900<span style={{ fontSize: 11, fontWeight: 400, color: "rgba(255,255,255,0.28)", marginLeft: 3 }}>COP</span>
              </p>
              <p style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", marginTop: 4 }}>Envío gratis +$150k</p>
            </div>
          </div>
        </div>

        {/* ════════════ BODY ════════════ */}
        <div className="cfg-body">

          {/* ── 3D Canvas ── */}
          <div className="cfg-canvas-col" style={{
            position: "relative",
            background: "#080808",
            minHeight: 580,
            borderRight: "1px solid rgba(255,255,255,0.1)"
          }}>
            <div style={{ position: "absolute", top: 18, left: 20, zIndex: 10, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.22em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
                Vista 3D
              </span>
            </div>
            <motion.div key={selectedColor.name} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
              style={{
                position: "absolute", top: 18, right: 18, zIndex: 10,
                display: "flex", alignItems: "center", gap: 8,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                padding: "4px 10px",
              }}>
              <div style={{ width: 10, height: 10, background: selectedColor.hex, border: "1px solid rgba(255,255,255,0.2)" }} />
              <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: "0.1em" }}>
                {selectedColor.name.toUpperCase()}
              </span>
            </motion.div>
            <div style={{ position: "absolute", bottom: 18, left: 18, zIndex: 10, display: "flex", gap: 16 }}>
              {[{ icon: <RotateCw size={11} />, lb: "Rotate" }, { icon: <ZoomIn size={11} />, lb: "Zoom" }].map(({ icon, lb }) => (
                <div key={lb} style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(255,255,255,0.25)", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {icon}{lb}
                </div>
              ))}
            </div>

            <div style={{ 
              height: "100%", 
              minHeight: 580, 
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Suspense fallback={<CanvasLoader />}>
                <Canvas
                  shadows
                  camera={{ position: [0, 0, 7.5], fov: 28 }}
                  gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
                  style={{ background: "transparent", width: "100%", height: "100%" }}
                >
                  <ambientLight intensity={0.6} color="#ffffff" />
                  <directionalLight position={[4, 6, 4]}  intensity={1.2} castShadow shadow-mapSize={2048} />
                  <directionalLight position={[-4, 3, 2]} intensity={0.5} />
                  <directionalLight position={[0, 4, -4]} intensity={0.3} />

                  {/*
                    ─── NOTA: stampItems se pasa directamente al modelo.
                        Cada DecalItem gestiona su propia textura con useMemo/useState,
                        así que no hace falta ningún estado externo de texturas.
                  */}
                  <HoodieModel
                    color={selectedColor.hex}
                    materialProps={selectedTexture}
                    accessoryHex={selectedAcc.hex}
                    stampItems={stampItems}
                  />

                  <ContactShadows position={[0, -1.6, 0]} opacity={0.45} blur={3.5} far={5} />
                  <Environment preset="studio" background={false} />
                  <OrbitControls
                    enablePan={false} 
                    minDistance={4} 
                    maxDistance={10}
                    minPolarAngle={0.15} 
                    maxPolarAngle={Math.PI / 2.1}
                    rotateSpeed={0.7} 
                    dampingFactor={0.08} 
                    enableDamping
                    target={[0, 0, 0]}
                  />
                </Canvas>
              </Suspense>
            </div>
          </div>

          {/* ── Panel ── */}
          <div className="cfg-panel" style={{ background: "#0a0a0a", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "0 0 0", borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
              <div style={{ display: "flex", gap: 1, marginBottom: -1 }}>
                {tabs.map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                    flex: 1, padding: "16px 4px",
                    background: activeTab === tab.id ? "#151515" : "transparent",
                    border: "none",
                    borderRight: "1px solid rgba(255,255,255,0.1)",
                    borderBottom: activeTab === tab.id ? "2px solid #fff" : "2px solid transparent",
                    color: activeTab === tab.id ? "#fff" : "rgba(255,255,255,0.4)",
                    fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    textTransform: "uppercase",
                    transition: "all 0.15s", fontFamily: "'DM Sans',sans-serif",
                  }}>
                    {tab.icon}<span className="cfg-tab-lbl">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="cfg-scroll" style={{ flex: 1, overflowY: "auto", padding: "17px 21px" }}>
              <AnimatePresence mode="wait">

                {/* COLOR */}
                {activeTab === "color" && (
                  <motion.div key="color" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
                    <Lbl>Color principal</Lbl>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 22 }}>
                      {COLORS.map((c) => (
                        <button key={c.name} onClick={() => setSelectedColor(c)}
                          style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: 0, background: c.hex,
                            border: selectedColor.name === c.name ? "2px solid #fff" : "1px solid rgba(255,255,255,0.15)",
                            transform: selectedColor.name === c.name ? "scale(1.15)" : "scale(1)",
                            transition: "all 0.15s",
                          }} />
                          <span style={{ fontSize: 8, fontWeight: 800, textTransform: "uppercase", color: selectedColor.name === c.name ? "#fff" : "rgba(255,255,255,0.3)" }}>{c.name}</span>
                        </button>
                      ))}
                    </div>
                    <Lbl>Accesorios</Lbl>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 7 }}>
                      {ACCESSORY_COLORS.map((a) => {
                        const on = selectedAcc.name === a.name;
                        return (
                          <button key={a.name} onClick={() => setSelectedAcc(a)} style={{
                            display: "flex", alignItems: "center", gap: 9, padding: "10px 12px",
                            borderRadius: 9, cursor: "pointer",
                            background: on ? "rgba(196,57,90,0.08)" : "rgba(255,255,255,0.03)",
                            border: on ? "1px solid rgba(196,57,90,0.4)" : "1px solid rgba(255,255,255,0.06)",
                            transition: "all 0.18s",
                          }}>
                            <div style={{ width: 12, height: 12, borderRadius: "50%", background: a.hex, flexShrink: 0 }} />
                            <span style={{ fontSize: 11, fontWeight: 700, color: on ? "#fff" : "rgba(255,255,255,0.38)" }}>{a.name}</span>
                            {on && <Check size={11} color="#C4395A" style={{ marginLeft: "auto" }} />}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* MATERIAL */}
                {activeTab === "material" && (
                  <motion.div key="material" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
                    <Lbl>Textura / Material</Lbl>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {TEXTURES.map((t) => {
                        const on = selectedTexture.name === t.name;
                        return (
                          <button key={t.name} onClick={() => setSelectedTexture(t)} style={{
                            display: "flex", alignItems: "center", gap: 12, padding: "11px 14px",
                            cursor: "pointer",
                            background: on ? "#fff" : "rgba(255,255,255,0.03)",
                            border: "1px solid",
                            borderColor: on ? "#fff" : "rgba(255,255,255,0.15)",
                            transition: "all 0.1s",
                          }}>
                            <span style={{ fontSize: 16, color: on ? "#000" : "rgba(255,255,255,0.3)" }}>{t.icon}</span>
                            <div style={{ flex: 1, textAlign: "left" }}>
                              <p style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", color: on ? "#000" : "rgba(255,255,255,0.6)", marginBottom: 2 }}>{t.name}</p>
                              <p style={{ fontSize: 9, color: on ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.3)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                                Rugosidad {t.roughness} · Metal {t.metalness}
                              </p>
                            </div>
                            {on && <Check size={14} color="#000" />}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* ESTAMPA */}
                {activeTab === "stamp" && (
                  <motion.div key="stamp" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
                    <div style={{
                      display: "flex", alignItems: "flex-start", gap: 7, padding: "9px 11px",
                      background: "rgba(196,57,90,0.06)", border: "1px solid rgba(196,57,90,0.15)",
                      borderRadius: 9, marginBottom: 14,
                    }}>
                      <Move size={12} color="#C4395A" style={{ flexShrink: 0, marginTop: 1 }} />
                      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.48)", lineHeight: 1.55, margin: 0 }}>
                        Agrega texto o logo y <strong style={{ color: "rgba(255,255,255,0.78)" }}>arrástralo</strong> — se proyecta como Decal 3D real sobre la prenda
                      </p>
                    </div>

                    <div style={{
                      aspectRatio: "340/420", borderRadius: 12, overflow: "hidden",
                      border: "1px solid rgba(255,255,255,0.07)", marginBottom: 12,
                      background: "rgba(255,255,255,0.02)", position: "relative",
                    }}>
                      <StampCanvas baseColor={selectedColor.hex} items={stampItems}
                        selectedId={selectedStampId} onSelect={setSelectedStampId} onMove={moveItem} />
                      {stampItems.length === 0 && (
                        <div style={{
                          position: "absolute", inset: 0, display: "flex", alignItems: "center",
                          justifyContent: "center", pointerEvents: "none",
                        }}>
                          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.16)", letterSpacing: "0.1em", textAlign: "center", lineHeight: 1.7 }}>
                            Agrega texto o logo<br />para verlo en el modelo 3D
                          </p>
                        </div>
                      )}
                    </div>

                    <AnimatePresence>
                      {selectedItem && (
                        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                          style={{
                            display: "flex", alignItems: "center", gap: 5, marginBottom: 12,
                            padding: "8px 10px", background: "rgba(196,57,90,0.07)",
                            border: "1px solid rgba(196,57,90,0.22)", borderRadius: 9,
                          }}>
                          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {selectedItem.type === "text" ? `"${selectedItem.text}"` : "Imagen"}
                          </span>
                          <button onClick={() => scaleSelected(-0.15)} style={btnSm}>−</button>
                          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.38)", minWidth: 28, textAlign: "center" }}>
                            {Math.round(selectedItem.scale * 100)}%
                          </span>
                          <button onClick={() => scaleSelected(+0.15)} style={btnSm}>+</button>
                          <button onClick={deleteSelected} style={{ ...btnSm, background: "rgba(239,68,68,0.12)", borderColor: "rgba(239,68,68,0.25)" }}>
                            <Trash2 size={10} color="#ef4444" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Lbl><Tag size={10} style={{ display: "inline", marginRight: 4 }} />Agregar texto</Lbl>
                    <div style={{ display: "flex", gap: 6, marginBottom: 9 }}>
                      <input
                        value={newText}
                        onChange={(e) => setNewText(e.target.value.slice(0, 18))}
                        onKeyDown={(e) => { if (e.key === "Enter") addText(); }}
                        placeholder="Ej: EVOLET 96"
                        style={{
                          flex: 1, padding: "10px 12px", borderRadius: 9,
                          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
                          color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box",
                          fontFamily: `'${selectedFont.fam}',sans-serif`,
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "rgba(196,57,90,0.5)")}
                        onBlur={(e)  => (e.target.style.borderColor = "rgba(255,255,255,0.09)")}
                      />
                      <input
                        type="color" value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        title="Color del texto"
                        style={{
                          width: 38, height: 38, padding: 3, borderRadius: 8,
                          border: "1px solid rgba(255,255,255,0.1)",
                          background: "rgba(255,255,255,0.04)", cursor: "pointer", flexShrink: 0,
                        }}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
                      {FONTS.map((f) => {
                        const on = selectedFont.name === f.name;
                        return (
                          <button key={f.name} onClick={() => setSelectedFont(f)} style={{
                            padding: "9px 10px", borderRadius: 8, cursor: "pointer",
                            fontFamily: `'${f.fam}',sans-serif`, fontSize: 12,
                            background: on ? "rgba(196,57,90,0.1)" : "rgba(255,255,255,0.03)",
                            border: on ? "1px solid rgba(196,57,90,0.4)" : "1px solid rgba(255,255,255,0.06)",
                            color: on ? "#fff" : "rgba(255,255,255,0.38)",
                            textAlign: "center", transition: "all 0.15s",
                          }}>{f.name}</button>
                        );
                      })}
                    </div>

                    <button onClick={addText} disabled={!newText.trim()} style={{
                      width: "100%", padding: "10px", borderRadius: 9,
                      cursor: newText.trim() ? "pointer" : "not-allowed",
                      background: newText.trim() ? "rgba(196,57,90,0.15)" : "rgba(255,255,255,0.03)",
                      border: newText.trim() ? "1px solid rgba(196,57,90,0.4)" : "1px solid rgba(255,255,255,0.06)",
                      color: newText.trim() ? "#fff" : "rgba(255,255,255,0.2)",
                      fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      fontFamily: "'DM Sans',sans-serif", transition: "all 0.18s", marginBottom: 16,
                    }}>
                      <Type size={11} /> Agregar texto como Decal 3D
                    </button>

                    <Lbl><ImageIcon size={10} style={{ display: "inline", marginRight: 4 }} />Agregar logo / imagen</Lbl>
                    <label
                      style={{
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                        padding: "16px 14px", borderRadius: 10, cursor: "pointer",
                        border: "2px dashed rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(196,57,90,0.35)")}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                    >
                      <ImageIcon size={17} color="rgba(255,255,255,0.16)" />
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textAlign: "center", margin: 0 }}>
                        Subir logo o imagen<br />
                        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.16)" }}>PNG · JPG · SVG · WEBP</span>
                      </p>
                      <input type="file" accept="image/*" style={{ display: "none" }}
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) addImage(f); e.target.value = ""; }} />
                    </label>

                    {stampItems.length > 0 && (
                      <div style={{ marginTop: 14 }}>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: 7 }}>
                          Decals en la prenda ({stampItems.length})
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {stampItems.map((item) => (
                            <div key={item.id} onClick={() => setSelectedStampId(item.id)}
                              style={{
                                display: "flex", alignItems: "center", gap: 8, padding: "7px 10px",
                                borderRadius: 8, cursor: "pointer",
                                background: selectedStampId === item.id ? "rgba(196,57,90,0.1)" : "rgba(255,255,255,0.03)",
                                border: selectedStampId === item.id ? "1px solid rgba(196,57,90,0.35)" : "1px solid rgba(255,255,255,0.05)",
                              }}>
                              {item.type === "text"
                                ? <Type size={10} color="rgba(255,255,255,0.38)" />
                                : <ImageIcon size={10} color="rgba(255,255,255,0.38)" />}
                              <span style={{ flex: 1, fontSize: 11, color: "rgba(255,255,255,0.52)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {item.type === "text" ? item.text?.toUpperCase() : "Imagen"}
                              </span>
                              <button onClick={(e) => {
                                e.stopPropagation();
                                setStampItems((p) => p.filter((i) => i.id !== item.id));
                                if (selectedStampId === item.id) setSelectedStampId(null);
                              }} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 2 }}>
                                <X size={10} color="rgba(255,255,255,0.22)" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* TALLA */}
                {activeTab === "size" && (
                  <motion.div key="size" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
                    <Lbl>Selecciona tu talla</Lbl>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7, marginBottom: 20 }}>
                      {SIZES.map((s) => {
                        const on = selectedSize === s;
                        return (
                          <button key={s} onClick={() => setSelectedSize(s)} style={{
                            padding: "14px 0", borderRadius: 11, cursor: "pointer",
                            background: on ? "rgba(196,57,90,0.12)" : "rgba(255,255,255,0.03)",
                            border: on ? "1px solid rgba(196,57,90,0.5)" : "1px solid rgba(255,255,255,0.05)",
                            fontSize: 14, fontWeight: 900, color: on ? "#fff" : "rgba(255,255,255,0.32)",
                            letterSpacing: "0.06em", fontFamily: "'DM Sans',sans-serif",
                            boxShadow: on ? "0 0 0 3px rgba(196,57,90,0.1)" : "none",
                            transition: "all 0.18s",
                          }}>{s}</button>
                        );
                      })}
                    </div>
                    <div style={{
                      padding: "12px 13px", background: "rgba(255,255,255,0.02)", borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.05)",
                    }}>
                      <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 9 }}>
                        Guía de tallas (cm)
                      </p>
                      {[
                        { s: "XS", c: "82–87",  h: "38" },
                        { s: "S",  c: "88–93",  h: "40" },
                        { s: "M",  c: "94–99",  h: "42" },
                        { s: "L",  c: "100–105", h: "44" },
                        { s: "XL", c: "106–111", h: "46" },
                        { s: "XXL", c: "112–118", h: "48" },
                      ].map((row) => (
                        <div key={row.s} style={{
                          display: "flex", justifyContent: "space-between",
                          padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.03)",
                          background: selectedSize === row.s ? "rgba(196,57,90,0.05)" : "transparent", borderRadius: 4,
                        }}>
                          <span style={{ fontSize: 11, fontWeight: selectedSize === row.s ? 800 : 500, width: 34, color: selectedSize === row.s ? "#C4395A" : "rgba(255,255,255,0.26)" }}>{row.s}</span>
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.24)" }}>Pecho {row.c}</span>
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.24)" }}>Hombro {row.h}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* CTA */}
            <div style={{ padding: "12px 21px 19px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "#0e0e0e" }}>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 9 }}>
                {[
                  selectedColor.name, selectedTexture.name, `Talla ${selectedSize}`, selectedAcc.name,
                  ...(stampItems.length > 0 ? [`${stampItems.length} decal${stampItems.length > 1 ? "es" : ""}`] : []),
                ].map((tag) => (
                  <span key={tag} style={{
                    fontSize: 8, fontWeight: 700, letterSpacing: "0.06em",
                    color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)", borderRadius: 100, padding: "2px 8px",
                    textTransform: "uppercase",
                  }}>{tag}</span>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.24)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Total</span>
                <span style={{ fontSize: 20, fontWeight: 900, color: "#fff", letterSpacing: "-0.04em" }}>
                  $259.900<span style={{ fontSize: 10, fontWeight: 400, color: "rgba(255,255,255,0.26)", marginLeft: 3 }}>COP</span>
                </span>
              </div>
              <motion.button
                onClick={() => {
                  onAddToCart?.({
                    baseProductId: "hoodie-premium-001", name: "Hoodie Personalizado", basePrice: 259900,
                    customization: {
                      color: selectedColor.name, colorHex: selectedColor.hex,
                      texture: selectedTexture.name, size: selectedSize, accessory: selectedAcc.name,
                      stamps: stampItems.map((i) => ({ type: i.type, text: i.text, x: i.x, y: i.y, scale: i.scale, side: i.side })),
                    },
                    quantity: 1,
                  });
                  setAdded(true);
                  setTimeout(() => setAdded(false), 2400);
                }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: "100%", padding: "16px 20px",
                  background: added ? "#16a34a" : "#fff",
                  border: "none", color: added ? "#fff" : "#000", fontSize: 12, fontWeight: 900,
                  letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  transition: "background 0.2s, color 0.2s", fontFamily: "'DM Sans',sans-serif",
                }}
              >
                {added
                  ? <><Check size={14} />¡Añadido!</>
                  : <><ShoppingBag size={14} />Añadir al carrito</>}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductConfigurator3D;