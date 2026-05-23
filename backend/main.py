from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from collections import defaultdict

app = FastAPI()

# Enable CORS to allow the React development server to talk to the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PipelinePayload(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]

@app.get('/')
def read_root():
    return {'Ping': 'Pong'}

@app.post('/pipelines/parse')
def parse_pipeline(payload: PipelinePayload):
    nodes = payload.nodes
    edges = payload.edges

    num_nodes = len(nodes)
    num_edges = len(edges)

    # 1. Build adjacency list of the directed graph
    adj_list = defaultdict(list)
    for edge in edges:
        source = edge.get('source')
        target = edge.get('target')
        if source and target:
            adj_list[source].append(target)

    # 2. DFS cycle-finding validation for Directed Acyclic Graph (DAG) status
    # States: 0 = Unvisited, 1 = Visiting, 2 = Visited
    visited = {node.get('id'): 0 for node in nodes if node.get('id')}

    def has_cycle(u: str) -> bool:
        visited[u] = 1  # mark node as visiting (added to recursion stack)
        
        # Check all outgoing connections
        for v in adj_list[u]:
            # If neighbor is currently visiting, there's a back-edge (loop/cycle)
            if visited.get(v, 0) == 1:
                return True
            # If neighbor is unvisited, traverse it recursively
            elif visited.get(v, 0) == 0:
                # Ensure the neighbor node is in our graph (prevent cycles involving deleted nodes)
                if v in visited:
                    if has_cycle(v):
                        return True
                        
        visited[u] = 2  # mark node as fully visited (removed from recursion stack)
        return False

    is_dag = True
    for node in nodes:
        node_id = node.get('id')
        if node_id and visited.get(node_id, 0) == 0:
            if has_cycle(node_id):
                is_dag = False
                break

    return {
        'num_nodes': num_nodes,
        'num_edges': num_edges,
        'is_dag': is_dag
    }
