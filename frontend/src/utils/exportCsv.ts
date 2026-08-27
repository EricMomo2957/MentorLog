export const exportToCSV = (filename: string, rows: Record<string, any>[]) => {
    if (!rows || !rows.length) return;

    const headers = Object.keys(rows[0]);
    const csvContent = [
        headers.join(','),
        ...rows.map(row => 
            headers.map(header => {
                const value = row[header] ?? '';
                const escaped = String(value).replace(/"/g, '""');
                return `"${escaped}"`;
            }).join(',')
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
