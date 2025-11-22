
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ImageViewer } from './components/ImageViewer';
import { removeTextFromImage } from './services/geminiService';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback((file: File) => {
    setOriginalImage(file);
    setOriginalImageUrl(URL.createObjectURL(file));
    setEditedImageUrl(null);
    setError(null);
  }, []);

  const handleRemoveText = async () => {
    if (!originalImage) return;

    setIsLoading(true);
    setError(null);
    setEditedImageUrl(null);

    try {
      const { base64Image, mimeType } = await removeTextFromImage(originalImage);
      setEditedImageUrl(`data:${mimeType};base64,${base64Image}`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = useCallback(() => {
    if (!editedImageUrl) return;
    const link = document.createElement('a');
    link.href = editedImageUrl;
    const fileExtension = editedImageUrl.split(';')[0].split('/')[1];
    link.download = `edited-image.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [editedImageUrl]);

  const handleClear = () => {
    setOriginalImage(null);
    setOriginalImageUrl(null);
    setEditedImageUrl(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl">
        <Header />
        <main className="mt-8">
          {!originalImageUrl ? (
            <ImageUploader onImageUpload={handleImageUpload} />
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ImageViewer title="Original Image" imageUrl={originalImageUrl} />
                <ImageViewer
                  title="Text Removed"
                  imageUrl={editedImageUrl}
                  isLoading={isLoading}
                  onDownload={handleDownload}
                />
              </div>
              {error && (
                <div className="mt-6 bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-center">
                  <p><strong>Error:</strong> {error}</p>
                </div>
              )}
              <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                <button
                  onClick={handleRemoveText}
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Processing...' : 'Remove Text'}
                </button>
                <button
                  onClick={handleClear}
                  className="w-full sm:w-auto bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-opacity-50"
                >
                  Start Over
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
