import { useState, useEffect } from "react";
import { immutableJSONPatch, revertJSONPatch } from 'immutable-json-patch'
import { ReactFormatter } from "./react-formatter";

type ValidationResult = {
  isValid: boolean;
  errorMessage?: string;
};

function App() {
  const [jsonData, setJsonData] = useState(
    () => localStorage.getItem("jsonData") || ""
  );
  const [jsonPatch, setJsonPatch] = useState(
    () => localStorage.getItem("jsonPatch") || ""
  );
  const [result, setResult] = useState(
    () => localStorage.getItem("result") || ""
  );
  const [patchedData, setPatchedData] = useState<string | null>(() => {
    const savedPatchedData = localStorage.getItem("patchedData");
    return savedPatchedData ? JSON.parse(savedPatchedData) : null;
  });
  const [error, setError] = useState<string | null | undefined>(null);
  const [showUnchanged, setShowUnchanged] = useState(() => {
    const saved = localStorage.getItem("showUnchanged");
    return saved ? JSON.parse(saved) : false;
  });
  const [revertPatch, setRevertPatch] = useState(() => localStorage.getItem("revertPatch") || "");

  useEffect(() => {
    localStorage.setItem("jsonData", jsonData);
  }, [jsonData]);

  useEffect(() => {
    localStorage.setItem("jsonPatch", jsonPatch);
  }, [jsonPatch]);

  useEffect(() => {
    localStorage.setItem("result", result);
  }, [result]);

  useEffect(() => {
    if (patchedData !== null) {
      localStorage.setItem("patchedData", JSON.stringify(patchedData));
    } else {
      localStorage.removeItem("patchedData");
    }
  }, [patchedData]);

  useEffect(() => {
    localStorage.setItem("showUnchanged", JSON.stringify(showUnchanged));
  }, [showUnchanged]);

  useEffect(() => {
    localStorage.setItem("revertPatch", revertPatch);
  }, [revertPatch]);

  function validateJson(json: string): ValidationResult {
    try {
      JSON.parse(json);
      return { isValid: true };
    } catch {
      return { isValid: false, errorMessage: "Invalid JSON format" };
    }
  }

  const handleApplyPatch = () => {
    const jsonDataValidation = validateJson(jsonData);
    const jsonPatchValidation = validateJson(jsonPatch);

    if (!jsonDataValidation.isValid) {
      setError(jsonDataValidation.errorMessage);
      setResult("");
      setPatchedData(null);
      return;
    }

    if (!jsonPatchValidation.isValid) {
      setError(jsonPatchValidation.errorMessage);
      setResult("");
      setPatchedData(null);
      return;
    }

    setError(null);

    try {
      const data = JSON.parse(jsonData);
      const operations = JSON.parse(jsonPatch);
      const patchedData = immutableJSONPatch<string>(data, operations);
      setResult(JSON.stringify(patchedData, null, 2));
      setPatchedData(patchedData);

      const reverseOperations = revertJSONPatch(data, operations);
      setRevertPatch(JSON.stringify(reverseOperations, null, 2));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setResult(`Error: ${errorMessage}`);
      setPatchedData(null);
      setRevertPatch("");
    }
  };

  const handlePrettify = () => {
    try {
      const prettyJsonData = JSON.stringify(JSON.parse(jsonData), null, 2);
      const prettyJsonPatch = JSON.stringify(JSON.parse(jsonPatch), null, 2);
      setJsonData(prettyJsonData);
      setJsonPatch(prettyJsonPatch);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Invalid JSON format";
      setResult(`Error: ${errorMessage}`);
    }
  };

  const handleReset = () => {
    setJsonData("");
    setJsonPatch("");
    setResult("");
    setPatchedData(null);
    setError(null);
    setRevertPatch("");
    localStorage.removeItem("jsonData");
    localStorage.removeItem("jsonPatch");
    localStorage.removeItem("result");
    localStorage.removeItem("patchedData");
    localStorage.removeItem("revertPatch");
  };

  const handleJsonDataChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResult("");
    setPatchedData(null);
    setJsonData(e.target.value);
  };

  const handleJsonPatchChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonPatch(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8 flex flex-col">
      <div className="container mx-auto flex-grow">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
          JSON Patch Applier
        </h1>
        
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white shadow-md rounded-lg p-6">
              <label htmlFor="jsonData" className="block text-sm font-medium text-gray-700 mb-2">
                JSON Data:
              </label>
              <textarea
                id="jsonData"
                className="w-full h-64 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={jsonData}
                onChange={handleJsonDataChange}
                placeholder="Enter your JSON data here..."
              />
            </div>
            
            <div className="bg-white shadow-md rounded-lg p-6">
              <label htmlFor="jsonPatch" className="block text-sm font-medium text-gray-700 mb-2">
                Proposed JSON Patch:
              </label>
              <textarea
                id="jsonPatch"
                className="w-full h-64 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={jsonPatch}
                onChange={handleJsonPatchChange}
                placeholder="Enter your JSON Patch here..."
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white shadow-md rounded-lg p-6">
              <label htmlFor="result" className="block text-sm font-medium text-gray-700 mb-2">
                Result:
              </label>
              <textarea
                id="result"
                className="w-full h-64 p-3 border border-gray-300 rounded-md bg-gray-50"
                value={result}
                readOnly
                placeholder="The patched JSON will appear here..."
              />
            </div>
            
            <div className="bg-white shadow-md rounded-lg p-6">
              <label htmlFor="revertPatch" className="block text-sm font-medium text-gray-700 mb-2">
                Revert JSON Patch:
              </label>
              <textarea
                id="revertPatch"
                className="w-full h-64 p-3 border border-gray-300 rounded-md bg-gray-50"
                value={revertPatch}
                readOnly
                placeholder="The revert JSON Patch will appear here..."
              />
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mt-6 p-4 bg-red-100 text-red-700 border border-red-400 rounded-md">
            {error}
          </div>
        )}
        
        <div className="mt-8 flex flex-wrap justify-center items-center gap-4">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out"
            onClick={handleApplyPatch}
          >
            Apply Patch
          </button>
          <button
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out"
            onClick={handlePrettify}
          >
            Prettify JSON
          </button>
          <button
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out"
            onClick={handleReset}
          >
            Reset
          </button>
          <label className="flex items-center space-x-2 text-gray-700">
            <input
              type="checkbox"
              checked={showUnchanged}
              onChange={(e) => setShowUnchanged(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span>Show unchanged values</span>
          </label>
        </div>
        
        {patchedData && result && (
          <div className="mt-8 bg-white shadow-md rounded-lg p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Diff:</label>
            <div className="border border-gray-300 rounded-md bg-gray-50 h-96 overflow-auto p-4">
              <ReactFormatter
                oldJson={JSON.parse(jsonData)}
                newJson={patchedData}
                showUnchanged={showUnchanged}
              />
            </div>
          </div>
        )}
      </div>
      
      <footer className="mt-12 py-6">
        <div className="text-center text-sm text-gray-500">
          <p>
            <a href="https://github.com/mkuchak/apply-json-patch" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
              View project on GitHub
            </a>
          </p>
          <p className="mt-2">
            Powered by:{' '}
            <a href="https://github.com/josdejong/immutable-json-patch" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
              immutable-json-patch
            </a>
            {' '}&amp;{' '}
            <a href="https://github.com/benjamine/jsondiffpatch" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
              jsondiffpatch
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
