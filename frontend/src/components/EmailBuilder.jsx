/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useDropzone } from 'react-dropzone';
import { ChevronUpIcon, ChevronDownIcon, PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';

const EmailBuilder = () => {
  const [emailData, setEmailData] = useState({
    sections: [
      {
        id: 1,
        type: 'title',
        content: 'Email has never been easier',
        order: 0
      },
      {
        id: 2,
        type: 'content',
        content: 'Create beautiful and sophisticated emails in minutes. No code required, and minimal setup.',
        order: 1
      },
      {
        id: 3,
        type: 'image',
        content: null,
        order: 2
      }
    ],
    styles: {
      titleSize: 'text-3xl',
      contentSize: 'text-base',
      alignment: 'text-left',
      theme: 'light'
    }
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      setLoading(true);
      try {
        // Simulated API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        // const response = await axios.get('/api/template/default');
        // setEmailData(response.data);
      } catch (error) {
        showNotification('Error loading template', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSectionChange = (id, value) => {
    setEmailData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === id ? { ...section, content: value } : section
      )
    }));
  };

  const handleStyleChange = (property, value) => {
    setEmailData(prev => ({
      ...prev,
      styles: {
        ...prev.styles,
        [property]: value
      }
    }));
  };

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
        setEmailData(prev => ({
          ...prev,
          sections: prev.sections.map(section =>
            section.type === 'image' ? { ...section, content: file } : section
          )
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    multiple: false
  });

  const moveSection = (index, direction) => {
    const newSections = [...emailData.sections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < newSections.length) {
      [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
      newSections.forEach((section, idx) => {
        section.order = idx;
      });
      setEmailData(prev => ({ ...prev, sections: newSections }));
    }
  };

  const saveTemplate = async () => {
    setLoading(true);
    try {
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // const formData = new FormData();
      // formData.append('data', JSON.stringify(emailData));
      // await axios.post('/api/template/save', formData);
      showNotification('Template saved successfully!');
    } catch (error) {
      showNotification('Error saving template', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
          notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } text-white`}>
          {notification.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Panel */}
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
            {emailData.sections.map((section, index) => (
              <div key={section.id} className="relative bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="absolute right-2 top-2 flex space-x-2">
                  <button
                    onClick={() => moveSection(index, 'up')}
                    disabled={index === 0}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
                  >
                    <ChevronUpIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => moveSection(index, 'down')}
                    disabled={index === emailData.sections.length - 1}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
                  >
                    <ChevronDownIcon className="h-5 w-5" />
                  </button>
                </div>

                {section.type === 'title' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      value={section.content}
                      onChange={(e) => handleSectionChange(section.id, e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                )}

                {section.type === 'content' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Content</label>
                    <ReactQuill
                      value={section.content}
                      onChange={(value) => handleSectionChange(section.id, value)}
                      className="bg-white rounded-md"
                    />
                  </div>
                )}

                {section.type === 'image' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Image</label>
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'}`}
                    >
                      <input {...getInputProps()} />
                      <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">
                        {isDragActive ? 'Drop the image here' : 'Drag & drop an image here, or click to select'}
                      </p>
                      {preview && (
                        <img src={preview} alt="Preview" className="mt-4 mx-auto max-h-40 rounded-lg" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Style Controls */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Style Options</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Text Size</label>
                  <select
                    value={emailData.styles.contentSize}
                    onChange={(e) => handleStyleChange('contentSize', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="text-sm">Small</option>
                    <option value="text-base">Medium</option>
                    <option value="text-lg">Large</option>
                    <option value="text-xl">Extra Large</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Alignment</label>
                  <select
                    value={emailData.styles.alignment}
                    onChange={(e) => handleStyleChange('alignment', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="text-left">Left</option>
                    <option value="text-center">Center</option>
                    <option value="text-right">Right</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Background Color</label>
                  <input
                    type="color"
                    value={emailData.styles.backgroundColor || '#ffffff'}
                    onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Background Image URL</label>
                  <input
                    type="text"
                    value={emailData.styles.backgroundImage || ''}
                    onChange={(e) => handleStyleChange('backgroundImage', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter image URL"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={saveTemplate}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Template'}
            </button>
          </div>

          {/* Preview Panel */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Preview</h2>
              <div className={`border rounded-lg p-6 ${emailData.styles.alignment}`}>
                {emailData.sections.sort((a, b) => a.order - b.order).map(section => (
                  <div key={section.id} className="mb-4">
                    {section.type === 'title' && (
                      <h1 className={`font-bold ${emailData.styles.titleSize}`}>
                        {section.content}
                      </h1>
                    )}
                    {section.type === 'content' && (
                      <div
                        dangerouslySetInnerHTML={{ __html: section.content }}
                        className={emailData.styles.contentSize}
                      />
                    )}
                    {section.type === 'image' && preview && (
                      <img src={preview} alt="Content" className="max-w-full rounded-lg" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailBuilder;