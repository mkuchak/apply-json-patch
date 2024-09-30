import { useState, useEffect } from "react";
import { immutableJSONPatch, revertJSONPatch } from "immutable-json-patch";
import { ReactFormatter } from "./components/react-formatter";

type ValidationResult = {
  isValid: boolean;
  errorMessage?: string;
};

type AppState = {
  jsonData: string;
  jsonPatch: string;
  result: string;
  patchedData: string | null;
  error: string | null;
  showUnchanged: boolean;
  revertPatch: string;
};

function App() {
  const [state, setState] = useState<AppState>(() => {
    const savedState = localStorage.getItem("appState");
    if (savedState) {
      return JSON.parse(savedState);
    }
    return {
      jsonData: "",
      jsonPatch: "",
      result: "",
      patchedData: null,
      error: null,
      showUnchanged: false,
      revertPatch: "",
    };
  });

  useEffect(() => {
    localStorage.setItem("appState", JSON.stringify(state));
  }, [state]);

  function validateJson(json: string): ValidationResult {
    try {
      JSON.parse(json);
      return { isValid: true };
    } catch {
      return { isValid: false, errorMessage: "Invalid JSON format" };
    }
  }

  function updateState(newState: Partial<AppState>) {
    setState((prevState) => ({ ...prevState, ...newState }));
  }

  const handleApplyPatch = () => {
    const jsonDataValidation = validateJson(state.jsonData);
    const jsonPatchValidation = validateJson(state.jsonPatch);

    if (!jsonDataValidation.isValid) {
      updateState({
        error: jsonDataValidation.errorMessage,
        result: "",
        patchedData: null,
      });
      return;
    }

    if (!jsonPatchValidation.isValid) {
      updateState({
        error: jsonPatchValidation.errorMessage,
        result: "",
        patchedData: null,
      });
      return;
    }

    try {
      const data = JSON.parse(state.jsonData);
      const operations = JSON.parse(state.jsonPatch);
      const patchedData = immutableJSONPatch<string>(data, operations);
      const reverseOperations = revertJSONPatch(data, operations);

      updateState({
        error: null,
        result: JSON.stringify(patchedData, null, 2),
        patchedData,
        revertPatch: JSON.stringify(reverseOperations, null, 2),
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      updateState({
        result: `Error: ${errorMessage}`,
        patchedData: null,
        revertPatch: "",
      });
    }
  };

  const handlePrettify = () => {
    try {
      const prettyJsonData = JSON.stringify(
        JSON.parse(state.jsonData),
        null,
        2
      );
      const prettyJsonPatch = JSON.stringify(
        JSON.parse(state.jsonPatch),
        null,
        2
      );
      updateState({
        jsonData: prettyJsonData,
        jsonPatch: prettyJsonPatch,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Invalid JSON format";
      updateState({ result: `Error: ${errorMessage}` });
    }
  };

  const handleReset = () => {
    setState({
      jsonData: "",
      jsonPatch: "",
      result: "",
      patchedData: null,
      error: null,
      showUnchanged: false,
      revertPatch: "",
    });
  };

  const handleJsonDataChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateState({
      jsonData: e.target.value,
      result: "",
      patchedData: null,
    });
  };

  const handleJsonPatchChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateState({ jsonPatch: e.target.value });
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
              <label
                htmlFor="jsonData"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                JSON Data:
              </label>
              <textarea
                id="jsonData"
                className="w-full h-64 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={state.jsonData}
                onChange={handleJsonDataChange}
                placeholder="Enter your JSON data here..."
              />
            </div>

            <div className="bg-white shadow-md rounded-lg p-6">
              <label
                htmlFor="jsonPatch"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Proposed JSON Patch:
              </label>
              <textarea
                id="jsonPatch"
                className="w-full h-64 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={state.jsonPatch}
                onChange={handleJsonPatchChange}
                placeholder="Enter your JSON Patch here..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white shadow-md rounded-lg p-6">
              <label
                htmlFor="result"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Result:
              </label>
              <textarea
                id="result"
                className="w-full h-64 p-3 border border-gray-300 rounded-md bg-gray-50"
                value={state.result}
                readOnly
                placeholder="The patched JSON will appear here..."
              />
            </div>

            <div className="bg-white shadow-md rounded-lg p-6">
              <label
                htmlFor="revertPatch"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Revert JSON Patch:
              </label>
              <textarea
                id="revertPatch"
                className="w-full h-64 p-3 border border-gray-300 rounded-md bg-gray-50"
                value={state.revertPatch}
                readOnly
                placeholder="The revert JSON Patch will appear here..."
              />
            </div>
          </div>
        </div>

        {state.error && (
          <div className="mt-6 p-4 bg-red-100 text-red-700 border border-red-400 rounded-md">
            {state.error}
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
              checked={state.showUnchanged}
              onChange={(e) => updateState({ showUnchanged: e.target.checked })}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span>Show unchanged values</span>
          </label>
        </div>

        {state.patchedData && state.result && (
          <div className="mt-8 bg-white shadow-md rounded-lg p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diff:
            </label>
            <div className="border border-gray-300 rounded-md bg-gray-50 h-96 overflow-auto p-4">
              <ReactFormatter
                oldJson={JSON.parse(state.jsonData)}
                newJson={state.patchedData}
                showUnchanged={state.showUnchanged}
              />
            </div>
          </div>
        )}
      </div>

      <footer className="mt-12 py-6">
        <div className="text-center text-sm text-gray-500">
          <p>
            <a
              href="https://github.com/mkuchak/apply-json-patch"
              className="text-blue-500 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              View project on GitHub
            </a>
          </p>
          <p className="mt-2">
            Powered by:{" "}
            <a
              href="https://github.com/josdejong/immutable-json-patch"
              className="text-blue-500 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              immutable-json-patch
            </a>{" "}
            &amp;{" "}
            <a
              href="https://github.com/benjamine/jsondiffpatch"
              className="text-blue-500 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              jsondiffpatch
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
