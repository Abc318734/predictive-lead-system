import React, { useState, useCallback } from 'react';
import { Upload, Download, Users, TrendingUp, AlertCircle, CheckCircle, X, Plus, Search, Filter } from 'lucide-react';

const PredictiveLeadSystem = () => {
  // Your existing state logic remains the same.

  const renderDashboard = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      <div className="bg-blue-50 p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-600 text-sm font-semibold">Total Leads</p>
            <p className="text-3xl font-extrabold text-blue-900">{stats.total}</p>
          </div>
          <Users className="w-10 h-10 text-blue-600" />
        </div>
      </div>
      
      <div className="bg-green-50 p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-600 text-sm font-semibold">High Score Leads</p>
            <p className="text-3xl font-extrabold text-green-900">{stats.highScore}</p>
          </div>
          <TrendingUp className="w-10 h-10 text-green-600" />
        </div>
      </div>
      
      <div className="bg-yellow-50 p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-yellow-600 text-sm font-semibold">Medium Score</p>
            <p className="text-3xl font-extrabold text-yellow-900">{stats.mediumScore}</p>
          </div>
          <AlertCircle className="w-10 h-10 text-yellow-600" />
        </div>
      </div>
      
      <div className="bg-purple-50 p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-600 text-sm font-semibold">Avg Score</p>
            <p className="text-3xl font-extrabold text-purple-900">{stats.avgScore}</p>
          </div>
          <CheckCircle className="w-10 h-10 text-purple-600" />
        </div>
      </div>
    </div>
  );

  const renderUpload = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-xl">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6">Upload CSV File</h3>
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Upload a CSV file with lead data. Expected columns: name, email, company, phone, source, industry, budget, timeline, engagement
          </p>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>CSV Format Example:</strong><br />
              name,email,company,phone,source,industry,budget,timeline,engagement<br />
              John Doe,john@example.com,Acme Inc,+1234567890,website,tech,$50000,immediate,high
            </p>
          </div>
        </div>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
          {!isUploading ? (
            <>
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-700 mb-4">Upload CSV File</p>
              <p className="text-sm text-gray-500 mb-6">Drag and drop or click to select</p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="bg-blue-600 text-white text-lg px-6 py-3 rounded-lg hover:bg-blue-700 cursor-pointer inline-block"
              >
                Select CSV File
              </label>
            </>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xl font-semibold text-gray-800">Processing CSV...</p>
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

      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-xl">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6">Add Lead Manually</h3>
        
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-3 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition duration-200"
          >
            <Plus className="w-5 h-5" />
            Add New Lead
          </button>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form Inputs */}
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={handleAddLead}
                className="bg-green-600 text-white text-lg px-6 py-3 rounded-xl hover:bg-green-700 transition duration-200"
              >
                Add Lead
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-gray-500 text-white text-lg px-6 py-3 rounded-xl hover:bg-gray-600 transition duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-extrabold text-gray-900">Predictive Lead Conversion System</h1>
          <p className="text-xl text-gray-600 mt-4">AI-powered lead scoring and conversion prediction tool to boost your sales.</p>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-2xl border border-gray-200 mb-8 shadow-md">
          <div className="flex justify-around">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 py-4 text-xl font-semibold text-center ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-blue-600'} rounded-lg transition-all duration-300`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-4 text-xl font-semibold text-center ${activeTab === 'upload' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-blue-600'} rounded-lg transition-all duration-300`}
            >
              Upload Data
            </button>
            <button
              onClick={() => setActiveTab('leads')}
              className={`flex-1 py-4 text-xl font-semibold text-center ${activeTab === 'leads' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-blue-600'} rounded-lg transition-all duration-300`}
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
