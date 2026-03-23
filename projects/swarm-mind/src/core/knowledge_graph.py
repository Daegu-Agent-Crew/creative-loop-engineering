"""Simple knowledge graph using NetworkX."""

from __future__ import annotations

import networkx as nx
from pydantic import BaseModel


class KnowledgeGraph:
    """Lightweight knowledge graph for tracking entities and relationships."""

    def __init__(self):
        self.graph = nx.DiGraph()

    def add_entities(self, entities: list[str]):
        """Add entities as nodes."""
        for entity in entities:
            self.graph.add_node(entity, type="entity")

    def add_relationship(self, source: str, target: str, relation: str):
        """Add a directed relationship between entities."""
        self.graph.add_edge(source, target, relation=relation)

    def add_event(self, event: str, related_entities: list[str]):
        """Add an event node linked to related entities."""
        self.graph.add_node(event, type="event")
        for entity in related_entities:
            if entity in self.graph:
                self.graph.add_edge(event, entity, relation="involves")

    def get_context(self) -> str:
        """Get a text summary of the knowledge graph."""
        if not self.graph.nodes:
            return "No knowledge graph built yet."

        lines = []
        entities = [n for n, d in self.graph.nodes(data=True) if d.get("type") == "entity"]
        events = [n for n, d in self.graph.nodes(data=True) if d.get("type") == "event"]

        if entities:
            lines.append(f"Entities: {', '.join(entities)}")
        if events:
            lines.append(f"Events: {', '.join(events)}")

        edges = []
        for u, v, d in self.graph.edges(data=True):
            edges.append(f"  {u} --[{d.get('relation', 'related')}]--> {v}")
        if edges:
            lines.append("Relationships:")
            lines.extend(edges)

        return "\n".join(lines)

    @property
    def node_count(self) -> int:
        return self.graph.number_of_nodes()

    @property
    def edge_count(self) -> int:
        return self.graph.number_of_edges()
