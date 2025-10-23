// Excel Boss Mode - Much more realistic and functional!
let currentSheet = 'Budget';
let selectedCell = null;

// Generate column and row headers on page load
function generateHeaders() {
    // Generate column headers (A-Z)
    const colHeaders = document.getElementById('col-headers');
    if (colHeaders) {
        colHeaders.innerHTML = '';
        for (let i = 0; i < 26; i++) {
            const header = document.createElement('div');
            header.className = 'excel-col-header';
            header.textContent = String.fromCharCode(65 + i);
            colHeaders.appendChild(header);
        }
    }

    // Generate row headers (1-50)
    const rowHeaders = document.getElementById('row-headers');
    if (rowHeaders) {
        // Keep the corner div
        const corner = rowHeaders.querySelector('.excel-corner');
        rowHeaders.innerHTML = '';
        if (corner) {
            rowHeaders.appendChild(corner);
        } else {
            const newCorner = document.createElement('div');
            newCorner.className = 'excel-corner';
            rowHeaders.appendChild(newCorner);
        }

        for (let i = 1; i <= 50; i++) {
            const header = document.createElement('div');
            header.className = 'excel-row-header';
            header.textContent = i;
            rowHeaders.appendChild(header);
        }
    }
}

// Ribbon tab functionality
function handleRibbonTab(tabName) {
    // Update active tab styling
    document.querySelectorAll('.excel-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.textContent === tabName) {
            tab.classList.add('active');
        }
    });

    // You could add different ribbon content for each tab
    // For now just show which tab is active in status bar
    const statusLeft = document.querySelector('.status-left');
    if (statusLeft) {
        statusLeft.textContent = tabName + ' tab selected';
    }
}

const sheetData = {
    'Budget': [
        ['FY 2024 Budget Analysis', '', '', '', '', '', '', '', 'Status:', 'In Review', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['Department', 'Q1 Budget', 'Q1 Actual', 'Q1 Variance', 'Q2 Budget', 'Q2 Actual', 'Q2 Variance', 'YTD Budget', 'YTD Actual', 'YTD Variance', 'Remaining', 'Annual Budget', '', '', ''],
        ['Engineering', '$450,000', '$438,250', '-$11,750', '$450,000', '$462,100', '$12,100', '$900,000', '$900,350', '$350', '$1,800,000', '$3,600,000', '', '', ''],
        ['Sales', '$320,000', '$335,600', '$15,600', '$320,000', '$318,900', '-$1,100', '$640,000', '$654,500', '$14,500', '$1,280,000', '$2,560,000', '', '', ''],
        ['Marketing', '$180,000', '$172,800', '-$7,200', '$180,000', '$185,300', '$5,300', '$360,000', '$358,100', '-$1,900', '$720,000', '$1,440,000', '', '', ''],
        ['Operations', '$280,000', '$291,450', '$11,450', '$280,000', '$276,800', '-$3,200', '$560,000', '$568,250', '$8,250', '$1,120,000', '$2,240,000', '', '', ''],
        ['HR', '$125,000', '$118,900', '-$6,100', '$125,000', '$128,750', '$3,750', '$250,000', '$247,650', '-$2,350', '$500,000', '$1,000,000', '', '', ''],
        ['IT', '$220,000', '$215,600', '-$4,400', '$220,000', '$223,400', '$3,400', '$440,000', '$439,000', '-$1,000', '$880,000', '$1,760,000', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['TOTAL', '$1,575,000', '$1,572,600', '-$2,400', '$1,575,000', '$1,595,250', '$20,250', '$3,150,000', '$3,167,850', '$17,850', '$6,300,000', '$12,600,000', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['Notes:', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['- Engineering over budget in Q2 due to contractor fees', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['- Sales under budget in Q2 - hiring delayed', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['- Marketing variance due to conference spending', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['Next Review: 2024-07-15', '', '', '', '', 'Approved By:', 'CFO', '', '', '', '', '', '', '', ''],
    ],
    'Revenue': [
        ['2024 Revenue Dashboard', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['Product Line', 'Jan', 'Feb', 'Mar', 'Q1 Total', 'Apr', 'May', 'Jun', 'Q2 Total', 'YTD Total', 'Target', 'Variance', '% of Target', '', ''],
        ['Cloud Services', '$285,400', '$298,750', '$312,900', '$897,050', '$325,600', '$338,200', '$352,100', '$1,015,900', '$1,912,950', '$1,800,000', '$112,950', '106.3%', '', ''],
        ['Professional Services', '$142,800', '$138,600', '$155,300', '$436,700', '$148,900', '$162,400', '$158,800', '$470,100', '$906,800', '$950,000', '-$43,200', '95.5%', '', ''],
        ['Licenses', '$96,500', '$102,300', '$98,700', '$297,500', '$105,800', '$99,200', '$108,400', '$313,400', '$610,900', '$580,000', '$30,900', '105.3%', '', ''],
        ['Support & Maintenance', '$188,200', '$195,400', '$201,800', '$585,400', '$208,500', '$212,300', '$218,900', '$639,700', '$1,225,100', '$1,200,000', '$25,100', '102.1%', '', ''],
        ['Training', '$45,300', '$48,900', '$52,600', '$146,800', '$55,200', '$58,800', '$61,500', '$175,500', '$322,300', '$350,000', '-$27,700', '92.1%', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['TOTAL REVENUE', '$758,200', '$783,950', '$821,300', '$2,363,450', '$844,000', '$870,900', '$899,700', '$2,614,600', '$4,978,050', '$4,880,000', '$98,050', '102.0%', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['Growth Metrics', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['MoM Growth', '3.4%', '4.7%', '3.3%', '', '2.8%', '3.2%', '3.3%', '', '', '', '', '', '', ''],
        ['YoY Growth', '18.5%', '19.2%', '21.3%', '', '22.8%', '24.1%', '23.7%', '', '', '', '', '', '', ''],
    ],
    'Headcount': [
        ['Employee Headcount Report', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['As of: June 30, 2024', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['Department', 'Jan 1', 'Hires', 'Terminations', 'Mar 31', 'Hires', 'Terminations', 'Jun 30', 'Budget', 'Variance', 'Open Req', '', '', '', ''],
        ['Engineering', '145', '12', '-3', '154', '8', '-2', '160', '165', '-5', '8', '', '', '', ''],
        ['Product', '32', '3', '-1', '34', '2', '0', '36', '38', '-2', '3', '', '', '', ''],
        ['Sales', '85', '8', '-5', '88', '6', '-4', '90', '95', '-5', '12', '', '', '', ''],
        ['Marketing', '28', '2', '-1', '29', '3', '-1', '31', '32', '-1', '2', '', '', '', ''],
        ['Customer Success', '45', '5', '-2', '48', '4', '-3', '49', '52', '-3', '5', '', '', '', ''],
        ['Operations', '38', '2', '-1', '39', '3', '-2', '40', '42', '-2', '3', '', '', '', ''],
        ['Finance', '18', '1', '0', '19', '1', '0', '20', '20', '0', '1', '', '', '', ''],
        ['HR', '12', '1', '0', '13', '0', '-1', '12', '12', '0', '0', '', '', '', ''],
        ['IT', '22', '2', '0', '24', '1', '0', '25', '26', '-1', '2', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['TOTAL', '425', '36', '-13', '448', '28', '-13', '463', '482', '-19', '36', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['Turnover Rate', '3.1%', '', '', '2.9%', '', '', '2.8%', '', '', '', '', '', '', ''],
        ['Time to Fill (days)', '42', '', '', '38', '', '', '35', '', '', '', '', '', '', ''],
    ]
};

function generateExcelGrid(sheetName) {
    const grid = document.getElementById('excel-grid');
    if (!grid) return;

    grid.innerHTML = ''; // Clear existing cells
    const data = sheetData[sheetName] || sheetData['Budget'];

    for (let row = 0; row < 50; row++) {
        for (let col = 0; col < 26; col++) {
            const cell = document.createElement('div');
            cell.className = 'excel-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;

            if (data[row] && data[row][col]) {
                cell.textContent = data[row][col];

                // Style header rows
                if (row === 0) {
                    cell.style.fontWeight = 'bold';
                    cell.style.fontSize = '13px';
                    cell.style.backgroundColor = '#e8f4f8';
                }
                // Style column headers (row 2 for most sheets)
                if (row === 2 && data[row][col]) {
                    cell.style.fontWeight = 'bold';
                    cell.style.backgroundColor = '#d9e9f0';
                    cell.style.borderBottom = '2px solid #217346';
                }
                // Style total rows
                if (cell.textContent.toUpperCase().includes('TOTAL')) {
                    cell.style.fontWeight = 'bold';
                    cell.style.backgroundColor = '#f0f0f0';
                    cell.style.borderTop = '2px solid #000';
                }
                // Style currency
                if (cell.textContent.includes('$')) {
                    cell.style.textAlign = 'right';
                }
                // Style percentages
                if (cell.textContent.includes('%')) {
                    cell.style.textAlign = 'right';
                }
                // Style formulas
                if (cell.textContent.startsWith('=')) {
                    cell.style.fontStyle = 'italic';
                    cell.style.color = '#0066cc';
                }
            }

            // Make cells clickable - use event delegation instead
            cell.addEventListener('click', function(e) {
                e.stopPropagation();
                selectCell(this);
            });

            grid.appendChild(cell);
        }
    }
}

function selectCell(cell) {
    if (selectedCell) {
        selectedCell.classList.remove('selected');
    }
    selectedCell = cell;
    cell.classList.add('selected');

    // Update formula bar
    const colLetter = String.fromCharCode(65 + parseInt(cell.dataset.col));
    const rowNumber = parseInt(cell.dataset.row) + 1;
    document.querySelector('.formula-cell-ref').textContent = colLetter + rowNumber;
    document.querySelector('.formula-input').textContent = cell.textContent || '';
}

function switchTab(tabName) {
    currentSheet = tabName;

    // Update tab styling
    document.querySelectorAll('.excel-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');

    // Update sheet tabs
    document.querySelectorAll('.sheet-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.textContent === tabName) {
            tab.classList.add('active');
        }
    });

    // Regenerate grid
    generateExcelGrid(tabName);
}

// Initialize boss mode when document is ready
function initBossMode() {
    generateHeaders();
    generateExcelGrid('Budget');
}
