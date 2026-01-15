# Achuar Language Resources

Resources for transcription, data enrichment, and RAG (Retrieval-Augmented Generation) for the Domo Achuar app.

---

## Language Overview

```
Language Family: Jivaroan (Chicham)
Speakers: ~7,000 (Ecuador & Peru)
Related to: Shuar, Huambisa
Script: Latin alphabet with special characters

Vowels: a, e, i, u (+ nasal: ã, ẽ, ĩ, ũ)
Special consonants: ch, ng, ñ, ts, ' (glottal stop)
Dialects: Anasu (AN), Corrientes (C), Huasaga (HUA), Huitoyacu (HUI), Puránchim (P)
```

---

## Grammar & Pronunciation

| Resource | URL | Description |
|----------|-----|-------------|
| **SIL Achuar Grammar (PDF)** | https://www.sil.org/system/files/reapdata/45/52/83/45528358940634105848122717401297373783/dt20.pdf | 141-page grammar of Achuar-Shiwiar language by Gerhard Fast & Ruby Fast (1981) |
| **Native Languages Pronunciation Guide** | https://www.native-languages.org/achuar_guide.htm | Alphabet, vowels, consonants, pronunciation tips |

---

## Dictionaries

| Resource | URL | Description |
|----------|-----|-------------|
| **Diccionario Achuar-Shiwiar (SIL)** | https://www.sil.org/resources/archives/29643 | 517-page official dictionary (1996) |
| **Archive.org Full Text** | https://archive.org/stream/achuarshiwiardiccionario | Searchable dictionary text |
| **Pueblos Originarios** | https://pueblosoriginarios.com/lenguas/achuar/achuar/achuar.html | Interactive dictionary with PDF download |
| **Scribd PDF** | https://www.scribd.com/document/369011404/diccionario-achuar-shiwiar | Dictionary PDF |
| **Léxico por campos semánticos** | https://abyayala.org.ec/producto/lexico-achuar-chicham-por-campos-semanticos-pdf/ | Semantic field lexicon |

---

## Audio & Archive Resources

| Resource | URL | Description |
|----------|-----|-------------|
| **AILLA Archive** | https://ailla.utexas.org/ | Archive of Indigenous Languages of Latin America - has Achuar ceremonial recordings |
| **OLAC Language Resources** | http://www.language-archives.org/language/acu | Catalog of all Achuar language materials |

---

## Academic Resources (Ethnobiology & Traditional Ecological Knowledge)

| Resource | Author | Description |
|----------|--------|-------------|
| **In the Society of Nature** | Philippe Descola | Ethnography of Achuar ecology, hunting, animals (Archive.org) |
| **The Spears of Twilight** | Philippe Descola | Personal account of life with Achuar |
| **Beyond Nature and Culture** | Philippe Descola | Achuar animism - animals have souls, act like persons |

### Cultural Insight (Important for App Design)

From Philippe Descola's research: The Achuar believe wild animals have souls ("anima") - they think of animals as persons (peccary-persons, tapir-persons, toucan-persons). "Mothers of game" punish over-hunting. This cosmology should be reflected in how we present animal information in the app - with respect for the Achuar worldview that animals are not just resources but beings with agency.

---

## Transcription Strategy

### Challenge
Achuar is NOT in Whisper/Google Speech-to-Text training data.

### Recommended Approach

1. **Primary**: Use Spanish transcription (most speakers are bilingual)
2. **Achuar words**: Store as audio + manual transcription
3. **Future**: Fine-tune Whisper with collected Achuar audio data
4. **RAG**: Use dictionary entries to enrich AI responses with Achuar terms

### Whisper Workaround
From OpenAI community discussions:
- Specify `language="es"` (Spanish) as closest supported language
- Accept that Achuar-specific words may be mistranscribed
- **Always store original audio as ground truth**

---

## RAG Enrichment Data Sources

For enriching AI responses with Achuar knowledge:

| Source | Use Case |
|--------|----------|
| **Diccionario Achuar-Shiwiar** | Animal names in Achuar |
| **Philippe Descola's ethnographies** | Cultural context, traditional beliefs |
| **Community voice recordings** | Primary source of traditional knowledge |
| **iNaturalist Ecuador data** | Scientific names cross-reference |
| **Libro Rojo de los Mamíferos del Ecuador** | Conservation status |

---

## Implementation Notes

### For Voice Recording Feature
- Always save original audio file (never discard)
- Transcribe to Spanish for searchability
- Tag with species/topic for RAG retrieval
- Store speaker attribution (optional, for community credit)

### For RAG System
- Extract animal names from Diccionario for entity matching
- Use vector embeddings on transcriptions for semantic search
- Combine scientific facts (Perplexity/Gemini) with community knowledge
- Display: "Según la comunidad Achuar: [quote]" with playback option

### For Future Development
- Collect high-quality Achuar audio samples
- Partner with linguists for transcription validation
- Consider fine-tuning speech model on collected data
- Build Achuar vocabulary list for species encountered

---

## Related Documentation

- [Product Requirements (PRD)](./PRD.md)
- [Development Setup](./SETUP.md)
