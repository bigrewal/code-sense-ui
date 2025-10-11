import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, { 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  MarkerType,
  Handle,
  Position
} from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';

// Custom node component with tooltip and handles
const CustomNode = ({ data }) => {
  return (
    <div className="group relative">
      <Handle type="target" position={Position.Top} />
      <div 
        className="px-3 py-2 rounded-lg border-2 text-center transition-all"
        style={{
          background: data.isActive ? '#3b82f6' : data.isHighlighted ? '#fbbf24' : '#fff',
          color: data.isActive ? '#fff' : data.isHighlighted ? '#000' : '#000',
          borderColor: data.isActive ? '#2563eb' : data.isHighlighted ? '#f59e0b' : '#ddd',
          minWidth: '180px',
          boxShadow: data.isHighlighted ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
        }}
      >
        <div className="font-medium text-xs truncate max-w-[160px] mx-auto">
          {data.fileName}
        </div>
        <div className="text-[10px]" style={{ color: data.isActive ? '#dbeafe' : data.isHighlighted ? '#92400e' : '#6b7280' }}>
          Level {data.level}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
      
      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        {data.fullPath}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
};

// Dagre layout configuration
const getLayoutedElements = (nodes, edges) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'TB', ranksep: 100, nodesep: 80 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 180, height: 80 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 90,
        y: nodeWithPosition.y - 40,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export default function PlanVisualization({ plan, currentStep, onNodeClick }) {
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  
  const nodeTypes = useMemo(() => ({
    custom: CustomNode,
  }), []);

  // Create nodes from plan data
  const initialNodes = useMemo(() => {
    if (!plan?.nodes) return [];
    
    return plan.nodes.map((node) => {
      const fileName = node.file_path.split('/').pop();
      const isActive = plan.sequence?.[currentStep - 1]?.file_path === node.file_path;
      const isHighlighted = selectedNodeId === node.file_path;
      
      return {
        id: node.file_path,
        type: 'custom',
        data: { 
          fileName,
          fullPath: node.file_path,
          level: node.level,
          isActive,
          isHighlighted,
        },
        position: { x: 0, y: 0 },
      };
    });
  }, [plan, currentStep, selectedNodeId]);

  // Create edges from plan data with highlighting
  const initialEdges = useMemo(() => {
    if (!plan?.edges) return [];
    
    return plan.edges.map((edge, idx) => {
      const isConnected = selectedNodeId && (edge.from === selectedNodeId || edge.to === selectedNodeId);
      const isIncoming = selectedNodeId && edge.to === selectedNodeId;
      const isOutgoing = selectedNodeId && edge.from === selectedNodeId;
      
      return {
        id: `e${idx}-${edge.from}-${edge.to}`,
        source: edge.from,
        target: edge.to,
        type: 'smoothstep',
        animated: isConnected,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isIncoming ? '#10b981' : isOutgoing ? '#ef4444' : '#94a3b8',
        },
        style: { 
          stroke: isIncoming ? '#10b981' : isOutgoing ? '#ef4444' : '#94a3b8',
          strokeWidth: isConnected ? 3 : 2,
          opacity: selectedNodeId ? (isConnected ? 1 : 0.2) : 1,
        },
        label: isIncoming ? 'incoming' : isOutgoing ? 'outgoing' : undefined,
        labelStyle: { 
          fontSize: 10, 
          fontWeight: 600,
          fill: isIncoming ? '#10b981' : '#ef4444',
        },
        labelBgStyle: { fill: 'white', fillOpacity: 0.8 },
      };
    });
  }, [plan, selectedNodeId]);

  // Apply dagre layout
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    if (initialNodes.length === 0) return { nodes: [], edges: [] };
    return getLayoutedElements(initialNodes, initialEdges);
  }, [initialNodes, initialEdges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  // Update nodes when plan or currentStep changes
  React.useEffect(() => {
    setNodes(layoutedNodes);
  }, [layoutedNodes, setNodes]);

  React.useEffect(() => {
    setEdges(layoutedEdges);
  }, [layoutedEdges, setEdges]);

  const handleNodeClick = useCallback((event, node) => {
    // Toggle selection
    if (selectedNodeId === node.id) {
      setSelectedNodeId(null);
    } else {
      setSelectedNodeId(node.id);
    }
    
    // Still call the original onNodeClick for navigation
    if (onNodeClick) {
      onNodeClick(node.id);
    }
  }, [onNodeClick, selectedNodeId]);

  // Click on background to deselect
  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  return (
    <div className="bg-white px-6 py-4 border-b">
      <div className="grid grid-cols-2 gap-4 h-80">
        {/* Interactive Graph with Hierarchical Layout */}
        <div className="border rounded bg-gray-50 overflow-hidden">
          <div className="text-sm font-medium text-gray-700 p-2 bg-white border-b flex items-center justify-between">
            <span>Dependency Graph</span>
            {selectedNodeId && (
              <button 
                onClick={() => setSelectedNodeId(null)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Clear Selection
              </button>
            )}
          </div>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            <Controls />
            <Background color="#aaa" gap={16} />
          </ReactFlow>
        </div>

        {/* Outline */}
        <div className="border rounded p-4 bg-gray-50 overflow-y-auto">
          <div className="text-sm font-medium text-gray-700 mb-2">Sequence Outline</div>
          <div className="space-y-1">
            {plan?.sequence?.map((item, idx) => (
              <div 
                key={idx}
                className={`text-xs py-1 px-2 rounded cursor-pointer hover:bg-gray-200 transition-colors group relative ${
                  idx === currentStep - 1 ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600'
                }`}
                style={{ paddingLeft: `${item.level * 12 + 8}px` }}
                onClick={() => onNodeClick && onNodeClick(item.file_path)}
                title={item.file_path}
              >
                {idx + 1}. {item.file_path.split('/').pop()} {item.level > 0 && `(level ${item.level})`}
                
                {/* Tooltip for outline items */}
                <div className="absolute left-full ml-2 top-0 px-3 py-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.file_path}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Legend when node is selected */}
      {selectedNodeId && (
        <div className="mt-2 flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-green-500"></div>
            <span className="text-gray-600">Incoming dependencies</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-red-500"></div>
            <span className="text-gray-600">Outgoing dependencies</span>
          </div>
        </div>
      )}
    </div>
  );
}