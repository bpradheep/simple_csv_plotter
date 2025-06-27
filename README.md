# CSV Plotter

A powerful and flexible web-based tool for visualizing CSV data with interactive charts.

## Overview

CSV Plotter is a client-side web application that allows users to visualize data from CSV files using interactive charts. It provides an intuitive interface for selecting columns to plot, customizing chart types and colors, and dynamically updating visualizations.

## Features

- **Simple CSV Upload**: Easily upload any CSV file with a simple file selector.
- **Dynamic Column Selection**: Choose which columns to display on X and Y axes.
- **Multiple Chart Types**: Select from line, bar, scatter, bubble, radar, polarArea, doughnut, and pie charts for each data series.
- **Custom Colors**: Choose custom colors for each data series using a color picker.
- **Primary/Secondary Y-Axis**: Plot data with different scales on primary or secondary Y-axes.
- **Real-time Refresh**: Reload the data file and maintain your visualization settings.
- **Interactive Charts**: Zoom, pan, and explore your data with interactive chart controls.
- **Application Filtering**: Filter data by application name if available in the CSV.

## Usage

1. **Load a CSV File**:

   - Click the file input to select a CSV file from your computer.
   - The application will parse the file and display column selection options.

2. **Select Columns**:

   - Choose one column for the X-axis (typically a timestamp or category).
   - Select one or more columns for the Y-axis to visualize.

3. **Customize Your Chart**:

   - For each Y-axis column, you can:
     - Select a chart type (line, bar, scatter, bubble, radar, polarArea, doughnut, or pie)
     - Choose a custom color
     - Assign to primary or secondary Y-axis for different scales

4. **Generate Visualization**:

   - Click the "Plot Selected Columns" button to create your chart.
   - The chart will automatically update based on your selections.

5. **Interact with the Chart**:

   - Zoom in/out using mouse wheel or pinch gestures
   - Pan by clicking and dragging
   - Reset zoom with the "Reset Zoom" button

6. **Refresh Data**:
   - Click the "Refresh" button to reload the CSV file with updated data
   - Your column selections and chart settings will be preserved

## Special Formatting

- **Timestamp Handling**: Columns named "timestamp" receive special formatting for better readability.
- **Application Filtering**: If your CSV contains an "application_name" column, the tool will automatically generate a filter dropdown.

## Sample CSV Files

The repository includes several sample CSV files to help you get started and showcase different chart types:

1. **time_series_data.csv**: Demonstrates time series data visualization with line and scatter charts.
2. **comparison_data.csv**: Shows how to compare different categories using bar and radar charts.
3. **distribution_data.csv**: Perfect for pie, doughnut, and polarArea charts to show proportions.
4. **correlation_data.csv**: Illustrates relationships between variables using scatter and bubble charts.
5. **application_metrics.csv**: Demonstrates the application filtering feature with multiple application names.

To use these samples:

1. Download the desired sample file from the `sample_data` folder
2. Upload it to the application using the file input
3. Experiment with different chart types and settings

## Visualization Guide

For detailed step-by-step examples with screenshots, please check out the comprehensive `visualization_guide.md` in the `sample_data` folder. This guide includes:

- Line charts with time series data
- Bar charts for comparison
- Pie and doughnut charts for distributions
- Scatter plots for correlation analysis
- Bubble charts for multi-dimensional analysis
- Radar charts for multi-variable comparison
- Application filtering examples

The guide provides specific instructions for each chart type, along with sample images of the expected output.

## Getting Started

1. Clone this repository or download the source files.
2. Open `index.html` in a modern web browser (Chrome, Firefox, Edge, etc.).
3. Upload your CSV file and start visualizing your data!

## Requirements

- Modern web browser with JavaScript enabled
- CSV files with headers in the first row
- No server-side components required - runs entirely in the browser

## Implementation Details

CSV Plotter is built using:

- HTML5, CSS3, and vanilla JavaScript
- Chart.js for interactive data visualization
- FileReader API for client-side file handling

## License

This project is open source and available under the MIT License.

## Contributing

Contributions, bug reports, and feature requests are welcome! Feel free to submit issues or pull requests.
