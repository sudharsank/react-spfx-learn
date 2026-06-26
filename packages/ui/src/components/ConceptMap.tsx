'use client';

import { ReactFlow, Background, Controls, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export interface ConceptNode {
  id: string;
  label: string;
  active?: boolean;
  x: number;
  y: number;
}

export interface ConceptEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface ConceptMapProps {
  nodes: ConceptNode[];
  edges: ConceptEdge[];
  height?: number;
}

export function ConceptMap({ nodes, edges, height = 300 }: ConceptMapProps) {
  const flowNodes: Node[] = nodes.map((n) => ({
    id: n.id,
    position: { x: n.x, y: n.y },
    data: { label: n.label },
    style: {
      background: n.active ? 'oklch(0.55 0.22 250)' : '#f1f5f9',
      color: n.active ? '#fff' : '#1e293b',
      border: `2px solid ${n.active ? 'oklch(0.45 0.22 250)' : '#e2e8f0'}`,
      borderRadius: '10px',
      fontSize: '12px',
      fontWeight: n.active ? '700' : '500',
      padding: '8px 14px',
    },
  }));

  const flowEdges: Edge[] = edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    style: { stroke: '#94a3b8', strokeWidth: 1.5 },
    labelStyle: { fontSize: '10px', fill: '#64748b' },
  }));

  return (
    <div className="my-6 rounded-[var(--radius-card)] border border-gray-200 overflow-hidden" style={{ height }}>
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#e2e8f0" gap={20} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
