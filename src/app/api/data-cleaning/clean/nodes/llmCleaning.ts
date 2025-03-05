import { NodeFunction } from './types';
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

/**
 * Node function for applying LLM-based cleaning to text fields
 *
 * Uses LLM to detect and fix contextual issues in text fields
 */
export const llmCleaning: NodeFunction = async (state) => {
  const { dataset, profile, options, cleanedData, llmCleaningStats } = state;
  let updatedData = [...cleanedData];
  const updatedLlmCleaningStats = {
    fieldsProcessed: llmCleaningStats.fieldsProcessed,
    contextualIssuesFixed: llmCleaningStats.contextualIssuesFixed,
    insights: [...llmCleaningStats.insights],
    contextualIssues: new Map(llmCleaningStats.contextualIssues),
  };

  // Identify text columns that should be processed
  const textColumns = dataset.headers.filter((header) => {
    return dataset.data.some((row) => typeof row[header] === 'string');
  });

  if (textColumns.length > 0) {
    // Initialize LLM
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
      for (let i = 0; i < updatedData.length; i += batchSize) {
        const batch = updatedData.slice(i, i + batchSize);

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
              updatedLlmCleaningStats.fieldsProcessed++;

              if (cleaning.issueDetected) {
                updatedLlmCleaningStats.contextualIssuesFixed++;

                // Track column issues
                if (!updatedLlmCleaningStats.contextualIssues.has(column)) {
                  updatedLlmCleaningStats.contextualIssues.set(column, { count: 0, examples: [] });
                }

                const columnStats = updatedLlmCleaningStats.contextualIssues.get(column)!;
                columnStats.count++;

                // Store a few examples for the issue report
                if (columnStats.examples.length < 5) {
                  columnStats.examples.push(
                    `"${updatedData[rowIndex][column]}" → "${cleaning.cleanedValue}": ${
                      cleaning.explanation || 'Issue fixed'
                    }`,
                  );
                }

                // Apply the correction
                updatedData[rowIndex] = {
                  ...updatedData[rowIndex],
                  [column]: cleaning.cleanedValue,
                };

                // Add insight if high confidence correction
                if (cleaning.confidence && cleaning.confidence > 0.8 && cleaning.explanation) {
                  if (updatedLlmCleaningStats.insights.length < 10) {
                    updatedLlmCleaningStats.insights.push(`Column "${column}": ${cleaning.explanation}`);
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

  return {
    cleanedData: updatedData,
    llmCleaningStats: updatedLlmCleaningStats,
  };
};
