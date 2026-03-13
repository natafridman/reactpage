import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '/components/Header.jsx';
import { loadManifest, parseMetadata, IMAGES_BASE_FOLDER } from '/utils/productUtils.js';

const PRODUCT_R = 54;
const CATEGORY_R = 34;
const SPRING_LEN = 130;
const SPRING_K = 0.012;
const REPULSION = 5000;
const DAMPING = 0.94;
const GRAVITY = 0.0015;
const COGNAC = '#7A4F48';

function RedProductosPage() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const nodesRef = useRef([]);
  const edgesRef = useRef([]);
  const velsRef = useRef([]);
  const imagesRef = useRef({});
  const animRef = useRef(null);
  const dragRef = useRef(null);    // { index, startX, startY, moved }
  const hoveredRef = useRef(-1);
  const [categories, setCategories] = useState([]);
  const [isMenuActive, setIsMenuActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ── Load data ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const manifest = await loadManifest();
      const catKeys = Object.keys(manifest);
      setCategories(catKeys);

      const W = window.innerWidth;
      const H = window.innerHeight - 70;
      const cx = W / 2, cy = H / 2;

      const allNodes = [];
      const allEdges = [];

      const CATEGORY_COLORS = [
        '#7A4F48', '#5C7A8A', '#6B7A5C', '#8A6B5C',
        '#5C6B8A', '#7A6B5C', '#5C8A7A', '#8A7A5C',
      ];

      // Divide canvas into grid cells, shuffle, assign one category per cell
      const n = catKeys.length;
      const cols = Math.ceil(Math.sqrt(n * (W / H)));
      const rows = Math.ceil(n / cols);
      const pad = CATEGORY_R + 180;
      const cellW = (W - pad * 2) / cols;
      const cellH = (H - pad * 2) / rows;
      const cellIndices = Array.from({ length: cols * rows }, (_, i) => i)
        .sort(() => Math.random() - 0.5)
        .slice(0, n);

      for (let ci = 0; ci < catKeys.length; ci++) {
        const cat = catKeys[ci];
        const color = CATEGORY_COLORS[ci % CATEGORY_COLORS.length];
        const cell = cellIndices[ci];
        const col = cell % cols;
        const row = Math.floor(cell / cols);
        const catX = pad + col * cellW + cellW * 0.15 + Math.random() * cellW * 0.7;
        const catY = pad + row * cellH + cellH * 0.15 + Math.random() * cellH * 0.7;

        const catNode = {
          id: `cat-${cat}`,
          type: 'category',
          label: cat,
          x: catX,
          y: catY,
          radius: CATEGORY_R,
          color,
          pinned: true,   // fixed position — cluster anchor
        };
        allNodes.push(catNode);

        const folders = manifest[cat];
        const metaResults = await Promise.all(
          folders.map(async (folder, fi) => {
            try {
              const res = await fetch(`/${IMAGES_BASE_FOLDER}/${cat}/${folder}/metadata.txt`);
              if (!res.ok) return { folder, meta: {}, fi };
              const meta = parseMetadata(await res.text());
              return { folder, meta, fi };
            } catch { return { folder, meta: {}, fi }; }
          })
        );

        // Angle from category toward canvas center, then fan products around it
        const toCenterAngle = Math.atan2(cy - catY, cx - catX);

        metaResults.forEach((prod) => {
          const pi = prod.fi;  // use original manifest index — never changes
          const spreadAngle = toCenterAngle + (pi - (folders.length - 1) / 2) * 0.38;
          const dist = 160 + (pi % 3) * 25;
          const images = Array.isArray(prod.meta.images) && prod.meta.images.length
            ? prod.meta.images
            : ['hero.jpg'];
          const firstImage = images[Math.floor(Math.random() * images.length)];

          const prodNode = {
            id: `${cat}/${prod.folder}`,
            type: 'product',
            label: prod.meta.title || prod.folder,
            category: cat,
            folder: prod.folder,
            x: cx + Math.cos(spreadAngle) * dist,
            y: cy + Math.sin(spreadAngle) * dist,
            radius: PRODUCT_R,
            color,
            image: `/${IMAGES_BASE_FOLDER}/${cat}/${prod.folder}/${firstImage}`,
            pinned: false,
          };
          allNodes.push(prodNode);
          allEdges.push({ source: catNode.id, target: prodNode.id });

          // Preload image
          const img = new Image();
          img.src = prodNode.image;
          imagesRef.current[prodNode.id] = img;
        });
      }

      nodesRef.current = allNodes;
      edgesRef.current = allEdges;
      velsRef.current = allNodes.map(() => ({ vx: 0, vy: 0 }));
      setLoading(false);
    }

    load();
  }, []);

  // ── Canvas size ───────────────────────────────────────────────────────────
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = containerRef.current?.clientWidth || window.innerWidth;
      canvas.height = containerRef.current?.clientHeight || (window.innerHeight - 70);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // ── Draw + simulate ───────────────────────────────────────────────────────
  useEffect(() => {
    if (loading) return;

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const W = canvas.width, H = canvas.height;
      const nodes = nodesRef.current;
      const edges = edgesRef.current;

      // Background — cream
      ctx.fillStyle = '#FAFAF9';
      ctx.fillRect(0, 0, W, H);

      // Subtle dot grid
      ctx.fillStyle = 'rgba(122,79,72,0.1)';
      for (let x = 40; x < W; x += 40) {
        for (let y = 40; y < H; y += 40) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Edges
      edges.forEach(edge => {
        const src = nodes.find(n => n.id === edge.source);
        const tgt = nodes.find(n => n.id === edge.target);
        if (!src || !tgt) return;

        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(tgt.x, tgt.y);
        ctx.strokeStyle = 'rgba(122,79,72,0.18)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Nodes
      nodes.forEach((node, ni) => {
        const isDragging = dragRef.current?.index === ni;
        const isHovered = hoveredRef.current === ni && !isDragging;
        const scale = isDragging ? 1.05 : isHovered ? 1.12 : 1;
        const r = node.radius * scale;
        ctx.save();

        if (node.type === 'product') {
          ctx.shadowColor = isHovered ? 'rgba(122,79,72,0.25)' : 'rgba(0,0,0,0.1)';
          ctx.shadowBlur = isHovered ? 18 : 6;
          ctx.shadowOffsetY = isHovered ? 4 : 2;

          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
          ctx.clip();

          const img = imagesRef.current[node.id];
          if (img?.complete && img.naturalWidth > 0) {
            // object-fit: cover — maintain aspect ratio, crop to fill circle
            const iw = img.naturalWidth, ih = img.naturalHeight;
            const scale = Math.max(r * 2 / iw, r * 2 / ih);
            const sw = r * 2 / scale, sh = r * 2 / scale;
            const sx = (iw - sw) / 2, sy = (ih - sh) / 2;
            ctx.drawImage(img, sx, sy, sw, sh, node.x - r, node.y - r, r * 2, r * 2);
          } else {
            ctx.fillStyle = '#E8E0DC';
            ctx.fill();
          }

          ctx.restore();
          ctx.save();

          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
          ctx.strokeStyle = isHovered ? COGNAC : 'rgba(122,79,72,0.35)';
          ctx.lineWidth = isHovered ? 2.5 : 1.5;
          ctx.stroke();

        } else {
          ctx.shadowColor = 'rgba(122,79,72,0.2)';
          ctx.shadowBlur = 10;

          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
          ctx.strokeStyle = COGNAC;
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.restore();
          ctx.save();

          ctx.font = `600 15px Inter, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = COGNAC;
          ctx.fillText(node.label.substring(0, 3).toUpperCase(), node.x, node.y);
          ctx.textBaseline = 'alphabetic';
        }

        ctx.restore();

        // Label below node
        const isCategory = node.type === 'category';
        ctx.font = `${isCategory ? 700 : 400} ${isCategory ? 13 : 10}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        const textY = node.y + r + (isCategory ? 16 : 13);
        ctx.fillStyle = isCategory ? COGNAC : '#5A5A5A';
        ctx.fillText(node.label, node.x, textY);
      });
    };

    const simulate = () => {
      const nodes = nodesRef.current;
      const vels = velsRef.current;
      const edges = edgesRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const W = canvas.width, H = canvas.height;
      const cx = W / 2, cy = H / 2;

      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].pinned) continue;

        // Category nodes are fixed — skip simulation
        if (nodes[i].type === 'category') continue;

        let fx = 0, fy = 0;

        // Repulsion only against same-category siblings (softer) and cross-category (harder)
        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          if (nodes[j].type === 'category') continue; // don't repel from category hubs
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist2 = dx * dx + dy * dy || 1;
          const dist = Math.sqrt(dist2);
          const minD = nodes[i].radius + nodes[j].radius + 15;
          if (dist < minD * 2.5) {
            const force = REPULSION / dist2;
            fx += (dx / dist) * force;
            fy += (dy / dist) * force;
          }
        }

        // Spring toward own category hub
        edges.forEach(edge => {
          let otherId = null;
          if (edge.source === nodes[i].id) otherId = edge.target;
          if (edge.target === nodes[i].id) otherId = edge.source;
          if (!otherId) return;

          const other = nodes.find(n => n.id === otherId);
          if (!other) return;

          const dx = other.x - nodes[i].x;
          const dy = other.y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const disp = dist - SPRING_LEN;
          fx += (dx / dist) * disp * SPRING_K;
          fy += (dy / dist) * disp * SPRING_K;
        });

        vels[i].vx = (vels[i].vx + fx) * DAMPING;
        vels[i].vy = (vels[i].vy + fy) * DAMPING;
        if (Math.abs(vels[i].vx) < 0.05) vels[i].vx = 0;
        if (Math.abs(vels[i].vy) < 0.05) vels[i].vy = 0;
        nodes[i].x = Math.max(nodes[i].radius + 5, Math.min(W - nodes[i].radius - 5, nodes[i].x + vels[i].vx));
        nodes[i].y = Math.max(nodes[i].radius + 5, Math.min(H - nodes[i].radius - 5, nodes[i].y + vels[i].vy));
      }

      draw();
      animRef.current = requestAnimationFrame(simulate);
    };

    animRef.current = requestAnimationFrame(simulate);
    return () => cancelAnimationFrame(animRef.current);
  }, [loading]);

  // ── Pointer events ────────────────────────────────────────────────────────
  const hitTest = (x, y) => {
    const nodes = nodesRef.current;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const dx = x - nodes[i].x;
      const dy = y - nodes[i].y;
      if (dx * dx + dy * dy <= nodes[i].radius * nodes[i].radius) return i;
    }
    return -1;
  };

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  };

  const onPointerDown = (e) => {
    const { x, y } = getPos(e);
    const idx = hitTest(x, y);
    if (idx < 0) return;
    e.preventDefault();
    nodesRef.current[idx].pinned = true;
    velsRef.current[idx] = { vx: 0, vy: 0 };
    dragRef.current = { index: idx, startX: x, startY: y, moved: false };
  };

  useEffect(() => {
    const onMove = (e) => {
      const { x, y } = getPos(e);
      if (dragRef.current) {
        const { index, startX, startY } = dragRef.current;
        if (!dragRef.current.moved && (Math.abs(x - startX) > 4 || Math.abs(y - startY) > 4)) {
          dragRef.current.moved = true;
        }
        nodesRef.current[index].x = x;
        nodesRef.current[index].y = y;
      } else {
        // Hover detection
        hoveredRef.current = hitTest(x, y);
        canvasRef.current.style.cursor = hoveredRef.current >= 0 ? 'pointer' : 'grab';
      }
    };

    const onUp = (e) => {
      if (!dragRef.current) return;
      const { index, moved } = dragRef.current;
      nodesRef.current[index].pinned = false;

      if (!moved) {
        const node = nodesRef.current[index];
        if (node.type === 'product') {
          navigate(`/producto/${encodeURIComponent(node.category)}/${encodeURIComponent(node.folder)}`);
        }
      }
      dragRef.current = null;
    };

    const canvas = canvasRef.current;
    canvas.addEventListener('mousedown', onPointerDown);
    canvas.addEventListener('touchstart', onPointerDown, { passive: false });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);

    return () => {
      canvas.removeEventListener('mousedown', onPointerDown);
      canvas.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [loading]);

  const handleCategoryClick = (e, cat) => {
    e.preventDefault();
    navigate(`/productos?categoria=${encodeURIComponent(cat)}`);
  };

  return (
    <div className="red-page">
      <Header
        categories={categories}
        isMenuActive={isMenuActive}
        isHeaderHidden={false}
        setIsMenuActive={setIsMenuActive}
        onLogoClick={() => navigate('/')}
        onCategoryClick={handleCategoryClick}
      />

      <div ref={containerRef} className="red-container">
        {loading && (
          <div className="red-loading">
            <div className="red-loading-dot" />
            <div className="red-loading-dot" />
            <div className="red-loading-dot" />
          </div>
        )}
        <canvas ref={canvasRef} className="red-canvas" />
      </div>
    </div>
  );
}

export default RedProductosPage;
