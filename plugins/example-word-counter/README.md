# Word Counter Plugin

A simple word counter tool for ToolNova.

## Features

- Count words
- Count characters
- Count sentences
- Count paragraphs

## Usage

```typescript
import { pluginManager } from "@toolnova/core";
import wordCounterPlugin from "./plugins/example-word-counter";

pluginManager.load(wordCounterPlugin);

const result = pluginManager.execute("word-counter", {
  inputs: { text: "Hello world. This is a test." },
});
```

## Schema

### Inputs

| Name | Type | Required | Description |
|------|------|----------|-------------|
| text | textarea | Yes | Text to count |

### Outputs

| Name | Type | Description |
|------|------|-------------|
| words | number | Word count |
| characters | number | Character count |
| sentences | number | Sentence count |
| paragraphs | number | Paragraph count |
