document.getElementById('addFileButton').addEventListener('click', addFileUploadRow);

// Initialize event handlers for the existing first row
initializeExistingRow();

function initializeExistingRow() {
  // Get the first row that's already in the HTML
  const firstRow = document.querySelector('.file-upload-row');

  // Add a unique ID to the existing row
  firstRow.id = 'row-' + Date.now();

  // Add event listener to the file input in the existing row
  const fileInput = firstRow.querySelector('.csvFileInput');
  if (fileInput) {
    fileInput.addEventListener('change', handleFileUpload);
  }

  // Add event listener to the refresh button
  const refreshButton = firstRow.querySelector('.refresh-button');
  if (refreshButton) {
    refreshButton.addEventListener('click', handleRefresh);
  }
  // Add event listener to the plot button
  const plotButton = firstRow.querySelector('.plotButton');
  if (plotButton) {
    plotButton.addEventListener('click', () => plotSelectedColumns(firstRow));
  }

  // Add event listener to the reset zoom button
  const resetZoomButton = firstRow.querySelector('.reset-zoom-button');
  if (resetZoomButton) {
    resetZoomButton.addEventListener('click', () => {
      const chart = firstRow.querySelector('.chart').chart;
      if (chart) {
        chart.resetZoom();
      }
    });
  }
}

// Initialize the first row
// addFileUploadRow(); // Now removed since we're using the existing row in HTML

function addFileUploadRow() {
  const container = document.getElementById('fileUploadContainer');

  // Clear the container if adding the first row
  if (document.querySelectorAll('.file-upload-row').length === 0) {
    container.innerHTML = '';
  }

  const row = document.createElement('div');
  row.className = 'file-upload-row';
  // Add unique ID to the row
  row.id = 'row-' + Date.now();

  // File input container
  const fileInputContainer = document.createElement('div');
  fileInputContainer.className = 'file-input-container';

  // File input
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.className = 'csvFileInput';
  fileInput.accept = '.csv';
  fileInput.addEventListener('change', handleFileUpload);

  // Refresh button
  const refreshButton = document.createElement('button');
  refreshButton.className = 'refresh-button';
  refreshButton.textContent = 'Refresh';
  refreshButton.addEventListener('click', handleRefresh);

  fileInputContainer.appendChild(fileInput);
  fileInputContainer.appendChild(refreshButton);

  // Column selector container
  const columnSelectorContainer = document.createElement('div');
  columnSelectorContainer.className = 'column-selector-container';

  // X-axis selector
  const xAxisSelector = document.createElement('div');
  xAxisSelector.className = 'x-axis-selector';
  const xAxisTitle = document.createElement('h3');
  xAxisTitle.textContent = 'X-Axis Column';
  const xAxisOptions = document.createElement('div');
  xAxisOptions.className = 'x-axis-options';
  xAxisSelector.appendChild(xAxisTitle);
  xAxisSelector.appendChild(xAxisOptions);

  // Y-axis selector
  const yAxisSelector = document.createElement('div');
  yAxisSelector.className = 'y-axis-selector';
  const yAxisTitle = document.createElement('h3');
  yAxisTitle.textContent = 'Y-Axis Columns';
  const yAxisOptions = document.createElement('div');
  yAxisOptions.className = 'y-axis-options';
  yAxisSelector.appendChild(yAxisTitle);
  yAxisSelector.appendChild(yAxisOptions);

  columnSelectorContainer.appendChild(xAxisSelector);
  columnSelectorContainer.appendChild(yAxisSelector);

  // Plot button
  const plotButton = document.createElement('button');
  plotButton.className = 'plotButton';
  plotButton.textContent = 'Plot Selected Columns';
  plotButton.disabled = true;
  plotButton.addEventListener('click', () => plotSelectedColumns(row));
  // Chart container
  const chartContainer = document.createElement('div');
  chartContainer.className = 'chart-container';

  // Chart controls
  const chartControls = document.createElement('div');
  chartControls.className = 'chart-controls';
  chartControls.style.textAlign = 'right';
  chartControls.style.marginBottom = '10px';

  // Reset zoom button
  const resetZoomButton = document.createElement('button');
  resetZoomButton.textContent = 'Reset Zoom';
  resetZoomButton.className = 'reset-zoom-button';
  resetZoomButton.style.padding = '5px 10px';
  resetZoomButton.style.marginLeft = '10px';
  resetZoomButton.addEventListener('click', () => {
    if (row.querySelector('.chart').chart) {
      row.querySelector('.chart').chart.resetZoom();
    }
  });

  chartControls.appendChild(resetZoomButton);
  chartContainer.appendChild(chartControls);

  const chart = document.createElement('canvas');
  chart.className = 'chart';
  chartContainer.appendChild(chart);

  // Append all elements to the row
  row.appendChild(fileInputContainer);
  row.appendChild(columnSelectorContainer);
  row.appendChild(plotButton);
  row.appendChild(chartContainer);

  // Append the row to the container
  container.appendChild(row);
}

function handleFileUpload(event) {
  const fileInput = event.target;
  const row = fileInput.closest('.file-upload-row');
  const file = fileInput.files[0];

  if (file) {
    // Store the file path for refresh operations
    if (file.path) {
      // If available (may not be in all browsers)
      row.dataset.filePath = file.path;
    } else if (fileInput.value) {
      // Fallback to input value (may be sanitized in some browsers)
      row.dataset.filePath = fileInput.value;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const text = e.target.result;
      parseCSV(text, row);

      // Check if this was a refresh operation and restore selections if it was
      if (row.dataset.wasRefreshed === 'true') {
        // Let the UI update first, then restore selections
        setTimeout(() => {
          restoreSelections(row);
          // Auto plot the chart
          plotSelectedColumns(row);
          // Clear the refresh flag
          delete row.dataset.wasRefreshed;
          console.log('Refresh completed successfully');
        }, 100);
      }
    };
    reader.readAsText(file);
  }
}

function parseCSV(input, row) {
  let text;

  // Check if input is ArrayBuffer (from readAsArrayBuffer) and convert it to text
  if (input instanceof ArrayBuffer) {
    const decoder = new TextDecoder('utf-8');
    text = decoder.decode(input);
  } else {
    // If it's already text (from readAsText), use it directly
    text = input;
  }

  // Split by lines and handle different line endings
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');

  if (lines.length > 0) {
    // Extract header row and trim whitespace from each column name
    const header = lines[0].split(',').map(column => column.trim());

    // Extract data rows
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() !== '') {
        const values = lines[i].split(',').map(item => item.trim());
        data.push(values);
      }
    }

    // Log for debugging
    console.log('CSV Headers:', header);
    console.log('CSV Rows count:', data.length);

    displayColumnSelectors(header, row, data);
  } else {
    alert('No data found in the CSV file');
  }
}

function displayColumnSelectors(header, row, csvData) {
  const xAxisOptions = row.querySelector('.x-axis-options');
  const yAxisOptions = row.querySelector('.y-axis-options');

  // Create or get filter container
  let filterContainer = row.querySelector('.filter-container');
  if (!filterContainer) {
    filterContainer = document.createElement('div');
    filterContainer.className = 'filter-container';
    // Insert it before the column selector container
    const columnSelectorContainer = row.querySelector('.column-selector-container');
    row.insertBefore(filterContainer, columnSelectorContainer);
  }

  // Clear existing options
  xAxisOptions.innerHTML = '';
  yAxisOptions.innerHTML = '';
  filterContainer.innerHTML = '';

  // Create radio buttons for X-axis selection
  header.forEach((column, index) => {
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = `x-axis-${row.id}`;
    radio.id = `x-col-${index}-${row.id}`;
    radio.value = index;
    // Add some styling and improve usability
    radio.style.marginRight = '5px';

    const label = document.createElement('label');
    label.htmlFor = radio.id;
    label.textContent = column;

    const div = document.createElement('div');
    div.appendChild(radio);
    div.appendChild(label);
    div.style.margin = '5px 0';
    div.style.cursor = 'pointer';
    div.style.width = '100%';

    // Click on div also selects the radio button
    div.addEventListener('click', function () {
      radio.checked = true;
    });

    xAxisOptions.appendChild(div);
  });
  // Create checkboxes for Y-axis selection
  header.forEach((column, index) => {
    const checkboxDiv = document.createElement('div');
    checkboxDiv.style.display = 'flex';
    checkboxDiv.style.alignItems = 'center';
    checkboxDiv.style.margin = '5px 0';
    checkboxDiv.style.cursor = 'pointer';

    // Checkbox for selecting the column
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `y-col-${index}-${row.id}`;
    checkbox.value = index;
    checkbox.style.marginRight = '5px';

    // Label for column name
    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.textContent = column;
    label.style.flexGrow = '1';

    // Color picker for this column
    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.className = 'color-picker';
    colorPicker.id = `color-picker-${index}-${row.id}`;
    colorPicker.style.marginLeft = '10px';
    colorPicker.style.width = '40px';
    colorPicker.style.height = '25px';
    colorPicker.value = `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')}`;

    // Chart type selector for this column
    const chartTypeSelector = document.createElement('select');
    chartTypeSelector.className = 'chart-type-selector';
    chartTypeSelector.id = `chart-type-${index}-${row.id}`;
    chartTypeSelector.style.marginLeft = '10px';
    ['line', 'bar', 'scatter', 'bubble', 'radar', 'polarArea', 'doughnut', 'pie'].forEach(type => {
      const option = document.createElement('option');
      option.value = type;
      option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
      chartTypeSelector.appendChild(option);
    });
    chartTypeSelector.value = 'line';
    chartTypeSelector.style.display = 'none'; // Hide initially, show when checked

    // Axis selector (primary/secondary)
    const axisSelector = document.createElement('select');
    axisSelector.id = `y-axis-type-${index}-${row.id}`;
    axisSelector.className = 'axis-selector';
    axisSelector.style.marginLeft = '10px';
    axisSelector.style.display = 'none';
    const primaryOption = document.createElement('option');
    primaryOption.value = 'primary';
    primaryOption.textContent = 'Primary Y-Axis';
    axisSelector.appendChild(primaryOption);
    const secondaryOption = document.createElement('option');
    secondaryOption.value = 'secondary';
    secondaryOption.textContent = 'Secondary Y-Axis';
    axisSelector.appendChild(secondaryOption);

    // Show/hide axis selector, color picker, and chart type selector based on checkbox state
    checkbox.addEventListener('change', function () {
      axisSelector.style.display = this.checked ? 'inline-block' : 'none';
      colorPicker.style.display = this.checked ? 'inline-block' : 'none';
      chartTypeSelector.style.display = this.checked ? 'inline-block' : 'none';
    });
    colorPicker.style.display = 'none';
    chartTypeSelector.style.display = 'none';

    // Add elements to the div
    checkboxDiv.appendChild(checkbox);
    checkboxDiv.appendChild(label);
    checkboxDiv.appendChild(axisSelector);
    checkboxDiv.appendChild(colorPicker);
    checkboxDiv.appendChild(chartTypeSelector);

    // Click on div also toggles the checkbox
    checkboxDiv.addEventListener('click', function (e) {
      if (
        e.target !== checkbox &&
        e.target !== axisSelector &&
        e.target !== colorPicker &&
        e.target !== chartTypeSelector &&
        !axisSelector.contains(e.target) &&
        !chartTypeSelector.contains(e.target)
      ) {
        checkbox.checked = !checkbox.checked;
        const event = new Event('change');
        checkbox.dispatchEvent(event);
      }
    });

    yAxisOptions.appendChild(checkboxDiv);
  });
  // Store CSV data in the row element for later use
  row.dataset.csvData = JSON.stringify(csvData);
  row.dataset.csvHeader = JSON.stringify(header);

  // Create the application name filter if the column exists
  const appNameIndex = header.findIndex(col => col.toLowerCase().includes('application') && col.toLowerCase().includes('name'));
  if (appNameIndex !== -1) {
    // Get unique application names
    const appNames = [...new Set(csvData.map(row => row[appNameIndex]))].filter(Boolean).sort();

    // Create filter label
    const filterLabel = document.createElement('label');
    filterLabel.textContent = 'Filter by Application Name: ';
    filterLabel.style.fontWeight = 'bold';
    filterLabel.style.display = 'block';
    filterLabel.style.marginBottom = '5px';

    // Create select dropdown
    const appFilter = document.createElement('select');
    appFilter.className = 'app-name-filter';
    appFilter.id = `app-filter-${row.id}`;
    appFilter.style.width = '100%';
    appFilter.style.padding = '5px';
    appFilter.style.marginBottom = '15px';

    // Add "All" option
    const allOption = document.createElement('option');
    allOption.value = '';
    allOption.textContent = 'All Applications';
    appFilter.appendChild(allOption);

    // Add options for each application name
    appNames.forEach(appName => {
      const option = document.createElement('option');
      option.value = appName;
      option.textContent = appName;
      appFilter.appendChild(option);
    });

    // Add event listener to filter
    appFilter.addEventListener('change', () => {
      // Store the selected app name in the row's dataset
      row.dataset.selectedAppName = appFilter.value;
      // Re-plot with the filter applied
      plotSelectedColumns(row);
    });

    // Add to filter container
    filterContainer.appendChild(filterLabel);
    filterContainer.appendChild(appFilter);

    // Store the application name column index for later use
    row.dataset.appNameColumnIndex = appNameIndex;
  }

  // Enable the plot button
  row.querySelector('.plotButton').disabled = false;
}

// Handle refresh button click
function handleRefresh(event) {
  event.preventDefault();

  console.log('Refresh button clicked');

  // Find the row containing this refresh button
  const refreshButton = event.target;
  const row = refreshButton.closest('.file-upload-row');

  console.log('Found row:', row.id);

  const fileInput = row.querySelector('.csvFileInput');

  // Store file path if it exists (needed for recreating file input)
  const filePath = row.dataset.filePath || '';
  const fileName = fileInput.files && fileInput.files[0] ? fileInput.files[0].name : '';

  // Check if a file was previously selected
  if (fileInput && fileInput.files && fileInput.files.length > 0) {
    console.log('Refreshing file:', fileName);

    // Save the current selections
    storeSelections(row);

    // Create a completely new file input to replace the existing one
    const newFileInput = document.createElement('input');
    newFileInput.type = 'file';
    newFileInput.className = 'csvFileInput';
    newFileInput.accept = '.csv';
    newFileInput.addEventListener('change', handleFileUpload);

    // Replace the old file input with the new one
    const fileInputContainer = fileInput.parentElement;
    fileInputContainer.replaceChild(newFileInput, fileInput);

    // Since we can't programmatically set a file to an input element due to security,
    // ask user to select the file again (this is the only reliable way)
    alert('Please select the CSV file again to refresh the data. This is necessary to get the latest version of the file.');

    // Trigger the click event to open file selector
    newFileInput.click();

    // After new file is selected and loaded, the handleFileUpload function will:
    // 1. Parse the CSV
    // 2. Display column selectors
    // Then we need to restore selections and plot the chart
    // This is handled in a separate function below
    // Store info that this was a refresh operation
    row.dataset.wasRefreshed = 'true';
  } else {
    alert('Please select a CSV file first before refreshing.');
  }
}

// Function to restore previous column selections after refresh
function restoreSelections(row) {
  // Check if we have stored the previous selections
  if (row.dataset.previousXColumn && row.dataset.previousYColumns) {
    try {
      const xColumnIndex = parseInt(row.dataset.previousXColumn);
      const yColumnIndices = JSON.parse(row.dataset.previousYColumns);

      // Restore X-axis selection
      const xRadio = row.querySelector(`.x-axis-options input[value="${xColumnIndex}"]`);
      if (xRadio) xRadio.checked = true;

      // Restore Y-axis selections
      yColumnIndices.forEach(index => {
        const yCheckbox = row.querySelector(`.y-axis-options input[value="${index}"]`);
        if (yCheckbox) {
          yCheckbox.checked = true;

          // Also show the axis selector
          const axisSelector = row.querySelector(`#y-axis-type-${index}-${row.id}`);
          if (axisSelector) {
            axisSelector.style.display = 'inline-block';

            // Restore axis type if we have it stored
            if (row.dataset.previousYAxisTypes) {
              const yAxisTypes = JSON.parse(row.dataset.previousYAxisTypes);
              if (yAxisTypes[index]) {
                axisSelector.value = yAxisTypes[index];
              }
            }
          }

          // Restore chart type selector
          const chartTypeSelector = row.querySelector(`#chart-type-${index}-${row.id}`);
          if (chartTypeSelector) {
            chartTypeSelector.style.display = 'inline-block';

            // Restore chart type if we have it stored
            if (row.dataset.previousYChartTypes) {
              const yChartTypes = JSON.parse(row.dataset.previousYChartTypes);
              if (yChartTypes[index]) {
                chartTypeSelector.value = yChartTypes[index];
              }
            }
          }

          // Restore color picker
          const colorPicker = row.querySelector(`#color-picker-${index}-${row.id}`);
          if (colorPicker) {
            colorPicker.style.display = 'inline-block';

            // Restore color if we have it stored
            if (row.dataset.previousYColors) {
              const yColors = JSON.parse(row.dataset.previousYColors);
              if (yColors[index]) {
                colorPicker.value = yColors[index];
              }
            }
          }
        }
      });

      // Restore application filter if it was previously set
      if (row.dataset.selectedAppName) {
        const appFilter = row.querySelector('.app-name-filter');
        if (appFilter) {
          appFilter.value = row.dataset.selectedAppName;
        }
      }
    } catch (error) {
      console.error('Failed to restore selections:', error);
    }
  }
}

// Store current column selections for later restoration
function storeSelections(row) {
  const xAxisRadio = row.querySelector('.x-axis-options input:checked');
  const yAxisCheckboxes = row.querySelectorAll('.y-axis-options input:checked');

  if (xAxisRadio) {
    row.dataset.previousXColumn = xAxisRadio.value;
  }

  if (yAxisCheckboxes.length > 0) {
    const yIndices = Array.from(yAxisCheckboxes).map(cb => cb.value);
    row.dataset.previousYColumns = JSON.stringify(yIndices);

    // Store the axis type (primary/secondary) for each selected column
    const yAxisTypes = {};
    // Store chart types
    const yChartTypes = {};
    // Store colors
    const yColors = {};

    yIndices.forEach(index => {
      const axisSelector = row.querySelector(`#y-axis-type-${index}-${row.id}`);
      if (axisSelector) {
        yAxisTypes[index] = axisSelector.value;
      }

      // Store chart type
      const chartTypeSelector = row.querySelector(`#chart-type-${index}-${row.id}`);
      if (chartTypeSelector) {
        yChartTypes[index] = chartTypeSelector.value;
      }

      // Store color
      const colorPicker = row.querySelector(`#color-picker-${index}-${row.id}`);
      if (colorPicker) {
        yColors[index] = colorPicker.value;
      }
    });

    row.dataset.previousYAxisTypes = JSON.stringify(yAxisTypes);
    row.dataset.previousYChartTypes = JSON.stringify(yChartTypes);
    row.dataset.previousYColors = JSON.stringify(yColors);
  }
}

function plotSelectedColumns(row) {
  const xAxisRadio = row.querySelector('.x-axis-options input:checked');
  const yAxisCheckboxes = row.querySelectorAll('.y-axis-options input:checked');

  if (!xAxisRadio) {
    alert('Please select an X-axis column');
    return;
  }

  if (yAxisCheckboxes.length === 0) {
    alert('Please select at least one Y-axis column');
    return;
  }

  const xColumnIndex = parseInt(xAxisRadio.value);
  const yColumnIndices = Array.from(yAxisCheckboxes).map(cb => parseInt(cb.value));

  // Check for chart type compatibility
  const chartTypes = [];
  let hasCircularCharts = false;
  let hasRadarChart = false;

  yColumnIndices.forEach(yIndex => {
    const chartTypeSelector = row.querySelector(`#chart-type-${yIndex}-${row.id}`);
    const chartType = chartTypeSelector && chartTypeSelector.value ? chartTypeSelector.value : 'line';
    chartTypes.push(chartType);

    if (['pie', 'doughnut', 'polarArea'].includes(chartType)) {
      hasCircularCharts = true;
    }

    if (chartType === 'radar') {
      hasRadarChart = true;
    }
  });

  // Warning for multiple Y columns with circular charts
  if (hasCircularCharts && yColumnIndices.length > 1) {
    if (
      !confirm(
        'Pie, Doughnut, and PolarArea charts work best with a single data series. Your chart may look unusual with multiple series. Continue anyway?'
      )
    ) {
      return;
    }
  }

  // Warning for radar chart with insufficient data points
  if (hasRadarChart && JSON.parse(row.dataset.csvData).length < 3) {
    if (!confirm('Radar charts work best with at least 3 data points. Your chart may look unusual. Continue anyway?')) {
      return;
    }
  }

  // Warning for mixing radar with other chart types
  if (hasRadarChart && chartTypes.some(type => type !== 'radar')) {
    if (!confirm('Mixing radar charts with other chart types is not supported. Only radar charts will be displayed. Continue anyway?')) {
      return;
    }
  }

  // Store the current selections for later use (when refreshing)
  row.dataset.previousXColumn = xColumnIndex;
  row.dataset.previousYColumns = JSON.stringify(yColumnIndices);
  const csvData = JSON.parse(row.dataset.csvData);
  const header = JSON.parse(row.dataset.csvHeader);

  // Apply application name filter if selected
  let filteredData = csvData;
  if (row.dataset.selectedAppName && row.dataset.appNameColumnIndex) {
    const appNameIndex = parseInt(row.dataset.appNameColumnIndex);
    const selectedAppName = row.dataset.selectedAppName;

    if (selectedAppName) {
      filteredData = csvData.filter(row => row[appNameIndex] === selectedAppName);
      console.log(`Filtered to ${filteredData.length} rows for application: ${selectedAppName}`);
    }
  }
  // Format the X-axis data
  // If X-axis is Timestamp column, format it for better display
  let xData = [];
  const headerName = header[xColumnIndex].toLowerCase();

  if (headerName === 'timestamp') {
    // Format the timestamp to show only time portion for cleaner display
    xData = filteredData.map(row => {
      const timestamp = row[xColumnIndex];
      // Handle format like 20250509_165142
      if (timestamp.includes('_')) {
        const timePart = timestamp.split('_')[1];
        return `${timePart.substring(0, 2)}:${timePart.substring(2, 4)}:${timePart.substring(4, 6)}`;
      }
      return timestamp;
    });
  } else {
    // For non-timestamp columns, use the original value or convert to number
    xData = filteredData.map(row => {
      const value = row[xColumnIndex];
      return isNaN(parseFloat(value)) ? value : parseFloat(value);
    });
  } // Prepare chart data
  const datasets = yColumnIndices.map(yIndex => {
    const colorPicker = row.querySelector(`#color-picker-${yIndex}-${row.id}`);
    let color =
      colorPicker && colorPicker.value
        ? colorPicker.value
        : `#${Math.floor(Math.random() * 16777215)
            .toString(16)
            .padStart(6, '0')}`;
    let rgbaColor =
      color.length === 7
        ? `rgba(${parseInt(color.slice(1, 3), 16)},${parseInt(color.slice(3, 5), 16)},${parseInt(color.slice(5, 7), 16)},0.7)`
        : color;

    // Chart type selector
    const chartTypeSelector = row.querySelector(`#chart-type-${yIndex}-${row.id}`);
    const chartType = chartTypeSelector && chartTypeSelector.value ? chartTypeSelector.value : 'line';

    // Convert string data to numbers for charting
    const yData = filteredData.map((row, idx) => {
      const value = row[yIndex];
      return isNaN(parseFloat(value)) ? value : parseFloat(value);
    });

    // Check if this column should use the secondary Y-axis
    const axisSelector = row.querySelector(`#y-axis-type-${yIndex}-${row.id}`);
    const useSecondaryAxis = axisSelector && axisSelector.value === 'secondary';

    // For bubble charts, we need an additional dimension (radius)
    // Use a default size that scales with the data point's value
    const bubbleRadius =
      chartType === 'bubble' ? yData.map(value => (typeof value === 'number' ? Math.max(Math.abs(value) * 0.2, 3) : 5)) : undefined;

    // For chart types that require background colors array (pie, doughnut, polarArea)
    const needsBackgroundColors = ['pie', 'doughnut', 'polarArea'].includes(chartType);
    const backgroundColors = needsBackgroundColors
      ? yData.map((_, i) => {
          // Generate a range of colors based on the selected color
          const hue = parseInt(color.slice(1), 16) % 360;
          return `hsl(${(hue + i * 30) % 360}, 70%, 60%)`;
        })
      : rgbaColor;

    return {
      label: header[yIndex],
      data: chartType === 'bubble' ? yData.map((val, i) => ({ x: xData[i], y: val, r: bubbleRadius[i] })) : yData,
      borderColor: rgbaColor,
      backgroundColor: backgroundColors,
      borderWidth: 2,
      fill: false,
      yAxisID: useSecondaryAxis ? 'y1' : 'y',
      type: chartType,
      pointRadius: 3,
      pointHoverRadius: 5
    };
  });

  // Get canvas and create chart
  const canvas = row.querySelector('.chart');
  const ctx = canvas.getContext('2d');

  // Destroy previous chart if it exists
  if (canvas.chart) {
    canvas.chart.destroy();
  }

  // Check if any dataset uses special chart types (pie, doughnut, polarArea)
  const hasSpecialChartTypes = datasets.some(ds => ['pie', 'doughnut', 'polarArea'].includes(ds.type));

  // Check if any dataset uses radar chart type
  const hasRadarChartType = datasets.some(ds => ds.type === 'radar');

  // Create new chart
  canvas.chart = new Chart(ctx, {
    type: hasRadarChartType ? 'radar' : hasSpecialChartTypes ? 'pie' : 'line', // Set the main chart type correctly
    data: {
      labels: xData,
      datasets: datasets.map(dataset => {
        // For radar charts, we need to ensure datasets don't specify their own type
        if (hasRadarChartType && dataset.type === 'radar') {
          const { type, ...rest } = dataset; // Remove the type property for radar datasets
          return rest;
        }
        return dataset;
      })
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'CSV Plotter - Data Visualization',
          font: {
            size: 16
          }
        },
        legend: {
          position: 'top'
        },
        tooltip: {
          mode: 'index',
          intersect: false
        },
        zoom: {
          pan: {
            enabled: !hasSpecialChartTypes && !hasRadarChartType, // Disable pan for pie/doughnut/radar charts
            mode: 'xy'
          },
          zoom: {
            wheel: {
              enabled: !hasSpecialChartTypes && !hasRadarChartType // Disable wheel zoom for pie/doughnut/radar charts
            },
            pinch: {
              enabled: !hasSpecialChartTypes && !hasRadarChartType // Disable pinch zoom for pie/doughnut/radar charts
            },
            mode: 'xy',
            drag: {
              enabled: !hasSpecialChartTypes && !hasRadarChartType, // Disable drag zoom for pie/doughnut/radar charts
              backgroundColor: 'rgba(225,225,225,0.3)',
              borderColor: 'rgba(102,102,102,0.5)',
              borderWidth: 1
            }
          }
        }
      },
      // Special radar chart options
      ...(hasRadarChartType
        ? {
            scales: {
              r: {
                angleLines: {
                  display: true
                },
                suggestedMin: 0,
                ticks: {
                  beginAtZero: true
                }
              }
            },
            elements: {
              line: {
                borderWidth: 3
              }
            }
          }
        : {
            scales: {
              x: {
                display: !hasSpecialChartTypes, // Hide x-axis for pie/doughnut charts
                title: {
                  display: !hasSpecialChartTypes,
                  text: header[xColumnIndex]
                }
              },
              y: {
                display: !hasSpecialChartTypes, // Hide y-axis for pie/doughnut charts
                title: {
                  display: !hasSpecialChartTypes,
                  text: 'Values'
                },
                beginAtZero: headerName.includes('percentage') ? true : false
              },
              y1: {
                display: !hasSpecialChartTypes, // Hide secondary y-axis for pie/doughnut charts
                position: 'right',
                title: {
                  display: !hasSpecialChartTypes,
                  text: 'Secondary Scale'
                },
                beginAtZero: false,
                grid: {
                  drawOnChartArea: false // only want the grid lines for the secondary y-axis to show up
                }
              }
            }
          })
    }
  });
}
