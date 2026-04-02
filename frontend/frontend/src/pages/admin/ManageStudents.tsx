import { useState, useEffect } from 'react';

interface Student {
    id: number;
    full_name: string;
    student_id: string;
    email: string;
    ojt_hours_required: number;
    is_active: boolean;
}

const ManageStudents = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/students', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const result = await response.json();
            if (result.success) setStudents(result.data);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!editingStudent) return;

        try {
            const response = await fetch(`http://localhost:5000/api/admin/students/${editingStudent.id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` 
                },
                body: JSON.stringify({
                    full_name: editingStudent.full_name,
                    student_id: editingStudent.student_id,
                    ojt_hours_required: editingStudent.ojt_hours_required
                })
            });

            if (response.ok) {
                setStudents(students.map(s => s.id === editingStudent.id ? editingStudent : s));
                setEditingStudent(null);
            }
        } catch (error) {
            console.error("Update failed:", error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Permanently delete this student account?")) return;
        
        try {
            const response = await fetch(`http://localhost:5000/api/admin/students/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            if (response.ok) {
                setStudents(students.filter(s => s.id !== id));
            }
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    const toggleStatus = (id: number) => {
        // Toggle logic (can be synced to a 'status' column if added to DB later)
        setStudents(students.map(s => 
            s.id === id ? { ...s, is_active: !s.is_active } : s
        ));
    };

    const filteredStudents = students.filter(s => 
        s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.student_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                        Student <span className="text-blue-500">Directory</span>
                    </h1>
                    <p className="text-slate-500 font-bold text-xs uppercase mt-1">Manage accounts and OJT requirements</p>
                </div>
                <input 
                    type="text" 
                    placeholder="Search Name or ID..." 
                    className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-blue-500 outline-none w-72 transition-all"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="bg-[#0f172a]/40 backdrop-blur-xl border border-slate-800 rounded-4xl overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-900/50 border-b border-slate-800 text-[10px] font-black uppercase text-slate-500 tracking-widest">
                            <th className="p-5">Student Info</th>
                            <th className="p-5 text-center">ID Number</th>
                            <th className="p-5 text-center">OJT Hours</th>
                            <th className="p-5 text-center">Status</th>
                            <th className="p-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {loading ? (
                             <tr><td colSpan={5} className="p-20 text-center animate-pulse text-slate-500 uppercase font-black tracking-widest text-xs">Loading Records...</td></tr>
                        ) : filteredStudents.map((student) => (
                            <tr key={student.id} className="hover:bg-blue-500/5 transition-colors group">
                                <td className="p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-blue-400 border border-slate-700">
                                            {student.full_name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{student.full_name}</p>
                                            <p className="text-xs text-slate-500">{student.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-5 text-center">
                                    <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                                        {student.student_id || 'N/A'}
                                    </span>
                                </td>
                                <td className="p-5 text-center text-sm font-black text-blue-400">
                                    {student.ojt_hours_required}h
                                </td>
                                <td className="p-5 text-center">
                                    <button 
                                        onClick={() => toggleStatus(student.id)}
                                        className={`text-[10px] font-black px-3 py-1 rounded-full border transition-all ${
                                            student.is_active !== false ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                                        }`}
                                    >
                                        {student.is_active !== false ? 'ACTIVE' : 'DISABLED'}
                                    </button>
                                </td>
                                <td className="p-5 text-right">
                                    <div className="flex justify-end gap-2 text-lg">
                                        <button onClick={() => setEditingStudent(student)} className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors text-blue-400">✏️</button>
                                        <button onClick={() => handleDelete(student.id)} className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400">🗑️</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {editingStudent && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-[#020617]/90 backdrop-blur-sm p-4">
                    <div className="bg-[#0f172a] border border-slate-800 w-full max-w-md rounded-3xl p-8 shadow-2xl">
                        <h2 className="text-xl font-black text-white mb-6 uppercase italic">Edit Student</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 mb-1 block uppercase">Full Name</label>
                                <input 
                                    type="text" 
                                    value={editingStudent.full_name} 
                                    onChange={(e) => setEditingStudent({...editingStudent, full_name: e.target.value})}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 mb-1 block uppercase">Student ID</label>
                                    <input 
                                        type="text" 
                                        value={editingStudent.student_id} 
                                        onChange={(e) => setEditingStudent({...editingStudent, student_id: e.target.value})}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 mb-1 block uppercase">OJT Hours</label>
                                    <input 
                                        type="number" 
                                        value={editingStudent.ojt_hours_required} 
                                        onChange={(e) => setEditingStudent({...editingStudent, ojt_hours_required: Number(e.target.value)})}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setEditingStudent(null)} className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs">CANCEL</button>
                            <button onClick={handleUpdate} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black text-xs">SAVE CHANGES</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageStudents;