import { NextResponse } from 'next/server';
import { DatasetType } from '../../../../types/dataCleaningTypes';
import { z } from 'zod';
import { ChatOpenAI } from '@langchain/openai';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';

export const runtime = 'edge';

// Enhanced schema for more detailed LLM-driven output
const outputSchema = z.object({
  recommendedDomain: z.enum(['general', 'finance', 'healthcare', 'marketing', 'hr']),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  suggestedCleaningActions: z.array(z.string()),
  dataQualityAssessment: z.object({
    completenessScore: z.number().min(0).max(10),
    accuracyScore: z.number().min(0).max(10),
    consistencyScore: z.number().min(0).max(10),
    overallQualityScore: z.number().min(0).max(10),
  }),
  potentialUseCase: z.string(),
  riskFactors: z.array(z.string()),
});

// Type for column analysis results
interface ColumnAnalysis {
  dataType: string;
  nullPercentage: number;
  uniqueValues: number;
  sampleValues: any[];
}

// Type for the complete column analysis object
interface ColumnAnalysisResult {
  [columnName: string]: ColumnAnalysis;
}

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    const { dataset } = body as { dataset: DatasetType };

    // Calculate some basic dataset statistics to include in the prompt
    const basicStats = {
      rowCount: dataset.data.length,
      columnCount: dataset.headers.length,
      missingValueRatio: calculateMissingValueRatio(dataset),
      duplicateEstimate: estimateDuplicates(dataset),
    };

    // Create more comprehensive sample data
    const sampleSize = Math.min(dataset.data.length, 8);
    const sampleRows = dataset.data.slice(0, sampleSize);

    // Calculate column data types and sample values
    const columnAnalysis = analyzeColumns(dataset);

    // Create a parser for structured output
    const parser = StructuredOutputParser.fromZodSchema(outputSchema);
    const formatInstructions = parser.getFormatInstructions();

    // Create an enhanced prompt template with more detailed instructions
    const prompt = ChatPromptTemplate.fromTemplate(`
      You are a senior data scientist specialized in dataset analysis and data quality assessment.
      Your task is to thoroughly analyze the provided dataset and make recommendations based on your expertise.
      
      # Dataset Information
      - Filename: {filename}
      - File Type: {fileType}
      - Total Rows: {rowCount}
      - Total Columns: {columnCount}
      
      # Column Information
      {columnInfo}
      
      # Sample Data (first {sampleSize} rows):
      {sampleData}
      
      # Basic Dataset Statistics
      - Missing Value Ratio: {missingValueRatio}
      - Estimated Duplicate Rows: {duplicateEstimate}
      
      # Instructions
      1. Carefully analyze the column names, data types, and sample values
      2. Determine the most likely domain for this dataset
      3. Provide specific cleaning recommendations based on data quality issues you identify
      4. Assess the overall quality of the data across multiple dimensions
      5. Suggest potential use cases for this dataset once cleaned
      6. Identify any potential risk factors or limitations in the data
      
      Based on your analysis, determine which domain this dataset belongs to:
      - general: Generic data that doesn't clearly fit the other categories
      - finance: Financial transactions, budgets, investments, etc.
      - healthcare: Patient data, medical records, health metrics, etc.
      - marketing: Customer data, campaign metrics, engagement data, etc.
      - hr: Human resources data, employee records, performance metrics, recruitment data, etc.
      
      Provide a thorough reasoning for your domain classification and detailed recommendations.
      
      {formatInstructions}
    `);

    // Initialize OpenAI chat model with higher temperature for more creative insights
    const llm = new ChatOpenAI({
      temperature: 0.2, // Slightly higher for more variability in responses
      modelName: 'gpt-3.5-turbo',
      maxTokens: 1500, // Increased to allow for more detailed analysis
    });

    // Create a chain to pass the data to the model and parse the result
    const chain = prompt.pipe(llm).pipe(parser);

    // Invoke the chain with enhanced dataset information
    const result = await chain.invoke({
      filename: dataset.filename,
      fileType: dataset.fileType,
      headers: dataset.headers.join(', '),
      columnInfo: formatColumnInfo(columnAnalysis),
      sampleData: JSON.stringify(sampleRows, null, 2),
      sampleSize: sampleSize,
      rowCount: basicStats.rowCount,
      columnCount: basicStats.columnCount,
      missingValueRatio: basicStats.missingValueRatio,
      duplicateEstimate: basicStats.duplicateEstimate,
      formatInstructions,
    });

    // Use LLM's data quality assessment instead of random values
    const response = {
      ...result,
      analysisMetrics: {
        missingValueRatio: basicStats.missingValueRatio,
        duplicateRowsEstimate: basicStats.duplicateEstimate,
        anomalyScore: result.dataQualityAssessment.accuracyScore,
        formatConsistencyScore: result.dataQualityAssessment.consistencyScore,
      },
      traceId: `langchain-analysis-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in dataset analysis API:', error);
    return NextResponse.json({ error: 'Failed to analyze dataset' }, { status: 500 });
  }
}

// Analyze column data types and sample values
function analyzeColumns(dataset: DatasetType): ColumnAnalysisResult {
  const result: ColumnAnalysisResult = {};

  dataset.headers.forEach((header) => {
    const values = dataset.data.slice(0, 10).map((row) => row[header]);
    const nonNullValues = values.filter((v) => v !== null);

    // Determine likely data type
    let dataType = 'unknown';
    if (nonNullValues.length > 0) {
      const firstNonNull = nonNullValues[0];
      if (typeof firstNonNull === 'number') dataType = 'numeric';
      else if (typeof firstNonNull === 'boolean') dataType = 'boolean';
      else if (typeof firstNonNull === 'string') {
        // Check if it's a date
        if (!isNaN(Date.parse(firstNonNull))) dataType = 'date';
        else dataType = 'text';
      }
    }

    // Calculate null percentage
    const nullPercentage = ((values.length - nonNullValues.length) / values.length) * 100;

    result[header] = {
      dataType,
      nullPercentage,
      uniqueValues: new Set(nonNullValues).size,
      sampleValues: nonNullValues.slice(0, 3),
    };
  });

  return result;
}

// Format column info for the prompt
function formatColumnInfo(columnAnalysis: ColumnAnalysisResult): string {
  let result = '';

  Object.entries(columnAnalysis).forEach(([column, info]) => {
    result += `Column: "${column}"\n`;
    result += `- Data Type: ${info.dataType}\n`;
    result += `- Null Percentage: ${info.nullPercentage.toFixed(2)}%\n`;
    result += `- Unique Values Count: ${info.uniqueValues}\n`;
    result += `- Sample Values: ${JSON.stringify(info.sampleValues)}\n\n`;
  });

  return result;
}

// Helper function to calculate missing value ratio
function calculateMissingValueRatio(dataset: DatasetType): number {
  let totalCells = dataset.data.length * dataset.headers.length;
  let missingCells = 0;

  dataset.data.forEach((row) => {
    dataset.headers.forEach((header) => {
      if (row[header] === null) {
        missingCells++;
      }
    });
  });

  return missingCells / totalCells;
}

function estimateDuplicates(dataset: DatasetType): number {
  const sampleSize = Math.min(dataset.data.length, 1000);
  const sample = dataset.data.slice(0, sampleSize);

  const seen = new Set<string>();
  let duplicates = 0;

  sample.forEach((row) => {
    const rowStr = JSON.stringify(row);
    if (seen.has(rowStr)) {
      duplicates++;
    } else {
      seen.add(rowStr);
    }
  });

  if (sampleSize < dataset.data.length) {
    duplicates = Math.round(duplicates * (dataset.data.length / sampleSize));
  }

  return duplicates;
}
