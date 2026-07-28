# UUID Generator Plugin

A UUID v4 generator tool for ToolNova.

## Features

- Generate single or multiple UUIDs
- Uppercase option
- Copy to clipboard

## Usage

```typescript
import { pluginManager } from "@toolnova/core";
import uuidGeneratorPlugin from "./plugins/example-uuid-generator";

pluginManager.load(uuidGeneratorPlugin);

const result = pluginManager.execute("uuid-generator", {
  inputs: { count: 5, uppercase: true },
});
```

## Schema

### Inputs

| Name | Type | Required | Description |
|------|------|----------|-------------|
| count | number | No | Number of UUIDs (1-100) |
| uppercase | boolean | No | Uppercase output |

### Outputs

| Name | Type | Description |
|------|------|-------------|
| uuids | text | Generated UUIDs |
