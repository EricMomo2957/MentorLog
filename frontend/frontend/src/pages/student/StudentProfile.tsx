import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    User, Mail, Phone, Award, 
    Edit2, ShieldCheck, Download, X, Upload, Camera,
    School, MapPin, Calendar, Hash, Briefcase, BookOpen, Clock, Heart
} from 'lucide-react';

interface UserProfile {
    id?: number;
    full_name: string;
    member_title?: string;
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    id_number?: string;
    email: string;
    phone: string;
    date_of_birth?: string;
    age?: number | string;
    gender?: string;
    civil_status?: string;
    address?: string;
    school_name?: string;
    student_id: string;
    course: string;
    year_level: string;
    it_position?: string;
    profile_pic?: string;
    ojt_hours_required: number;
}

const IT_POSITIONS = [
    'Software Engineer / Developer',
    'Frontend Web Developer',
    'Backend Web Developer',
    'Full Stack Web Developer',
    'Mobile App Developer (iOS / Android)',
    'UI/UX Designer & Researcher',
    'Quality Assurance (QA) Tester / Software QA',
    'Data Analyst / Business Intelligence',
    'Data Scientist / AI & ML Engineer',
    'Database Administrator (DBA)',
    'DevOps & Cloud Infrastructure Engineer',
    'Cybersecurity / Information Security Specialist',
    'Network & Systems Administrator',
    'IT Technical Support & Helpdesk',
    'IT Technical Writer & Systems Analyst',
    'IT Project Manager / Scrum Master',
    'Administrator / OJT Supervisor',
    'Other IT Specialization'
];

const getInitials = (name?: string) => {
    if (!name) return 'UN';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
};

const getFullPicUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `http://localhost:5000${path}`;
};

const StudentProfile = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        member_title: 'Mr.',
        first_name: '',
        middle_name: '',
        last_name: '',
        full_name: '',
        id_number: '',
        student_id: '',
        email: '',
        phone: '',
        date_of_birth: '',
        age: '',
        gender: 'Male',
        civil_status: 'Single',
        address: '',
        school_name: '',
        course: '',
        year_level: '',
        it_position: 'Software Engineer / Developer'
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const calculateAge = (dobString: string): string => {
        if (!dobString) return '';
        const birthDate = new Date(dobString);
        if (isNaN(birthDate.getTime())) return '';
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 0 ? String(age) : '';
    };

    const fetchProfile = async () => {
        try {
            const res = await api.get('/auth/profile');
            const data = res.data;
            const userData = data.user || data;
            
            if (userData) {
                const mappedUser: UserProfile = {
                    id: userData.id,
                    full_name: userData.full_name || 'No Name',
                    member_title: userData.member_title || 'Mr.',
                    first_name: userData.first_name || '',
                    middle_name: userData.middle_name || '',
                    last_name: userData.last_name || '',
                    id_number: userData.id_number || userData.student_id || '',
                    email: userData.email || '',
                    phone: userData.phone || '',
                    date_of_birth: userData.date_of_birth ? String(userData.date_of_birth).split('T')[0] : '',
                    age: userData.age || (userData.date_of_birth ? calculateAge(userData.date_of_birth) : ''),
                    gender: userData.gender || 'Male',
                    civil_status: userData.civil_status || 'Single',
                    address: userData.address || '',
                    school_name: userData.school_name || '',
                    student_id: userData.student_id || userData.id_number || '',
                    course: userData.course || 'BS Information Technology',
                    year_level: userData.year_level || '4th Year',
                    it_position: userData.it_position || 'Software Engineer / Developer',
                    profile_pic: userData.profile_pic || undefined,
                    ojt_hours_required: Number(userData.ojt_hours_required) || 600
                };

                setProfile(mappedUser);
                setFormData({
                    member_title: mappedUser.member_title || 'Mr.',
                    first_name: mappedUser.first_name || '',
                    middle_name: mappedUser.middle_name || '',
                    last_name: mappedUser.last_name || '',
                    full_name: mappedUser.full_name || '',
                    id_number: mappedUser.id_number || '',
                    student_id: mappedUser.student_id || '',
                    email: mappedUser.email || '',
                    phone: mappedUser.phone || '',
                    date_of_birth: mappedUser.date_of_birth || '',
                    age: String(mappedUser.age || ''),
                    gender: mappedUser.gender || 'Male',
                    civil_status: mappedUser.civil_status || 'Single',
                    address: mappedUser.address || '',
                    school_name: mappedUser.school_name || '',
                    course: mappedUser.course || '',
                    year_level: mappedUser.year_level || '',
                    it_position: mappedUser.it_position || 'Software Engineer / Developer'
                });
            }
        } catch (err) {
            console.error("Fetch Profile Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const nextData = { ...prev, [name]: value };
            if (name === 'date_of_birth') {
                nextData.age = calculateAge(value);
            }
            return nextData;
        });
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const uploadData = new FormData();
            const fullName = formData.full_name || `${formData.first_name} ${formData.middle_name ? formData.middle_name + ' ' : ''}${formData.last_name}`.trim();

            uploadData.append('full_name', fullName);
            uploadData.append('member_title', formData.member_title);
            uploadData.append('first_name', formData.first_name);
            uploadData.append('middle_name', formData.middle_name);
            uploadData.append('last_name', formData.last_name);
            uploadData.append('id_number', formData.id_number || formData.student_id);
            uploadData.append('student_id', formData.student_id || formData.id_number);
            uploadData.append('email', formData.email);
            uploadData.append('phone', formData.phone);
            uploadData.append('date_of_birth', formData.date_of_birth);
            uploadData.append('age', formData.age);
            uploadData.append('gender', formData.gender);
            uploadData.append('civil_status', formData.civil_status);
            uploadData.append('address', formData.address);
            uploadData.append('school_name', formData.school_name);
            uploadData.append('course', formData.course);
            uploadData.append('year_level', formData.year_level);
            uploadData.append('it_position', formData.it_position);

            if (selectedFile) {
                uploadData.append('profile_pic', selectedFile);
            }

            const res = await api.put('/auth/profile', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (res.data?.success) {
                alert("Profile updated successfully!");
                setIsEditModalOpen(false);
                setSelectedFile(null);
                setPreviewUrl(null);
                window.dispatchEvent(new Event('profileUpdated'));
                await fetchProfile(); 
            } else {
                alert(res.data?.message || "Update failed.");
            }
        } catch (err) {
            console.error("Update Error:", err);
            alert("Failed to update profile.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDownloadPic = () => {
        if (!profile?.profile_pic) {
            alert("No profile picture uploaded yet.");
            return;
        }
        const imgUrl = getFullPicUrl(profile.profile_pic);
        const link = document.createElement('a');
        link.href = imgUrl;
        link.download = `${profile.full_name.replace(/\s+/g, '_')}_Profile_Pic.jpg`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return (
        <div className="py-20 text-center text-slate-400 text-xs font-medium animate-pulse">
            Loading student profile...
        </div>
    );

    const currentPicUrl = profile?.profile_pic ? getFullPicUrl(profile.profile_pic) : null;

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12 text-slate-800">
            
            {/* Top Title & Primary Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                            Verified Intern Account
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Student Account Profile</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Manage your detailed personal identification, school track, contact info, and IT specialization
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {currentPicUrl && (
                        <button 
                            onClick={handleDownloadPic}
                            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <Download className="w-4 h-4 text-blue-600" />
                            <span>Download Picture</span>
                        </button>
                    )}

                    <button 
                        onClick={() => {
                            setFormData({
                                member_title: profile?.member_title || 'Mr.',
                                first_name: profile?.first_name || '',
                                middle_name: profile?.middle_name || '',
                                last_name: profile?.last_name || '',
                                full_name: profile?.full_name || '',
                                id_number: profile?.id_number || profile?.student_id || '',
                                student_id: profile?.student_id || profile?.id_number || '',
                                email: profile?.email || '',
                                phone: profile?.phone || '',
                                date_of_birth: profile?.date_of_birth || '',
                                age: String(profile?.age || ''),
                                gender: profile?.gender || 'Male',
                                civil_status: profile?.civil_status || 'Single',
                                address: profile?.address || '',
                                school_name: profile?.school_name || '',
                                course: profile?.course || '',
                                year_level: profile?.year_level || '',
                                it_position: profile?.it_position || 'Software Engineer / Developer'
                            });
                            setPreviewUrl(null);
                            setSelectedFile(null);
                            setIsEditModalOpen(true);
                        }} 
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                    >
                        <Edit2 className="w-4 h-4" />
                        <span>Edit Full Profile</span>
                    </button>
                </div>
            </div>

            {/* Profile Overview Hero Box */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center gap-6">
                
                {/* Profile Picture */}
                <div className="relative group shrink-0">
                    {currentPicUrl ? (
                        <img 
                            src={currentPicUrl} 
                            alt={profile?.full_name} 
                            className="w-28 h-28 rounded-full object-cover border-4 border-slate-100 shadow-md"
                        />
                    ) : (
                        <div className="w-28 h-28 rounded-full border-4 border-blue-100 bg-blue-50 text-blue-700 font-extrabold text-3xl flex items-center justify-center shadow-xs">
                            {getInitials(profile?.full_name)}
                        </div>
                    )}
                </div>

                {/* Profile Key Attributes */}
                <div className="space-y-2 text-center md:text-left flex-1">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{profile?.member_title}</span>
                        <h2 className="text-2xl font-black text-slate-900">{profile?.full_name}</h2>
                        <span className="px-3 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full inline-flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> Verified OJT Intern
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs">
                        {profile?.it_position && (
                            <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg font-semibold flex items-center gap-1.5">
                                <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                                {profile.it_position}
                            </span>
                        )}
                        {profile?.school_name && (
                            <span className="px-3 py-1 bg-purple-50 text-purple-800 border border-purple-200 rounded-lg font-semibold flex items-center gap-1.5">
                                <School className="w-3.5 h-3.5 text-purple-600" />
                                {profile.school_name}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1 text-xs text-slate-500 font-medium">
                        {profile?.course && (
                            <span>Degree: <strong className="text-slate-800">{profile.course}</strong></span>
                        )}
                        {profile?.year_level && (
                            <span>Year Level: <strong className="text-slate-800">{profile.year_level}</strong></span>
                        )}
                        {(profile?.id_number || profile?.student_id) && (
                            <span className="font-mono">I.D Number: <strong className="text-slate-800">{profile?.id_number || profile?.student_id}</strong></span>
                        )}
                    </div>
                </div>
            </div>

            {/* Detailed Verification Information Grid Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. PERSONAL IDENTIFICATION & DEMOGRAPHICS */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-emerald-600">
                        <User className="w-4 h-4" /> Personal Identification & Demographics
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Member Title</p>
                            <p className="font-semibold text-slate-800">{profile?.member_title || 'Mr.'}</p>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl sm:col-span-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Hash className="w-3 h-3 text-emerald-600" /> I.D / Student Number
                            </p>
                            <p className="font-semibold font-mono text-slate-800">{profile?.id_number || profile?.student_id || 'Not Set'}</p>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">First Name</p>
                            <p className="font-semibold text-slate-800">{profile?.first_name || profile?.full_name?.split(' ')[0] || 'N/A'}</p>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Middle Name</p>
                            <p className="font-semibold text-slate-800">{profile?.middle_name || 'N/A'}</p>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Last Name</p>
                            <p className="font-semibold text-slate-800">{profile?.last_name || profile?.full_name?.split(' ').slice(1).join(' ') || 'N/A'}</p>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-blue-600" /> Date of Birth
                            </p>
                            <p className="font-semibold text-slate-800">{profile?.date_of_birth || 'Not Set'}</p>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Age</p>
                            <p className="font-extrabold text-emerald-600">{profile?.age || 'N/A'}</p>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sex / Gender</p>
                            <p className="font-semibold text-slate-800">{profile?.gender || 'Male'}</p>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Heart className="w-3 h-3 text-rose-500" /> Civil Status
                            </p>
                            <p className="font-semibold text-slate-800">{profile?.civil_status || 'Single'}</p>
                        </div>
                    </div>
                </div>

                {/* 2. CONTACT & LOCATION */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-blue-600">
                        <Mail className="w-4 h-4" /> Contact & Location Information
                    </div>

                    <div className="space-y-3.5 text-xs">
                        <div className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                            <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Official Email Address</p>
                                <p className="font-bold text-slate-900 mt-0.5">{profile?.email}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                            <Phone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Phone Number</p>
                                <p className="font-bold text-slate-900 mt-0.5">{profile?.phone || 'Not Provided'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                            <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Residential Address</p>
                                <p className="font-bold text-slate-900 mt-0.5">{profile?.address || 'Not Provided'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. ACADEMIC TRACK & SCHOOL DETAILS */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-purple-600">
                        <School className="w-4 h-4" /> Academic Track & School Details
                    </div>

                    <div className="space-y-3 text-xs">
                        <div className="p-3.5 bg-purple-50/50 border border-purple-100 rounded-2xl space-y-1">
                            <p className="text-[10px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
                                <School className="w-3.5 h-3.5 text-purple-600" /> Name of School / University
                            </p>
                            <p className="font-extrabold text-slate-900 text-sm">{profile?.school_name || 'Not Specified'}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3.5">
                            <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <BookOpen className="w-3 h-3 text-purple-600" /> Course / Degree Program
                                </p>
                                <p className="font-semibold text-slate-800">{profile?.course || 'Not Set'}</p>
                            </div>

                            <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Year Level / Batch</p>
                                <p className="font-semibold text-slate-800">{profile?.year_level || 'Not Set'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. IT POSITION & INTERNSHIP METRICS */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-amber-600">
                        <Briefcase className="w-4 h-4" /> IT Position & Internship Metrics
                    </div>

                    <div className="space-y-3.5 text-xs">
                        <div className="p-3.5 bg-amber-50/50 border border-amber-100 rounded-2xl space-y-1">
                            <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                                <Briefcase className="w-3.5 h-3.5 text-amber-600" /> IT Track Specialization / Position
                            </p>
                            <p className="font-extrabold text-slate-900 text-sm">{profile?.it_position || 'Software Engineer / Developer'}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3.5">
                            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-blue-600" /> Required OJT Hours
                                </p>
                                <p className="text-xl font-extrabold text-slate-900 font-mono">{profile?.ojt_hours_required} hrs</p>
                            </div>

                            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <Award className="w-3 h-3 text-emerald-600" /> Academic Status
                                </p>
                                <p className="text-xs font-bold text-emerald-700 mt-1">Verified Active</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* --- COMPLETE PROFILE EDIT MODAL --- */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
                    <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Update Detailed Profile Verification</h3>
                                <p className="text-xs text-slate-500">Edit your personal identification, school track, and contact info</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="space-y-6">
                            
                            {/* Profile Picture Upload Header */}
                            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-5">
                                <div className="w-16 h-16 rounded-full border-2 border-slate-200 overflow-hidden bg-white flex items-center justify-center shrink-0 shadow-xs">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    ) : currentPicUrl ? (
                                        <img src={currentPicUrl} alt="Current" className="w-full h-full object-cover" />
                                    ) : (
                                        <Camera className="w-6 h-6 text-slate-400" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-900">Profile Photo</p>
                                    <p className="text-[11px] text-slate-500 mb-2">Upload a professional headshot for intern verification.</p>
                                    <label className="cursor-pointer bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 transition-all inline-flex items-center gap-1.5">
                                        <Upload className="w-3.5 h-3.5 text-blue-600" />
                                        <span>Select New Photo</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                    </label>
                                </div>
                            </div>

                            {/* Section 1: Personal Identification */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5" /> Personal Identification
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                                    <div>
                                        <label className="font-bold text-slate-700 mb-1 block">Member Title</label>
                                        <select 
                                            name="member_title" value={formData.member_title} onChange={handleFormChange}
                                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-600"
                                        >
                                            <option value="Mr.">Mr.</option>
                                            <option value="Ms.">Ms.</option>
                                            <option value="Mrs.">Mrs.</option>
                                            <option value="Dr.">Dr.</option>
                                            <option value="Engr.">Engr.</option>
                                            <option value="Prof.">Prof.</option>
                                        </select>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="font-bold text-slate-700 mb-1 block">I.D Number / Student ID</label>
                                        <input 
                                            type="text" name="id_number" value={formData.id_number} onChange={handleFormChange}
                                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 outline-none focus:border-blue-600"
                                            placeholder="000-000-000-000 or Student ID"
                                        />
                                    </div>

                                    <div>
                                        <label className="font-bold text-slate-700 mb-1 block">First Name</label>
                                        <input 
                                            type="text" name="first_name" value={formData.first_name} onChange={handleFormChange}
                                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-600"
                                        />
                                    </div>

                                    <div>
                                        <label className="font-bold text-slate-700 mb-1 block">Middle Name</label>
                                        <input 
                                            type="text" name="middle_name" value={formData.middle_name} onChange={handleFormChange}
                                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-600"
                                        />
                                    </div>

                                    <div>
                                        <label className="font-bold text-slate-700 mb-1 block">Last Name</label>
                                        <input 
                                            type="text" name="last_name" value={formData.last_name} onChange={handleFormChange}
                                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Contact & Demographics */}
                            <div className="space-y-4 pt-2 border-t border-slate-100">
                                <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5" /> Contact & Demographics
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                                    <div>
                                        <label className="font-bold text-slate-700 mb-1 block">Email Address</label>
                                        <input 
                                            type="email" name="email" value={formData.email} onChange={handleFormChange} required
                                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-600"
                                        />
                                    </div>

                                    <div>
                                        <label className="font-bold text-slate-700 mb-1 block">Phone Number</label>
                                        <input 
                                            type="text" name="phone" value={formData.phone} onChange={handleFormChange}
                                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-600"
                                            placeholder="+63 900 000 0000"
                                        />
                                    </div>

                                    <div>
                                        <label className="font-bold text-slate-700 mb-1 block">Date of Birth</label>
                                        <input 
                                            type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleFormChange}
                                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-600"
                                        />
                                    </div>

                                    <div>
                                        <label className="font-bold text-slate-700 mb-1 block">Sex / Gender</label>
                                        <select 
                                            name="gender" value={formData.gender} onChange={handleFormChange}
                                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-600"
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="font-bold text-slate-700 mb-1 block">Civil Status</label>
                                        <select 
                                            name="civil_status" value={formData.civil_status} onChange={handleFormChange}
                                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-600"
                                        >
                                            <option value="Single">Single</option>
                                            <option value="Married">Married</option>
                                            <option value="Divorced">Divorced</option>
                                            <option value="Widowed">Widowed</option>
                                            <option value="Separated">Separated</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="font-bold text-slate-700 mb-1 block">Residential Address</label>
                                        <input 
                                            type="text" name="address" value={formData.address} onChange={handleFormChange}
                                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Academic & School Details */}
                            <div className="space-y-4 pt-2 border-t border-slate-100">
                                <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wider flex items-center gap-1.5">
                                    <School className="w-3.5 h-3.5" /> Academic & School Details
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                                    <div className="sm:col-span-3">
                                        <label className="font-bold text-slate-700 mb-1 block">Name of School / University</label>
                                        <input 
                                            type="text" name="school_name" value={formData.school_name} onChange={handleFormChange}
                                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-600"
                                            placeholder="University of Cebu / CIT-U"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="font-bold text-slate-700 mb-1 block">Course / Degree Program</label>
                                        <input 
                                            type="text" name="course" value={formData.course} onChange={handleFormChange}
                                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-600"
                                        />
                                    </div>

                                    <div>
                                        <label className="font-bold text-slate-700 mb-1 block">Year Level / Batch</label>
                                        <input 
                                            type="text" name="year_level" value={formData.year_level} onChange={handleFormChange}
                                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: IT Track Specialization */}
                            <div className="space-y-4 pt-2 border-t border-slate-100">
                                <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                                    <Briefcase className="w-3.5 h-3.5" /> IT Track Specialization
                                </h4>

                                <div>
                                    <label className="font-bold text-slate-700 mb-1 block text-xs">IT Position / Track Specialization</label>
                                    <select 
                                        name="it_position" value={formData.it_position} onChange={handleFormChange}
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-600"
                                    >
                                        {IT_POSITIONS.map((pos, idx) => (
                                            <option key={idx} value={pos}>{pos}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                                <button 
                                    type="button" 
                                    onClick={() => setIsEditModalOpen(false)} 
                                    className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSaving} 
                                    className="px-6 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                                >
                                    {isSaving ? 'Saving Profile...' : 'Save Profile Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentProfile;