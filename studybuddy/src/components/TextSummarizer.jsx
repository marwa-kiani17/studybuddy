import React, { useState } from 'react';
import { FaRegCopy } from 'react-icons/fa'; // Importing the copy icon
import Header from './Header';

const TextSummarizer = () => {
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryText, setSummaryText] = useState(''); // Placeholder text for the summary

  const handleCopyText = () => {
    navigator.clipboard.writeText(summaryText).then(() => {
      alert('Text copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  return (
    <>
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-2">Text Summarizer</h1>
        <p className="text-gray-600 mb-6">
          Upload and Summarize your PDFs within minutes!
        </p>

        {/* Status Message */}
        <div className="flex justify-between items-center border border-gray-300 bg-gray-50 p-4 mb-6 rounded-lg shadow-md">
          <p className="text-green-500 font-medium">
            {isSummarizing ? 'Please wait while we summarize your content' : 'Ready to Summarize!'}
          </p>
          <div className="flex space-x-3">
            <button className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">
              Quick Revise
            </button>
            <button className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
              Keywords
            </button>
          </div>
        </div>

        {/* Summarized Text Area with Copy Button */}
        <div className="relative mb-8"> {/* Set relative for absolute positioning inside */}
          <textarea
            className="w-full h-40 p-4 pr-12 pb-12 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
            placeholder="Summarized content will appear here..."
            value={summaryText}
            onChange={(e) => setSummaryText(e.target.value)}
          ></textarea>

          {/* Copy Button at bottom-right corner inside the textarea */}
          <button
            onClick={handleCopyText}
            className="absolute bottom-2 right-2 flex items-center space-x-1 text-sm text-black hover:underline"
          >
            <FaRegCopy className="inline-block" /> {/* Copy Icon */}
            <span>Copy text</span>
          </button>
        </div>

        {/* Quick Revision Section */}
        <h2 className="text-xl font-semibold mb-4">Quick Revision</h2>
        <div className="p-6 bg-gray-100 border border-gray-300 rounded-lg shadow-sm mb-8">
          <ul className="list-disc pl-6 text-gray-700">
            <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
            <li>Ut et massa mi. Aliquam in hendrerit urna.</li>
            <li>Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris.</li>
            <li>Maecenas vitae mattis tellus, Nullam quis imperdiet augue.</li>
          </ul>
        </div>

        {/* Keywords Section */}
        <h2 className="text-xl font-semibold mb-4">Keywords</h2>
        <div className="p-6 bg-gray-100 border border-gray-300 rounded-lg shadow-sm">
          <p className="text-gray-700">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in
            hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur,
            ultrices mauris. Maecenas vitae mattis tellus, Nullam quis imperdiet augue. Vestibulum
            auctor ornare leo, non suscipit magna interdum eu. Curabitur pellentesque nibh nibh, at
            maximus ante fermentum sit amet. Vestibulum auctor ornare leo, non suscipit magna
            interdum.
          </p>
        </div>
      </div>
    </>
  );
};

export default TextSummarizer;
