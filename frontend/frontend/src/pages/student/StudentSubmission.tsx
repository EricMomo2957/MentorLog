import { useState } from 'react';
import axios from 'axios';

const StudentSubmission = () => {
    const [file, setFile] = useState<File | null>(null);
    const [docType, setDocType] = useState("Resume");

    const handleSubmit = async () => {
        if (!file) return alert("Please select a file");
        
        const formData = new FormData();
        formData.append('document', file);
        formData.append('student_id', '101'); // Replace with actual logged-in ID
        formData.append('student_name', 'Eric Dominic Momo'); 
        formData.append('document_type', docType);

        try {
            await axios.post('http://localhost:5000/api/documents/submit', formData);
            alert("Uploaded successfully!");
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="p-8 bg-[#0a0f1c] min-h-screen text-white">
            <div className="max-w-md mx-auto bg-[#0d1424] p-6 border border-slate-800">
                <h2 className="text-xs font-black uppercase tracking-widest mb-6 border-b border-slate-800 pb-2">Submit Requirement</h2>
                <select 
                    className="w-full bg-[#0a0f1c] border border-slate-800 p-3 mb-4 text-xs"
                    onChange={(e) => setDocType(e.target.value)}
                >
                    <option>Resume</option>
                    <option>OJT Waiver</option>
                    <option>Clearance</option>
                </select>
                <input 
                    type="file" 
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-blue-600 file:text-white hover:file:bg-[#00df9a] cursor-pointer"
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                />
                <button onClick={handleSubmit} className="mt-6 w-full bg-blue-600 p-3 text-[10px] font-black uppercase tracking-widest hover:bg-[#00df9a] hover:text-black transition-all">
                    Upload Document
                </button>
            </div>
        </div>
    );
};

export default StudentSubmission;