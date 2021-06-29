import { serialize } from "remark-slate";
import { useState, useEffect, useMemo, useCallback } from "react";
import { createEditor } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import unified from "unified";
import markdown from "remark-parse";
import slate from "remark-slate";
import gfm from "remark-gfm";
import Editor from "@monaco-editor/react";
// import { remarkToSlate } from "remark-slate-transformer";

import "./App.css";

const markdownStr = `
# Heading one

## Heading two

### Heading three

#### Heading four

##### Heading five

###### Heading six

Normal paragraph

---

\`console.log('code line')\`

\`\`\` js
const test = ({ message}) => {
    message = message.toLowerCase();
    console.log(message)
}
\`\`\`

_italic text_

**bold text**

~~strike~~

autolink <https://postman.com>

custom link [hyperlink](https://jackhanford.com)

> A block quote.

- bullet list item 1
- bullet list item 2

1. ordered list item 1
1. ordered list item 2

`;

const App = () => {
  const editor = useMemo(() => withReact(createEditor()), []);
  const [slateObject, setSlateObject] = useState([{ text: "asdasdads" }]);
  const [markdownValue, setMarkdownValue] = useState(markdownStr);

  //   const processor = unified().use(markdown).use(gfm).use(remarkToSlate);

  useEffect(() => {
    // serialize slate state to a markdown string
    unified()
      .use(markdown)
      .use(gfm)
      .use(slate)
      .process(markdownStr, (err, slateObject) => {
        if (err) throw err;
        setSlateObject(slateObject.result);
      });

    // const processMarkdown = async () => {
    //   const result = await processor.processSync(markdownStr).result;
    //   setSlateObject(result);
    // };
    // processMarkdown();
  }, []);

  const renderElement = useCallback((props) => {
    switch (props.element.type) {
      case "heading_one":
        return <h1 {...props.attributes}>{props.children}</h1>;
      case "heading_two":
        return <h2 {...props.attributes}>{props.children}</h2>;
      case "heading_three":
        return <h3 {...props.attributes}>{props.children}</h3>;
      case "heading_four":
        return <h4 {...props.attributes}>{props.children}</h4>;
      case "heading_five":
        return <h5 {...props.attributes}>{props.children}</h5>;
      case "heading_six":
        return <h6 {...props.attributes}>{props.children}</h6>;
      case "paragraph":
        return <p {...props.attributes}>{props.children}</p>;
      case "thematic_break":
        return <hr />;
      case "block_quote":
        return (
          <blockquote
            style={{
              borderLeft: "2px solid #ccc",
              marginLeft: "-0",
              padding: "0 5px",
            }}
            {...props.attributes}
          >
            {props.children}
          </blockquote>
        );
      case "link":
        return (
          <a {...props.attributes} href={props.element.link}>
            {props.children}
          </a>
        );
      case "ul_list":
        return <ul {...props.attributes}>{props.children}</ul>;
      case "ol_list":
        return <ol {...props.attributes}>{props.children}</ol>;
      case "list_item":
        return <li {...props.attributes}>{props.children}</li>;
      case "code_block":
        return (
          <pre>
            <code {...props.attributes}>{props.children}</code>
          </pre>
        );
      default:
        return <p {...props.attributes}>{props.children}</p>;
    }
  }, []);

  const renderLeaf = useCallback((props) => {
    return <Leaf {...props} />;
  }, []);

  function editorDidMount(editor, monaco) {
    setTimeout(function () {
      editor.getAction("editor.action.formatDocument").run();
    }, 200);
  }

  const convertToSlateObject = (e) => {
    console.log(e.target.value);
    setMarkdownValue(e.target.value);
    unified()
      .use(markdown)
      .use(gfm)
      .use(slate)
      .process(e.target.value, (err, slateObject) => {
        if (err) throw err;
        setSlateObject(slateObject.result);
      });
    // const result = processor.processSync(e.target.value).result;
    // setSlateObject(result);
  };

  const convertToMarkdown = (obj) => {
    console.log(obj.map((v) => serialize(v)).join(""));
  };

  return (
    <div className="container">
      <div className="column">
        <h4>Markdown</h4>
        <textarea
          value={markdownValue}
          editable
          onChange={(e) => convertToSlateObject(e)}
        ></textarea>
      </div>
      <div className="column">
        <h4>Slate object</h4>
        <Editor
          className="editor"
          options={{ wordWrap: true }}
          defaultLanguage="json"
          onMount={editorDidMount}
          value={JSON.stringify(slateObject)}
        />
      </div>
      <div className="column">
        <h4>Slate Editor</h4>
        <Slate
          editor={editor}
          value={slateObject}
          onChange={(value) => convertToMarkdown(value)}
        >
          <Editable renderElement={renderElement} renderLeaf={renderLeaf} />
        </Slate>
      </div>
    </div>
  );
};

const Leaf = (props) => {
  return (
    <>
      {props.leaf.bold && (
        <span {...props.attributes} style={{ fontWeight: "bold" }}>
          {props.children}
        </span>
      )}
      {props.leaf.italic && (
        <span {...props.attributes} style={{ fontStyle: "italic" }}>
          {props.children}
        </span>
      )}
      {props.leaf.code && <code {...props.attributes}>{props.children}</code>}
      {props.leaf.strikeThrough && (
        <del {...props.attributes}>{props.children}</del>
      )}
      {!props.leaf.code &&
        !props.leaf.italic &&
        !props.leaf.bold &&
        !props.leaf.strikeThrough && (
          <span {...props.attributes} style={{ fontWeight: "italic" }}>
            {props.children}
          </span>
        )}
    </>
  );
};

export default App;
