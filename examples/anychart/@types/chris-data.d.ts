type TGraphId = number;
type TDatabaseId = number;

type TEdgeNode = any;
type TFlowNode = any;
type TGraphNode = any;
type TDatabaseNode = any;

type TGraphHash = Record<TGraphId, TGraphNode>;
type TDatabaseHash = Record<TDatabaseId, TDatabaseNode>;

interface TDataSet {
  edgesData: TEdgeNode[];
  flowsData: TFlowNode[];
  nodesSupplyChainData: TGraphNode[];
  nodesData: TDatabaseNode[];
}

interface TFullDataSet extends TDataSet {
  graphsHash: TGraphHash;
  nodesHash: TDatabaseHash;
}

interface TChartData {
    from: string;
    to: string;
    value: number;
}
