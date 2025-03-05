import { NextResponse } from 'next/server';
import { DatasetType, CleaningProfile, CleaningOptions, CleaningResult } from '../../../../types/dataCleaningTypes';
import { StateGraph, END, START } from '@langchain/langgraph';
import { printGraphImage } from './util';
import {
  CleaningStateAnnotation,
  handleMissingValues,
  handleOutliers,
  removeDuplicates,
  standardizeColumns,
  llmCleaning,
  generateIssuesReport,
  prepareResult,
} from './nodes';

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    const { dataset, profile, options } = body as {
      dataset: DatasetType;
      profile: CleaningProfile;
      options: CleaningOptions;
    };

    if (!dataset || !dataset.data || !dataset.headers) {
      return NextResponse.json({ error: 'Invalid dataset format' }, { status: 400 });
    }

    if (!profile) {
      return NextResponse.json({ error: 'Missing cleaning profile' }, { status: 400 });
    }

    // Combine provided options with defaults
    const cleaningOptions: CleaningOptions = {
      ...{
        handleMissingValues: 'drop',
        handleOutliers: 'flag',
        removeDuplicates: true,
        standardizeColumns: true,
        useLLM: false,
        llmContextualCleaning: false,
        llmDetectAnomalies: false,
        llmTemperature: 0.2,
        llmMaxTokens: 1000,
      },
      ...options,
    };

    // Process data cleaning
    const result = await processDataCleaningWithGraph(dataset, profile, cleaningOptions);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing data cleaning request:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 },
    );
  }
}

async function processDataCleaningWithGraph(
  dataset: DatasetType,
  profile: CleaningProfile,
  options: CleaningOptions,
): Promise<CleaningResult> {
  // Create a new StateGraph for data cleaning
  const graph = new StateGraph(CleaningStateAnnotation)
    .addNode('handleMissingValues', handleMissingValues)
    .addNode('handleOutliers', handleOutliers)
    .addNode('removeDuplicates', removeDuplicates)
    .addNode('standardizeColumns', standardizeColumns)
    .addNode('llmCleaning', llmCleaning)
    .addNode('generateIssuesReport', generateIssuesReport)
    .addNode('prepareResult', prepareResult)

    // Connect nodes to create the graph
    // Using type assertions for node names to satisfy TypeScript
    .addEdge(START, 'handleMissingValues')
    .addEdge('handleMissingValues', 'handleOutliers')
    .addEdge('handleOutliers', 'removeDuplicates')
    .addEdge('removeDuplicates', 'standardizeColumns')
    .addEdge('standardizeColumns', 'llmCleaning')
    .addEdge('llmCleaning', 'generateIssuesReport')
    .addEdge('generateIssuesReport', 'prepareResult')
    .addEdge('prepareResult', END);

  // Compile the graph
  const compiledGraph = graph.compile();

  printGraphImage(compiledGraph);

  // Set up initial state
  const initialState = {
    dataset,
    profile,
    options,
    cleanedData: [...dataset.data], // Start with a copy of the original data
    missingValuesFixed: {
      count: 0,
      columns: new Map<string, number>(),
    },
    outliersDetected: {
      count: 0,
      columns: new Map<string, number>(),
    },
    duplicatesRemoved: { count: 0 },
    llmCleaningStats: {
      fieldsProcessed: 0,
      contextualIssuesFixed: 0,
      insights: [],
      contextualIssues: new Map<string, { count: number; examples: string[] }>(),
    },
    columnsStandardized: 0,
    issues: [],
  };

  // Execute the graph and get the final state
  const finalState = await compiledGraph.invoke(initialState);

  if (!finalState.result) {
    throw new Error('Graph execution failed to produce a result');
  }

  return finalState.result;
}
