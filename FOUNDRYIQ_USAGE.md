# Microsoft Azure AI Foundry & Foundry IQ Integration

This document details how **Microsoft Azure AI Foundry**, **Foundry IQ**, and **Azure AI Search** were utilized during the development of **FoundryForge** to ground architectural reasoning and provide hallucination-free compliance verification.

## Microsoft Technologies Used

*   **Azure AI Foundry Agent**: Acts as the orchestration layer for managing software architecture tasks, delegating prompt processing and managing agent state.
*   **Microsoft Foundry IQ**: The retrieval-augmented generation (RAG) system developed for grounded knowledge retrieval, serving as the interface between the LLM and custom standard repositories.
*   **GPT-4.1-mini**: The primary reasoning model utilized for complex architectural planning, requirements analysis, and system decomposition.
*   **text-embedding-3-small**: The embedding model used to generate semantic vectors of standard documents, enabling low-latency semantic search and relevance matching.
*   **Azure AI Search**: The search engine index (`foundryforgesrch`) storing compliance standards, React structure guides, and template blueprints to ground all AI recommendations.

---

## Key Features & RAG Integration Workflow

FoundryForge implements a secure, grounded compliance pipeline utilizing the following flow:

### 1. Vector Search and Semantic Retrieval
When a user initiates an architecture planning session, the request is parsed and queried against the `foundryforgesrch` index in Azure AI Search. Using `text-embedding-3-small`, the system matches the query with custom architectural guidelines (e.g., React standards, database indexing policies, or security compliance checklists).

### 2. Live Agent Grounded Reasoning
The context retrieved from Azure AI Search is injected directly into the prompt context for the **Azure AI Foundry Agent** (powered by `GPT-4.1-mini`). This prevents the model from hallucinating file structures or proposing unsupported library configurations:
*   **Prompt Structure**:
    ```text
    You are an AI Software Architect querying the Foundry IQ database.
    Please answer this query using the grounded knowledge in your search index (foundryforgesrch)...
    ```
*   **Outcome**: The generated code files and architectural specifications match the enterprise blueprints exactly.

### 3. Local Offline Fallback
To ensure maximum availability, the **Foundry IQ** interface in `api/mcp.ts` implements a hybrid local-matching routing engine. If the Azure AI Foundry cloud endpoints are unreachable, it falls back to a local keyword-relevance parser scanning matching markdown blueprint standards in the `/kb` directory.

---

## 💡 Benefits & Outcomes
*   **Zero Hallucinations**: Code generated for libraries like React Router or Tailwind CSS is strictly grounded in the official standards index, avoiding deprecated API usage.
*   **Secure by Design**: Enforces security rules (TLS 1.3, AES-256 database encryption, rate limiting) on every generated blueprint by referencing the security compliance indices.
*   **Stateless MCP Compatibility**: Exposes this grounded intelligence as tools to external developer agents using the Model Context Protocol (MCP).
