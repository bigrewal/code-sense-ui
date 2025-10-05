import React, { useCallback, useMemo } from 'react';
import ReactFlow, { 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  MarkerType 
} from 'reactflow';
import 'reactflow/dist/style.css';

export default function PlanVisualization({ plan, currentStep, onNodeClick }) {
  // Create nodes from plan data
  const initialNodes = useMemo(() => {
    if (!plan?.nodes) return [];
    
    return plan.nodes.map((node, idx) => {
      const fileName = node.file_path.split('/').pop();
      const isActive = plan.sequence?.[currentStep - 1]?.file_path === node.file_path;
      
      return {
        id: node.file_path,
        data: { 
          label: (
            <div className="text-center">
              <div className="font-medium text-xs">{fileName}</div>
              <div className="text-[10px] text-gray-500">Level {node.level}</div>
            </div>
          )
        },
        position: { x: node.level * 250, y: idx * 80 },
        style: {
          background: isActive ? '#3b82f6' : '#fff',
          color: isActive ? '#fff' : '#000',
          border: isActive ? '2px solid #2563eb' : '1px solid #ddd',
          borderRadius: '8px',
          padding: '10px',
          fontSize: '12px',
          width: 180,
        },
      };
    });
  }, [plan, currentStep]);

  // Create edges from plan data
  const initialEdges = useMemo(() => {
    if (!plan?.edges) return [];
    
    return plan.edges.map((edge, idx) => ({
      id: `e${idx}-${edge.from}-${edge.to}`,
      source: edge.from,
      target: edge.to,
      type: 'smoothstep',
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      style: { stroke: '#94a3b8' },
    }));
  }, [plan]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when plan or currentStep changes
  React.useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  React.useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const handleNodeClick = useCallback((event, node) => {
    if (onNodeClick) {
      onNodeClick(node.id);
    }
  }, [onNodeClick]);

  return (
    <div className="bg-white px-6 py-4 border-b">
      <div className="grid grid-cols-2 gap-4 h-80">
        {/* Interactive Graph */}
        <div className="border rounded bg-gray-50 overflow-hidden">
          <div className="text-sm font-medium text-gray-700 p-2 bg-white border-b">
            Dependency Graph
          </div>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
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
                className={`text-xs py-1 px-2 rounded cursor-pointer hover:bg-gray-200 transition-colors ${
                  idx === currentStep - 1 ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600'
                }`}
                style={{ paddingLeft: `${item.level * 12 + 8}px` }}
                onClick={() => onNodeClick && onNodeClick(item.file_path)}
              >
                {idx + 1}. {item.file_path.split('/').pop()} {item.level > 0 && `(level ${item.level})`}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}