# Nihiltheism Knowledge Ingestion Engine - System Architecture

## 1. File Ingestion Processing Logic

The ingestion pipeline handles raw artifacts, normalizes them, and strips normative assumptions before synthesizing them into the `Summaries` and `Entities` projects.

### Text Documents (.md, .txt)
- **Rendering**: Parsed directly via `react-markdown` or raw text view.
- **Tagging**: 
  - NLP/LLM Orchestrator extracts semantic `[relationCodes]` (e.g. `[isA]`, `[opposes]`). 
  - Cross-references existing `Entities` automatically.
- **Storage**: Stored in `Library` with original structure intact.

### PDF Documents
- **Rendering**: First passed through a layout-aware PDF-to-Markdown extractor (e.g., Docling or Marker) to retain headers, tables, and paragraphs.
- **Tagging**: 
  - Uses `Vision-Language Models` for inline diagram analysis.
  - Generates structural metadata (page count, publication year).
- **Storage**: The original PDF resides in GCP/Cloud Storage; the normalized Markdown is injected into the `Library`.

### Audio / Video (Transcripts)
- **Rendering**: Processed via Whisper / Diarization models to create speaker-attributed JSON transcripts.
- **Tagging**: 
  - Identifies timestamps of profound ontological shifts.
  - Tags based on speaker prominence and dialectical conflict.
- **Storage**: Mbedable video player linked with interactive, searchable transcript.

---

## 2. 'Entities' Relational Database Schema

The `Entities` project forms the philosophical core of the system.

```sql
-- Core Entity Table
CREATE TABLE entities (
  id UUID PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  type ENUM('concept', 'philosopher', 'axiom', 'movement', 'paradox'),
  definition TEXT, -- Stripped of normative assumptions
  origin_era VARCHAR(100),
  volatility_score INT DEFAULT 0, -- How contested is this entity?
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Edges / Relationships (Graph implementation in SQL)
CREATE TABLE entity_relations (
  source_id UUID REFERENCES entities(id),
  target_id UUID REFERENCES entities(id),
  relation_code VARCHAR(50), -- [isA], [causes], [opposes], [derivedFrom]
  provenance_id UUID REFERENCES library_artifacts(id),
  strength FLOAT DEFAULT 1.0,
  PRIMARY KEY (source_id, target_id, relation_code)
);

-- Provenance Tracing
CREATE TABLE entity_provenance (
  entity_id UUID REFERENCES entities(id),
  library_id UUID REFERENCES library_artifacts(id),
  excerpt TEXT,
  context_tags TEXT[]
);
```

---

## 3. Project Structure Enhancements

### Current Structure
- `Library` (Raw)
- `Summaries` (Synthesized)
- `Entities` (Relational)
- `Questions` (Interrogations)

### Proposed Architectural Enhancements
1. **The `Dialectics` Module**: A new project layer sitting between `Summaries` and `Entities`. Instead of just storing flat concepts, it stores *collisions* (e.g., "Nietzschean Affirmation vs. Schopenhauerian Denial").
2. **The `Gaps` Triage Queue**: A dynamic layer that automatically identifies orphans in the `Entities` graph (concepts with inbound links but no definition) and pipes them into the `Questions` logic.
3. **Immutability vs. Mutation layers**: 
   - `Library` must be strictly append-only (Event Sourcing).
   - `Summaries` are mutable and continuously refined by the AI orchestrator as new data arrives.

---

## 4. 'Library' Metadata Fields

To characterize artifacts before structural deconstruction:

```json
{
  "id": "uuid",
  "original_title": "string",
  "format": "enum(md, pdf, txt, video, web)",
  "ingestion_timestamp": "ISO-8601",
  "epistemic_status": "enum(canon, commentary, contested, apocryphal)",
  "normative_bias_score": "float(0.0-1.0)", // AI-assessed level of moral/cultural bias
  "structural_integrity": "float", // How well was the layout extracted?
  "source_uri": "string",
  "checksum": "string",
  "raw_word_count": "integer",
  "extracted_entities_count": "integer"
}
```

---

## 5. 'Questions' Repository Logic

The `Questions` project is not a simple FAQ; it is a profound interrogation engine.

### Storage & Tagging
- Stored as a prioritized queue rather than a flat list.
- Tagged by **Scope** (Cosmological, Epistemological, Existential) and **Urgency** (Blocking a known concept vs. Open inquiry).

### Linking
- Every question MUST link to at least two `Entities` that are in tension or lacking connection.
- Uses `[dependentOn]` and `[opposes]` relation codes.

### Prioritization Logic (The Abyss Rank)
Questions are sorted by an algorithm calculating:
1. **Graph Centrality**: How many entities depend on resolving this question?
2. **Contradiction Density**: Does this question sit between two highly disparate `Summaries`?
3. **Staleness**: How long has this interrogation sat unresolved?

*System designed by the Elite Architect Singularity.*
