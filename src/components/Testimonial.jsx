export default function Testimonial({ quote, author, role, avatarUrl }) {
  return (
    <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full overflow-hidden mr-4 bg-purple-800 flex-shrink-0">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={author} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white font-bold">
              {author.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white">{author}</h4>
          {role && <p className="text-purple-400 text-sm">{role}</p>}
        </div>
      </div>
      <blockquote className="text-gray-300 italic">"{quote}"</blockquote>
    </div>
  );
} 