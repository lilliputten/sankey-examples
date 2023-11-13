// @ts-check
/* global anychart */

import edgesData from '../../data/set-231113-chris/lignite/edges.json' assert { type: 'json' };
import flowsData from '../../data/set-231113-chris/lignite/flows.json' assert { type: 'json' };
import nodesSupplyChainData from '../../data/set-231113-chris/lignite/nodes-supply-chain.json' assert { type: 'json' };

import nodesData from '../../data/set-231113-chris/nodes.json' assert { type: 'json' };

// Graph parameters...
const graphName = 'Graph with provided data / test 1';
const containerId = 'container';

// Prepare data hashes...
const graphsHash = constructGraphsHashFromSupplyChain(nodesSupplyChainData);
const nodesHash = constructNodesHashFromNodes(nodesData);

/** Show demo data. See `getDemoData` */
const useDemoData = false;

function constructGraphsHashFromSupplyChain(nodesSupplyChainData) {
  const graphsHash = nodesSupplyChainData.reduce((hash, graph) => {
    const { id_in_graph: id } = graph;
    hash[id] = graph;
    return hash;
  }, {});
  console.log('[constructGraphsHashFromSupplyChain] finish', {
    graphsHash,
    nodesSupplyChainData,
  });
  return graphsHash;
}

function constructNodesHashFromNodes(nodesData) {
  const nodesHash = nodesData.reduce((hash, node) => {
    const { id } = node;
    hash[id] = node;
    return hash;
  }, {});
  console.log('[constructNodesHashFromNodes] finish', {
    nodesHash,
    nodesSupplyChainData,
  });
  return nodesHash;
}

function getGraphForId(id) {
  const graph = graphsHash[id];
  if (!graph) {
    const error = new Error('Cannot find graph for id "' + id + '"');
    console.error('[getGraphForId]', error);
    debugger;
    throw error;
  }
  return graph;
}

function getNodeForId(id) {
  const node = nodesHash[id];
  if (!node) {
    if (id === -1) {
      const error = new Error('Construct root node for absent id = -1');
      console.warn('[getNodeForId]', error);
      return {
        name: 'Root node',
        product: 'Root product',
      };
    } else {
      const error = new Error('Cannot find node for id "' + id + '"');
      console.warn('[getNodeForId]', error);
      return {
        name: 'Node ' + id,
        product: 'Product' + id,
      };
    }
  }
  return node;
}

function constructEdgesData() {
  console.log('[constructEdgesData] start', {
    edgesData,
    flowsData,
    nodesSupplyChainData,
    // nodesData,
  });
  const chartData = edgesData.map(
    ({
      producer_graph_id: toId, // 2,
      consumer_graph_id: fromId, // 0,
      amount, // 0.0016624585259705782
    }) => {
      const fromGraph = getGraphForId(fromId);
      const toGraph = getGraphForId(toId);
      const fromNode = getNodeForId(fromGraph.id_in_database);
      const toNode = getNodeForId(toGraph.id_in_database);
      const fromName = fromNode.name;
      const toName = toNode.name;
      console.log('[constructEdgesData] item', {
        toName,
        fromName,
        toId,
        fromId,
        amount,
        fromGraph,
        toGraph,
        fromNode,
        toNode,
      });
      return {
        from: fromName,
        to: toName,
        value: amount,
      };
    },
  );
  console.log('[constructEdgesData] finish', {
    chartData,
  });
  return chartData;
}

function getDemoData() {
  return [
    { from: 'First Class', to: 'Child', value: 6 },
    { from: 'Second Class', to: 'Child', value: 24 },
    { from: 'Third Class', to: 'Child', value: 79 },
    { from: 'Crew', to: 'Child', value: 0 },
    { from: 'First Class', to: 'Adult', value: 319 },
    { from: 'Second Class', to: 'Adult', value: 261 },
    { from: 'Third Class', to: 'Adult', value: 627 },
    { from: 'Crew', to: 'Adult', value: 885 },
    { from: 'Child', to: 'Female', value: 45 },
    { from: 'Child', to: 'Male', value: 64 },
    { from: 'Adult', to: 'Female', value: 425 },
    { from: 'Adult', to: 'Male', value: 1667 },
    { from: 'Female', to: 'Survived', value: 344 },
    { from: 'Female', to: 'Perished', value: 126 },
    { from: 'Male', to: 'Survived', value: 367 },
    { from: 'Male', to: 'Perished', value: 1364 },
  ];
}

function getChartData() {
  if (useDemoData) {
    return getDemoData();
  }
  return constructEdgesData();
}

export function drawChart() {
  // Add data
  const data = getChartData();

  // Create a sankey diagram instance
  // @ts-ignore
  let chart = anychart.sankey();

  // Load the data to the sankey diagram instance
  chart.data(data);

  // Set the chart's padding
  chart.padding(20, 20);

  // Add a title
  chart.title(graphName);

  // Set the chart container id
  chart.container(containerId);

  // Draw the chart
  chart.draw();
}
