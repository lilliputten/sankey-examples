// @ts-check
/* global anychart */
/* eslint-disable no-console */
/*!
 * @changed 2023.11.13, 23:55
 */

/** Core data path (for `nodes.json` data) */
const dataUrl = '../../data/set-231113-chris/';
/** Specific data set path (for all other data: we can choose different sets here) */
const dataSetUrl = dataUrl + 'lignite/';

// Graph parameters...
const graphName = 'Graph with provided data / test 1';
const containerId = 'container';

/** Show demo data. See `getDemoData` */
const useDemoData = false;

/** @param {Error|string|undefined} error
 */
function setError(error) {
  const errorNode = document.getElementById('error');
  if (!errorNode) {
    return;
  }
  if (error && error instanceof Error) {
    error = error.message;
  }
  errorNode.innerText = error ? String(error) : '';
}

/** Display error text on the page
 * @param {string} jsonUrl
 */
async function loadJson(jsonUrl) {
  return fetch(jsonUrl).then((res) => {
    const { ok, status, statusText, url } = res;
    if (!ok) {
      const reason = [status, statusText].filter(Boolean).join(', ');
      const msg = `Failed load "${url}" due to ${reason}`;
      const error = new Error(msg);
      // eslint-disable-next-line no-console
      console.error('[loadJson]', msg, {
        ok,
        status,
        statusText,
        url,
        jsonUrl,
        error,
      });
      // eslint-disable-next-line no-debugger
      // debugger;
      throw error;
    }
    return res.json();
  });
}

/** Load all required data
 * @return {Promise<TFullDataSet>}
 */
async function loadFullData() {
  const promises = [
    loadJson(dataSetUrl + 'edges.json'),
    loadJson(dataSetUrl + 'flows.json'),
    loadJson(dataSetUrl + 'nodes-supply-chain.json'),
    loadJson(dataUrl + 'nodes.json'),
  ];
  return Promise.all(promises)
    .then(
      ([
        // prettier-ignore
        edgesData,
        flowsData,
        graphsData,
        nodesData,
      ]) => {
        const graphsHash = constructGraphsHashGraphsData(graphsData);
        const nodesHash = constructNodesHashFromData(nodesData);
        /** @type {TFullDataSet} */
        const fullDataSet = {
          edgesData,
          flowsData,
          graphsData,
          nodesData,
          graphsHash,
          nodesHash,
        };
        console.log('[loadFullData]', fullDataSet);
        return fullDataSet;
      },
    )
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error('[loadFullData] promise error', {
        error,
      });
      // eslint-disable-next-line no-debugger
      debugger;
      setError(error);
      throw error;
    });
}

/**
 * @param {TGraphsData} graphsData
 * @return {TGraphHash}
 */
function constructGraphsHashGraphsData(graphsData) {
  // TODO: Detect duplicated ids?
  /** @type {TGraphHash} */
  const graphsHash = graphsData.reduce((hash, graph) => {
    const { id_in_graph: id } = graph;
    hash[id] = graph;
    return hash;
  }, {});
  console.log('[constructGraphsHashGraphsData] finish', {
    graphsHash,
    graphsData,
  });
  return graphsHash;
}

/**
 * @param {TNodesData} nodesData
 * @return {TNodeHash}
 */
function constructNodesHashFromData(nodesData) {
  // TODO: Detect duplicated ids?
  /** @type {TNodeHash} */
  const nodesHash = nodesData.reduce((hash, node) => {
    const { id } = node;
    hash[id] = node;
    return hash;
  }, {});
  console.log('[constructNodesHashFromData] finish', {
    nodesHash,
    nodesData,
  });
  return nodesHash;
}

/**
 * @param {TGraphHash} graphsHash
 * @param {TGraphId} id
 */
function getGraphForId(graphsHash, id) {
  const graph = graphsHash[id];
  if (!graph) {
    const error = new Error('Cannot find graph for id ' + id);
    // eslint-disable-next-line no-console
    console.error('[getGraphForId]', error);
    // eslint-disable-next-line no-debugger
    debugger;
    throw error;
  }
  return graph;
}

/**
 * @param {TNodeHash} nodesHash
 * @param {TNodeId} id
 */
function getNodeForId(nodesHash, id) {
  const node = nodesHash[id];
  if (!node) {
    if (id === -1) {
      const error = new Error('Constructing stub root node for absent id = -1');
      // eslint-disable-next-line no-console
      console.warn('[getNodeForId]', error.message);
      return {
        name: 'Root node',
        product: 'Root product',
      };
    } else {
      const error = new Error('Cannot find node for id ' + id + ' (creating default node stub)');
      // eslint-disable-next-line no-console
      console.warn('[getNodeForId]', error.message);
      return {
        name: 'Node ' + id,
        product: 'Product' + id,
      };
    }
  }
  return node;
}

/** Create chart data from the data set
 * @param {TFullDataSet} fullDataSet
 */
function constructEdgesData(fullDataSet) {
  const {
    edgesData, // TEdgesData;
    flowsData, // TFlowsData;
    graphsData, // TGraphsData;
    // nodesData, // TNodesData;
    graphsHash, // TGraphHash;
    nodesHash, // TNodeHash;
  } = fullDataSet;
  console.log('[constructEdgesData] start', {
    edgesData,
    flowsData,
    graphsData,
    // nodesData,
  });
  /** @type {TAnyChartData} */
  const chartData = edgesData.map(
    ({
      producer_graph_id: toId, // 2,
      consumer_graph_id: fromId, // 0,
      amount, // 0.0016624585259705782
    }) => {
      const fromGraph = getGraphForId(graphsHash, fromId);
      const toGraph = getGraphForId(graphsHash, toId);
      const fromNode = getNodeForId(nodesHash, fromGraph.id_in_database);
      const toNode = getNodeForId(nodesHash, toGraph.id_in_database);
      const fromName = fromNode.name;
      const toName = toNode.name;
      /* console.log('[constructEdgesData] item', {
       *   toName,
       *   fromName,
       *   toId,
       *   fromId,
       *   amount,
       *   fromGraph,
       *   toGraph,
       *   fromNode,
       *   toNode,
       * });
       */
      /** @type {TAnyChartRecord} */
      const chartDataItem = {
        from: fromName,
        to: toName,
        value: amount,
      };
      return chartDataItem;
    },
  );
  console.log('[constructEdgesData] finish', {
    chartData,
  });
  return chartData;
}

/** Get demo chart data (from anychart examples)
 * @return {TAnyChartData}
 */
function getDemoData() {
  /** @type {TAnyChartData} */
  const chartData = [
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
  return chartData;
}

/** Get current chart data wrapper
 * @param {TFullDataSet} fullDataSet
 * @return {TAnyChartData}
 */
function getChartData(fullDataSet) {
  if (useDemoData) {
    return getDemoData();
  }
  return constructEdgesData(fullDataSet);
}

/** Display chart with demo or actual data */
async function drawChart() {
  const fullData = await loadFullData();
  const chartData = getChartData(fullData);
  // Create a sankey diagram instance
  const chart = anychart.sankey();
  // Load the data to the sankey diagram instance
  chart.data(chartData);
  // Set the chart's padding
  chart.padding(20, 20);
  // Add a title
  chart.title(graphName);
  // Set the chart container id
  chart.container(containerId);
  // Draw the chart
  chart.draw();
}

anychart.onDocumentReady(drawChart);
