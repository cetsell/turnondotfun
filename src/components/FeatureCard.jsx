export default function FeatureCard({ title, description, icon, imageUrl }) {
  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-lg">
      <div className="h-48 bg-gray-800 relative overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-purple-500">
            {icon}
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-300">{description}</p>
      </div>
    </div>
  );
} 