import { useState } from 'react';
import { FaCloudUploadAlt, FaExclamationTriangle, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import adminApi from '../../../services/adminApi';

const REQUIRED_FIELDS = [
    { key: 'name', label: 'Program Name' },
    { key: 'universityName', label: 'University Name' },
    { key: 'degree_level', label: 'Degree Level (bachelor, master, phd)' },
    { key: 'degree_qualification', label: 'Degree Qualification' },
    { key: 'discipline', label: 'Discipline' },
    { key: 'domain', label: 'Domain' },
    { key: 'career_horizon', label: 'Career Horizon' },
    { key: 'tuition_usd', label: 'Tuition (USD)' },
    { key: 'application_url', label: 'Application URL' },
    { key: 'description', label: 'Description' }
];

function ImportProgramsModal({ onClose, onImportSuccess }) {
    const [file, setFile] = useState(null);
    const [data, setData] = useState([]);
    const [errors, setErrors] = useState([]);
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const jsonData = XLSX.utils.sheet_to_json(ws);
            validateData(jsonData);
        };
        reader.readAsBinaryString(selectedFile);
    };

    const validateData = (jsonData) => {
        const validationErrors = [];
        const validatedData = jsonData.map((row, index) => {
            const rowNum = index + 1;
            const rowErrors = [];

            REQUIRED_FIELDS.forEach(field => {
                if (!row[field.key]) {
                    rowErrors.push(field.label);
                }
            });

            // Specific type validations
            if (row.degree_level && !['bachelor', 'master', 'phd'].includes(row.degree_level.toLowerCase())) {
                rowErrors.push('Degree Level (must be bachelor, master, or phd)');
            }
            if (row.tuition_usd && isNaN(parseInt(row.tuition_usd))) {
                rowErrors.push('Tuition (must be a number)');
            }

            if (rowErrors.length > 0) {
                validationErrors.push({
                    row: rowNum,
                    name: row.name || 'Unknown',
                    fields: rowErrors
                });
            }

            return row;
        });

        setData(validatedData);
        setErrors(validationErrors);
        setImportResult(null);
    };

    const handleImport = async () => {
        if (errors.length > 0) return;

        try {
            setIsImporting(true);
            const response = await adminApi.bulkImportPrograms(data);
            setImportResult(response.data.data);
            if (response.data.data.errors.length === 0) {
                onImportSuccess();
            }
        } catch (err) {
            alert(err.message || 'Failed to import programs');
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="admin-modal">
            <div className="admin-modal__content admin-modal__content--large">
                <div className="admin-modal__header">
                    <h2>Import Programs from Excel/CSV</h2>
                    <button className="admin-modal__close" onClick={onClose}>×</button>
                </div>

                <div className="admin-import">
                    {!file ? (
                        <div className="admin-import__upload">
                            <input
                                type="file"
                                id="import-file"
                                accept=".xlsx, .xls, .csv"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="import-file" className="admin-import__dropzone">
                                <FaCloudUploadAlt size={48} />
                                <p>Click to upload or drag and drop</p>
                                <span>Supports .xlsx, .xls, .csv</span>
                            </label>
                            
                            <div className="admin-import__template">
                                <p>Download our template to ensure correct format:</p>
                                <button 
                                    className="btn-admin btn-admin--secondary btn-admin--small"
                                    onClick={() => {
                                        const templateData = [REQUIRED_FIELDS.reduce((acc, f) => ({ ...acc, [f.key]: '' }), {})];
                                        const ws = XLSX.utils.json_to_sheet(templateData);
                                        const wb = XLSX.utils.book_new();
                                        XLSX.utils.book_append_sheet(wb, ws, "Programs");
                                        
                                        XLSX.writeFile(wb, 'programs_import_template.xlsx');
                                    }}
                                >
                                    Download Template
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="admin-import__preview">
                            <div className="admin-import__status">
                                <span>File: <strong>{file.name}</strong></span>
                                <button className="btn-admin btn-admin--small btn-admin--secondary" onClick={() => { setFile(null); setData([]); setErrors([]); }}>
                                    Change File
                                </button>
                            </div>

                            {errors.length > 0 ? (
                                <div className="admin-import__errors">
                                    <div className="alert alert--danger">
                                        <FaExclamationTriangle />
                                        <span>We found {errors.length} rows with errors. Please fix them in your file and re-upload.</span>
                                    </div>
                                    <div className="error-list">
                                        {errors.slice(0, 10).map((err, i) => (
                                            <div key={i} className="error-item">
                                                <strong>Row {err.row} ({err.name}):</strong> Missing or invalid: {err.fields.join(', ')}
                                            </div>
                                        ))}
                                        {errors.length > 10 && <div className="error-more">And {errors.length - 10} more errors...</div>}
                                    </div>
                                </div>
                            ) : importResult ? (
                                <div className="admin-import__result">
                                    <div className={`alert alert--${importResult.errors.length === 0 ? 'success' : 'warning'}`}>
                                        {importResult.errors.length === 0 ? <FaCheckCircle /> : <FaExclamationTriangle />}
                                        <span>
                                            Import complete! Created {importResult.created} programs.
                                            {importResult.errors.length > 0 && ` Failed to import ${importResult.errors.length} programs.`}
                                        </span>
                                    </div>
                                    {importResult.errors.length > 0 && (
                                        <div className="error-list">
                                            {importResult.errors.slice(0, 10).map((err, i) => (
                                                <div key={i} className="error-item">
                                                    <strong>Row {err.row} ({err.program}):</strong> {err.error}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="admin-modal__actions">
                                        <button className="btn-admin btn-admin--primary" onClick={onClose}>Close</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="admin-import__ready">
                                    <div className="alert alert--success">
                                        <FaCheckCircle />
                                        <span>File is valid! Ready to import {data.length} programs.</span>
                                    </div>
                                    <div className="admin-modal__actions">
                                        <button className="btn-admin btn-admin--secondary" onClick={onClose}>Cancel</button>
                                        <button 
                                            className="btn-admin btn-admin--primary" 
                                            onClick={handleImport}
                                            disabled={isImporting}
                                        >
                                            {isImporting ? <><FaSpinner className="fa-spin" /> Importing...</> : 'Confirm Import'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ImportProgramsModal;
