import { useState, useEffect } from "react";
import { immutableJSONPatch } from "immutable-json-patch";
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
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setResult(`Error: ${errorMessage}`);
      setPatchedData(null);
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
    localStorage.removeItem("jsonData");
    localStorage.removeItem("jsonPatch");
    localStorage.removeItem("result");
    localStorage.removeItem("patchedData");
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
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">
        JSON Patch Applier
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="jsonData" className="block mb-2 font-semibold">
            JSON Data:
          </label>
          <textarea
            id="jsonData"
            className="w-full h-64 p-2 border border-gray-300 rounded-md"
            value={jsonData}
            onChange={handleJsonDataChange}
            placeholder="Enter your JSON data here..."
          />
        </div>
        <div>
          <label htmlFor="jsonPatch" className="block mb-2 font-semibold">
            JSON Patch:
          </label>
          <textarea
            id="jsonPatch"
            className="w-full h-64 p-2 border border-gray-300 rounded-md"
            value={jsonPatch}
            onChange={handleJsonPatchChange}
            placeholder="Enter your JSON Patch here..."
          />
        </div>
      </div>
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 border border-red-400 rounded">
          {error}
        </div>
      )}
      <div className="mt-4 flex justify-center space-x-4 items-center">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          onClick={handleApplyPatch}
        >
          Apply Patch
        </button>
        <button
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          onClick={handlePrettify}
        >
          Prettify JSON
        </button>
        <button
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          onClick={handleReset}
        >
          Reset
        </button>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showUnchanged}
            onChange={(e) => setShowUnchanged(e.target.checked)}
            className="form-checkbox"
          />
          <span>Show unchanged values</span>
        </label>
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="result" className="block mb-2 font-semibold">
            Result:
          </label>
          <textarea
            id="result"
            className="w-full h-[calc(100vh-400px)] p-2 border border-gray-300 rounded-md"
            value={result}
            readOnly
            placeholder="The patched JSON will appear here..."
          />
        </div>
        {patchedData && result && (
          <div>
            <label className="block mb-2 font-semibold">Diff:</label>
            <div className="p-4 border border-gray-300 rounded-md bg-gray-50 h-[calc(100vh-400px)] overflow-auto">
              <ReactFormatter
                oldJson={JSON.parse(jsonData)}
                newJson={patchedData}
                showUnchanged={showUnchanged}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
