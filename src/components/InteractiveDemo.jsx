import { useState } from 'react';

export default function InteractiveDemo() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setLoading(true);
    
    // Simulate AI response - in a real app, this would call your AI backend
    setTimeout(() => {
      const responses = [
        {
          character: "Mysterious Stranger",
          description: "A tall figure with piercing eyes and an enigmatic smile. Their movements are fluid and calculated, suggesting years of training in some unknown art. They wear a tailored suit with subtle, futuristic accents that hint at hidden technology.",
          setting: "A dimly lit bar with holographic displays and ambient music. The atmosphere is thick with intrigue and possibility."
        },
        {
          character: "Seductive Heiress",
          description: "Graceful and commanding, with an air of old-world wealth. Her gestures are deliberate and hypnotic, drawing attention without seeming to try. She wears vintage couture with modern modifications that accentuate her confident posture.",
          setting: "A luxurious penthouse overlooking a neon-lit cityscape. The room is filled with rare artifacts and cutting-edge technology."
        },
        {
          character: "Rogue AI",
          description: "A digital entity manifested in human form, with subtle glitches in movement that betray its non-human nature. Its expressions shift between calculated precision and surprising emotion. Its appearance is sleek and minimalist.",
          setting: "A virtual reality construct that blends natural elements with impossible architecture. Reality seems malleable here, responding to emotional states."
        }
      ];
      
      setResponse(responses[Math.floor(Math.random() * responses.length)]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
      <h3 className="text-2xl font-bold text-white mb-4">Try Our AI Storyteller</h3>
      <p className="text-gray-300 mb-6">
        Enter a simple prompt and see what our AI can create for your next adventure.
      </p>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., a mysterious stranger in a bar"
            className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </form>
      
      {response && (
        <div className="bg-gray-800 rounded-lg p-4 animate-fade-in">
          <div className="mb-4">
            <h4 className="text-xl font-semibold text-purple-400">{response.character}</h4>
            <p className="text-gray-300 mt-2">{response.description}</p>
          </div>
          <div>
            <h5 className="text-lg font-semibold text-purple-400">Setting</h5>
            <p className="text-gray-300 mt-2">{response.setting}</p>
          </div>
        </div>
      )}
    </div>
  );
} 