import React, { useState, useCallback } from 'react';
import { Upload, Download, Users, TrendingUp, AlertCircle, CheckCircle, X, Plus, Search, Filter } from 'lucide-react';

const PredictiveLeadSystem = () => {
  const [leads, setLeads] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [csvFile, setCsvFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterScore, setFilterScore] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    source: '',
    industry: '',
    budget: '',
    timeline: '',
    engagement: ''
  });

  // Predictive scoring algorithm
  const calculateLeadScore = (lead) => {
    let score = 0;
    
    // Source scoring
    const sourceScores = {
      'website': 20,
      'referral': 25,
      'social': 15,
      'email': 18,
      'cold': 10,
      'event': 22
    };
    score += sourceScores[lead.source?.toLowerCase()] || 10;
    
    // Budget scoring
    const budget = parseInt(lead.budget?.replace(/[^0-9]/g, '')) || 0;
    if (budget > 50000) score += 30;
    else if (budget > 10000) score += 20;
    else if (budget > 1000) score += 10;
    
    // Timeline scoring
    const timelineScores = {
      'immediate': 25,
      'within 1 month': 20,
      'within 3 months': 15,
      'within 6 months': 10,
      'no timeline': 5
    };
    score += timelineScores[lead.timeline?.toLowerCase()] || 5;
    
    // Engagement scoring
    const engagementScores = {
      'very high': 25,
      'high': 20,
      'medium': 15,
      'low': 10,
      'very low': 5
    };
    score += engagementScores[lead.engagement?.toLowerCase()] || 10;
    
    return Math.min(score, 100);
  };

  // Conversion probability calculation
  const calculateConversionProbability = (score) => {
    if (score >= 80) return 'Very High (85-95%)';
    if (score >= 60) return 'High (65-84%)';
    if (score >= 40) return 'Medium (40-64%)';
    if (score >= 20) return 'Low (20-39%)';
    return 'Very Low (0-19%)';
  };

  // CSV file processing
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setCsvFile(file);
    setIsUploading(true);
    setUploadProgress(0);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const newLeads = [];
        
        // Simulate upload progress
        const totalLines = lines.length - 1;
        let processed = 0;
        
        const processLine = (index) => {
          if (index >= lines.length) {
            setLeads(prev => [...prev, ...newLeads]);
            setIsUploading(false);
            setUploadProgress(100);
            setCsvFile(null);
            return;
          }
          
          const line = lines[index].trim();
          if (line) {
            const values = line.split(',').map(v => v.trim());
            const leadData = {};
            
            headers.forEach((header, i) => {
              const value = values[i] || '';
              // Map common CSV headers to our lead fields
              if (header.includes('name')) leadData.name = value;
              else if (header.includes('email')) leadData.email = value;
              else if (header.includes('company')) leadData.company = value;
              else if (header.includes('phone')) leadData.phone = value;
              else if (header.includes('source')) leadData.source = value;
              else if (header.includes('industry')) leadData.industry = value;
              else if (header.includes('budget')) leadData.budget = value;
              else if (header.includes('timeline')) leadData.timeline = value;
              else if (header.includes('engagement')) leadData.engagement = value;
            });
            
            if (leadData.name && leadData.email) {
              const score = calculateLeadScore(leadData);
              newLeads.push({
                id: Date.now() + Math.random(),
                ...leadData,
                score,
                conversionProbability: calculateConversionProbability(score),
                dateAdded: new Date().toLocaleDateString()
              });
            }
          }
          
          processed++;
          setUploadProgress((processed / totalLines) * 100);
          
          setTimeout(() => processLine(index + 1), 10);
        };
        
        processLine(1);
      } catch (error) {
        console.error('Error processing CSV:', error);
        setIsUploading(false);
        alert('Error processing CSV file. Please check the format.');
      }
    };
    
    reader.readAsText(file);
  }, []);

  // Add manual lead
  const handleAddLead = () => {
    if (!newLead.name || !newLead.email) {
      alert('Name and email are required');
      return;
    }
    
    const score = calculateLeadScore(newLead);
    const lead = {
      id: Date.now(),
      ...newLead,
      score,
      conversionProbability: calculateConversionProbability(score),
      dateAdded: new Date().toLocaleDateString()
    };
    
    setLeads(prev => [...prev, lead]);
    setNewLead({
      name: '', email: '', company: '', phone: '', source: '',
      industry: '', budget: '', timeline: '', engagement: ''
    });
    setShowAddForm(false);
  };

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesScore = filterScore === 'all' || 
                        (filterScore === 'high' && lead.score >= 70) ||
                        (filterScore === 'medium' && lead.score >= 40 && lead.score < 70) ||
                        (filterScore === 'low' && lead.score < 40);
    
    return matchesSearch && matchesScore;
  });

  // Calculate stats
  const stats = {
    total: leads.length,
    highScore: leads.filter(l => l.score >= 70).length,
    mediumScore: leads.filter(l => l.score >= 40 && l.score < 70).length,
    lowScore: leads.filter(l => l.score < 40).length,
    avgScore: leads.length > 0 ? Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length) : 0
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Leads</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">High Score Leads</p>
              <p className="text-2xl font-bold text-green-900">{stats.highScore}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Medium Score</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.mediumScore}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Avg Score</p>
              <p className="text-2xl font-bold text-purple-900">{stats.avgScore}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Recent High-Score Leads */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Top Converting Leads</h3>
        <div className="space-y-3">
          {leads
            .filter(l => l.score >= 70)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
            .map(lead => (
              <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{lead.name}</p>
                  <p className="text-sm text-gray-600">{lead.company} • {lead.email}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">{lead.score}/100</span>
                    <span className="text-sm text-gray-500">{lead.conversionProbability}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  const renderUpload = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Upload CSV File</h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Upload a CSV file with lead data. Expected columns: name, email, company, phone, source, industry, budget, timeline, engagement
          </p>
          <div className="bg-blue-50 p-3 rounded border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>CSV Format Example:</strong><br />
              name,email,company,phone,source,industry,budget,timeline,engagement<br />
              John Doe,john@example.com,Acme Inc,+1234567890,website,tech,$50000,immediate,high
            </p>
          </div>
        </div>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          {!isUploading ? (
            <>
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">Upload CSV File</p>
              <p className="text-sm text-gray-500 mb-4">Drag and drop or click to select</p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer inline-block"
              >
                Select CSV File
              </label>
            </>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-lg font-medium">Processing CSV...</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">{Math.round(uploadProgress)}% complete</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Add Lead Manually</h3>
        
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            Add New Lead
          </button>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Name *"
                value={newLead.name}
                onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                className="border border-gray-300 rounded px-3 py-2"
              />
              <input
                type="email"
                placeholder="Email *"
                value={newLead.email}
                onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                className="border border-gray-300 rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Company"
                value={newLead.company}
                onChange={(e) => setNewLead({...newLead, company: e.target.value})}
                className="border border-gray-300 rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Phone"
                value={newLead.phone}
                onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                className="border border-gray-300 rounded px-3 py-2"
              />
              <select
                value={newLead.source}
                onChange={(e) => setNewLead({...newLead, source: e.target.value})}
                className="border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Select Source</option>
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="social">Social Media</option>
                <option value="email">Email Campaign</option>
                <option value="cold">Cold Outreach</option>
                <option value="event">Event</option>
              </select>
              <input
                type="text"
                placeholder="Industry"
                value={newLead.industry}
                onChange={(e) => setNewLead({...newLead, industry: e.target.value})}
                className="border border-gray-300 rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Budget (e.g., $10,000)"
                value={newLead.budget}
                onChange={(e) => setNewLead({...newLead, budget: e.target.value})}
                className="border border-gray-300 rounded px-3 py-2"
              />
              <select
                value={newLead.timeline}
                onChange={(e) => setNewLead({...newLead, timeline: e.target.value})}
                className="border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Select Timeline</option>
                <option value="immediate">Immediate</option>
                <option value="within 1 month">Within 1 month</option>
                <option value="within 3 months">Within 3 months</option>
                <option value="within 6 months">Within 6 months</option>
                <option value="no timeline">No timeline</option>
              </select>
              <select
                value={newLead.engagement}
                onChange={(e) => setNewLead({...newLead, engagement: e.target.value})}
                className="border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Select Engagement</option>
                <option value="very high">Very High</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="very low">Very Low</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleAddLead}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Add Lead
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderLeads = () => (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterScore}
              onChange={(e) => setFilterScore(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2"
            >
              <option value="all">All Scores</option>
              <option value="high">High Score (70+)</option>
              <option value="medium">Medium Score (40-69)</option>
              <option value="low">Low Score (0-39)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead Info</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion Probability</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeline</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.map(lead => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                      <div className="text-sm text-gray-500">{lead.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{lead.company}</div>
                    <div className="text-sm text-gray-500">{lead.industry}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {lead.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        lead.score >= 70 ? 'bg-green-100 text-green-800' :
                        lead.score >= 40 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {lead.score}/100
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lead.conversionProbability}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lead.timeline}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setLeads(leads.filter(l => l.id !== lead.id))}
                      className="text-red-600 hover:text-red-900"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Predictive Lead Conversion System</h1>
          <p className="text-gray-600 mt-2">AI-powered lead scoring and conversion prediction</p>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 py-3 px-4 text-center ${
                activeTab === 'dashboard' 
                  ? 'bg-blue-600 text-white border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-3 px-4 text-center ${
                activeTab === 'upload' 
                  ? 'bg-blue-600 text-white border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Upload Data
            </button>
            <button
              onClick={() => setActiveTab('leads')}
              className={`flex-1 py-3 px-4 text-center ${
                activeTab === 'leads' 
                  ? 'bg-blue-600 text-white border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Leads ({leads.length})
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'upload' && renderUpload()}
        {activeTab === 'leads' && renderLeads()}
      </div>
    </div>
  );
};

export default PredictiveLeadSystem;
