import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '/components/Header.jsx';
import { loadManifest, parseMetadata, IMAGES_BASE_FOLDER } from '/utils/productUtils.js';

const PRODUCT_R = 68;
const CATEGORY_R = 40;
const SPRING_LEN = 220;
const SPRING_K = 0.008;
const REPULSION = 18000;
const DAMPING = 0.92;
const COGNAC = '#7A4F48';

function RedProductosPage() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const nodesRef = useRef([]);
  const edgesRef = useRef([]);
  const velsRef = useRef([]);
  const imagesRef = useRef({});
  const animRef = useRef(null);
  const dragRef = useRef(null);
  const hoveredRef = useRef(-1);
  const panRef = useRef({ x: 0, y: 0, isPanning: false, startX: 0, startY: 0, startPanX: 0, startPanY: 0 });
  const zoomRef = useRef(1);
  const [categories, setCategories] = useState([]);
  const [isMenuActive, setIsMenuActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';

  // ── Load data ──
  useEffect(() => {
    async function load() {
      const manifest = await loadManifest();
      const catKeys = Object.keys(manifest);
      setCategories(catKeys);

      // Large world size - not limited to screen
      const totalProducts = Object.values(manifest).reduce((s, arr) => s + arr.length, 0);
      const WORLD_W = Math.max(2400, Math.sqrt(totalProducts) * 300);
      const WORLD_H = Math.max(1800, Math.sqrt(totalProducts) * 250);
      const cx = WORLD_W / 2, cy = WORLD_H / 2;

      const allNodes = [];
      const allEdges = [];

      const CATEGORY_COLORS = [
        '#7A4F48', '#5C7A8A', '#6B7A5C', '#8A6B5C',
        '#5C6B8A', '#7A6B5C', '#5C8A7A', '#8A7A5C',
      ];

      const n = catKeys.length;
      const cols = Math.ceil(Math.sqrt(n * (WORLD_W / WORLD_H)));
      const rows = Math.ceil(n / cols);
      const pad = CATEGORY_R + 200;
      const cellW = (WORLD_W - pad * 2) / cols;
      const cellH = (WORLD_H - pad * 2) / rows;
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
          x: catX, y: catY,
          radius: CATEGORY_R,
          color,
          pinned: true,
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

        const toCenterAngle = Math.atan2(cy - catY, cx - catX);

        metaResults.forEach((prod) => {
          const pi = prod.fi;
          const spreadAngle = toCenterAngle + (pi - (folders.length - 1) / 2) * 0.38;
          const dist = 250 + (pi % 3) * 40;
          const images = Array.isArray(prod.meta.images) && prod.meta.images.length
            ? prod.meta.images : ['hero.jpg'];
          const firstImage = images[Math.floor(Math.random() * images.length)];

          const prodNode = {
            id: `${cat}/${prod.folder}`,
            type: 'product',
            label: prod.meta.title || prod.folder,
            category: cat,
            folder: prod.folder,
            x: catX + Math.cos(spreadAngle) * dist,
            y: catY + Math.sin(spreadAngle) * dist,
            radius: PRODUCT_R,
            color,
            image: `/${IMAGES_BASE_FOLDER}/${cat}/${prod.folder}/${firstImage}`,
            pinned: false,
          };
          allNodes.push(prodNode);
          allEdges.push({ source: catNode.id, target: prodNode.id });

          const img = new Image();
          img.src = prodNode.image;
          imagesRef.current[prodNode.id] = img;
        });
      }

      nodesRef.current = allNodes;
      edgesRef.current = allEdges;
      velsRef.current = allNodes.map(() => ({ vx: 0, vy: 0 }));

      // Center pan on the world
      const vw = window.innerWidth;
      const vh = window.innerHeight - 70;
      panRef.current.x = (vw - WORLD_W) / 2;
      panRef.current.y = (vh - WORLD_H) / 2;

      // Pre-stabilize physics (run simulation without rendering)
      for (let step = 0; step < 200; step++) {
        const nodes = nodesRef.current;
        const vels = velsRef.current;
        const edges = edgesRef.current;
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].pinned || nodes[i].type === 'category') continue;
          let fx = 0, fy = 0;
          for (let j = 0; j < nodes.length; j++) {
            if (i === j || nodes[j].type === 'category') continue;
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
          nodes[i].x += vels[i].vx;
          nodes[i].y += vels[i].vy;
        }
      }

      // Wait for all images to load
      const imagePromises = Object.values(imagesRef.current).map(img =>
        new Promise(resolve => {
          if (img.complete) return resolve();
          img.onload = resolve;
          img.onerror = resolve;
        })
      );
      await Promise.all(imagePromises);

      setLoading(false);
    }
    load();
  }, []);

  // ── Canvas size ──
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

  // ── Draw + simulate ──
  useEffect(() => {
    if (loading) return;

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const W = canvas.width, H = canvas.height;
      const nodes = nodesRef.current;
      const edges = edgesRef.current;
      const pan = panRef.current;
      const zoom = zoomRef.current;
      const dark = isDark();

      // Background
      ctx.fillStyle = dark ? '#1a1a1a' : '#FAFAF9';
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      // Dot grid
      const dotColor = dark ? 'rgba(122,79,72,0.15)' : 'rgba(122,79,72,0.1)';
      ctx.fillStyle = dotColor;
      const startX = Math.floor(-pan.x / zoom / 40) * 40;
      const startY = Math.floor(-pan.y / zoom / 40) * 40;
      const endX = startX + W / zoom + 80;
      const endY = startY + H / zoom + 80;
      for (let x = startX; x < endX; x += 40) {
        for (let y = startY; y < endY; y += 40) {
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
        ctx.strokeStyle = dark ? 'rgba(122,79,72,0.25)' : 'rgba(122,79,72,0.18)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Nodes - draw hovered last so it's on top
      const hovered = hoveredRef.current;
      const drawOrder = nodes.map((_, i) => i);
      if (hovered >= 0) {
        const idx = drawOrder.indexOf(hovered);
        if (idx >= 0) {
          drawOrder.splice(idx, 1);
          drawOrder.push(hovered);
        }
      }

      drawOrder.forEach(ni => {
        const node = nodes[ni];
        const isDragging = dragRef.current?.index === ni;
        const isHovered = hovered === ni && !isDragging;
        const scale = isDragging ? 1.05 : isHovered ? 1.15 : 1;
        const r = node.radius * scale;
        ctx.save();

        if (node.type === 'product') {
          ctx.shadowColor = dark
            ? (isHovered ? 'rgba(122,79,72,0.5)' : 'rgba(0,0,0,0.3)')
            : (isHovered ? 'rgba(122,79,72,0.3)' : 'rgba(0,0,0,0.1)');
          ctx.shadowBlur = isHovered ? 22 : 6;
          ctx.shadowOffsetY = isHovered ? 4 : 2;

          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
          ctx.clip();

          const img = imagesRef.current[node.id];
          if (img?.complete && img.naturalWidth > 0) {
            const iw = img.naturalWidth, ih = img.naturalHeight;
            const s = Math.max(r * 2 / iw, r * 2 / ih);
            const sw = r * 2 / s, sh = r * 2 / s;
            const sx = (iw - sw) / 2, sy = (ih - sh) / 2;
            ctx.drawImage(img, sx, sy, sw, sh, node.x - r, node.y - r, r * 2, r * 2);
          } else {
            ctx.fillStyle = dark ? '#333' : '#E8E0DC';
            ctx.fill();
          }

          ctx.restore();
          ctx.save();

          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
          ctx.strokeStyle = isHovered ? COGNAC : (dark ? 'rgba(122,79,72,0.5)' : 'rgba(122,79,72,0.35)');
          ctx.lineWidth = isHovered ? 3 : 1.5;
          ctx.stroke();

          // Label only on hover
          if (isHovered) {
            ctx.restore();
            ctx.save();
            ctx.font = '500 12px Inter, sans-serif';
            ctx.textAlign = 'center';
            const textY = node.y + r + 15;
            // Background pill behind text
            const textW = ctx.measureText(node.label).width + 16;
            ctx.fillStyle = dark ? 'rgba(30,30,30,0.9)' : 'rgba(255,255,255,0.92)';
            ctx.beginPath();
            ctx.roundRect(node.x - textW / 2, textY - 10, textW, 20, 10);
            ctx.fill();
            ctx.strokeStyle = dark ? 'rgba(122,79,72,0.4)' : 'rgba(122,79,72,0.25)';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.fillStyle = dark ? '#eee' : '#2D2D2D';
            ctx.fillText(node.label, node.x, textY + 4);
          }

        } else {
          ctx.shadowColor = dark ? 'rgba(122,79,72,0.3)' : 'rgba(122,79,72,0.2)';
          ctx.shadowBlur = 10;

          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
          ctx.fillStyle = dark ? '#2a2a2a' : '#FFFFFF';
          ctx.fill();
          ctx.strokeStyle = COGNAC;
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.restore();
          ctx.save();

          ctx.font = '600 15px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = COGNAC;
          ctx.fillText(node.label.substring(0, 3).toUpperCase(), node.x, node.y);

          // Category label always visible
          ctx.restore();
          ctx.save();
          ctx.font = '700 13px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = COGNAC;
          ctx.fillText(node.label, node.x, node.y + r + 16);
        }

        ctx.restore();
      });

      ctx.restore();
    };

    const simulate = () => {
      const nodes = nodesRef.current;
      const vels = velsRef.current;
      const edges = edgesRef.current;

      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].pinned || nodes[i].type === 'category') continue;

        let fx = 0, fy = 0;

        for (let j = 0; j < nodes.length; j++) {
          if (i === j || nodes[j].type === 'category') continue;
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
        nodes[i].x += vels[i].vx;
        nodes[i].y += vels[i].vy;
      }

      draw();
      animRef.current = requestAnimationFrame(simulate);
    };

    animRef.current = requestAnimationFrame(simulate);
    return () => cancelAnimationFrame(animRef.current);
  }, [loading]);

  // ── Convert screen coords to world coords ──
  const screenToWorld = (sx, sy) => {
    const pan = panRef.current;
    const zoom = zoomRef.current;
    return { x: (sx - pan.x) / zoom, y: (sy - pan.y) / zoom };
  };

  const hitTest = (wx, wy) => {
    const nodes = nodesRef.current;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const dx = wx - nodes[i].x;
      const dy = wy - nodes[i].y;
      if (dx * dx + dy * dy <= nodes[i].radius * nodes[i].radius) return i;
    }
    return -1;
  };

  const getCanvasPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  };

  // ── Pointer events ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onDown = (e) => {
      const { x, y } = getCanvasPos(e);
      const { x: wx, y: wy } = screenToWorld(x, y);
      const idx = hitTest(wx, wy);

      if (idx >= 0) {
        e.preventDefault();
        nodesRef.current[idx].pinned = true;
        velsRef.current[idx] = { vx: 0, vy: 0 };
        dragRef.current = { index: idx, startX: x, startY: y, moved: false };
      } else {
        // Start panning
        panRef.current.isPanning = true;
        panRef.current.startX = x;
        panRef.current.startY = y;
        panRef.current.startPanX = panRef.current.x;
        panRef.current.startPanY = panRef.current.y;
      }
    };

    const onMove = (e) => {
      const { x, y } = getCanvasPos(e);

      if (dragRef.current) {
        const { index, startX, startY } = dragRef.current;
        if (!dragRef.current.moved && (Math.abs(x - startX) > 4 || Math.abs(y - startY) > 4)) {
          dragRef.current.moved = true;
        }
        const { x: wx, y: wy } = screenToWorld(x, y);
        nodesRef.current[index].x = wx;
        nodesRef.current[index].y = wy;
      } else if (panRef.current.isPanning) {
        e.preventDefault();
        const dx = x - panRef.current.startX;
        const dy = y - panRef.current.startY;
        panRef.current.x = panRef.current.startPanX + dx;
        panRef.current.y = panRef.current.startPanY + dy;
        canvas.style.cursor = 'grabbing';
      } else {
        const { x: wx, y: wy } = screenToWorld(x, y);
        hoveredRef.current = hitTest(wx, wy);
        canvas.style.cursor = hoveredRef.current >= 0 ? 'pointer' : 'grab';
      }
    };

    const onUp = () => {
      if (dragRef.current) {
        const { index, moved } = dragRef.current;
        nodesRef.current[index].pinned = nodesRef.current[index].type === 'category';
        if (!moved) {
          const node = nodesRef.current[index];
          if (node.type === 'product') {
            navigate(`/producto/${encodeURIComponent(node.category)}/${encodeURIComponent(node.folder)}`);
          }
        }
        dragRef.current = null;
      }
      if (panRef.current.isPanning) {
        panRef.current.isPanning = false;
        canvas.style.cursor = 'grab';
      }
    };

    const onWheel = (e) => {
      e.preventDefault();
      const { x, y } = getCanvasPos(e);
      const oldZoom = zoomRef.current;
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.3, Math.min(3, oldZoom * delta));

      // Zoom toward cursor
      panRef.current.x = x - (x - panRef.current.x) * (newZoom / oldZoom);
      panRef.current.y = y - (y - panRef.current.y) * (newZoom / oldZoom);
      zoomRef.current = newZoom;
    };

    // Touch pinch zoom
    let lastPinchDist = 0;
    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastPinchDist = Math.sqrt(dx * dx + dy * dy);
      } else {
        onDown(e);
      }
    };

    const onTouchMove = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (lastPinchDist > 0) {
          const scale = dist / lastPinchDist;
          const rect = canvas.getBoundingClientRect();
          const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
          const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
          const oldZoom = zoomRef.current;
          const newZoom = Math.max(0.3, Math.min(3, oldZoom * scale));
          panRef.current.x = cx - (cx - panRef.current.x) * (newZoom / oldZoom);
          panRef.current.y = cy - (cy - panRef.current.y) * (newZoom / oldZoom);
          zoomRef.current = newZoom;
        }
        lastPinchDist = dist;
      } else {
        onMove(e);
      }
    };

    const onTouchEnd = (e) => {
      lastPinchDist = 0;
      if (e.touches.length === 0) onUp();
    };

    canvas.addEventListener('mousedown', onDown);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      canvas.removeEventListener('mousedown', onDown);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('wheel', onWheel);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
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
