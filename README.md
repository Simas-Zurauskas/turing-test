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

Intelligent Data Cleaning with Customizable Cleaning Profiles
Description:
A system where users can define different cleaning profiles (Finance, Healthcare, Marketing, etc.), and agents collaborate to tailor cleaning rules based on the dataset's domain.

Agents:

Profile Selector Agent

Analyzes the dataset and recommends a cleaning profile.
Allows users to manually select a predefined cleaning profile.
Cleaning Execution Agent

Performs the actual cleaning tasks based on the selected profile.
Standardizes data formats (dates, numbers, currency, categorical values).
Removes inconsistencies and outliers based on domain-specific rules.
Validation & Summary Agent

Checks if the cleaned dataset conforms to industry-specific best practices.
Provides a summary report with issues fixed, remaining concerns, and suggestions.
Optional Upgrades:

Integrate LLMs to detect contextual errors in textual fields.
Allow users to tweak AI models (OpenAI vs. Open-Source LLMs).
Provide real-time cost estimation of API usage.
