import React, { useState } from 'react';
import axios from 'axios';
import { FaRegCopy } from 'react-icons/fa'; // Importing the copy icon
import Header from './Header';
import PlusLogo from '../images/plus.png';

function SummarizationApp() {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [quickRevision, setQuickRevision] = useState([]); // Store as array
  const [error, setError] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [isQuickRevisionLoading, setIsQuickRevisionLoading] = useState(false);
  const [isKeywordExtractionLoading, setIsKeywordExtractionLoading] = useState(false);


  // Handle file selection
  const handleFileUpload = (event) => {
    setFile(event.target.files[0]);
    setSummary('');
    setKeywords([]);
    setQuickRevision([]);
    setError(null);
    console.log("File uploaded:", event.target.files[0]);
  };

  // Handle file removal
  const handleFileRemove = () => {
    setFile(null);
    setSummary('');
    setKeywords([]);
    setQuickRevision([]);
    setError(null);
    document.getElementById('fileInput').value = '';
    console.log("File removed");
  };

  const triggerFileInput = () => {
    document.getElementById('fileInput').click();
  };

  // Handle file submission to the server for summarization
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setError('Please select a file first.');
      console.error('No file selected');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setIsSummarizing(true);
    setShowSummary(true);

    try {
      console.log("Submitting PDF for summarization...");
      const response = await axios.post('http://localhost:5000/summarize_pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("Received summary from backend:", response.data.summary);
      setSummary(response.data.summary);
      setIsSummarizing(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('There was an error summarizing the file.');
      setIsSummarizing(false);
    }
  };



  // Handle Keyword Extraction
  const handleKeywordExtraction = async () => {
    setIsKeywordExtractionLoading(true); // Start loading
    try {
      console.log("Requesting keyword extraction for summary:", summary);
      const response = await axios.post('http://localhost:5000/extract_keywords', { summary });
      setKeywords(response.data.keywords);
    } catch (error) {
      console.error('Error extracting keywords:', error);
      setError('There was an error extracting keywords.');
    } finally {
      setIsKeywordExtractionLoading(false); // Stop loading
    }
  };


  // Handle Quick Revision (Extract Key Sentences)
  const handleQuickRevision = async () => {
    setIsQuickRevisionLoading(true); // Start loading
    try {
      console.log("Requesting quick revision for summary:", summary);
      const response = await axios.post('http://localhost:5000/quick_revision', { summary });

      console.log("Quick revision points received:", response.data.bullet_points);
      setQuickRevision(response.data.bullet_points);
    } catch (error) {
      console.error('Error generating quick revision:', error);
      setError('There was an error generating quick revision.');
      setQuickRevision([]);
    } finally {
      setIsQuickRevisionLoading(false); // Stop loading
    }
  };


  // Handle text copy functionality
  const handleCopyText = () => {
    navigator.clipboard.writeText(summary).then(() => {
      alert('Text copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  return (
    <div>
      <Header />

      {!showSummary && (
        <div>
          <div className='mt-6 px-7 text-2xl text-center' style={{ color: 'rgb(125, 46, 140)', marginBottom: '60px' }}>
            <span className='font-semibold'>Text Summarization</span>
          </div>


          <div className='flex flex-col items-center justify-center mt-6 cursor-pointer'>
            <div
              className='flex items-center flex-col gap-7 justify-center border-2 border-gray h-72 w-96 rounded-lg'
              onClick={triggerFileInput}
            >
              <img src={PlusLogo} alt="Pluslogo" />
              <span className='text-gray-500'><strong>Upload</strong> Files from device</span>
            </div>
            <input
              id="fileInput"
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.docx"
            />

            {file && (
              <div className='flex items-start flex-col gap-7 justify-start mt-10 w-96'>
                <span className='font-semibold text-2xl'><strong>Uploaded</strong> file</span>
                <div className='flex items-start gap-5 flex-row'>
                  <div className='w-80 h-10 border-2 border-gray flex items-center px-2'>
                    {file.name}
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-7 h-7 cursor-pointer"
                    viewBox="0 0 256 256"
                    onClick={handleFileRemove}
                  >
                    <g fill="#fa5252">
                      <g transform="scale(10.66667,10.66667)">
                        <path d="M10.80664,2c-0.517,0 -1.01095,0.20431 -1.37695,0.57031l-0.42969,0.42969h-5c-0.36064,-0.0051 -0.69608,0.18438 -0.87789,0.49587c-0.18181,0.3115 -0.18181,0.69676 0,1.00825c0.18181,0.3115 0.51725,0.50097 0.87789,0.49587h16c0.36064,0.0051 0.69608,-0.18438 0.87789,-0.49587c0.18181,-0.3115 0.18181,-0.69676 0,-1.00825c-0.18181,-0.3115 -0.51725,-0.50097 -0.87789,-0.49587h-5l-0.42969,-0.42969c-0.365,-0.366 -0.85995,-0.57031 -1.37695,-0.57031zM4.36523,7l1.52734,13.26367c0.132,0.99 0.98442,1.73633 1.98242,1.73633h8.24805c0.998,0 1.85138,-0.74514 1.98438,-1.74414l1.52734,-13.25586z"></path>
                      </g>
                    </g>
                  </svg>
                </div>
              </div>
            )}

            <button
              className="text-white bg-[#BC7BDA] font-semibold mt-5"
              onClick={handleSubmit}
            >
              Summarize
            </button>
          </div>
        </div>
      )}

      {showSummary && (
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-2">Text Summarizer</h1>

          <div className="flex justify-between items-center border border-gray-300 bg-gray-50 p-4 mb-6 rounded-lg shadow-md">
            <p className="text-green-500 font-medium">
              {isSummarizing ? 'Please wait while we summarize your content' : 'Your summary is ready!'}
            </p>
          {isSummarizing && (
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="loader border-4 border-purple-400 border-t-transparent w-12 h-12 rounded-full animate-spin"></div>
              </div>
            </div>
          )}

            <div className={`flex space-x-3 ${isSummarizing ? 'hidden' : 'block'}`}>
              <button
                onClick={handleQuickRevision}
                className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                disabled={isQuickRevisionLoading} // Disable button while loading
              >
                {isQuickRevisionLoading ? (
                  <span>Revising...</span> // Show loading text while the API call is in progress
                ) : (
                  <span>Quick Revise</span>
                )}
              </button>

              <button
                onClick={handleKeywordExtraction}
                className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                disabled={isKeywordExtractionLoading} // Disable button while loading
              >
                {isKeywordExtractionLoading ? (
                  <span>Extracting...</span> // Show loading text while the API call is in progress
                ) : (
                  <span>Extract Keywords</span>
                )}
              </button>
            </div>

          </div>

          <div className="relative mb-8">
            <textarea
              className="w-full h-80 p-4 pr-12 pb-12 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
              placeholder="Summarized content will appear here..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            ></textarea>

            <button
              onClick={handleCopyText} // Added handleCopyText here
              className="absolute bottom-2 right-2 flex items-center space-x-1 text-sm text-black hover:underline"
            >
              <FaRegCopy className="inline-block" />
              <span>Copy text</span>
            </button>
          </div>

          {/* Quick Revision Section */}
          {quickRevision && quickRevision.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Quick Revision</h2>
              <div className="p-6 bg-gray-100 border border-gray-300 rounded-lg shadow-sm mb-8">
                <ul className="list-disc pl-6 text-gray-700">
                  {quickRevision.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {keywords.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Keywords</h2>
              <div className="p-6 bg-gray-100 border border-gray-300 rounded-lg shadow-sm">
                <p className="text-gray-700">
                  {keywords.join(', ')}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SummarizationApp;
