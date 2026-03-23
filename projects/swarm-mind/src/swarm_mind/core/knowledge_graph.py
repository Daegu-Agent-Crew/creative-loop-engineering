"""
Knowledge Graph - Simple graph-based knowledge storage
"""

from pydantic import BaseModel, Field
from typing import Dict, List, Set, Optional, Any
import networkx as nx
from datetime import datetime


class Node(BaseModel):
    """Graph node"""
    id: str
    node_type: str
    properties: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.now)


class Edge(BaseModel):
    """Graph edge"""
    source: str
    target: str
    relation: str
    weight: float = 1.0
    properties: Dict[str, Any] = Field(default_factory=dict)


class KnowledgeGraph:
    """
    Simple NetworkX-based knowledge graph for MVP.
    
    Stores entities, events, and relationships for simulation context.
    """
    
    def __init__(self):
        self.graph = nx.DiGraph()
        self.nodes: Dict[str, Node] = {}
        self.edges: List[Edge] = []
    
    def add_node(self, node: Node) -> None:
        """Add a node to the graph"""
        self.nodes[node.id] = node
        self.graph.add_node(
            node.id,
            node_type=node.node_type,
            **node.properties
        )
    
    def add_edge(self, edge: Edge) -> None:
        """Add an edge to the graph"""
        self.edges.append(edge)
        self.graph.add_edge(
            edge.source,
            edge.target,
            relation=edge.relation,
            weight=edge.weight,
            **edge.properties
        )
    
    def get_node(self, node_id: str) -> Optional[Node]:
        """Get a node by ID"""
        return self.nodes.get(node_id)
    
    def get_neighbors(self, node_id: str) -> List[str]:
        """Get neighbors of a node"""
        return list(self.graph.neighbors(node_id))
    
    def get_related_entities(self, node_id: str, max_depth: int = 2) -> Set[str]:
        """Get all entities related to a node within max_depth"""
        if node_id not in self.graph:
            return set()
        
        related = set()
        for node in nx.single_source_shortest_path_length(
            self.graph, node_id, cutoff=max_depth
        ).keys():
            if node != node_id:
                related.add(node)
        
        return related
    
    def get_context_for_agent(self, agent_id: str, seed_data: Any) -> Dict[str, Any]:
        """Get relevant context for an agent"""
        # Simple context extraction for MVP
        context = {
            "related_entities": [],
            "recent_events": [],
            "domain": getattr(seed_data, "context", {}).get("domain", "general") 
                      if hasattr(seed_data, "context") else "general"
        }
        
        # Get entities related to agent
        if agent_id in self.nodes:
            neighbors = self.get_neighbors(agent_id)
            context["related_entities"] = [
                self.nodes[n].properties.get("name", n)
                for n in neighbors
                if n in self.nodes
            ]
        
        return context
    
    def update_from_simulation(self, events: List[Dict[str, Any]]) -> None:
        """Update graph from simulation events"""
        for event in events:
            # Create event node
            event_node = Node(
                id=f"event_{len(self.nodes)}",
                node_type="event",
                properties=event
            )
            self.add_node(event_node)
            
            # Link to related entities
            if "actor" in event:
                self.add_edge(Edge(
                    source=event["actor"],
                    target=event_node.id,
                    relation="performed"
                ))
    
    def to_dict(self) -> Dict[str, Any]:
        """Export graph to dictionary"""
        return {
            "nodes": [n.model_dump() for n in self.nodes.values()],
            "edges": [e.model_dump() for e in self.edges],
            "stats": {
                "node_count": len(self.nodes),
                "edge_count": len(self.edges)
            }
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "KnowledgeGraph":
        """Import graph from dictionary"""
        kg = cls()
        for node_data in data.get("nodes", []):
            kg.add_node(Node(**node_data))
        for edge_data in data.get("edges", []):
            kg.add_edge(Edge(**edge_data))
        return kg
