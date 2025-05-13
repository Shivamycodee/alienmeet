import matter from "gray-matter";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import "github-markdown-css/github-markdown.css";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const ArticlePage = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<string | null>(null);

  useEffect(() => {
    const handleRawContent = (raw: string) => {
      const { content } = matter(raw);
      setData(content);
    };

    fetch(
      "https://raw.githubusercontent.com/Shivamycodee/alienmeet/refs/heads/main/README.md"
    )
      .then((res) => res.text())
      .then((text) => handleRawContent(text))
      .catch((err) => console.error("Error fetching markdown:", err));
  }, []);

  return (
    <article className="min-h-screen text-left">
      <div className="markdown-body mx-auto px-8 py-8">

         <h1 className="text-white text-2xl text-left" >Title : {id}</h1>

        {data ? (
          <ReactMarkdown
            rehypePlugins={[rehypeRaw, rehypeSanitize]} // Enable raw HTML parsing
          >
            {data}
          </ReactMarkdown>
        ) : (
          <p className="text-white">Loading content...</p>
        )}
      </div>
    </article>
  );
};

export default ArticlePage;
