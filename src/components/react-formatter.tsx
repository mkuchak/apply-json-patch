import * as jsondiffpatch from "jsondiffpatch";
import type { Delta } from "jsondiffpatch";
import HtmlFormatter from "jsondiffpatch/formatters/html";
import "jsondiffpatch/formatters/styles/annotated.css";
import "jsondiffpatch/formatters/styles/html.css";

type ReactFormatterType = {
  oldJson: unknown;
  newJson?: unknown;
  showUnchanged: boolean;
};

export function ReactFormatter({
  oldJson,
  newJson,
  showUnchanged,
}: ReactFormatterType) {
  const delta: Delta = jsondiffpatch.diff(oldJson, newJson);
  if (!delta) return null;

  const htmlDiff = new HtmlFormatter().format(delta, oldJson);
  const createMarkupHtml = () => ({ __html: htmlDiff || "" });

  return (
    <div
      className={`json-diff-container ${
        !showUnchanged ? "jsondiffpatch-unchanged-hidden" : ""
      }`}
    >
      <div dangerouslySetInnerHTML={createMarkupHtml()}></div>
    </div>
  );
}
