"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, BookOpen, CheckCircle, FileText, Search, Zap,
  Copy, RefreshCw, Download, ChevronDown, ChevronUp, Loader2,
  MessageSquare, Lightbulb, Globe
} from "lucide-react";
import toast from "react-hot-toast";

interface AITool {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  placeholder: string;
  inputLabel: string;
  examples: string[];
}

const AI_TOOLS: AITool[] = [
  {
    id: "outline",
    label: "Outline Generator",
    description: "Create a structured, detailed outline for any academic or professional writing assignment.",
    icon: BookOpen,
    color: "from-blue-500 to-brand-500",
    placeholder: "E.g., Write a 2000-word essay on climate change and its economic impacts",
    inputLabel: "Describe your assignment or topic",
    examples: [
      "Research paper on artificial intelligence in healthcare",
      "Argumentative essay on social media effects on teenagers",
      "Business report on remote work productivity",
    ],
  },
  {
    id: "grammar",
    label: "Grammar & Style Check",
    description: "Improve your writing with advanced grammar corrections, style suggestions, and readability improvements.",
    icon: CheckCircle,
    color: "from-green-500 to-emerald-500",
    placeholder: "Paste your text here for grammar and style analysis...",
    inputLabel: "Paste your text to check",
    examples: [
      "Check and improve this paragraph: The students was very excited about the new project...",
      "Make this more academic: The thing is, climate change is really bad...",
    ],
  },
  {
    id: "paraphrase",
    label: "Smart Paraphrase",
    description: "Intelligently rephrase content while maintaining meaning, improving flow, and matching academic tone.",
    icon: RefreshCw,
    color: "from-purple-500 to-pink-500",
    placeholder: "Paste the text you want to paraphrase...",
    inputLabel: "Text to paraphrase",
    examples: [
      "Paraphrase in academic style: The study found that exercise is good for health...",
      "Make more formal: Lots of companies are using AI to save money...",
    ],
  },
  {
    id: "research",
    label: "Research Assistant",
    description: "Get key research points, relevant studies, statistics, and suggested sources for your topic.",
    icon: Search,
    color: "from-orange-500 to-amber-500",
    placeholder: "Enter your research topic or question...",
    inputLabel: "Research topic or question",
    examples: [
      "Key research points on quantum computing applications",
      "Statistics and studies on mental health in universities",
      "Recent findings on renewable energy adoption rates",
    ],
  },
  {
    id: "citation",
    label: "Citation Formatter",
    description: "Generate properly formatted citations in APA, MLA, Chicago, or Harvard style.",
    icon: FileText,
    color: "from-teal-500 to-cyan-500",
    placeholder: "Enter source details: author, title, year, publisher, URL...",
    inputLabel: "Source information",
    examples: [
      "APA: Smith, John. (2023). AI in Medicine. Oxford Press.",
      "MLA for: https://www.nature.com/articles/climate-2024",
      "Chicago style for a journal article on renewable energy",
    ],
  },
  {
    id: "seo",
    label: "SEO Content Optimizer",
    description: "Optimize your content for search engines with keyword suggestions, meta descriptions, and structure improvements.",
    icon: Globe,
    color: "from-rose-500 to-red-500",
    placeholder: "Enter your content or topic to optimize for SEO...",
    inputLabel: "Content or topic to optimize",
    examples: [
      "Optimize: How to start a successful online business in 2024",
      "Write meta description for: benefits of meditation for students",
      "Suggest keywords for: digital marketing strategies article",
    ],
  },
];

export default function AIToolsPage() {
  const [activeTool, setActiveTool] = useState<AITool>(AI_TOOLS[0]);
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{ tool: string; input: string; result: string; timestamp: Date }[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [wordCount, setWordCount] = useState(500);
  const [tone, setTone] = useState("academic");

  const runTool = async () => {
    if (!input.trim()) {
      toast.error("Please enter some text or a topic");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/ai/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activeTool.id,
          content: input,
          context: { wordCount, tone },
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      setResult(json.data.result);
      setHistory(prev => [{
        tool: activeTool.label,
        input: input.slice(0, 100),
        result: json.data.result,
        timestamp: new Date(),
      }, ...prev.slice(0, 9)]);
    } catch (err) {
      toast.error("AI tool failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    toast.success("Copied to clipboard!");
  };

  const downloadResult = () => {
    const blob = new Blob([result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeTool.id}-result-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-brand-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI Writing Tools</h1>
            <p className="text-gray-400 text-sm">Powered by Claude — your intelligent writing assistant</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tool Selector */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Available Tools</p>
          {AI_TOOLS.map(tool => (
            <motion.button
              key={tool.id}
              onClick={() => { setActiveTool(tool); setResult(""); setInput(""); }}
              whileHover={{ x: 2 }}
              className={`w-full p-3 rounded-xl text-left transition-all border ${
                activeTool.id === tool.id
                  ? "border-brand-500/50 bg-brand-500/10"
                  : "border-white/10 hover:border-white/20 glass"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center`}>
                  <tool.icon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className={`text-sm font-medium ${activeTool.id === tool.id ? "text-white" : "text-gray-400"}`}>
                  {tool.label}
                </span>
              </div>
            </motion.button>
          ))}

          {/* Usage Note */}
          <div className="mt-4 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs font-semibold text-purple-400">Pro Tip</span>
            </div>
            <p className="text-xs text-gray-400">Use AI tools to assist your writing, not replace it. Always review and personalize the output.</p>
          </div>
        </div>

        {/* Main Tool Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Tool Header */}
          <div className="glass-card p-5">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${activeTool.color} flex items-center justify-center shrink-0`}>
                <activeTool.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{activeTool.label}</h2>
                <p className="text-sm text-gray-400 mt-0.5">{activeTool.description}</p>
              </div>
            </div>

            {/* Options */}
            {(activeTool.id === "outline" || activeTool.id === "paraphrase") && (
              <div className="flex gap-4 mt-4 pt-4 border-t border-white/10">
                <div className="flex-1">
                  <label className="text-xs text-gray-400 mb-1.5 block">Target Word Count</label>
                  <input
                    type="number"
                    value={wordCount}
                    onChange={e => setWordCount(Number(e.target.value))}
                    className="input-field w-full text-sm"
                    min={100}
                    max={10000}
                    step={100}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-400 mb-1.5 block">Writing Tone</label>
                  <select
                    value={tone}
                    onChange={e => setTone(e.target.value)}
                    className="input-field w-full text-sm"
                  >
                    <option value="academic">Academic</option>
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="creative">Creative</option>
                    <option value="technical">Technical</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="glass-card p-5">
            <label className="text-sm font-medium text-gray-300 mb-2 block">{activeTool.inputLabel}</label>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={activeTool.placeholder}
              rows={6}
              className="input-field w-full resize-none"
            />

            {/* Examples */}
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2">Quick examples:</p>
              <div className="flex flex-wrap gap-2">
                {activeTool.examples.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(ex)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all"
                  >
                    {ex.length > 40 ? ex.slice(0, 40) + "..." : ex}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={runTool}
              disabled={loading || !input.trim()}
              className={`mt-4 w-full py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 bg-gradient-to-r ${activeTool.color} hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Processing with Claude...</>
              ) : (
                <><Sparkles className="w-5 h-5" /> Run {activeTool.label}</>
              )}
            </button>
          </div>

          {/* Result */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass-card p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-brand-500 flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    <h3 className="font-semibold text-white">AI Result</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={copyResult}
                      className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </button>
                    <button onClick={downloadResult}
                      className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                    <button onClick={() => runTool()}
                      className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                    </button>
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 max-h-96 overflow-y-auto">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">{result}</pre>
                </div>
                <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                  Generated by Claude · Review and customize before using
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* History */}
          {history.length > 0 && (
            <div className="glass-card">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <span className="text-sm font-medium text-gray-300">Recent History ({history.length})</span>
                {showHistory ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>

              <AnimatePresence>
                {showHistory && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 space-y-2">
                      {history.map((item, i) => (
                        <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-brand-400">{item.tool}</span>
                            <span className="text-xs text-gray-500">{item.timestamp.toLocaleTimeString()}</span>
                          </div>
                          <p className="text-xs text-gray-400 truncate mb-2">Input: {item.input}</p>
                          <button
                            onClick={() => { setResult(item.result); setActiveTool(AI_TOOLS.find(t => t.label === item.tool) || AI_TOOLS[0]); }}
                            className="text-xs text-brand-400 hover:text-brand-300"
                          >
                            View result →
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
