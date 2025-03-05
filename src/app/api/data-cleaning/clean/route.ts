import { NextResponse } from 'next/server';
import {
  DatasetType,
  DataRow,
  CleaningProfile,
  CleaningResult,
  CleaningOptions,
  CleaningIssue,
} from '../../../../types/dataCleaningTypes';
import { ChatOpenAI } from '@langchain/openai';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

// Schema for LLM textual field cleaning output
const textualCleaningSchema = z.object({
  cleaned: z.boolean(),
  cleanedValue: z.string().optional(),
  issueDetected: z.boolean(),
  issueType: z.string().optional(),
  explanation: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
});

// Schema for batch LLM cleaning
const batchCleaningSchema = z.array(
  z.object({
    columnName: z.string(),
    rowIndex: z.number(),
    originalValue: z.string(),
    result: textualCleaningSchema,
  }),
);

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    const { dataset, profile, options } = body as {
      dataset: DatasetType;
      profile: CleaningProfile;
      options: CleaningOptions;
    };

    // Validate required data
    if (!dataset || !dataset.data || !dataset.headers) {
      return NextResponse.json({ error: 'Invalid dataset provided' }, { status: 400 });
    }

    if (!profile || !profile.rules) {
      return NextResponse.json({ error: 'Invalid cleaning profile provided' }, { status: 400 });
    }

    // Ensure LLM is enabled - force it to true regardless of what was sent
    const enhancedOptions: CleaningOptions = {
      ...options,
      useLLM: true, // Always use LLM
    };

    // Process the data cleaning (non-streaming)
    const result = await processDataCleaning(dataset, profile, enhancedOptions);

    // Return the result
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in data cleaning API:', error);
    return NextResponse.json({ error: 'Failed to process data cleaning request' }, { status: 500 });
  }
}

async function processDataCleaning(
  dataset: DatasetType,
  profile: CleaningProfile,
  options: CleaningOptions,
): Promise<CleaningResult> {
  const totalRows = dataset.data.length;

  try {
    // Clone the data to avoid modifying the original
    let cleanedData = [...dataset.data];

    // Track issue statistics
    const missingValuesFixed = {
      count: 0,
      columns: new Map<string, number>(),
    };

    const outliersDetected = {
      count: 0,
      columns: new Map<string, number>(),
    };

    const duplicatesRemoved = {
      count: 0,
    };

    // Track LLM cleaning statistics
    const llmCleaningStats = {
      fieldsProcessed: 0,
      contextualIssuesFixed: 0,
      insights: [] as string[],
      contextualIssues: new Map<string, { count: number; examples: string[] }>(),
    };

    // 1. Handle missing values
    if (options.handleMissingValues === 'drop') {
      const originalLength = cleanedData.length;
      cleanedData = cleanedData.filter((row) => {
        return !Object.values(row).some((value) => value === null);
      });
      missingValuesFixed.count = originalLength - cleanedData.length;
    } else if (options.handleMissingValues === 'impute') {
      // For each column with numeric values, calculate the mean
      // For each column with string values, use the mode
      const numericMeans = new Map<string, number>();
      const stringModes = new Map<string, string>();

      // Calculate means and modes
      dataset.headers.forEach((header) => {
        const values = dataset.data.map((row) => row[header]);
        const nonNullValues = values.filter((v) => v !== null) as (string | number | boolean)[];

        if (nonNullValues.length === 0) return;

        if (typeof nonNullValues[0] === 'number') {
          const sum = (nonNullValues as number[]).reduce((a, b) => a + b, 0);
          numericMeans.set(header, sum / nonNullValues.length);
        } else if (typeof nonNullValues[0] === 'string') {
          // Calculate mode (most frequent value)
          const counts = new Map<string, number>();
          (nonNullValues as string[]).forEach((val) => {
            counts.set(val, (counts.get(val) || 0) + 1);
          });

          let mode = nonNullValues[0] as string;
          let maxCount = 0;

          counts.forEach((count, value) => {
            if (count > maxCount) {
              maxCount = count;
              mode = value;
            }
          });

          stringModes.set(header, mode);
        }
      });

      // Apply imputation
      for (let i = 0; i < cleanedData.length; i++) {
        const row = cleanedData[i];
        const newRow = { ...row };

        dataset.headers.forEach((header) => {
          if (newRow[header] === null) {
            if (numericMeans.has(header)) {
              const mean = numericMeans.get(header);
              if (mean !== undefined) {
                newRow[header] = mean;
                missingValuesFixed.count++;
                missingValuesFixed.columns.set(header, (missingValuesFixed.columns.get(header) || 0) + 1);
              }
            } else if (stringModes.has(header)) {
              const mode = stringModes.get(header);
              if (mode !== undefined) {
                newRow[header] = mode;
                missingValuesFixed.count++;
                missingValuesFixed.columns.set(header, (missingValuesFixed.columns.get(header) || 0) + 1);
              }
            }
          }
        });

        cleanedData[i] = newRow;
      }
    } else if (options.handleMissingValues === 'replace') {
      // Replace missing values with custom value
      const replacementValue = options.replacementValue || 'N/A';

      for (let i = 0; i < cleanedData.length; i++) {
        const row = cleanedData[i];
        const newRow = { ...row };

        dataset.headers.forEach((header) => {
          if (newRow[header] === null) {
            newRow[header] = replacementValue;
            missingValuesFixed.count++;
            missingValuesFixed.columns.set(header, (missingValuesFixed.columns.get(header) || 0) + 1);
          }
        });

        cleanedData[i] = newRow;
      }
    }

    // 2. Handle outliers
    // Identify numeric columns
    const numericColumns = dataset.headers.filter((header) => {
      return dataset.data.some((row) => typeof row[header] === 'number');
    });

    for (const column of numericColumns) {
      // Calculate mean and standard deviation
      const values = cleanedData.map((row) => row[column]).filter((value) => value !== null) as number[];

      if (values.length === 0) {
        continue;
      }

      const sum = values.reduce((a, b) => a + b, 0);
      const mean = sum / values.length;

      const squaredDiffs = values.map((value) => Math.pow((value as number) - mean, 2));
      const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
      const stdDev = Math.sqrt(variance);

      // Identify outliers (values more than 3 standard deviations from the mean)
      const outlierThreshold = 3 * stdDev;

      for (let i = 0; i < cleanedData.length; i++) {
        const row = cleanedData[i];
        const value = row[column] as number | null;

        if (value === null) continue;

        const deviation = Math.abs(value - mean);
        if (deviation > outlierThreshold) {
          outliersDetected.count++;
          outliersDetected.columns.set(column, (outliersDetected.columns.get(column) || 0) + 1);

          if (options.handleOutliers === 'remove') {
            cleanedData[i] = { ...row, [column]: null };
          } else if (options.handleOutliers === 'cap') {
            // Winsorization: cap the value at the threshold
            cleanedData[i] = {
              ...row,
              [column]: value > mean ? mean + outlierThreshold : mean - outlierThreshold,
            };
          }
        }
      }
    }

    // 3. Remove duplicates
    if (options.removeDuplicates) {
      const seen = new Set<string>();
      const originalLength = cleanedData.length;
      const newCleanedData: DataRow[] = [];

      for (let i = 0; i < cleanedData.length; i++) {
        const row = cleanedData[i];
        // Create a string representation of the row for comparison
        const rowStr = JSON.stringify(row);

        if (!seen.has(rowStr)) {
          seen.add(rowStr);
          newCleanedData.push(row);
        }
      }

      duplicatesRemoved.count = originalLength - newCleanedData.length;
      cleanedData = newCleanedData;
    }

    // 4. Standardize column formats (simplified implementation)
    const columnsStandardized = options.standardizeColumns ? dataset.headers.length : 0;

    // 5. Apply LLM-based cleaning for text fields - Always run regardless of options
    // Identify text columns that should be processed
    const textColumns = dataset.headers.filter((header) => {
      return dataset.data.some((row) => typeof row[header] === 'string');
    });

    if (textColumns.length > 0) {
      // Always use OpenAI model
      const llm = new ChatOpenAI({
        modelName: 'gpt-3.5-turbo',
        temperature: options.llmTemperature || 0.2,
        maxTokens: options.llmMaxTokens || 1000,
      });

      // Create parser for structured output
      const parser = StructuredOutputParser.fromZodSchema(batchCleaningSchema);
      const formatInstructions = parser.getFormatInstructions();

      // Process text columns in batches to avoid excessive API calls
      for (const column of textColumns) {
        // Get column context from dataset analysis if available
        let columnContext = `Column "${column}" from ${profile.domain} domain.`;

        // Create a prompt template for this column
        const prompt = ChatPromptTemplate.fromTemplate(`
          You are an expert data cleaning assistant specializing in detecting and fixing contextual issues in textual data.
          
          # Context
          {columnContext}
          Dataset domain: {profileDomain}
          
          # Task
          You will be provided with a batch of text values from the "{column}" column.
          For each value, determine if there are contextual errors, inconsistencies, or anomalies that should be fixed.
          
          Types of issues to look for:
          1. Spelling errors
          2. Inconsistent formatting 
          3. Contextual inconsistencies (values that don't make sense in context)
          4. Outliers or values that don't match the expected pattern
          5. Mixed formats (e.g., different date formats or number formats)
          6. Domain-specific issues (e.g., invalid medical terms in healthcare data)
          
          # Instructions
          - For each value, determine if it needs cleaning
          - If it needs cleaning, provide a corrected version
          - Explain what issue was detected and how you fixed it
          - Assign a confidence score to your correction (0.0-1.0)
          - DO NOT "overcorrect" - only fix clear issues
          - If the value appears correct, mark it as not needing cleaning
          
          # Input Batch
          {valueBatch}
          
          {formatInstructions}
        `);

        // Create a chain
        const chain = prompt.pipe(llm).pipe(parser);

        // Process in small batches to avoid hitting token limits
        const batchSize = 10;
        for (let i = 0; i < cleanedData.length; i += batchSize) {
          const batch = cleanedData.slice(i, i + batchSize);

          // Prepare batch data for LLM
          const valueBatch = batch
            .map((row, idx) => {
              const value = row[column];
              // Only process string values that aren't null or empty
              if (typeof value === 'string' && value) {
                return {
                  columnName: column,
                  rowIndex: i + idx,
                  originalValue: value,
                };
              }
              return null;
            })
            .filter(Boolean);

          if (valueBatch.length === 0) continue;

          try {
            // Call the LLM to process this batch
            const result = await chain.invoke({
              columnContext: columnContext,
              profileDomain: profile.domain,
              column: column,
              valueBatch: JSON.stringify(valueBatch),
              formatInstructions: formatInstructions,
            });

            // Apply corrections from LLM
            result.forEach((item) => {
              const { rowIndex, result: cleaning } = item;

              if (cleaning.cleaned && cleaning.cleanedValue) {
                llmCleaningStats.fieldsProcessed++;

                if (cleaning.issueDetected) {
                  llmCleaningStats.contextualIssuesFixed++;

                  // Track column issues
                  if (!llmCleaningStats.contextualIssues.has(column)) {
                    llmCleaningStats.contextualIssues.set(column, { count: 0, examples: [] });
                  }

                  const columnStats = llmCleaningStats.contextualIssues.get(column)!;
                  columnStats.count++;

                  // Store a few examples for the issue report
                  if (columnStats.examples.length < 5) {
                    columnStats.examples.push(
                      `"${cleanedData[rowIndex][column]}" → "${cleaning.cleanedValue}": ${
                        cleaning.explanation || 'Issue fixed'
                      }`,
                    );
                  }

                  // Apply the correction
                  cleanedData[rowIndex] = {
                    ...cleanedData[rowIndex],
                    [column]: cleaning.cleanedValue,
                  };

                  // Add insight if high confidence correction
                  if (cleaning.confidence && cleaning.confidence > 0.8 && cleaning.explanation) {
                    if (llmCleaningStats.insights.length < 10) {
                      llmCleaningStats.insights.push(`Column "${column}": ${cleaning.explanation}`);
                    }
                  }
                }
              }
            });
          } catch (error) {
            console.error(`Error processing LLM batch for column ${column}:`, error);
            // Continue with next batch even if this one fails
          }
        }
      }
    }

    // Generate issues report
    // Convert Map to array for JSON serialization
    const missingValueColumns: { column: string; count: number }[] = [];
    missingValuesFixed.columns.forEach((count, column) => {
      missingValueColumns.push({ column, count });
    });

    const outlierColumns: { column: string; count: number }[] = [];
    outliersDetected.columns.forEach((count, column) => {
      outlierColumns.push({ column, count });
    });

    const issues: CleaningIssue[] = [];

    // Add missing value issues
    missingValueColumns.forEach(({ column, count }) => {
      issues.push({
        type: 'missing',
        column,
        count,
        action: `${
          options.handleMissingValues === 'impute'
            ? 'imputed with mean/mode'
            : options.handleMissingValues === 'drop'
            ? 'rows dropped'
            : 'replaced with custom value'
        }`,
      });
    });

    // Add outlier issues
    outlierColumns.forEach(({ column, count }) => {
      issues.push({
        type: 'outlier',
        column,
        count,
        action: `${
          options.handleOutliers === 'flag' ? 'flagged' : options.handleOutliers === 'remove' ? 'removed' : 'capped'
        }`,
      });
    });

    // Add duplicate issue if any were removed
    if (duplicatesRemoved.count > 0) {
      issues.push({
        type: 'duplicate',
        column: 'multiple',
        count: duplicatesRemoved.count,
        action: 'removed',
      });
    }

    // Add contextual issues from LLM cleaning
    llmCleaningStats.contextualIssues.forEach(({ count, examples }, column) => {
      issues.push({
        type: 'contextual',
        column,
        count,
        action: 'fixed with LLM',
        examples: examples,
      });
    });

    // Prepare and return the final result
    const result: CleaningResult = {
      cleanedData,
      summary: {
        rowsProcessed: dataset.data.length,
        missingValuesFixed: missingValuesFixed.count,
        outliersDetected: outliersDetected.count,
        duplicatesRemoved: duplicatesRemoved.count,
        columnsStandardized,
      },
      issues,
    };

    // Always include LLM-specific information
    result.summary.llmCleaningApplied = llmCleaningStats.fieldsProcessed;
    result.summary.contextualIssuesFixed = llmCleaningStats.contextualIssuesFixed;
    result.llmInsights = llmCleaningStats.insights;

    return result;
  } catch (error) {
    console.error('Error during data cleaning process:', error);
    throw new Error('An error occurred during data cleaning');
  }
}

// Replace the initializeLLM function with a simpler one that only uses OpenAI
function initializeLLM(options: CleaningOptions) {
  // Always use OpenAI
  return new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    temperature: options.llmTemperature || 0.2,
    maxTokens: options.llmMaxTokens || 1000,
  });
}
