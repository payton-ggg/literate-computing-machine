import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import * as d3 from "d3";
import type { GraphNode, GraphLink } from "../types/graph.types";

interface UseGraphSimulationProps {
  nodes: GraphNode[];
  links: GraphLink[];
  linkDistance: number;
  chargeStrengthAbs: number;
  searchQuery: string;
  autoCollapseEnabled: boolean;
  onNodeHover: (
    event: MouseEvent,
    node: GraphNode,
    show: boolean,
    x: number,
    y: number
  ) => void;
  onShowInsightPanel: (node: GraphNode) => void;
  onOpenGroupPanel: (node: GraphNode) => void;
  onOpenCastdevPanel: (node: GraphNode) => void;
  onCloseSidePanel: () => void;
}

export function useGraphSimulation({
  nodes: initialNodes,
  links: initialLinks,
  linkDistance,
  chargeStrengthAbs,
  searchQuery,
  autoCollapseEnabled,
  onNodeHover,
  onShowInsightPanel,
  onOpenGroupPanel,
  onOpenCastdevPanel,
  onCloseSidePanel,
}: UseGraphSimulationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [expandedCastdevs, setExpandedCastdevs] = useState<Set<string>>(new Set());

  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);
  const linkGroupRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const nodeGroupRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const svgSelectionRef = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined> | null>(null);

  const INITIAL_ZOOM_SCALE = 0.75;

  useEffect(() => {
    // Only update if we received new initial nodes/links
    setNodes(initialNodes.map((n) => ({ ...n })));
    setLinks(initialLinks.map((l) => ({ ...l })));
  }, [initialNodes, initialLinks]);

  // Insights Map Helper
  const insightsMap = useMemo(() => {
    const map: Record<string, GraphNode> = {};
    nodes.forEach((n) => {
      if (n.type === "insight" || n.type === "ungrouped") {
        map[n.id] = n;
      }
    });
    return map;
  }, [nodes]);

  const groupTouchesCastdev = useCallback(
    (groupNode: GraphNode, castdevId: string) => {
      return groupNode.insightIds?.some((insId) => {
        const ins = insightsMap[insId];
        return ins && ins.castdevId === castdevId;
      });
    },
    [insightsMap]
  );

  const getNodeColor = (type: string) => {
    if (type === "castdev") return "#006DFA";
    if (type === "group") return "#8C5BD8";
    if (type === "ungrouped") return "#F47C22";
    return "#99CDFF";
  };

  const getNodeFilter = (type: string) => {
    if (type === "castdev") return "url(#glow-castdev)";
    if (type === "group") return "url(#glow-group)";
    if (type === "ungrouped") return "url(#glow-ungrouped)";
    return "url(#glow-insight)";
  };

  const truncate = (str: string, len: number) => {
    return str.length > len ? str.substring(0, len) + "..." : str;
  };

  const applySearchFilter = useCallback(() => {
    if (!nodeGroupRef.current || !linkGroupRef.current) return;

    const q = searchQuery.trim().toLowerCase();
    const searchTerms = q.split(/\s+/).filter(Boolean);

    const isMatchNode = (d: GraphNode) => {
      if (searchTerms.length === 0) return true;
      const nameStr = d.name ? String(d.name).toLowerCase() : "";
      const descStr = d.description ? String(d.description).toLowerCase() : "";
      const combined = nameStr + " " + descStr;
      return searchTerms.every((term) => combined.includes(term));
    };

    const matchedNodes: GraphNode[] = [];

    nodeGroupRef.current.selectAll<SVGGElement, GraphNode>("g.node").each(function (d) {
      const nodeSelection = d3.select(this);
      const circle = nodeSelection.select("circle");
      if (searchTerms.length === 0) {
        nodeSelection.style("opacity", 1);
        nodeSelection.style("pointer-events", "all");
        circle.attr("stroke", null).attr("stroke-width", null);
      } else {
        const isMatch = isMatchNode(d);
        if (isMatch) matchedNodes.push(d);
        nodeSelection.style("opacity", isMatch ? 1 : 0.15);
        nodeSelection.style("pointer-events", isMatch ? "all" : "none");

        if (isMatch) {
          circle.attr("stroke", "#FFF").attr("stroke-width", 3);
        } else {
          circle.attr("stroke", null).attr("stroke-width", null);
        }
      }
    });

    linkGroupRef.current.selectAll<SVGLineElement, GraphLink>("line").each(function (d) {
      const linkSelection = d3.select(this);
      if (searchTerms.length === 0) {
        linkSelection.style("opacity", 1);
      } else {
        const sourceMatch = typeof d.source === "object" && isMatchNode(d.source as GraphNode);
        const targetMatch = typeof d.target === "object" && isMatchNode(d.target as GraphNode);
        linkSelection.style("opacity", sourceMatch || targetMatch ? 1 : 0.05);
      }
    });

    if (searchTerms.length > 0 && matchedNodes.length > 0 && svgSelectionRef.current && zoomBehaviorRef.current && containerRef.current) {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      matchedNodes.forEach((n) => {
        if (n.x !== undefined && n.x < minX) minX = n.x;
        if (n.x !== undefined && n.x > maxX) maxX = n.x;
        if (n.y !== undefined && n.y < minY) minY = n.y;
        if (n.y !== undefined && n.y > maxY) maxY = n.y;
      });

      const hw = 10;
      minX -= hw; maxX += hw; minY -= hw; maxY += hw;

      const width = containerRef.current.clientWidth || 800;
      const height = containerRef.current.clientHeight || 600;
      const padding = 60;
      const bx = maxX - minX || 1;
      const by = maxY - minY || 1;

      const targetScale = Math.min(2, Math.max(0.5, Math.min((width - padding * 2) / bx, (height - padding * 2) / by)));

      const centerX = minX + (maxX - minX) / 2;
      const centerY = minY + (maxY - minY) / 2;

      const transform = d3.zoomIdentity.translate(width / 2, height / 2).scale(targetScale).translate(-centerX, -centerY);
      svgSelectionRef.current.transition().duration(750).call(zoomBehaviorRef.current.transform, transform);
    }
  }, [searchQuery]);

  const updateGraph = useCallback(() => {
    if (!svgRef.current || !nodeGroupRef.current || !linkGroupRef.current || !simulationRef.current) return;

    const visibleNodes = nodes.filter((n) => !n.hidden);
    const visibleLinks = links.filter((l) => !l.hidden);

    const linkSelection = linkGroupRef.current.selectAll<SVGLineElement, GraphLink>("line").data(visibleLinks, (d) => {
      const sourceId = typeof d.source === "object" ? d.source.id : d.source;
      const targetId = typeof d.target === "object" ? d.target.id : d.target;
      return `${sourceId}-${targetId}`;
    });

    linkSelection.join(
      (enter) =>
        enter
          .append("line")
          .attr("stroke", (d) => {
            if (d.type === "group-insight") return "#99CDFF";
            if (d.type === "castdev-ungrouped") return "#F47C22";
            return "#4c5d80";
          })
          .attr("stroke-width", 2)
          .attr("stroke-opacity", 0)
          .call((e) => e.transition().duration(400).attr("stroke-opacity", 0.6)),
      (update) => update,
      (exit) => exit.transition().duration(300).attr("stroke-opacity", 0).remove()
    );

    const nodeSelection = nodeGroupRef.current.selectAll<SVGGElement, GraphNode>("g.node").data(visibleNodes, (d) => d.id);

    const dragstarted = (event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) => {
      if (!event.active && simulationRef.current) simulationRef.current.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    };

    const dragged = (event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) => {
      d.fx = event.x;
      d.fy = event.y;
    };

    const dragended = (event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) => {
      if (!event.active && simulationRef.current) simulationRef.current.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    };

    const nodeEnter = nodeSelection
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("opacity", 0)
      .call(d3.drag<SVGGElement, GraphNode>().on("start", dragstarted).on("drag", dragged).on("end", dragended));

    nodeEnter.transition().duration(500).attr("opacity", 1);

    const circleEnter = nodeEnter
      .append("circle")
      .attr("class", "node-circle")
      .attr("r", 0)
      .attr("fill", (d) => getNodeColor(d.type))
      .attr("filter", (d) => getNodeFilter(d.type))
      .style("cursor", "pointer");

    circleEnter.transition().duration(500).attr("r", (d) => d.radius);

    nodeEnter
      .append("text")
      .attr("class", "node-label")
      .attr("dy", (d) => d.radius + 15)
      .attr("text-anchor", "middle")
      .attr("fill", "var(--fg)")
      .attr("font-size", "11px")
      .style("pointer-events", "none")
      .attr("fill-opacity", 0)
      .text((d) => truncate(d.name, 25))
      .transition()
      .duration(600)
      .attr("fill-opacity", 1);

    nodeEnter
      .on("mouseover", (event, d) => {
        const circle = d3.select(event.currentTarget as Element).select("circle");
        circle.classed("hovered", d.type === "group").classed("castdev-pulse", d.type === "castdev").attr("filter", "url(#glow-hover)");
        onNodeHover(event, d, true, event.pageX, event.pageY);
      })
      .on("mouseout", (event, d) => {
        d3.select(event.currentTarget as Element).select("circle").classed("hovered", false).classed("castdev-pulse", false).attr("filter", getNodeFilter(d.type));
        onNodeHover(event, d, false, 0, 0);
      })
      .on("click", (event, d) => {
        if (d.type === "castdev") {
          toggleCastdevInsights(d);
        } else if (d.type === "group") {
          toggleGroupInsights(d);
        } else if (d.type === "ungrouped" || d.type === "insight") {
          onShowInsightPanel(d);
        }
      });

    nodeSelection
      .exit()
      .transition()
      .duration(300)
      .attr("opacity", 0)
      .attr("transform", (d) => `translate(${(d as GraphNode).x},${(d as GraphNode).y}) scale(0.1)`)
      .remove();

    applySearchFilter();

    simulationRef.current.nodes(visibleNodes);
    simulationRef.current.force<d3.ForceLink<GraphNode, GraphLink>>("link")?.links(visibleLinks);
    simulationRef.current.alpha(0.3).restart();

  }, [nodes, links, applySearchFilter, onNodeHover, onShowInsightPanel]);

  // Initial setup
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || nodes.length === 0) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svgSelectionRef.current = svg;
    svg.attr("viewBox", [0, 0, width, height]);
    svg.selectAll("g.graph-container").remove();

    const container = svg.append("g").attr("class", "graph-container");

    container
      .append("rect")
      .attr("class", "grid-rect")
      .attr("width", 100000)
      .attr("height", 100000)
      .attr("x", -50000)
      .attr("y", -50000)
      .attr("fill", "url(#grid-dots)")
      .attr("pointer-events", "none");

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 8])
      .interpolate(d3.interpolateZoom)
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });
    
    zoomBehaviorRef.current = zoom;
    svg.call(zoom);
    svg.transition().duration(1000).call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(INITIAL_ZOOM_SCALE));

    linkGroupRef.current = container.append("g").attr("class", "links");
    nodeGroupRef.current = container.append("g").attr("class", "nodes");

    const visibleNodes = nodes.filter((n) => !n.hidden);
    const visibleLinks = links.filter((l) => !l.hidden);

    const sim = d3
      .forceSimulation(visibleNodes)
      .force("link", d3.forceLink<GraphNode, GraphLink>(visibleLinks).id((d) => d.id).distance(linkDistance))
      .force("charge", d3.forceManyBody().strength(-chargeStrengthAbs))
      .force("center", d3.forceCenter(0, 0))
      .force("collision", d3.forceCollide<GraphNode>().radius((d) => d.radius + 20));

    simulationRef.current = sim;

    sim.on("tick", () => {
      linkGroupRef.current?.selectAll<SVGLineElement, GraphLink>("line")
        .attr("x1", (d) => (d.source as GraphNode).x || 0)
        .attr("y1", (d) => (d.source as GraphNode).y || 0)
        .attr("x2", (d) => (d.target as GraphNode).x || 0)
        .attr("y2", (d) => (d.target as GraphNode).y || 0);

      nodeGroupRef.current?.selectAll<SVGGElement, GraphNode>("g.node").attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    updateGraph();

    return () => {
      sim.stop();
    };
    // Initialize exactly once when nodes become available
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length > 0 && simulationRef.current === null]); 


  useEffect(() => {
    if (simulationRef.current) {
      simulationRef.current.force<d3.ForceLink<GraphNode, GraphLink>>("link")?.distance(linkDistance);
      simulationRef.current.force<d3.ForceManyBody<GraphNode>>("charge")?.strength(-chargeStrengthAbs);
      simulationRef.current.alpha(0.5).restart();
    }
  }, [linkDistance, chargeStrengthAbs]);

  useEffect(() => {
    applySearchFilter();
  }, [searchQuery, applySearchFilter]);

  // Methods to interact with graph
  const collapseCastdevInsights = (castdevId: string) => {
    setNodes((prev) => prev.map((n) => (n.type === "ungrouped" && n.castdevId === castdevId ? { ...n, hidden: true } : n)));
    setLinks((prev) => prev.map((l) => (l.type === "castdev-ungrouped" && (typeof l.source === "object" ? l.source.id : l.source) === castdevId ? { ...l, hidden: true } : l)));
  };

  const expandCastdevInsights = (castdevNode: GraphNode) => {
    setNodes((prev) => prev.map((n) => (n.type === "ungrouped" && n.castdevId === castdevNode.id ? { ...n, hidden: false, x: (castdevNode.x || 0) + (Math.random() - 0.5) * 50, y: (castdevNode.y || 0) + (Math.random() - 0.5) * 50 } : n)));
    setLinks((prev) => prev.map((l) => (l.type === "castdev-ungrouped" && (typeof l.source === "object" ? l.source.id : l.source) === castdevNode.id ? { ...l, hidden: false } : l)));
  };

  const expandGroupsLinkedToCastdev = (castdevNode: GraphNode) => {
    setNodes((prev) => {
      let changed = false;
      const nextNodes = prev.map((n) => {
        if (n.type !== "group" || !groupTouchesCastdev(n, castdevNode.id) || expandedGroups.has(n.id)) return n;
        changed = true;
        setExpandedGroups((g) => new Set(g).add(n.id));
        return n;
      });
      if (changed) {
        nextNodes.forEach((n) => {
          if (n.type === "group" && expandedGroups.has(n.id)) {
            n.insightIds?.forEach((insId) => {
              const insNode = nextNodes.find((node) => node.id === insId);
              if (insNode) {
                insNode.hidden = false;
                insNode.x = (n.x || 0) + (Math.random() - 0.5) * 100;
                insNode.y = (n.y || 0) + (Math.random() - 0.5) * 100;
              }
            });
          }
        });
      }
      return nextNodes;
    });

    setLinks((prev) => prev.map((l) => {
      const sourceId = typeof l.source === "object" ? l.source.id : l.source;
      const targetId = typeof l.target === "object" ? l.target.id : l.target;
      const groupNode = nodes.find((n) => n.id === sourceId);
      if (groupNode && groupNode.type === "group" && groupNode.insightIds?.includes(targetId as string) && expandedGroups.has(groupNode.id)) {
        return { ...l, hidden: false };
      }
      return l;
    }));
  };

  const collapseGroupsLinkedToCastdev = (castdevId: string) => {
    setNodes((prev) => {
      const nextNodes = [...prev];
      nextNodes.forEach((n) => {
        if (n.type !== "group" || !groupTouchesCastdev(n, castdevId) || !expandedGroups.has(n.id)) return;
        setExpandedGroups((g) => {
          const nextG = new Set(g);
          nextG.delete(n.id);
          return nextG;
        });
        n.insightIds?.forEach((insId) => {
          const insNode = nextNodes.find((node) => node.id === insId);
          if (insNode) insNode.hidden = true;
        });
      });
      return nextNodes;
    });

    setLinks((prev) => prev.map((l) => {
      const sourceId = typeof l.source === "object" ? l.source.id : l.source;
      const groupNode = nodes.find((n) => n.id === sourceId);
      if (groupNode && groupNode.type === "group" && l.type === "group-insight" && !expandedGroups.has(groupNode.id)) {
        return { ...l, hidden: true };
      }
      return l;
    }));
  };

  const toggleCastdevInsights = (castdevNode: GraphNode) => {
    if (expandedCastdevs.has(castdevNode.id)) {
      collapseCastdevInsights(castdevNode.id);
      collapseGroupsLinkedToCastdev(castdevNode.id);
      setExpandedCastdevs((prev) => {
        const next = new Set(prev);
        next.delete(castdevNode.id);
        return next;
      });
      onCloseSidePanel();
    } else {
      if (autoCollapseEnabled) {
        if (expandedCastdevs.size > 0) {
          expandedCastdevs.forEach((id) => collapseCastdevInsights(id));
          setExpandedCastdevs(new Set());
        }
        if (expandedGroups.size > 0) {
          setNodes((prev) => {
            const nextNodes = [...prev];
            expandedGroups.forEach((groupId) => {
              const groupNode = nextNodes.find((n) => n.id === groupId);
              if (groupNode) {
                groupNode.insightIds?.forEach((insId) => {
                  const insNode = nextNodes.find((n) => n.id === insId);
                  if (insNode) insNode.hidden = true;
                });
              }
            });
            return nextNodes;
          });
          setLinks((prev) => prev.map((l) => (l.type === "group-insight" ? { ...l, hidden: true } : l)));
          setExpandedGroups(new Set());
        }
      }
      setExpandedCastdevs((prev) => new Set(prev).add(castdevNode.id));
      expandCastdevInsights(castdevNode);
      expandGroupsLinkedToCastdev(castdevNode);
      onOpenCastdevPanel(castdevNode);
    }
  };

  const toggleGroupInsights = (groupNode: GraphNode) => {
    if (autoCollapseEnabled && expandedCastdevs.size > 0) {
      expandedCastdevs.forEach((id) => collapseCastdevInsights(id));
      setExpandedCastdevs(new Set());
    }

    const insightIds = groupNode.insightIds || [];
    const isExpanded = expandedGroups.has(groupNode.id);

    if (isExpanded) {
      setExpandedGroups((prev) => {
        const next = new Set(prev);
        next.delete(groupNode.id);
        return next;
      });
      setNodes((prev) => prev.map((n) => (insightIds.includes(n.id) ? { ...n, hidden: true } : n)));
      setLinks((prev) => prev.map((l) => (l.type === "group-insight" && (typeof l.source === "object" ? l.source.id : l.source) === groupNode.id ? { ...l, hidden: true } : l)));
      onCloseSidePanel();
    } else {
      setExpandedGroups((prev) => new Set(prev).add(groupNode.id));
      setNodes((prev) => prev.map((n) => (insightIds.includes(n.id) ? { ...n, hidden: false, x: (groupNode.x || 0) + (Math.random() - 0.5) * 100, y: (groupNode.y || 0) + (Math.random() - 0.5) * 100 } : n)));
      setLinks((prev) => prev.map((l) => (l.type === "group-insight" && (typeof l.source === "object" ? l.source.id : l.source) === groupNode.id && insightIds.includes((typeof l.target === "object" ? l.target.id : l.target) as string) ? { ...l, hidden: false } : l)));
      onOpenGroupPanel(groupNode);
    }
  };

  const areAllGroupsExpanded = useMemo(() => {
    const groups = nodes.filter((n) => n.type === "group");
    return groups.length > 0 && expandedGroups.size === groups.length;
  }, [nodes, expandedGroups]);

  const toggleAllGroups = () => {
    if (areAllGroupsExpanded) {
      setExpandedGroups(new Set());
      setNodes((prev) => prev.map((n) => (n.type === "insight" ? { ...n, hidden: true } : n)));
      setLinks((prev) => prev.map((l) => (l.type === "group-insight" ? { ...l, hidden: true } : l)));
    } else {
      const allGroups = nodes.filter((n) => n.type === "group");
      setExpandedGroups(new Set(allGroups.map((g) => g.id)));
      setNodes((prev) => {
        const nextNodes = [...prev];
        allGroups.forEach((groupNode) => {
          groupNode.insightIds?.forEach((insId) => {
            const insNode = nextNodes.find((n) => n.id === insId);
            if (insNode) {
              insNode.hidden = false;
              if (insNode.x === undefined) {
                insNode.x = (groupNode.x || 0) + (Math.random() - 0.5) * 100;
                insNode.y = (groupNode.y || 0) + (Math.random() - 0.5) * 100;
              }
            }
          });
        });
        return nextNodes;
      });
      setLinks((prev) => prev.map((l) => (l.type === "group-insight" ? { ...l, hidden: false } : l)));
    }
  };

  const areAllUngroupedExpanded = useMemo(() => {
    const castdevs = nodes.filter((n) => n.type === "castdev");
    return castdevs.length > 0 && expandedCastdevs.size === castdevs.length;
  }, [nodes, expandedCastdevs]);

  const toggleAllUngrouped = () => {
    if (areAllUngroupedExpanded) {
      setExpandedCastdevs(new Set());
      setNodes((prev) => prev.map((n) => (n.type === "ungrouped" ? { ...n, hidden: true } : n)));
      setLinks((prev) => prev.map((l) => (l.type === "castdev-ungrouped" ? { ...l, hidden: true } : l)));
    } else {
      const allCastdevs = nodes.filter((n) => n.type === "castdev");
      setExpandedCastdevs(new Set(allCastdevs.map((c) => c.id)));
      setNodes((prev) => {
        const nextNodes = [...prev];
        allCastdevs.forEach((castdevNode) => {
          nextNodes.forEach((n) => {
            if (n.type === "ungrouped" && n.castdevId === castdevNode.id) {
              n.hidden = false;
              if (n.x === undefined) {
                n.x = (castdevNode.x || 0) + (Math.random() - 0.5) * 50;
                n.y = (castdevNode.y || 0) + (Math.random() - 0.5) * 50;
              }
            }
          });
        });
        return nextNodes;
      });
      setLinks((prev) => prev.map((l) => (l.type === "castdev-ungrouped" ? { ...l, hidden: false } : l)));
    }
  };

  const collapseAllNodes = () => {
    setExpandedGroups(new Set());
    setExpandedCastdevs(new Set());
    setNodes((prev) => prev.map((n) => (n.type === "insight" || n.type === "ungrouped" ? { ...n, hidden: true } : n)));
    setLinks((prev) => prev.map((l) => (l.type === "castdev-ungrouped" || l.type === "group-insight" ? { ...l, hidden: true } : l)));
    onCloseSidePanel();
  };

  const untangleNodes = () => {
    if (!simulationRef.current) return;
    const currentCharge = chargeStrengthAbs;
    const currentDistance = linkDistance;
    const visibleLinks = links.filter((l) => !l.hidden);

    simulationRef.current.force("charge", null); // we can't easily re-assign strength via d3.forceManyBody directly on the same simulation without re-init, wait... actually d3.forceManyBody is a new force.
    simulationRef.current.force("charge", d3.forceManyBody<GraphNode>().strength(-currentCharge * 3.5));
    simulationRef.current.force("collision", d3.forceCollide<GraphNode>().radius((d) => d.radius + 30).iterations(3));
    simulationRef.current.force("link", d3.forceLink<GraphNode, GraphLink>(visibleLinks).id((d) => d.id).distance(currentDistance * 2));
    
    simulationRef.current.alpha(0.8).restart();

    setTimeout(() => {
      simulationRef.current?.force("charge", d3.forceManyBody<GraphNode>().strength(-currentCharge));
      simulationRef.current?.force("collision", d3.forceCollide<GraphNode>().radius((d) => d.radius + 20));
      simulationRef.current?.force("link", d3.forceLink<GraphNode, GraphLink>(visibleLinks).id((d) => d.id).distance(currentDistance));
      simulationRef.current?.alpha(0.4).restart();
    }, 1000);
  };

  const pullFloatingNodes = () => {
    if (!simulationRef.current) return;
    simulationRef.current.force("gravityX", d3.forceX(0).strength(0.12));
    simulationRef.current.force("gravityY", d3.forceY(0).strength(0.12));
    
    simulationRef.current.alpha(0.6).restart();

    setTimeout(() => {
      simulationRef.current?.force("gravityX", null);
      simulationRef.current?.force("gravityY", null);
      simulationRef.current?.alpha(0.3).restart();
    }, 1200);
  };

  // Re-run updateGraph when node hidden states change
  useEffect(() => {
    updateGraph();
  }, [nodes, links, updateGraph]);


  return {
    svgRef,
    containerRef,
    toggleAllGroups,
    toggleAllUngrouped,
    collapseAllNodes,
    untangleNodes,
    pullFloatingNodes,
  };
}
