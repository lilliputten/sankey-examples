type TGraphId = number;
type TNodeId = number;

type TEdgeItem = any;
type TFlowItem = any;
type TGraphItem = any;
type TNodeItem = any;

type TEdgesData = TEdgesData;
type TGraphsData = TGraphsData;
type TFlowsData = TFlowsData;
type TNodesData = TNodesData;

type TGraphHash = Record<TGraphId, TGraphItem>;
type TNodeHash = Record<TNodeId, TNodeItem>;

interface TDataSet {
  edgesData: TEdgesData;
  flowsData: TFlowsData;
  graphsData: TGraphsData;
  nodesData: TNodesData;
}

interface TFullDataSet extends TDataSet {
  graphsHash: TGraphHash;
  nodesHash: TNodeHash;
}

interface TAnyChartRecord {
  from: string;
  to: string;
  value: number;
}
type TAnyChartData = TAnyChartRecord[];
