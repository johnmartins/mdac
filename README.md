# Multidisciplinary Analysis Client

[![DOI](https://zenodo.org/badge/459617015.svg)](https://zenodo.org/badge/latestdoi/459617015)

## How to use
MDAC is an interactive data visualisation tool. It uses a parallel coordinates diagram to display the data, which the user can interact with by adding filters.

### 1. Import data
The data needs to be of CSV-format, delimitted by either commas, semi-colons, or tabs. Load your CSV file using the file selector in the top right corner. If the plot looks strange, then you may need to change delimitor in the drop-down menu next to the file selector.  

### 2. Adjust axes
You can click on a data axis to highlight that axis. Highlighting it causes the data to be colored based on the upper and lower bounds of the data on that axis. Highlighted axes can also be tweaked using the menu that shows up to the left. This menu allows you to change the bounds of the axis, or delete it, etc.

### 3. Add and adjust filters
Clicking and dragging over an axis creates a filter. Filters causes data that does not pass through it to become hidden. Two filters on two separate axis creates an "AND"-condition. Two filters on the same axis creates an "OR"-condition. When a new filter is created, it is added to the filter list in the menu to the left. Filters can be fine-tuned in the left-hand menu such that the filters act on specific values.

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
