/**
 * Helper utility to export array of JSON objects to a downloadable CSV file.
 * 
 * @param filename - Name of the output file (e.g., 'students_roster.csv')
 * @param data - Array of objects containing row data
 * @param columns - Optional array of objects mapping object key to CSV column header
 */
export interface ColumnDef {
    header: string;
    key: string;
    formatter?: (value: any, row: any) => string | number;
}

export const exportToCSV = (filename: string, data: any[], columns?: ColumnDef[]) => {
    if (!data || data.length === 0) {
        alert("No data available to export.");
        return;
    }

    let cols: ColumnDef[] = [];
    if (columns && columns.length > 0) {
        cols = columns;
    } else {
        const keys = Object.keys(data[0]);
        cols = keys.map(k => ({ header: k, key: k }));
    }

    // 1. Create Headers
    const headers = cols.map(col => `"${col.header.replace(/"/g, '""')}"`).join(',');

    // 2. Format Data Rows
    const rows = data.map(row => {
        return cols.map(col => {
            let val = row[col.key];
            if (col.formatter) {
                val = col.formatter(val, row);
            }
            if (val === null || val === undefined) {
                val = '';
            } else {
                val = String(val).replace(/"/g, '""');
            }
            return `"${val}"`;
        }).join(',');
    });

    // 3. Assemble CSV string
    const csvContent = [headers, ...rows].join('\n');

    // 4. Trigger browser download using Blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
