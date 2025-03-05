# szurau-AE.3.5

Sprint: AI Agents

## Setup Instructions

1. **Install Dependencies**

   Install the project dependencies using Yarn:

   ```bash
   yarn install
   ```

2. **Run the Project**

   Start the project using Yarn:

   ```bash
   yarn dev
   ```

## Application Overview

### Intelligent Data Cleaning with Customizable Cleaning Profiles

This application provides an intelligent data cleaning platform that leverages AI to automatically detect and fix issues in datasets. It implements customizable cleaning profiles tailored to specific domains and data types, allowing users to:

- Analyze datasets to identify data quality issues
- Apply intelligent cleaning operations with configurable parameters
- Use AI-powered contextual cleaning for textual data
- Generate comprehensive reports on data quality issues

#### LangGraph Implementation

The data cleaning workflow is implemented as a directed graph using LangGraph:

- **StateGraph Architecture**: The application uses a `StateGraph` to define a multi-stage cleaning pipeline
- **Node-based Processing**: Each cleaning operation (missing value handling, outlier detection, etc.) is implemented as a separate node in the graph
- **Deterministic Workflow**: The graph establishes a clear sequence of operations with defined data transformations at each step

#### AI Agent Architecture

The application implements AI agents for intelligent data operations:

- **Analysis Agent**: Examines the dataset to identify potential issues, recommending appropriate cleaning strategies
- **Cleaning Agent**: Applies contextual understanding to clean textual data, detecting and fixing inconsistencies
- **Report Generator**: Creates detailed reports on the cleaning process and remaining data quality issues

The agent system uses LangGraph to coordinate the different stages of processing, maintaining state throughout the cleaning workflow and ensuring each operation builds upon the results of previous steps.
