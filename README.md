# Multidisciplinary Analysis Client

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.6784231.svg)](https://doi.org/10.5281/zenodo.6784231)

The tool can be used at this link: [https://mdac.martinsson-bonde.com/](https://mdac.martinsson-bonde.com/)

## How to use
MDAC is an interactive data visualisation tool. It uses a parallel coordinates diagram to display the data, which the user can interact with by adding filters.

### Visualise and interact with a dataset.
This guide will go through how to visualize and interact with a dataset.
#### 1. Import data
The data needs to be of CSV-format, delimitted by either commas, semi-colons, or tabs. Load your CSV file using the file selector in the top right corner. If the plot looks strange, then you may need to change delimitor in the drop-down menu next to the file selector.  

#### 2. Adjust axes
You can click on a data axis to highlight that axis. Highlighting it causes the data to be colored based on the upper and lower bounds of the data on that axis. Highlighted axes can also be tweaked using the menu that shows up to the left. This menu allows you to change the bounds of the axis, or delete it, etc.

#### 3. Add and adjust filters
Clicking and dragging over an axis creates a filter. Filters causes data that does not pass through it to become hidden. Two filters on two separate axis creates an "AND"-condition. Two filters on the same axis creates an "OR"-condition. When a new filter is created, it is added to the filter list in the menu to the left. Filters can be fine-tuned in the left-hand menu such that the filters act on specific values.

### Analysis

#### Similarity analysis
If your dataset contains two or more types of fidelities (e.g., simulated data vs surrogate model data), then a similarity analysis can be performed. First, determine which of your columns are inputs and outputs by navigating to the data tab or the data settings tab, and configuring your columns accordingly. Then, Navigate to the similarity analysis tool. It is important that your data has a categorical data column that is string-based, which differentiates the two different types of data. Select that column in as the `Fidelity column`. Then, select which category represents the highest fidelity as the `HiFi indicator`. Finally, choose if you want to analyse input or output data, and click `Calculate inter-similarity`. This will result in a new column in the PCP. This can be used to color-code the data, and can also be used in the scatter plot view. If you are not satisfied with your data configuration, then you can tweak your configuration and redo the analysis, which will overwrite the inter-similarity column.

## Development

### Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
