import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, RoundedBox } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";
import { RotateCcw, Palette, Layers } from "lucide-react";

const COLORS = [
  { name: "Negro", hex: "#1a1a1a" },
  { name: "Blanco", hex: "#f5f5f0" },
  { name: "Terracota", hex: "#c4713b" },
  { name: "Oliva", hex: "#5c6b3c" },
  { name: "Azul Marino", hex: "#1e3a5f" },
  { name: "Burdeos", hex: "#6b2d3e" },
];

const TEXTURES = [
  { name: "Liso", roughness: 0.3, metalness: 0.1 },
  { name: "Mate", roughness: 0.9, metalness: 0.0 },
  { name: "Metálico", roughness: 0.15, metalness: 0.8 },
  { name: "Satinado", roughness: 0.5, metalness: 0.3 },
];

interface ProductMeshProps {
  color: string;
  roughness: number;
  metalness: number;
  shape: "box" | "cylinder" | "torus";
}

const ProductMesh = ({ color, roughness, metalness, shape }: ProductMeshProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0.5, 0]} castShadow>
      {shape === "box" && <RoundedBox args={[1.8, 1.8, 1.8]} radius={0.15} smoothness={4} />}
      {shape === "cylinder" && <cylinderGeometry args={[0.9, 0.9, 2, 64]} />}
      {shape === "torus" && <torusGeometry args={[0.8, 0.35, 32, 64]} />}
      <meshStandardMaterial
        color={color}
        roughness={roughness}
        metalness={metalness}
        envMapIntensity={1.2}
      />
    </mesh>
  );
};

const ProductConfigurator3D = () => {
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedTexture, setSelectedTexture] = useState(TEXTURES[0]);
  const [selectedShape, setSelectedShape] = useState<"box" | "cylinder" | "torus">("box");

  const shapes: Array<{ id: "box" | "cylinder" | "torus"; label: string }> = [
    { id: "box", label: "Cubo" },
    { id: "cylinder", label: "Cilindro" },
    { id: "torus", label: "Anillo" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mt-12 border border-border bg-card"
    >
      <div className="p-4 lg:p-6 border-b border-border">
        <h2 className="font-display text-xl lg:text-2xl font-bold flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-accent" />
          Configurador 3D
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Arrastra para rotar · Scroll para zoom · Personaliza color y textura
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
        {/* 3D Canvas */}
        <div className="lg:col-span-2 h-[350px] lg:h-[450px] bg-secondary/30">
          <Canvas
            shadows
            camera={{ position: [3, 2, 5], fov: 45 }}
            gl={{ antialias: true }}
          >
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
            <ProductMesh
              color={selectedColor.hex}
              roughness={selectedTexture.roughness}
              metalness={selectedTexture.metalness}
              shape={selectedShape}
            />
            <ContactShadows position={[0, -0.5, 0]} opacity={0.4} blur={2} />
            <Environment preset="studio" />
            <OrbitControls
              enablePan={false}
              minDistance={3}
              maxDistance={8}
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={Math.PI / 2}
            />
          </Canvas>
        </div>

        {/* Controls */}
        <div className="p-4 lg:p-6 flex flex-col gap-6 border-t lg:border-t-0 lg:border-l border-border">
          {/* Color */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4" /> Color
            </h3>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor.name === c.name
                      ? "border-accent scale-110 ring-2 ring-accent/30"
                      : "border-border hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">{selectedColor.name}</p>
          </div>

          {/* Texture */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4" /> Textura
            </h3>
            <div className="flex flex-col gap-1.5">
              {TEXTURES.map((t) => (
                <button
                  key={t.name}
                  onClick={() => setSelectedTexture(t)}
                  className={`text-left px-3 py-2 text-sm transition-colors ${
                    selectedTexture.name === t.name
                      ? "bg-accent text-accent-foreground font-medium"
                      : "hover:bg-secondary text-foreground"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Shape */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">Forma</h3>
            <div className="flex gap-2">
              {shapes.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedShape(s.id)}
                  className={`flex-1 px-3 py-2 text-xs font-medium uppercase tracking-wider transition-colors border ${
                    selectedShape === s.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductConfigurator3D;
