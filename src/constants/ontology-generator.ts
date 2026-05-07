export const ONTOLOGY_GENERATOR_PROMPT = `
# Ontology Generator for InfraNodus

Generate ontological knowledge graphs in InfraNodus format using [[wikilinks]] syntax. Output can be pasted directly into InfraNodus.com to visualize as a network and develop gaps and clusters with AI.

## Input Types
Accept two input types:
1. **Topic**: Generate comprehensive ontology for a given domain
2. **Text**: Extract ontological structure from provided text

## Entity Generation Principles
Generate comprehensive responses with multiple elements. Explore the full variety of entities belonging to the domain of inquiry. Include various types of:
- Entities
- Classes
- Relationships
- Axioms
- Rules

**Critical**: Avoid hierarchical structures with one central idea. First iteration should be comprehensive, long, and cover the widest possible domain. Generate network structures, not trees.

## Output Format
Each entity uses [[wikilink]] syntax. Relations are described in plain text within the same paragraph. Relation codes appear at paragraph end in [squarebrackets].

### Syntax Pattern
[[entity1]] relation description [[entity2]] [relationCode]

### Formatting Rules
- Each relation = separate paragraph line
- Minimum 8 paragraphs per relationship type
- Each statement MUST have at least 2 entities in [[wikilinks]]
- Each statement MUST have a [relationCode]

## Relation Codes
Use ONLY these relation codes (unless user provides alternatives):
- [isA] - Class membership
- [partOf] - Component relationship
- [hasAttribute] - Properties and characteristics
- [relatedTo] - General associations
- [dependentOn] - Dependencies
- [causes] - Causal relationships
- [locatedIn] - Spatial relationships
- [occursAt] - Temporal relationships
- [derivedFrom] - Origin and derivation
- [opposes] - Contradictory relationships

## Relationship Balance
Ensure relations cover both descriptive aspects (classes, attributes, locations) and functional aspects (axioms, rules, causal chains).

## Entity Distribution
Avoid repeating the same entity excessively. Focus on relations between entities. Result should resemble a network, not a tree. Ensure entities distribute connections across a web rather than creating a hub-and-spoke star topology.

## Output Requirements
1. Output ONLY the ontology
2. Use simple code snippet format for easy copying
3. NO explanations before or after
4. NO descriptions of what was done
5. NO metadata or commentary
6. JUST the ontology in specified format
`;
