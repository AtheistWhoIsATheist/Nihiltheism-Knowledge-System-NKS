import { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { usePKMStore } from '@/src/store/pkmStore';
import { X } from 'lucide-react';

export function KnowledgeGraph({ onClose }: { onClose: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const { documents, connections } = usePKMStore();

  const [stats, setStats] = useState({ nodes: 0, links: 0, time: '0:00' });
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const startTime = useMemo(() => Date.now(), []);

  // Use the PKM store data or fallback to mock data if empty
  const rawNodes = useMemo(() => {
    if (documents.length > 0) {
      return documents.map(d => {
        let cat = 'general';
        if (d.detectedConcepts.some(c => c.toLowerCase().includes('void') || c.toLowerCase().includes('apophatic'))) cat = 'pillar';
        else if (d.detectedConcepts.some(c => c.toLowerCase().includes('nihil'))) cat = 'nihilist';
        else if (d.detectedConcepts.some(c => c.toLowerCase().includes('mystic'))) cat = 'mystic';
        
        return {
          id: d.id,
          label: d.title.substring(0, 20) + (d.title.length > 20 ? '...' : ''),
          cat,
          echo: d.detectedConcepts[0] || 'Unknown',
          desc: d.summary || d.content.substring(0, 150) + '...'
        };
      });
    }

    // Fallback to the requested seeded data if documents are somehow empty
    return [
      { id: "nihiltheism", label: "Nihiltheism", cat: "pillar", echo: "Transcendent Echo", desc: "The Nothingness is not a problem to solve but a disclosure..." },
      { id: "sacred-dread", label: "Sacred Dread", cat: "pillar", echo: "Numinous Core", desc: "The numinous fear that accompanies the dissolution of meaning..." },
      { id: "apophatic-void", label: "Apophatic Void", cat: "pillar", echo: "Negative Theology", desc: "Via negativa: what cannot be said about God is more real..." },
      { id: "nietzsche", label: "Nietzsche", cat: "nihilist", echo: "God is Dead", desc: "The death of God means not that God does not exist..." },
      { id: "heidegger", label: "Heidegger", cat: "nihilist", echo: "Being-toward", desc: "Dasein as being-toward-death; the nothing as the uncanny..." },
      { id: "爱克哈特", label: "Meister Eckhart", cat: "mystic", echo: "Godhead", desc: "The Godhead is beyond God..." },
      { id: "虚无主义", label: "Nihilism", cat: "general", echo: "Nothing", desc: "The belief that life lacks meaning..." },
    ];
  }, [documents]);

  const rawLinks = useMemo(() => {
    if (connections.length > 0) {
      return connections.map(c => ({
        source: c.sourceId,
        target: c.targetId,
        strength: 0.8
      })).filter(l => rawNodes.some(n => n.id === l.source) && rawNodes.some(n => n.id === l.target));
    }

    return [
      { source: "nihiltheism", target: "sacred-dread", strength: 0.9 },
      { source: "nihiltheism", target: "apophatic-void", strength: 0.9 },
      { source: "sacred-dread", target: "heidegger", strength: 0.7 },
      { source: "apophatic-void", target: "爱克哈特", strength: 0.8 },
      { source: "nietzsche", target: "heidegger", strength: 0.8 },
      { source: "nietzsche", target: "虚无主义", strength: 0.85 },
    ];
  }, [connections, rawNodes]);

  useEffect(() => {
    if (!canvasRef.current || !svgRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = containerRef.current.clientWidth;
    let H = containerRef.current.clientHeight;
    let stars: any[] = [];
    let animationFrameId: number;

    const resizeStarfield = () => {
      if (!containerRef.current) return;
      W = canvas.width = containerRef.current.clientWidth;
      H = canvas.height = containerRef.current.clientHeight;
      stars = Array.from({ length: 220 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.4 + 0.2,
        baseAlpha: Math.random() * 0.6 + 0.15,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.4 + 0.1,
      }));
    };

    const drawStarfield = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      stars.forEach(s => {
        const alpha = s.baseAlpha + 0.12 * Math.sin(t * 0.0008 * s.speed + s.phase);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 190, 230, ${Math.max(0, Math.min(1, alpha))})`;
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(drawStarfield);
    };

    resizeStarfield();
    window.addEventListener('resize', resizeStarfield);
    animationFrameId = requestAnimationFrame(drawStarfield);

    // --- D3 Graph ---
    const svg = d3.select(svgRef.current);
    svg.selectAll('.links, .auras, .nodes, .labels').remove(); // Clear previous

    let driftOn = true;
    let pulseOn = true;
    let warpLevel = 0;

    const nodes = rawNodes.map(d => ({ ...d, x: Math.random() * W, y: Math.random() * H } as any));
    const links = rawLinks.map(d => ({ ...d } as any));

    nodes.forEach(n => {
      n.driftPhase = Math.random() * Math.PI * 2;
      n.driftFreqX = 0.00035 + Math.random() * 0.00025;
      n.driftFreqY = 0.00028 + Math.random() * 0.0002;
      n.driftAmpX = 14 + Math.random() * 10;
      n.driftAmpY = 10 + Math.random() * 8;
      n.pulsePhase = Math.random() * Math.PI * 2;
      n.pulseFreq = 0.0008 + Math.random() * 0.0005;
      n.pulseAmp = 4 + Math.random() * 3;
    });

    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(110).strength((d: any) => d.strength * 0.6))
      .force('charge', d3.forceManyBody().strength(-320).distanceMax(400))
      .force('center', d3.forceCenter(W / 2, H / 2).strength(0.04))
      .force('collide', d3.forceCollide(38))
      .alphaDecay(0.025)
      .velocityDecay(0.4);

    const nodeGradId = (cat: string) => `nodeGrad-${cat}`;

    const linkSel = svg.append('g').attr('class', 'links')
      .selectAll('line').data(links).join('line')
      .attr('stroke', 'url(#linkGrad)')
      .attr('stroke-opacity', 0.35)
      .attr('stroke-width', 1.2);

    const auraCols: Record<string, string> = {
      pillar: 'rgba(155, 64, 224, 0.12)',
      nihilist: 'rgba(0, 184, 160, 0.10)',
      mystic: 'rgba(208, 64, 160, 0.10)',
      general: 'rgba(96, 112, 192, 0.08)',
    };

    const auraSel = svg.append('g').attr('class', 'auras')
      .selectAll('circle').data(nodes).join('circle')
      .attr('class', 'node-aura pointer-events-none')
      .attr('r', 26)
      .attr('fill', d => auraCols[d.cat] || auraCols.general)
      .attr('filter', 'url(#aura-filter)');

    const strokeCols: Record<string, string> = {
      pillar: 'rgba(200,160,255,0.5)',
      nihilist: 'rgba(0,255,200,0.4)',
      mystic: 'rgba(255,160,220,0.4)',
      general: 'rgba(160,170,255,0.35)'
    };

    const nodeSel = svg.append('g').attr('class', 'nodes')
      .selectAll('circle').data(nodes).join('circle')
      .attr('class', 'node cursor-pointer transition-all duration-300 hover:brightness-150')
      .attr('r', d => d.cat === 'pillar' ? 16 : d.cat === 'nihilist' ? 12 : d.cat === 'mystic' ? 13 : 10)
      .attr('fill', d => `url(#${nodeGradId(d.cat)})`)
      .attr('stroke', d => strokeCols[d.cat] || strokeCols.general)
      .attr('stroke-width', 1.2)
      .call(
        d3.drag<SVGCircleElement, any>()
          .on('start', (event, d) => {
            if (!event.active) sim.alphaTarget(0.3).restart();
            d.fx = d.x; d.fy = d.y;
          })
          .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
          .on('end', (event, d) => {
            if (!event.active) sim.alphaTarget(0);
            d.fx = null; d.fy = null;
          })
      )
      .on('click', (event, d) => setSelectedNode(d));

    const labelSel = svg.append('g').attr('class', 'labels pointer-events-none')
      .selectAll('text').data(nodes).join('text')
      .attr('class', 'node-label text-[9px] font-mono fill-muted-foreground tracking-wider uppercase text-center')
      .attr('text-anchor', 'middle')
      .text(d => d.label)
      .attr('dy', d => (d.cat === 'pillar' ? 28 : d.cat === 'nihilist' ? 23 : d.cat === 'mystic' ? 24 : 20));

    sim.on('tick', () => {
      const t = Date.now();

      linkSel
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      nodeSel
        .attr('cx', d => {
          const bx = d.x;
          return driftOn ? bx + Math.sin(t * d.driftFreqX + d.driftPhase) * d.driftAmpX : bx;
        })
        .attr('cy', d => {
          const by = d.y;
          const warp = warpLevel * 18;
          return driftOn ? by + Math.cos(t * d.driftFreqY + d.driftPhase * 1.4) * d.driftAmpY + warp : by;
        })
        .attr('r', d => {
          if (!pulseOn) return d.cat === 'pillar' ? 16 : d.cat === 'nihilist' ? 12 : d.cat === 'mystic' ? 13 : 10;
          const base = d.cat === 'pillar' ? 16 : d.cat === 'nihilist' ? 12 : d.cat === 'mystic' ? 13 : 10;
          return base + Math.sin(t * d.pulseFreq + d.pulsePhase) * d.pulseAmp;
        });

      auraSel
        .attr('cx', d => {
          const bx = d.x;
          return driftOn ? bx + Math.sin(t * d.driftFreqX + d.driftPhase) * d.driftAmpX : bx;
        })
        .attr('cy', d => {
          const by = d.y;
          const warp = warpLevel * 18;
          return driftOn ? by + Math.cos(t * d.driftFreqY + d.driftPhase * 1.4) * d.driftAmpY + warp : by;
        });

      labelSel
        .attr('x', d => {
          const bx = d.x;
          return driftOn ? bx + Math.sin(t * d.driftFreqX + d.driftPhase) * d.driftAmpX : bx;
        })
        .attr('y', d => {
          const by = d.y;
          const warp = warpLevel * 18;
          return driftOn ? by + Math.cos(t * d.driftFreqY + d.driftPhase * 1.4) * d.driftAmpY + warp : by;
        });

      // Avoid React state updates to prevent re-renders on every tick (60fps)
      // Just update DOM directly for these high-freq fields
      const sNodes = document.getElementById('kg-s-nodes');
      const sLinks = document.getElementById('kg-s-links');
      const sTime = document.getElementById('kg-s-time');
      if (sNodes) sNodes.textContent = nodes.length.toString();
      if (sLinks) sLinks.textContent = links.length.toString();
      if (sTime) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        sTime.textContent = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`;
      }
    });

    const handleGraphResize = () => {
      if (!containerRef.current) return;
      svg.attr('viewBox', `0 0 ${containerRef.current.clientWidth} ${containerRef.current.clientHeight}`);
      sim.force('center', d3.forceCenter(containerRef.current.clientWidth / 2, containerRef.current.clientHeight / 2).strength(0.04));
      sim.alpha(0.3).restart();
    };
    window.addEventListener('resize', handleGraphResize);
    
    // Auto-warp interval
    let warpTid: ReturnType<typeof setInterval> | null = null;
    const btnWarp = document.getElementById('btn-warp');
    const warpHandler = () => {
      if (warpTid) return;
      warpTid = setInterval(() => {
        warpLevel = Math.min(warpLevel + 0.08, 2.5);
        setTimeout(() => {
          if (warpTid) clearInterval(warpTid);
          warpTid = null;
          const down = setInterval(() => {
            warpLevel = Math.max(warpLevel - 0.08, 0);
            if (warpLevel <= 0) { warpLevel = 0; clearInterval(down); }
          }, 40);
        }, 1500);
      }, 40);
    };
    btnWarp?.addEventListener('click', warpHandler);

    return () => {
      sim.stop();
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeStarfield);
      window.removeEventListener('resize', handleGraphResize);
      btnWarp?.removeEventListener('click', warpHandler);
    };
  }, [rawNodes, rawLinks]);

  return (
    <div className="fixed inset-0 z-50 bg-[#05050a] text-[#c8c0d8] font-mono overflow-hidden flex" ref={containerRef}>
      <canvas id="starfield" ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />
      
      <svg id="graph" ref={svgRef} className="absolute inset-0 z-10 w-full h-full block">
        <defs>
          <radialGradient id="nodeGrad-pillar" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#e8c0ff" stopOpacity="1" />
            <stop offset="60%" stopColor="#9b40e0" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#4a1080" stopOpacity="0.6" />
          </radialGradient>
          <radialGradient id="nodeGrad-nihilist" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#a0ffe8" stopOpacity="1" />
            <stop offset="60%" stopColor="#00b8a0" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#003d35" stopOpacity="0.6" />
          </radialGradient>
          <radialGradient id="nodeGrad-mystic" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#ffc0e8" stopOpacity="1" />
            <stop offset="60%" stopColor="#d040a0" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#500030" stopOpacity="0.6" />
          </radialGradient>
          <radialGradient id="nodeGrad-general" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#c8d0ff" stopOpacity="1" />
            <stop offset="60%" stopColor="#6070c0" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#1a1a50" stopOpacity="0.6" />
          </radialGradient>
          <filter id="aura-filter" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="linkGrad" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(180,100,255,0.6)" />
            <stop offset="50%" stopColor="rgba(0,200,255,0.4)" />
            <stop offset="100%" stopColor="rgba(255,120,180,0.3)" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute inset-0 z-20 pointer-events-none p-6 md:p-8 flex flex-col justify-between">
         <div className="flex justify-between items-start pointer-events-auto bg-[#080610]/70 border border-[#b464ff]/20 backdrop-blur-md rounded-md p-4 md:p-5">
           <div>
             <div className="text-[11px] font-bold tracking-[4px] text-[#b464ff] drop-shadow-[0_0_18px_rgba(180,100,255,0.5)]">
               NIHILTHEISM
             </div>
             <div className="font-serif italic font-light text-[13px] text-[#5a5468] mt-1 tracking-wide">
               Cosmic Void Resonance — Knowledge Graph
             </div>
           </div>
           <div className="flex gap-2.5 items-center">
             <button id="btn-warp" className="bg-transparent border border-[#00c8ff]/30 text-[#00c8ff]/70 font-mono text-[9px] tracking-widest uppercase px-3.5 py-1.5 cursor-pointer transition-all hover:bg-[#00c8ff]/10 hover:border-[#00c8ff]/80 hover:text-[#00c8ff] hover:shadow-[0_0_14px_rgba(0,200,255,0.3)]">
               warp field
             </button>
             <button className="bg-transparent border border-destructive/30 text-destructive/70 font-mono text-[9px] tracking-widest uppercase px-3.5 py-1.5 cursor-pointer transition-all hover:bg-destructive/10 hover:border-destructive hover:text-destructive flex items-center" onClick={onClose}>
               <X className="w-3 h-3 mr-1" /> Close
             </button>
           </div>
         </div>

         <div className="flex flex-col md:flex-row justify-between items-end pointer-events-auto bg-[#080610]/70 border border-[#b464ff]/20 backdrop-blur-md rounded-md p-4 md:p-5 gap-4">
            <div className="text-[9px] text-[#5a5468] tracking-widest leading-loose">
              nodes: <span id="kg-s-nodes" className="text-[#00c8ff]/70">—</span> &nbsp;|&nbsp;
              links: <span id="kg-s-links" className="text-[#00c8ff]/70">—</span> &nbsp;|&nbsp;
              time: <span id="kg-s-time" className="text-[#00c8ff]/70">0:00</span>
            </div>
            <div className="flex flex-wrap gap-4 text-[9px] tracking-widest">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full shadow-[0_0_6px_currentColor] bg-[#9b40e0] text-[#9b40e0]" /> Pillar</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full shadow-[0_0_6px_currentColor] bg-[#00b8a0] text-[#00b8a0]" /> Nihilist</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full shadow-[0_0_6px_currentColor] bg-[#d040a0] text-[#d040a0]" /> Mystic</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full shadow-[0_0_6px_currentColor] bg-[#6070c0] text-[#6070c0]" /> General</div>
            </div>
         </div>
      </div>

      {selectedNode && (
        <div className="absolute top-[100px] right-8 w-72 z-30 bg-[#06050e]/95 border border-[#b464ff]/30 backdrop-blur-xl rounded-md p-5 pointer-events-auto animate-in fade-in slide-in-from-right-4 duration-300">
           <button className="absolute top-3 right-3 text-[#5a5468] hover:text-[#c8c0d8]" onClick={() => setSelectedNode(null)}>
             <X className="w-4 h-4" />
           </button>
           <h2 className="font-serif font-light text-lg text-[#b464ff]/90 mb-1 tracking-wide">{selectedNode.label}</h2>
           <div className="text-[9px] tracking-[3px] uppercase text-[#00c8ff]/60 mb-3.5">
             {selectedNode.cat} — {selectedNode.echo}
           </div>
           <div className="font-serif italic font-light text-sm leading-relaxed text-[#c8c0d8]">
             {selectedNode.desc}
           </div>
           <div className="inline-block mt-3 text-[8px] tracking-widest uppercase px-2 py-1 rounded-sm bg-[#b464ff]/10 border border-[#b464ff]/30 text-[#b464ff]/70">
             ⟨ {selectedNode.echo} ⟩
           </div>
        </div>
      )}
    </div>
  );
}
