'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import SoloLevelingProjectCard from './SoloLevelingProjectCard';

interface Repo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  previewImage?: string;
  isVideo?: boolean;
  techStack?: string[];
}

interface RepoNode {
  x: number;
  y: number;
  repo: Repo;
}

declare global {
  interface Window {
    TreePlugin: any;
  }
}

export default function ProjectsTreeVisualization({ repos = [] }: { repos?: Repo[] }) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<any>(null);
  const nodesRef = useRef<RepoNode[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);

  useEffect(() => setMounted(true), []);

  const isDark = mounted ? theme === 'dark' : true;
  const treeColor = isDark ? '#ffffff' : '#000000';

  // Place repos on tree branches
  const placeReposOnTree = (tree: any) => {
    if (!tree || !tree.branches) return;

    const nodes: RepoNode[] = [];
    const shuffled = [...repos].sort(() => Math.random() - 0.5);
    let repoIdx = 0;

    // Collect branch endpoints from depth 3 onwards
    const endpoints: { x: number; y: number }[] = [];
    for (let d = 3; d < tree.branches.length && d < 10; d++) {
      for (const branch of tree.branches[d]) {
        if (Math.random() > 0.6) {
          endpoints.push({ x: branch.endX, y: branch.endY });
        }
      }
    }

    endpoints.sort(() => Math.random() - 0.5);

    // Assign repos to endpoints
    for (const ep of endpoints) {
      if (repoIdx >= shuffled.length) break;
      const repo = shuffled[repoIdx++];
      nodes.push({ x: ep.x, y: ep.y, repo });
    }

    nodesRef.current = nodes;
  };

  // Init tree
  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined' || !mounted) return;

    if (!window.TreePlugin) {
      const script = document.createElement('script');
      script.innerHTML = `!function(){function t(t){if(t=t||{},this.container=t.container||document.body,this.fullDepth=14,this.depth=t.depth||this.fullDepth,this.pixelRatio=window.devicePixelRatio>1?2:1,this.growthSpeed=t.growthSpeed||1,this.treeScale=t.treeScale||1,this.branchWidth=t.branchWidth||1,this.colorMode=t.colorMode||\"solid\",this.color=t.color||\"#000\",this.gradientStart=t.gradientStart||\"#8B4513\",this.gradientEnd=t.gradientEnd||\"#228B22\",this.seed=void 0!==t.seed?Number(t.seed):void 0,void 0!==this.seed){this.randSeq=[];for(var e=this.seed,i=0;i<1e4;i++){var s=((e=16807*e%2147483647)-1)/2147483646;this.randSeq.push(s)}this.randCounter=0}this.canvas=document.createElement(\"canvas\"),this.container.appendChild(this.canvas),this.ctx=this.canvas.getContext(\"2d\"),this.branches=[],this.animation=null,this.currentDepth=0,this.addEventListeners(),this.resize(),this.startTree(this.stageWidth/2,this.stageHeight)}t.prototype.addEventListeners=function(){window.addEventListener(\"resize\",this.resize.bind(this))},t.prototype.resize=function(){this.stageWidth=this.container.clientWidth,this.stageHeight=this.container.clientHeight,this.canvas.width=this.stageWidth*this.pixelRatio,this.canvas.height=this.stageHeight*this.pixelRatio,this.ctx.setTransform(this.pixelRatio,0,0,this.pixelRatio,0,0),this.clearCanvas()},t.prototype.clearCanvas=function(){this.ctx.clearRect(0,0,this.stageWidth,this.stageHeight)},t.prototype.startTree=function(t,e){this.animation&&cancelAnimationFrame(this.animation),this.clearCanvas(),void 0!==this.seed&&(this.randCounter=0),this.branches=[];for(var i=0;i<=this.fullDepth;i++)this.branches.push([]);this.currentDepth=0,this.treeTop=1/0,this.treeX=t,this.treeY=e;var s=this.stageHeight/(10*this.fullDepth);this.treeScale>s&&(this.treeScale=s),this.createBranch(this.treeX,this.treeY,-90,0);for(var h=0;h<=this.fullDepth;h++)for(var r=0;r<this.branches[h].length;r++)this.branches[h][r].cntFrame=0;this.animate()},t.prototype.random=function(t,e){return this.randSeq?t+this.randSeq[this.randCounter++]*(e-t):Math.random()*(e-t)+t},t.prototype.degToRad=function(t){return t*(Math.PI/180)},t.prototype.createBranch=function(t,e,i,s){if(s<this.fullDepth){var h=this.treeScale,r=(0===s?this.random(12,16):this.random(0,13))*h,a=this.fullDepth-s,n=t+Math.cos(this.degToRad(i))*r*a,o=e+Math.sin(this.degToRad(i))*r*a;e<this.treeTop&&(this.treeTop=e),o<this.treeTop&&(this.treeTop=o);var d=this.branchWidth;this.branches[s].push({startX:t,startY:e,endX:n,endY:o,lineWidth:a*d,frame:100,cntFrame:0,gapX:(n-t)/100,gapY:(o-e)/100,plugin:this,draw:function(t,e){if(this.cntFrame<this.frame){t.beginPath();var i=this.cntFrame/this.frame,s=this.startX+(this.endX-this.startX)*i,h=this.startY+(this.endY-this.startY)*i;if(t.moveTo(this.startX,this.startY),t.lineTo(s,h),t.lineWidth=this.lineWidth,\"gradient\"===this.plugin.colorMode){var r=t.createLinearGradient(this.plugin.treeX,this.plugin.treeY,this.plugin.treeX,this.plugin.treeTop);r.addColorStop(0,this.plugin.gradientStart),r.addColorStop(1,this.plugin.gradientEnd),t.strokeStyle=r}else t.strokeStyle=this.plugin.color;return t.stroke(),t.closePath(),this.cntFrame+=e,!1}return!0}}),this.createBranch(n,o,i-this.random(18,28),s+1),this.createBranch(n,o,i+this.random(18,28),s+1)}},t.prototype.animate=function(){this.clearCanvas();for(var t=0;t<this.currentDepth&&t<this.depth&&t<this.branches.length;t++)for(var e=0;e<this.branches[t].length;e++){var i=this.branches[t][e];if(this.ctx.beginPath(),this.ctx.moveTo(i.startX,i.startY),this.ctx.lineTo(i.endX,i.endY),this.ctx.lineWidth=i.lineWidth,\"gradient\"===this.colorMode){var s=this.ctx.createLinearGradient(this.treeX,this.treeY,this.treeX,this.treeTop);s.addColorStop(0,this.gradientStart),s.addColorStop(1,this.gradientEnd),this.ctx.strokeStyle=s}else this.ctx.strokeStyle=this.color;this.ctx.stroke(),this.ctx.closePath()}var h=!1;if(this.currentDepth<this.depth&&this.currentDepth<this.branches.length){for(var r=!0,e=0;e<this.branches[this.currentDepth].length;e++){var i=this.branches[this.currentDepth][e];if(i.cntFrame<i.frame)i.draw(this.ctx,this.growthSpeed),h=!0,r=!1;else{if(this.ctx.beginPath(),this.ctx.moveTo(i.startX,i.startY),this.ctx.lineTo(i.endX,i.endY),this.ctx.lineWidth=i.lineWidth,\"gradient\"===this.colorMode){var s=this.ctx.createLinearGradient(this.treeX,this.treeY,this.treeX,this.treeTop);s.addColorStop(0,this.gradientStart),s.addColorStop(1,this.gradientEnd),this.ctx.strokeStyle=s}else this.ctx.strokeStyle=this.color;this.ctx.stroke(),this.ctx.closePath()}}r&&(this.currentDepth++,h=!0)}h?this.animation=requestAnimationFrame(this.animate.bind(this)):cancelAnimationFrame(this.animation)},window.TreePlugin=t}();`;
      document.head.appendChild(script);
      
      setTimeout(() => {
        if (window.TreePlugin && containerRef.current) initTree();
      }, 100);
    } else {
      initTree();
    }

    function initTree() {
      if (!containerRef.current || !window.TreePlugin) return;
      
      if (treeRef.current) {
        if (treeRef.current.animation) cancelAnimationFrame(treeRef.current.animation);
        if (treeRef.current.canvas && treeRef.current.canvas.parentNode) {
          treeRef.current.canvas.parentNode.removeChild(treeRef.current.canvas);
        }
      }
      
      const depth = Math.min(13, 9 + Math.floor(repos.length / 4));
      
      const tree = new window.TreePlugin({
        container: containerRef.current,
        depth,
        growthSpeed: 2.5,
        treeScale: 0.9,
        branchWidth: 1.5,
        colorMode: 'solid',
        color: treeColor,
        seed: 42,
      });

      treeRef.current = tree;

      setTimeout(() => {
        placeReposOnTree(tree);
      }, 3000);
    }

    return () => {
      if (treeRef.current?.animation) cancelAnimationFrame(treeRef.current.animation);
    };
  }, [repos, mounted, isDark, treeColor]);

  return (
    <div className="relative w-full">
      {/* Tree Background */}
      <div 
        ref={containerRef} 
        className="relative w-full rounded-xl overflow-hidden border border-white/10"
        style={{ 
          height: 700,
          background: isDark ? 'radial-gradient(ellipse at bottom, #0a0a0a 0%, #000000 100%)' : 'radial-gradient(ellipse at bottom, #f0f0f0 0%, #ffffff 100%)'
        }}
      />

      {/* Project Cards Positioned on Tree */}
      <div className="absolute inset-0 pointer-events-none">
        {nodesRef.current.map((node, idx) => (
          <div
            key={node.repo.id}
            className="absolute pointer-events-auto"
            style={{
              left: node.x - 150,
              top: node.y - 100,
              width: 300,
              transform: 'translate(-50%, -50%)',
            }}
            onClick={() => setSelectedRepo(node.repo)}
          >
            <div className="scale-75 hover:scale-90 transition-transform cursor-pointer">
              <SoloLevelingProjectCard repo={node.repo} index={idx} />
            </div>
          </div>
        ))}
      </div>

      {/* Expanded Card Modal */}
      {selectedRepo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setSelectedRepo(null)}
        >
          <div 
            className="max-w-2xl w-full"
            onClick={e => e.stopPropagation()}
          >
            <SoloLevelingProjectCard 
              repo={selectedRepo} 
              index={repos.findIndex(r => r.id === selectedRepo.id)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
